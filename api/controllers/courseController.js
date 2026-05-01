const { query } = require('../config/database');
const logger = require('../utils/logger');

class CourseController {
  /**
   * 예산에 맞는 코스 추천
   * @param {Object} options - 추천 옵션
   * @param {number} options.budget - 예산
   * @param {Array<string>} options.categories - 선호 카테고리
   * @param {number} options.lat - 위도
   * @param {number} options.lng - 경도
   * @param {number} options.radius - 검색 반경
   * @param {number} options.maxPlaces - 최대 장소 수
   * @returns {Promise<Array>} 추천 코스 목록
   */
  async recommendCourses(options) {
    try {
      const {
        budget,
        categories = [],
        lat,
        lng,
        radius = 1500,
        maxPlaces = 4
      } = options;

      logger.info('Generating course recommendations', options);

      // 1. 후보 장소 검색
      const candidatePlaces = await this.findCandidatePlaces({
        lat,
        lng,
        radius,
        categories,
        budget
      });

      // 2. 코스 조합 생성
      const courseCombinations = await this.generateCourseCombinations({
        places: candidatePlaces,
        budget,
        maxPlaces
      });

      // 3. 코스 랭킹
      const rankedCourses = await this.rankCourses(courseCombinations);

      // 4. 상위 코스 반환
      const topCourses = rankedCourses.slice(0, 5);

      logger.info(`Generated ${topCourses.length} course recommendations`);

      return topCourses;
    } catch (error) {
      logger.error('Error generating course recommendations:', error);
      throw error;
    }
  }

  /**
   * 후보 장소 검색
   */
  async findCandidatePlaces(options) {
    const { lat, lng, radius, categories, budget } = options;

    let baseQuery = `
      SELECT 
        p.*,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(p.latitude))
          )
        ) as distance
      FROM places p
      WHERE p.is_active = true
    `;

    const queryParams = [lat, lng];
    let paramIndex = 3;

    // 카테고리 필터
    if (categories.length > 0) {
      baseQuery += ` AND p.category = ANY($${paramIndex})`;
      queryParams.push(categories);
      paramIndex++;
    }

    // 예산 필터 (유료 장소만)
    if (budget && budget > 0) {
      baseQuery += ` AND (p.is_free = true OR p.avg_price_per_person <= $${paramIndex})`;
      queryParams.push(budget);
      paramIndex++;
    }

    // 거리 필터
    baseQuery += ` AND (
      6371 * acos(
        cos(radians($1)) * cos(radians(p.latitude)) * 
        cos(radians(p.longitude) - radians($2)) + 
        sin(radians($1)) * sin(radians(p.latitude))
      )
    ) <= $${paramIndex}`;
    queryParams.push(radius / 1000); // km 단위

    baseQuery += ` ORDER BY distance, p.rating DESC, p.review_count DESC`;
    baseQuery += ` LIMIT 50`; // 후보 장소 수 제한

    const result = await query(baseQuery, queryParams);
    return result.rows;
  }

  /**
   * 코스 조합 생성
   */
  async generateCourseCombinations(options) {
    const { places, budget, maxPlaces } = options;
    const combinations = [];

    // 장소를 카테고리별로 그룹화
    const placesByCategory = this.groupPlacesByCategory(places);

    // 1개 장소부터 maxPlaces까지의 조합 생성
    for (let placeCount = 1; placeCount <= maxPlaces; placeCount++) {
      const categoryCombinations = this.getCategoryCombinations(placesByCategory, placeCount);
      
      for (const categoryCombo of categoryCombinations) {
        const placeCombinations = this.getPlaceCombinations(categoryCombo, placeCount);
        
        for (const placeCombo of placeCombinations) {
          const totalPrice = placeCombo.reduce((sum, place) => {
            return sum + (place.avg_price_per_person || 0);
          }, 0);

          // 예산 내인 조합만 추가
          if (totalPrice <= budget) {
            combinations.push({
              places: placeCombo,
              totalPrice,
              estimatedDuration: this.estimateDuration(placeCombo),
              averageRating: this.calculateAverageRating(placeCombo)
            });
          }
        }
      }
    }

    // 총비용 기준으로 정렬
    return combinations.sort((a, b) => a.totalPrice - b.totalPrice);
  }

  /**
   * 장소를 카테고리별로 그룹화
   */
  groupPlacesByCategory(places) {
    const grouped = {};
    places.forEach(place => {
      if (!grouped[place.category]) {
        grouped[place.category] = [];
      }
      grouped[place.category].push(place);
    });
    return grouped;
  }

  /**
   * 카테고리 조합 생성
   */
  getCategoryCombinations(placesByCategory, count) {
    const categories = Object.keys(placesByCategory);
    const combinations = [];

    // 재귀적으로 조합 생성
    const combine = (start, current, depth) => {
      if (depth === 0) {
        combinations.push([...current]);
        return;
      }

      for (let i = start; i < categories.length; i++) {
        current.push(categories[i]);
        combine(i + 1, current, depth - 1);
        current.pop();
      }
    };

    combine(0, [], count);
    return combinations;
  }

