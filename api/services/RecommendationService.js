const WeightBasedRecommender = require('../algorithms/WeightBasedRecommender');
const EfficientRouteOptimizer = require('../algorithms/EfficientRouteOptimizer');
const RuleBasedRecommendationEngine = require('../algorithms/RuleBasedEngine');
const Place = require('../models/Place');

class RecommendationService {
  constructor() {
    this.recommender = new WeightBasedRecommender();
    this.optimizer = new EfficientRouteOptimizer();
    this.ruleEngine = new RuleBasedRecommendationEngine();
    
    // AI 교체 준비
    this.ai_ready = true;
  }
  
  async generateRecommendations(userProfile, options = {}) {
    try {
      const startTime = Date.now();
      
      // 1. 후보 장소 가져오기
      const places = await this.getCandidatePlaces(userProfile, options);
      
      // 2. 맥락 정보 가져오기
      const context = await this.getContext(userProfile);
      
      // 3. 알고리즘 기반 추천 생성
      const recommendations = await this.recommender.generateRecommendations(
        userProfile, 
        context, 
        places
      );
      
      // 4. 규칙 기반 개선
      const improved = await this.ruleEngine.applyRules(
        userProfile, 
        context, 
        recommendations.route
      );
      
      // 5. 최적화 검증
      const validated = await this.validateRoute(improved, userProfile.constraints);
      
      const result = {
        success: true,
        recommendation: {
          route: validated.route,
          estimated_time: validated.total_time,
          estimated_cost: validated.total_cost,
          places_count: validated.route.length,
          confidence: this.calculateConfidence(validated)
        },
        algorithm: {
          type: 'weighted_rule_based',
          version: '1.0.0',
          processing_time: Date.now() - startTime,
          ai_ready: this.ai_ready
        },
        metadata: {
          user_id: userProfile.id,
          context: {
            weather: context.weather,
            time_of_day: context.time_of_day,
            budget: userProfile.constraints.total_budget,
            time_limit: userProfile.constraints.total_time
          },
          optimization: {
            algorithm: validated.algorithm_used,
            efficiency: validated.efficiency_score
          }
        }
      };
      
      // 6. AI 준비 데이터 저장 (나중을 위한 준비)
      if (this.ai_ready) {
        await this.saveAIData(userProfile, context, places, result);
      }
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: await this.getFallbackRecommendation(userProfile)
      };
    }
  }
  
  async getCandidatePlaces(userProfile, options) {
    const query = {
      'status.visibility': 'visible',
      'status.verification': 'verified',
      'quality.overall_score': { $gte: 0.5 }
    };
    
    // 사용자 위치 기반 필터링
    if (userProfile.preferences.preferred_area) {
      query['address.district'] = userProfile.preferences.preferred_area;
    }
    
    // 카테고리 선호도 반영
    if (userProfile.preferences.categories) {
      const preferredCategories = Object.entries(userProfile.preferences.categories)
        .filter(([_, score]) => score > 0.5)
        .map(([category]) => category);
      
      if (preferredCategories.length > 0) {
        query['category.main'] = { $in: preferredCategories };
      }
    }
    
    // 거리 제한
    if (userProfile.preferences.max_distance) {
      // TODO: 지리공간 쿼리 구현
      // query['location'] = { $near: ... }
    }
    
    const places = await Place.find(query)
      .limit(options.max_places || 50)
      .lean();
    
    return places;
  }
  
  async getContext(userProfile) {
    // 현재 맥락 정보 가져오기 (실시간)
    return {
      weather: await this.getCurrentWeather(),
      time_of_day: this.getTimeOfDay(),
      day_type: this.getDayType(),
      season: this.getSeason(),
      user_location: userProfile.current_location || null,
      last_recommendation: await this.getLastRecommendation(userProfile.id)
    };
  }
  
  async validateRoute(route, constraints) {
    // 시간 제약 검증
    let totalTime = 0;
    let totalCost = 0;
    
    for (let i = 0; i < route.length; i++) {
      totalTime += route[i].features.duration;
      totalCost += route[i].price_max || 0;
      
      if (i < route.length - 1) {
        const travelTime = this.optimizer.estimateTravelTime(route[i], route[i + 1]);
        totalTime += travelTime;
      }
    }
    
    return {
      route,
      total_time: totalTime,
      total_cost: totalCost,
      is_valid: totalTime <= constraints.total_time && totalCost <= constraints.total_budget,
      efficiency_score: this.calculateEfficiencyScore(route, totalTime, totalCost),
      algorithm_used: 'rule_based_validation'
    };
  }
  
  calculateConfidence(recommendation) {
    // 추천 신뢰도 계산 (0.0 ~ 1.0)
    let confidence = 0.7; // 기본 신뢰도
    
    // 규칙 적용 여부
    if (recommendation.rules_applied) {
      confidence += 0.1;
    }
    
    // 제약조건 만족도
    if (recommendation.is_valid) {
      confidence += 0.15;
    }
    
    // 데이터 품질
    if (recommendation.data_quality > 0.8) {
      confidence += 0.05;
    }
    
    return Math.min(1.0, confidence);
  }
  
  async saveAIData(userProfile, context, places, result) {
    // AI 학습을 위한 데이터 저장
    const aiData = {
      user_features: this.extractUserFeatures(userProfile),
      context_features: this.extractContextFeatures(context),
      place_features: places.map(p => this.extractPlaceFeatures(p)),
      recommendation: result,
      metadata: {
        created_at: new Date(),
        algorithm_version: '1.0.0',
        ai_ready: true
      }
    };
    
    // TODO: AI 학습 데이터베이스에 저장
    // await AIModelTrainingData.create(aiData);
  }
  
  // 보조 메서드들
  extractUserFeatures(userProfile) {
    return {
      preferences: userProfile.preferences,
      constraints: userProfile.constraints,
      history: userProfile.history || {}
    };
  }
  
  extractContextFeatures(context) {
    return {
      weather: context.weather,
      time_of_day: context.time_of_day,
      day_type: context.day_type,
      season: context.season
    };
  }
  
  extractPlaceFeatures(place) {
    return {
      id: place.id,
      category: place.category,
      features: place.features,
      quality: place.quality,
      location: place.location
    };
  }
  
  async getCurrentWeather() {
    // TODO: 날씨 API 연동
    // 현재는 mock 데이터
    return 'sunny';
  }
  
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
  
  getDayType() {
    const day = new Date().getDay();
    return day === 0 || day === 6 ? 'weekend' : 'weekday';
  }
  
  getSeason() {
    const month = new Date().getMonth();
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }
  
  async getLastRecommendation(userId) {
    // TODO: 최근 추천 이력 가져오기
    return null;
  }
  
  async getFallbackRecommendation(userProfile) {
    // 기본 추천 (인기 장소 등)
    const popularPlaces = await Place.find({
      'status.visibility': 'visible',
      'stats.view_count': { $gt: 100 }
    })
    .limit(3)
    .lean();
    
    return {
      success: true,
      recommendation: {
        route: popularPlaces,
        estimated_time: 180,
        estimated_cost: 30000,
        places_count: popularPlaces.length,
        confidence: 0.5,
        is_fallback: true
      },
      algorithm: {
        type: 'fallback',
        version: '1.0.0'
      }
    };
  }
  
  calculateEfficiencyScore(route, totalTime, totalCost) {
    // 효율성 점수 계산 (0.0 ~ 1.0)
    const timeEfficiency = 1.0 - (totalTime / 480); // 8시간 기준
    const costEfficiency = 1.0 - (totalCost / 100000); // 10만원 기준
    
    return (timeEfficiency + costEfficiency) / 2;
  }
}

module.exports = RecommendationService;