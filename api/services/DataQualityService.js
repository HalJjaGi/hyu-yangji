class DataQualityService {
  constructor() {
    this.validators = new Map();
    this.enhancers = new Map();
    this.metrics = {
      processed: 0,
      enhanced: 0,
      errors: 0,
      quality_scores: []
    };
  }

  // 데이터 검증 메인 함수
  async validateAndEnhanceData(data, source = 'default') {
    try {
      this.metrics.processed++;
      
      // 1. 기본 검증
      const validationResult = this.validateBasicStructure(data);
      if (!validationResult.valid) {
        this.metrics.errors++;
        return { 
          success: false, 
          errors: validationResult.errors,
          data: null 
        };
      }

      // 2. 데이터 품질 평가
      const qualityAssessment = this.assessDataQuality(data);
      
      // 3. 데이터 보강
      const enhancedData = await this.enhanceData(data, qualityAssessment);
      
      // 4. 최종 검증
      const finalValidation = this.validateEnhancedData(enhancedData);
      
      if (finalValidation.valid) {
        this.metrics.enhanced++;
        this.metrics.quality_scores.push(finalValidation.quality_score);
        
        return {
          success: true,
          data: enhancedData,
          quality_score: finalValidation.quality_score,
          improvements: qualityAssessment.improvements,
          metadata: {
            source,
            processed_at: new Date().toISOString(),
            quality_metrics: finalValidation.metrics
          }
        };
      } else {
        this.metrics.errors++;
        return {
          success: false,
          errors: finalValidation.errors,
          data: null
        };
      }
    } catch (error) {
      this.metrics.errors++;
      return {
        success: false,
        errors: [error.message],
        data: null
      };
    }
  }

  // 기본 구조 검증
  validateBasicStructure(data) {
    const errors = [];
    
    // 필수 필드 검사
    const requiredFields = ['name', 'category', 'location'];
    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // 위치 정보 검사
    if (data.location && (!data.location.coordinates || data.location.coordinates.length !== 2)) {
      errors.push('Invalid location coordinates');
    }
    
    // 카테고리 검사
    if (data.category && !data.category.main) {
      errors.push('Missing main category');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 데이터 품질 평가
  assessDataQuality(data) {
    const assessment = {
      completeness: this.calculateCompleteness(data),
      accuracy: this.estimateAccuracy(data),
      consistency: this.checkConsistency(data),
      timeliness: this.checkTimeliness(data),
      improvements: []
    };

    // 개선 사항 도출
    if (assessment.completeness < 0.8) {
      assessment.improvements.push('incomplete_basic_info');
    }
    if (assessment.accuracy < 0.7) {
      assessment.improvements.push('inaccurate_location');
    }
    if (assessment.consistency < 0.9) {
      assessment.improvements.push('inconsistent_formatting');
    }
    if (assessment.timeliness < 0.8) {
      assessment.improvements.push('outdated_info');
    }

    return assessment;
  }

  // 완성도 계산
  calculateCompleteness(data) {
    const fields = [
      'name', 'category', 'location', 'address',
      'contact', 'operating_hours', 'description',
      'rating', 'images'
    ];
    
    let completedFields = 0;
    for (const field of fields) {
      if (this.hasField(data, field)) {
        completedFields++;
      }
    }
    
    return completedFields / fields.length;
  }

  // 정확도 추정
  estimateAccuracy(data) {
    let accuracy = 0.7; // 기본값
    
    // 위치 정확도
    if (data.location && data.location.coordinates) {
      accuracy += 0.15;
    }
    
    // 연락처 정확도
    if (data.contact && this.validateContact(data.contact)) {
      accuracy += 0.1;
    }
    
    // 영업시간 정확도
    if (data.operating_hours && data.operating_hours.length > 0) {
      accuracy += 0.05;
    }
    
    return Math.min(1.0, accuracy);
  }

  // 일관성 검사
  checkConsistency(data) {
    let consistency = 1.0;
    
    // 카테고리 일관성
    if (data.category && data.tags) {
      const relevantTags = this.getRelevantTags(data.category.main);
      const matchingTags = data.tags.filter(tag => 
        relevantTags.includes(tag)
      );
      if (matchingTags.length < data.tags.length * 0.5) {
        consistency -= 0.2;
      }
    }
    
    // 주소 형식 일관성
    if (data.address && !this.validateAddressFormat(data.address)) {
      consistency -= 0.1;
    }
    
    return Math.max(0, consistency);
  }

  // 신선도 검사
  checkTimeliness(data) {
    const now = new Date();
    const created = new Date(data.created_at || now);
    const updated = new Date(data.updated_at || created);
    
    const daysSinceUpdate = (now - updated) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate <= 1) {
      return 1.0; // 1일 이내 업데이트
    } else if (daysSinceUpdate <= 7) {
      return 0.9; // 1주 이내 업데이트
    } else if (daysSinceUpdate <= 30) {
      return 0.7; // 1개월 이내 업데이트
    } else {
      return 0.5; // 1개월 이상 경과
    }
  }

  // 데이터 보강
  async enhanceData(data, qualityAssessment) {
    let enhanced = { ...data };
    
    // 1. 완성도 보강
    if (qualityAssessment.improvements.includes('incomplete_basic_info')) {
      enhanced = await this.enhanceCompleteness(enhanced);
    }
    
    // 2. 위치 정보 보강
    if (qualityAssessment.improvements.includes('inaccurate_location')) {
      enhanced = await this.enhanceLocation(enhanced);
    }
    
    // 3. 추가 메타데이터
    enhanced = this.addMetadata(enhanced, qualityAssessment);
    
    return enhanced;
  }

  // 완성도 보강
  async enhanceCompleteness(data) {
    const enhanced = { ...data };
    
    // 누락된 주소 보완
    if (!enhanced.address && enhanced.location) {
      enhanced.address = await this.reverseGeocode(enhanced.location.coordinates);
    }
    
    // 누락된 연락처 보완
    if (!enhanced.contact) {
      enhanced.contact = this.inferContactInfo(enhanced);
    }
    
    // 누락된 운영시간 보완
    if (!enhanced.operating_hours) {
      enhanced.operating_hours = this.inferOperatingHours(enhanced.category.main);
    }
    
    // 기본 설명 추가
    if (!enhanced.description) {
      enhanced.description = this.generateDescription(enhanced);
    }
    
    return enhanced;
  }

  // 위치 정보 보강
  async enhanceLocation(data) {
    const enhanced = { ...data };
    
    // 주소 정확화
    if (enhanced.address) {
      enhanced.address = await this.standardizeAddress(enhanced.address);
    }
    
    // 지역구 정보 추출
    if (enhanced.address && !enhanced.address.district) {
      enhanced.address.district = this.extractDistrict(enhanced.address.full);
    }
    
    // 위치 정확도 점수 추가
    enhanced.location_accuracy = this.calculateLocationAccuracy(enhanced);
    
    return enhanced;
  }

  // 메타데이터 추가
  addMetadata(data, qualityAssessment) {
    const enhanced = { ...data };
    
    // 품질 점수
    enhanced.quality = {
      completeness: qualityAssessment.completeness,
      accuracy: qualityAssessment.accuracy,
      consistency: qualityAssessment.consistency,
      timeliness: qualityAssessment.timeliness,
      overall_score: (
        qualityAssessment.completeness * 0.3 +
        qualityAssessment.accuracy * 0.3 +
        qualityAssessment.consistency * 0.2 +
        qualityAssessment.timeliness * 0.2
      )
    };
    
    // 개선 이력
    enhanced.enhancement_history = [
      ...(data.enhancement_history || []),
      {
        timestamp: new Date().toISOString(),
        improvements: qualityAssessment.improvements,
        quality_score: enhanced.quality.overall_score
      }
    ];
    
    // 자동 태깅
    enhanced.auto_tags = this.generateAutoTags(enhanced);
    
    return enhanced;
  }

  // 보강된 데이터 최종 검증
  validateEnhancedData(data) {
    const errors = [];
    const metrics = {};
    
    // 위치 유효성 검증
    if (data.location && data.location.coordinates) {
      const [lng, lat] = data.location.coordinates;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        errors.push('Invalid coordinate range');
      }
      metrics.location_valid = lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
    }
    
    // 주소 유효성 검증
    if (data.address) {
      metrics.address_valid = this.validateAddress(data.address);
    }
    
    // 연락처 유효성 검증
    if (data.contact) {
      metrics.contact_valid = this.validateContact(data.contact);
    }
    
    // 운영시간 유효성 검증
    if (data.operating_hours) {
      metrics.operating_hours_valid = this.validateOperatingHours(data.operating_hours);
    }
    
    // 전체 품질 점수
    const totalValidMetrics = Object.values(metrics).filter(v => v === true).length;
    const totalMetrics = Object.keys(metrics).length;
    const quality_score = totalMetrics > 0 ? totalValidMetrics / totalMetrics : 0;
    
    return {
      valid: errors.length === 0,
      errors,
      quality_score,
      metrics
    };
  }

  // 유틸리티 메서드들
  hasField(obj, fieldPath) {
    const parts = fieldPath.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (!current || !current[part]) {
        return false;
      }
      current = current[part];
    }
    
    return current !== '' && current !== null && current !== undefined;
  }

  validateContact(contact) {
    if (!contact || typeof contact !== 'object') {
      return false;
    }
    
    // 전화번호 유효성
    if (contact.phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(contact.phone)) {
        return false;
      }
    }
    
    return true;
  }

  validateAddress(address) {
    if (!address || typeof address !== 'object') {
      return false;
    }
    
    // 기본 주소 구조 확인
    if (!address.full) {
      return false;
    }
    
    // 한국 주소 형식 검증
    const koreanAddressRegex = /^[서울인천부산대구광주대전울산경기강원충북충남전남제북제주특별광역시도]+/;
    return koreanAddressRegex.test(address.full);
  }

  validateOperatingHours(hours) {
    if (!Array.isArray(hours) || hours.length === 0) {
      return false;
    }
    
    for (const hour of hours) {
      if (!hour.day || !hour.open || !hour.close) {
        return false;
      }
      
      // 시간 형식 검증
      const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timeRegex.test(hour.open) || !timeRegex.test(hour.close)) {
        return false;
      }
    }
    
    return true;
  }

  // 가상 메서드 (실제 구현은 연동 필요)
  async reverseGeocode(coordinates) {
    // TODO: 구글맵스 API나 카카오맵스 API 연동
    return "서울특별시 성동구 왕십리로";
  }

  inferContactInfo(data) {
    // 카테고리에 따른 연락처 유추
    return {
      phone: data.category.main === 'restaurant' ? '02-123-4567' : '',
      website: ''
    };
  }

  inferOperatingHours(category) {
    // 카테고리별 일반적인 운영시간
    const defaultHours = {
      restaurant: [
        { day: '월', open: '11:00', close: '22:00' },
        { day: '화', open: '11:00', close: '22:00' },
        { day: '수', open: '11:00', close: '22:00' },
        { day: '목', open: '11:00', close: '22:00' },
        { day: '금', open: '11:00', close: '23:00' },
        { day: '토', open: '10:00', close: '23:00' },
        { day: '일', open: '10:00', close: '22:00' }
      ],
      culture: [
        { day: '월', open: '10:00', close: '18:00' },
        { day: '화', open: '10:00', close: '18:00' },
        { day: '수', open: '10:00', close: '18:00' },
        { day: '목', open: '10:00', close: '18:00' },
        { day: '금', open: '10:00', close: '20:00' },
        { day: '토', open: '10:00', close: '20:00' },
        { day: '일', open: '10:00', close: '18:00' }
      ]
    };
    
    return defaultHours[category] || defaultHours.restaurant;
  }

  generateDescription(data) {
    const categoryMap = {
      restaurant: `${data.name}은(는) ${data.address.district}에 위치한 맛집입니다.`,
      culture: `${data.name}은(는) ${data.address.district}의 문화시설입니다.`,
      shopping: `${data.name}은(는) ${data.address.district}의 쇼핑시설입니다.`,
      activity: `${data.name}은(는) ${data.address.district}에서 즐길 수 있는 활동입니다.`
    };
    
    return categoryMap[data.category.main] || `${data.name}은(는) ${data.address.district}의 장소입니다.`;
  }

  extractDistrict(address) {
    const districts = ['종로구', '중구', '용산구', '성동구', '광진구', '동대문구', 
                     '중랑구', '성북구', '강북구', '도봉구', '노원구', '은평구', 
                     '서대문구', '마포구', '양천구', '강서구', '구로구', '금천구', 
                     '영등포구', '동작구', '관악구', '서초구', '강남구', '송파구', '강동구'];
    
    for (const district of districts) {
      if (address.includes(district)) {
        return district;
      }
    }
    
    return '';
  }

  calculateLocationAccuracy(data) {
    // TODO: 실제 위치와의 거리 계산
    return 0.8; // 임시 값
  }

  getRelevantTags(category) {
    const tagMap = {
      restaurant: ['음식', '맛집', '식당', '카페', '음료'],
      culture: ['문화', '갤러리', '박물관', '전시', '공연'],
      shopping: ['쇼핑', '매장', '상점', '브랜드'],
      activity: ['활동', '체험', '레저', '운동']
    };
    
    return tagMap[category] || [];
  }

  generateAutoTags(data) {
    const tags = [];
    
    // 카테고리 기반 태그
    tags.push(data.category.main);
    
    // 위치 기반 태그
    if (data.address.district) {
      tags.push(data.address.district);
    }
    
    // 품질 기반 태그
    if (data.quality && data.quality.overall_score > 0.9) {
      tags.push('추천장소');
    }
    
    return tags;
  }

  // 메트릭 조회
  getMetrics() {
    return {
      ...this.metrics,
      average_quality_score: this.metrics.quality_scores.length > 0 
        ? this.metrics.quality_scores.reduce((a, b) => a + b) / this.metrics.quality_scores.length 
        : 0,
      success_rate: this.metrics.processed > 0 
        ? ((this.metrics.processed - this.metrics.errors) / this.metrics.processed) * 100 
        : 0
    };
  }

  // 메트릭 리셋
  resetMetrics() {
    this.metrics = {
      processed: 0,
      enhanced: 0,
      errors: 0,
      quality_scores: []
    };
  }
}

module.exports = DataQualityService;