  /**
   * 장소 조합 생성
   */
  getPlaceCombinations(categoryCombo, placeCount) {
    // 간단한 구현: 각 카테고리에서 첫 번째 장소만 선택
    const combinations = [];
    
    // 재귀적으로 장소 선택
    const selectPlaces = (categoryIndex, selectedPlaces) => {
      if (selectedPlaces.length === placeCount) {
        combinations.push([...selectedPlaces]);
        return;
      }

      if (categoryIndex >= categoryCombo.length) return;

      const category = categoryCombo[categoryIndex];
      const places = placesByCategory[category];

      // 각 카테고리에서 장소 선택
      for (const place of places) {
        selectedPlaces.push(place);
        selectPlaces(categoryIndex + 1, selectedPlaces);
        selectedPlaces.pop();
      }
    };

    const placesByCategory = {};
    categoryCombo.forEach(category => {
      placesByCategory[category] = this.groupPlacesByCategory(this.places)[category];
    });

    selectPlaces(0, []);
    return combinations;
  }

  /**
   * 예상 소요 시간 계산
   */
  estimateDuration(places) {
    // 기본: 장소당 평균 1시간 + 이동 시간
    const baseTimePerPlace = 60; // 분
    const moveTimeBetweenPlaces = 10; // 분
    
    return (places.length * baseTimePerPlace) + 
           ((places.length - 1) * moveTimeBetweenPlaces);
  }

  /**
   * 평균 평점 계산
   */
  calculateAverageRating(places) {
    const totalRating = places.reduce((sum, place) => {
      return sum + (place.rating || 0);
    }, 0);
    
    return places.length > 0 ? totalRating / places.length : 0;
  }

  /**
   * 코스 랭킹
   */
  async rankCourses(courses) {
    // 다양한 기준으로 점수 계산
    const rankedCourses = courses.map(course => {
      let score = 0;

      // 가성비 점수 (예산 대비 가치)
      const valueScore = Math.min(course.totalPrice / 10000, 1); // 1만원당 1점
      score += valueScore * 30;

      // 평균 평점 점수
      const ratingScore = (course.averageRating / 5) * 25;
      score += ratingScore;

      // 장소 수 점수 (다양성)
      const diversityScore = (course.places.length / 4) * 20;
      score += diversityScore;

      // 무료 장소 비율 점수
      const freePlaceCount = course.places.filter(p => p.is_free).length;
      const freeRatioScore = (freePlaceCount / course.places.length) * 15;
      score += freeRatioScore;

      // 인기도 점수 (리뷰 수 기반)
      const totalReviews = course.places.reduce((sum, p) => sum + (p.review_count || 0), 0);
      const popularityScore = Math.min(totalReviews / 1000, 1) * 10;
      score += popularityScore;

      return {
        ...course,
        score: Math.round(score * 100) / 100,
        scoreBreakdown: {
          value: valueScore * 30,
          rating: ratingScore,
          diversity: diversityScore,
          freeRatio: freeRatioScore,
          popularity: popularityScore
        }
      };
    });

    // 점수 기준으로 정렬
    return rankedCourses.sort((a, b) => b.score - a.score);
  }

  /**
   * 모든 코스 목록 조회
   */
  async getAllCourses(options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      budgetMin,
      budgetMax,
      difficulty,
      tags
    } = options;

    let whereConditions = ['c.is_active = true'];
    const queryParams = [];
    let paramIndex = 1;

    // 예산 필터
    if (budgetMin) {
      whereConditions.push(`c.budget_min >= $${paramIndex}`);
      queryParams.push(budgetMin);
      paramIndex++;
    }

    if (budgetMax) {
      whereConditions.push(`c.budget_max <= $${paramIndex}`);
      queryParams.push(budgetMax);
      paramIndex++;
    }

    // 난이도 필터
    if (difficulty) {
      whereConditions.push(`c.difficulty_level = $${paramIndex}`);
      queryParams.push(difficulty);
      paramIndex++;
    }

    // 태그 필터
    if (tags && tags.length > 0) {
      whereConditions.push(`c.tags && $${paramIndex}`);
      queryParams.push(tags);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // 전체 카운트
    const countQuery = `
      SELECT COUNT(*) 
      FROM courses c
      WHERE ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // 페이지네이션 계산
    const offset = (page - 1) * limit;

    // 메인 쿼리
    const mainQuery = `
      SELECT 
        c.*,
        (
          SELECT json_agg(
            json_build_object(
              'id', cp.place_id,
              'name', p.name,
              'visit_order', cp.visit_order,
              'estimated_time_spent_minutes', cp.estimated_time_spent_minutes
            )
          )
          FROM course_places cp
          JOIN places p ON cp.place_id = p.id
          WHERE cp.course_id = c.id
          ORDER BY cp.visit_order
        ) as places
      FROM courses c
      WHERE ${whereClause}
      ORDER BY c.${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const result = await query(mainQuery, queryParams);

    return {
      courses: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 코스 상세 정보 조회
   */
  async getCourseById(courseId) {
    const queryText = `
      SELECT 
        c.*,
        (
          SELECT json_agg(
            json_build_object(
              'id', cp.place_id,
              'name', p.name,
              'category', p.category,
              'address', p.address,
              'latitude', p.latitude,
              'longitude', p.longitude,
              'phone', p.phone,
              'rating', p.rating,
              'avg_price_per_person', p.avg_price_per_person,
              'is_free', p.is_free,
              'visit_order', cp.visit_order,
              'estimated_time_spent_minutes', cp.estimated_time_spent_minutes
            )
          )
          FROM course_places cp
          JOIN places p ON cp.place_id = p.id
          WHERE cp.course_id = $1
          ORDER BY cp.visit_order
        ) as places
      FROM courses c
      WHERE c.id = $1 AND c.is_active = true
    `;

    const result = await query(queryText, [courseId]);
    return result.rows[0] || null;
  }
}

module.exports = new CourseController();