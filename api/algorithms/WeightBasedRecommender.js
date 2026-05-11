class WeightBasedRecommender {
  constructor() {
    this.weights = {
      user_preferences: 0.4,
      place_quality: 0.3,
      context_fit: 0.2,
      distance_efficiency: 0.1
    };
    
    this.minScore = 0.1;
    this.maxScore = 1.0;
  }
  
  async generateRecommendations(userProfile, context, places) {
    try {
      // 1. 필터링
      const candidates = this.filterPlaces(places, userProfile, context);
      
      // 2. 스코어링
      const scoredPlaces = this.scorePlaces(candidates, userProfile, context);
      
      // 3. 정렬
      const rankedPlaces = this.rankPlaces(scoredPlaces);
      
      // 4. 후보군 선택
      const selectedPlaces = this.selectPlaces(rankedPlaces, userProfile);
      
      // 5. 경로 생성
      const route = await this.createRoute(selectedPlaces, userProfile);
      
      return {
        route: route.route,
        scores: scoredPlaces.map(p => ({
          id: p.id,
          score: p.total_score,
          breakdown: p.scores
        })),
        confidence: this.calculateConfidence(selectedPlaces),
        metadata: {
          algorithm: 'weighted_v1',
          processing_time: Date.now() - this.startTime,
          candidates_count: candidates.length,
          selected_count: selectedPlaces.length
        }
      };
      
    } catch (error) {
      throw new Error(`Weighted recommendation failed: ${error.message}`);
    }
  }
  
  filterPlaces(places, userProfile, context) {
    return places.filter(place => {
      return (
        this.fitsBudget(place, userProfile) &&
        this.fitsTimeSchedule(place, userProfile) &&
        this.isWithinDistance(place, userProfile) &&
        this.matchesPreferences(place, userProfile) &&
        this.isCurrentlySuitable(place, context)
      );
    });
  }
  
  scorePlaces(places, userProfile, context) {
    this.startTime = Date.now();
    
    return places.map(place => {
      const scores = {};
      
      // 1. 사용자 선호도 점수
      scores.user_preference = this.calculateUserPreferenceScore(place, userProfile);
      
      // 2. 장소 품질 점수
      scores.quality = this.calculateQualityScore(place);
      
      // 3. 맥락 적합도 점수
      scores.context = this.calculateContextScore(place, context);
      
      // 4. 거리 효율 점수
      scores.distance = this.calculateDistanceScore(place, userProfile);
      
      // 종합 점수
      place.total_score = this.calculateTotalScore(scores);
      
      return {
        ...place,
        scores,
        total_score: place.total_score
      };
    });
  }
  
  rankPlaces(scoredPlaces) {
    return scoredPlaces.sort((a, b) => {
      if (b.total_score !== a.total_score) {
        return b.total_score - a.total_score;
      }
      
      // 점수가 같을 경우 품질 점수로 우선순위 결정
      return b.scores.quality - a.scores.quality;
    });
  }
  
  selectPlaces(rankedPlaces, userProfile) {
    const constraints = userProfile.constraints;
    let selected = [];
    let totalTime = 0;
    let totalCost = 0;
    
    for (const place of rankedPlaces) {
      const estimatedTime = totalTime + place.features.duration + this.getTravelTime(selected, place);
      const estimatedCost = totalCost + (place.price_max || 0);
      
      if (estimatedTime <= constraints.total_time && estimatedCost <= constraints.total_budget) {
        selected.push(place);
        totalTime = estimatedTime;
        totalCost = estimatedCost;
        
        // 최소 장소 수 도달 시 중지
        if (selected.length >= (constraints.min_places || 3)) {
          break;
        }
      }
    }
    
    return selected;
  }
  
  calculateUserPreferenceScore(place, userProfile) {
    let score = 0;
    
    // 카테고리 선호도
    const categoryPref = userProfile.preferences.categories?.[place.category.main] || 0;
    score += categoryPref * 0.5;
    
    // 분위기 선호도
    if (place.features.atmosphere === userProfile.preferences.atmosphere) {
      score += 0.3;
    }
    
    // 가격대 선호도
    if (this.matchesPriceLevel(place, userProfile)) {
      score += 0.2;
    }
    
    return Math.max(this.minScore, Math.min(this.maxScore, score));
  }
  
  calculateQualityScore(place) {
    let score = 0;
    
    // 평점 (40%)
    if (place.ratings?.average) {
      score += (place.ratings.average / 5) * 0.4;
    }
    
    // 리뷰 수 (30%)
    const reviewCount = place.ratings?.count || 0;
    const reviewScore = Math.log(reviewCount + 1) / Math.log(1000); // 최대 1000 리뷰 기준
    score += reviewScore * 0.3;
    
    // 정보 완성도 (30%)
    const completenessScore = this.calculateCompleteness(place);
    score += completenessScore * 0.3;
    
    return Math.max(this.minScore, Math.min(this.maxScore, score));
  }
  
  calculateContextScore(place, context) {
    let score = 0;
    
    // 날씨 적합도 (40%)
    if (this.isWeatherSuitable(place, context.weather)) {
      score += 0.4;
    }
    
    // 시간대 적합도 (30%)
    if (this.isTimeAppropriate(place, context.time_of_day)) {
      score += 0.3;
    }
    
    // 혼잡도 적합도 (30%)
    if (this.isCrowdingSuitable(place, context)) {
      score += 0.3;
    }
    
    return Math.max(this.minScore, Math.min(this.maxScore, score));
  }
  
  calculateDistanceScore(place, userProfile) {
    // 사용자 현재 위치로부터의 거리
    if (!userProfile.current_location) {
      return 0.5; // 기본 점수
    }
    
    const distance = this.calculateDistance(
      userProfile.current_location,
      place.location.coordinates
    );
    
    // 1km 이내: 1.0점, 5km까지 선형 감소
    const maxDistance = 5000; // 5km
    const distanceScore = Math.max(0, (maxDistance - distance) / maxDistance);
    
    return Math.max(this.minScore, Math.min(this.maxScore, distanceScore));
  }
  
  calculateTotalScore(scores) {
    return Object.entries(this.weights).reduce((total, [key, weight]) => {
      return total + (scores[key] * weight);
    }, 0);
  }
  
  // 보조 메서드들
  fitsBudget(place, userProfile) {
    const budget = userProfile.constraints.total_budget;
    const maxPrice = place.price_max || 0;
    
    return maxPrice <= budget;
  }
  
  fitsTimeSchedule(place, userProfile) {
    const timeLimit = userProfile.constraints.total_time;
    const duration = place.features.duration || 60;
    
    return duration <= timeLimit;
  }
  
  isWithinDistance(place, userProfile) {
    if (!userProfile.preferences.max_distance) {
      return true;
    }
    
    const distance = this.calculateDistance(
      userProfile.current_location,
      place.location.coordinates
    );
    
    return distance <= userProfile.preferences.max_distance;
  }
  
  matchesPreferences(place, userProfile) {
    const prefs = userProfile.preferences;
    
    // 카테고리 선호도 점수 0.3 이상
    const categoryScore = prefs.categories?.[place.category.main] || 0;
    if (categoryScore < 0.3) {
      return false;
    }
    
    // 선호하지 않는 태그 체크
    if (prefs.must_avoid) {
      const hasAvoidTag = place.category.tags?.some(tag => 
        prefs.must_avoid.includes(tag)
      );
      if (hasAvoidTag) {
        return false;
      }
    }
    
    return true;
  }
  
  isCurrentlySuitable(place, context) {
    // 영업 중인지 확인
    if (place.status.visibility !== 'visible') {
      return false;
    }
    
    // 날씨 적합성
    if (!this.isWeatherSuitable(place, context.weather)) {
      return false;
    }
    
    return true;
  }
  
  isWeatherSuitable(place, weather) {
    // 실내 장소는 날씨 무관
    if (place.features.indoor) {
      return true;
    }
    
    // 실외 장소는 날씨 체크
    if (weather === 'rainy' && !place.features.weather_proof) {
      return false;
    }
    
    return true;
  }
  
  isTimeAppropriate(place, timeOfDay) {
    if (!place.operating_hours || place.operating_hours.length === 0) {
      return true; // 영업시간 정보 없음
    }
    
    const currentHour = this.getCurrentHour(timeOfDay);
    const daySchedule = place.operating_hours.find(schedule => 
      schedule.day === this.getCurrentDay()
    );
    
    if (!daySchedule || daySchedule.closed) {
      return false;
    }
    
    const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
    const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);
    
    const currentMinutes = currentHour * 60 + (currentHour * 60);
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }
  
  isCrowdingSuitable(place, context) {
    // 실시간 혼잡도 정보가 있다면 체크
    if (place.features.current_crowd_level) {
      const userCrowdPreference = context.user_crowd_preference || 'medium';
      return Math.abs(
        this.getCrowdLevelIndex(place.features.current_crowd_level) -
        this.getCrowdLevelIndex(userCrowdPreference)
      ) <= 1;
    }
    
    return true; // 혼잡도 정보 없으면 패스
  }
  
  matchesPriceLevel(place, userProfile) {
    const userLevel = userProfile.preferences.budget_level;
    const placeLevel = this.getPriceLevel(place);
    
    const levels = ['₩', '₩₊', '₩₊₊', '₩₊₊₊', '₩₊₊₊₊'];
    const userIndex = levels.indexOf(userLevel);
    const placeIndex = levels.indexOf(placeLevel);
    
    return Math.abs(userIndex - placeIndex) <= 1; // 1단계 차이까지 허용
  }
  
  calculateCompleteness(place) {
    const fields = [
      'contact.phone',
      'operating_hours',
      'description.short',
      'features.price_range',
      'category.tags'
    ];
    
    let completedFields = 0;
    
    for (const field of fields) {
      if (this.hasField(place, field)) {
        completedFields++;
      }
    }
    
    return completedFields / fields.length;
  }
  
  calculateConfidence(selectedPlaces) {
    let confidence = 0.7; // 기본 신뢰도
    
    // 선택된 장소들의 평균 품질 점수
    const avgQuality = selectedPlaces.reduce((sum, place) => 
      sum + (place.scores?.quality || 0), 0) / selectedPlaces.length;
    confidence += avgQuality * 0.2;
    
    // 다양성 점수
    const diversityScore = this.calculateDiversityScore(selectedPlaces);
    confidence += diversityScore * 0.1;
    
    return Math.min(1.0, confidence);
  }
  
  calculateDiversityScore(places) {
    if (places.length <= 1) {
      return 0;
    }
    
    const categories = places.map(p => p.category.main);
    const uniqueCategories = new Set(categories);
    
    return uniqueCategories.size / categories.length;
  }
  
  // 유틸리티 메서드들
  calculateDistance(coord1, coord2) {
    const [lng1, lat1] = coord1;
    const [lng2, lat2] = coord2;
    
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c * 1000; // 미터 단위
  }
  
  getTravelTime(route, nextPlace) {
    if (route.length === 0) {
      return 0;
    }
    
    const lastPlace = route[route.length - 1];
    const distance = this.calculateDistance(
      lastPlace.location.coordinates,
      nextPlace.location.coordinates
    );
    
    // 도보 4km/h 기준 (분 단위)
    return (distance / 4000) * 60;
  }
  
  getCurrentHour(timeOfDay) {
    const hourMap = {
      'morning': 9,
      'afternoon': 14,
      'evening': 19
    };
    return hourMap[timeOfDay] || 12;
  }
  
  getCurrentDay() {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    const dayIndex = new Date().getDay();
    return days[dayIndex === 0 ? 6 : dayIndex - 1]; // 일요일=0 → 6
  }
  
  getPriceLevel(place) {
    const avgPrice = (place.price_min + place.price_max) / 2;
    
    if (avgPrice <= 10000) return '₩';
    if (avgPrice <= 30000) return '₩₊';
    if (avgPrice <= 50000) return '₩₊₊';
    if (avgPrice <= 100000) return '₩₊₊₊';
    return '₩₊₊₊₊';
  }
  
  getCrowdLevelIndex(crowdLevel) {
    const levels = ['low', 'medium', 'high'];
    return levels.indexOf(crowdLevel);
  }
  
  hasField(place, fieldPath) {
    const parts = fieldPath.split('.');
    let current = place;
    
    for (const part of parts) {
      if (!current[part]) {
        return false;
      }
      current = current[part];
    }
    
    return current !== '' && current !== null && current !== undefined;
  }
  
  async createRoute(selectedPlaces, userProfile) {
    // 현재는 단순 순서, 나중에 최적화 알고리즘 연동
    const route = [...selectedPlaces];
    
    // 체력 소모 고려하여 고속/저속 장소 번갈아 배열
    const optimizedRoute = this.balancePace(route);
    
    return {
      route: optimizedRoute,
      total_time: this.calculateTotalTime(optimizedRoute),
      total_cost: this.calculateTotalCost(optimizedRoute)
    };
  }
  
  balancePace(route) {
    // 속도 번갈아 배열
    const highPace = route.filter(p => p.features.pace === 'fast');
    const lowPace = route.filter(p => p.features.pace === 'slow');
    const normalPace = route.filter(p => !p.features.pace || p.features.pace === 'normal');
    
    const balanced = [];
    const maxLength = Math.max(highPace.length, lowPace.length, normalPace.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (i < normalPace.length) balanced.push(normalPace[i]);
      if (i < lowPace.length) balanced.push(lowPace[i]);
      if (i < highPace.length) balanced.push(highPace[i]);
    }
    
    return balanced;
  }
  
  calculateTotalTime(route) {
    let totalTime = 0;
    
    for (let i = 0; i < route.length; i++) {
      totalTime += route[i].features.duration || 60;
      
      if (i < route.length - 1) {
        totalTime += this.getTravelTime(route.slice(0, i + 1), route[i + 1]);
      }
    }
    
    return totalTime;
  }
  
  calculateTotalCost(route) {
    return route.reduce((total, place) => {
      return total + (place.price_max || 0);
    }, 0);
  }
}

module.exports = WeightBasedRecommender;