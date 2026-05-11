const axios = require('axios');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/api-service.log' })
  ]
});

class APIService {
  constructor() {
    this.seoulAPI = {
      baseURL: 'https://openapi.seoul.go.kr:8088',
      key: process.env.SEOUL_API_KEY,
      services: {
        culture: {
          endpoint: '/{KEY}/json/TbVwCulture/{start}/{end}',
          name: '서울 문화시설'
        },
        restaurant: {
          endpoint: '/{KEY}/json/TbVwRestaurant/{start}/{end}',
          name: '서울 맛집정보'
        },
        market: {
          endpoint: '/{KEY}/json/TbVwMarket/{start}/{end}',
          name: '서울 전통시장'
        }
      }
    };
    
    this.tourismAPI = {
      baseURL: 'http://api.visitkorea.or.kr/openapi/service/rest/KorService',
      key: process.env.TOURISM_API_KEY,
      services: {
        areaBased: {
          endpoint: '/areaBasedList',
          name: '지역기반 관광정보'
        },
        categoryCode: {
          endpoint: '/categoryCode',
          name: '서비스 분류 코드'
        }
      }
    };
    
    this.axiosConfig = {
      timeout: 30000,
      headers: {
        'User-Agent': 'HYU양지:GO/1.0'
      }
    };
  }

  async fetchSeoulData(serviceType, start = 1, end = 1000) {
    try {
      const service = this.seoulAPI.services[serviceType];
      if (!service) {
        throw new Error(`Unknown Seoul API service: ${serviceType}`);
      }
      
      const url = `${this.seoulAPI.baseURL}${service.endpoint}`
        .replace('{KEY}', this.seoulAPI.key)
        .replace('{start}', start)
        .replace('{end}', end);
      
      logger.info(`Fetching Seoul API: ${service.name}`, { url });
      
      const response = await axios.get(url, this.axiosConfig);
      
      // 서울열린데이터 응답 구조
      const dataKey = Object.keys(response.data).find(key => 
        Array.isArray(response.data[key])
      );
      
      const result = response.data[dataKey] || [];
      
      logger.info(`Seoul API response: ${service.name}`, {
        total: result.length,
        hasResult: result.length > 0
      });
      
      return {
        success: true,
        source: 'seoul_api',
        service: serviceType,
        data: result,
        total: result.length
      };
      
    } catch (error) {
      logger.error('Seoul API error', {
        service: serviceType,
        error: error.message,
        status: error.response?.status
      });
      
      return {
        success: false,
        source: 'seoul_api',
        service: serviceType,
        error: error.message,
        data: []
      };
    }
  }

  async fetchTourismData(serviceType, params = {}) {
    try {
      const service = this.tourismAPI.services[serviceType];
      if (!service) {
        throw new Error(`Unknown Tourism API service: ${serviceType}`);
      }
      
      const url = `${this.tourismAPI.baseURL}${service.endpoint}`;
      
      const defaultParams = {
        serviceKey: this.tourismAPI.key,
        MobileOS: 'ETC',
        MobileApp: 'HYU양지:GO',
        numOfRows: 1000,
        pageNo: 1,
        ...params
      };
      
      logger.info(`Fetching Tourism API: ${service.name}`, { url, params: defaultParams });
      
      const response = await axios.get(url, {
        ...this.axiosConfig,
        params: defaultParams
      });
      
      // 관광공사 API 응답 구조
      const items = response.data.response?.body?.items?.item || [];
      
      // item이 배열이 아닌 경우 배열로 변환
      const result = Array.isArray(items) ? items : [items].filter(Boolean);
      
      logger.info(`Tourism API response: ${service.name}`, {
        total: result.length,
        hasResult: result.length > 0
      });
      
      return {
        success: true,
        source: 'tourism_api',
        service: serviceType,
        data: result,
        total: result.length
      };
      
    } catch (error) {
      logger.error('Tourism API error', {
        service: serviceType,
        error: error.message,
        status: error.response?.status
      });
      
      return {
        success: false,
        source: 'tourism_api',
        service: serviceType,
        error: error.message,
        data: []
      };
    }
  }

  async fetchAllSeoulData() {
    const results = [];
    const services = ['culture', 'restaurant', 'market'];
    
    for (const service of services) {
      try {
        // 페이지네이션 처리 (최대 1000개씩)
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const start = (page - 1) * 1000 + 1;
          const end = page * 1000;
          
          const result = await this.fetchSeoulData(service, start, end);
          
          if (result.success && result.data.length > 0) {
            results.push(...result.data.map(item => ({
              ...item,
              _source: 'seoul_api',
              _service: service,
              _page: page
            })));
            
            page++;
            hasMore = result.data.length === 1000; // 1000개 미만이면 마지막 페이지
            
            // API 호출 간 딜레이 (레이트 리밋 방지)
            await new Promise(resolve => setTimeout(resolve, 100));
          } else {
            hasMore = false;
          }
        }
        
      } catch (error) {
        logger.error(`Error fetching ${service} data:`, error);
      }
    }
    
    return {
      success: true,
      source: 'seoul_api',
      services: services,
      total: results.length,
      data: results
    };
  }

  async fetchAllTourismData(areaCode = 1) {
    const results = [];
    const services = ['areaBased'];
    
    for (const service of services) {
      try {
        // 서울 지역 (areaCode = 1)의 모든 시군구
        const sigunguCodes = [17]; // 성동구
        // 필요시 다른 시군구 코드 추가 가능
        
        for (const sigunguCode of sigunguCodes) {
          const result = await this.fetchTourismData(service, {
            areaCode: areaCode,
            sigunguCode: sigunguCode
          });
          
          if (result.success && result.data.length > 0) {
            results.push(...result.data.map(item => ({
              ...item,
              _source: 'tourism_api',
              _service: service,
              _areaCode: areaCode,
              _sigunguCode: sigunguCode
            })));
          }
          
          // API 호출 간 딜레이
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        logger.error(`Error fetching ${service} data:`, error);
      }
    }
    
    return {
      success: true,
      source: 'tourism_api',
      services: services,
      total: results.length,
      data: results
    };
  }

  // 데이터 품질 검사
  validateAPIData(data, source) {
    const validated = data.filter(item => {
      // 필수 필드 검사
      const hasName = item.name || item.title || item.FACIL_NM || item.TITLE;
      const hasLocation = item.X_COORD || item.mapx || item.lng;
      
      if (!hasName) {
        logger.warn('Invalid API data: missing name', { item });
        return false;
      }
      
      if (!hasLocation) {
        logger.warn('Invalid API data: missing location', { name: hasName });
        return false;
      }
      
      return true;
    });
    
    logger.info(`Data validation result`, {
      source,
      original: data.length,
      validated: validated.length,
      removed: data.length - validated.length
    });
    
    return validated;
  }

  // 데이터 변환 공통 유틸리티
  transformLocation(item) {
    let lng, lat;
    
    // 서울열린데이터광장 형식
    if (item.X_COORD && item.Y_COORD) {
      lng = parseFloat(item.X_COORD);
      lat = parseFloat(item.Y_COORD);
    }
    // 관광공사 형식
    else if (item.mapx && item.mapy) {
      lng = parseFloat(item.mapx);
      lat = parseFloat(item.mapy);
    }
    // 기타 형식
    else if (item.lng && item.lat) {
      lng = parseFloat(item.lng);
      lat = parseFloat(item.lat);
    }
    
    if (lng && lat) {
      return {
        type: 'Point',
        coordinates: [lng, lat],
        accuracy: 'medium'
      };
    }
    
    return null;
  }

  transformAddress(item) {
    // 서울열린데이터광장 형식
    if (item.ADDR) {
      return {
        full: item.ADDR,
        city: '서울특별시',
        district: this.extractDistrict(item.ADDR),
        detail: item.DTL_ADDR || ''
      };
    }
    // 관광공사 형식
    else if (item.addr1) {
      return {
        full: item.addr1,
        city: '서울특별시',
        district: this.extractDistrict(item.addr1),
        detail: item.addr2 || ''
      };
    }
    
    return {
      full: '',
      city: '서울특별시',
      district: '',
      detail: ''
    };
  }

  extractDistrict(address) {
    if (!address) return '';
    
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

  // API 상태 모니터링
  async checkAPIStatus() {
    const status = {
      seoul_api: {},
      tourism_api: {},
      timestamp: new Date()
    };
    
    // 서울열린데이터광장 상태 체크
    try {
      const seoulResult = await this.fetchSeoulData('culture', 1, 1);
      status.seoul_api = {
        status: seoulResult.success ? 'healthy' : 'error',
        response_time: seoulResult.success ? 'OK' : 'Timeout',
        error: seoulResult.error || null
      };
    } catch (error) {
      status.seoul_api = {
        status: 'error',
        response_time: 'Timeout',
        error: error.message
      };
    }
    
    // 관광공사 API 상태 체크
    try {
      const tourismResult = await this.fetchTourismData('areaBased', {
        areaCode: 1,
        numOfRows: 1
      });
      status.tourism_api = {
        status: tourismResult.success ? 'healthy' : 'error',
        response_time: tourismResult.success ? 'OK' : 'Timeout',
        error: tourismResult.error || null
      };
    } catch (error) {
      status.tourism_api = {
        status: 'error',
        response_time: 'Timeout',
        error: error.message
      };
    }
    
    logger.info('API Status Check', status);
    
    return status;
  }

  /**
   * 서울시 API 데이터 동기화
   */
  async syncSeoulData(force = false) {
    try {
      console.log('Starting Seoul API synchronization...');
      
      // 서울 문화시설 API 데이터 수집
      const cultureData = await this.fetchSeoulData('culture', { start: 1, end: 100 });
      
      // 데이터베이스 저장 로직
      const Place = require('../models/Place');
      
      let imported = 0;
      let updated = 0;
      let errors = 0;
      
      if (cultureData.success && cultureData.data) {
        for (const item of cultureData.data) {
          try {
            const placeData = {
              name: item.FACIL_NAME || item.NAME || 'Unknown',
              category: {
                main: 'culture',
                sub: item.CLSFC_CODE_NM || 'cultural facility'
              },
              location: {
                coordinates: [
                  parseFloat(item.X_COORD) || 127.0,
                  parseFloat(item.Y_COORD) || 37.5
                ]
              },
              address: {
                full: item.ADDR || 'Seoul',
                district: this.extractDistrict(item.ADDR || '')
              },
              contact: {
                phone: item.CNTCT_TEL || ''
              },
              operating_hours: this.inferOperatingHours('culture'),
              description: `문화시설: ${item.FACIL_NAME || 'Unknown'}`,
              data_sources: [
                {
                  source: 'seoul_culture_api',
                  last_sync: new Date(),
                  api_id: item.FACIL_ID || ''
                }
              ]
            };
            
            // 기존 장소가 있는지 확인
            const existingPlace = await Place.findOne({
              'data_sources.api_id': item.FACIL_ID
            });
            
            if (existingPlace && !force) {
              updated++;
            } else {
              // 데이터 품질 검증 및 보강
              const DataQualityService = require('./DataQualityService');
              const qualityService = new DataQualityService();
              
              const qualityResult = await qualityService.validateAndEnhanceData(placeData);
              
              if (qualityResult.success) {
                if (existingPlace && force) {
                  // 기존 장소 업데이트
                  await Place.findByIdAndUpdate(existingPlace._id, {
                    $set: qualityResult.data,
                    $push: { 
                      enhancement_history: {
                        timestamp: new Date(),
                        action: 'sync_update',
                        source: 'seoul_culture_api'
                      }
                    }
                  });
                  updated++;
                } else {
                  // 새 장소 생성
                  await Place.create(qualityResult.data);
                  imported++;
                }
              } else {
                console.log('Quality validation failed:', qualityResult.errors);
                errors++;
              }
            }
          } catch (error) {
            console.log('Error processing item:', error.message);
            errors++;
          }
        }
      }
      
      const result = {
        success: true,
        source: 'seoul_culture_api',
        imported,
        updated,
        errors,
        total_processed: imported + updated + errors,
        quality_improvements: true
      };
      
      console.log('Seoul API sync completed:', result);
      return result;
      
    } catch (error) {
      console.error('Seoul API sync error:', error);
      return {
        success: false,
        source: 'seoul_culture_api',
        error: error.message,
        imported: 0,
        updated: 0,
        errors: 0
      };
    }
  }

  /**
   * 데이터 품질 보고서
   */
  async getQualitySummary() {
    try {
      const Place = require('../models/Place');
      
      // 전체 장소 수
      const totalPlaces = await Place.countDocuments();
      
      // 품질 점수별 분포
      const qualityDistribution = await Place.aggregate([
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lt: ['$quality_score', 0.3] }, then: 'low' },
                  { case: { $lt: ['$quality_score', 0.7] }, then: 'medium' },
                  { default: 'high' }
                ]
              }
            },
            count: { $sum: 1 }
          }
        }
      ]);
      
      // 데이터 소스별 분포
      const sourceDistribution = await Place.aggregate([
        {
          $unwind: '$data_sources'
        },
        {
          $group: {
            _id: '$data_sources.source',
            count: { $sum: 1 }
          }
        }
      ]);
      
      // 최근 동기화 현황
      const recentSync = await Place.findOne()
        .sort({ 'data_sources.last_sync': -1 })
        .select('data_sources.last_sync data_sources.source');
      
      // 평균 품질 점수
      const avgQuality = await Place.aggregate([
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$quality_score' }
          }
        }
      ]);
      
      return {
        success: true,
        summary: {
          total_places: totalPlaces,
          quality_distribution: qualityDistribution,
          source_distribution: sourceDistribution,
          average_quality_score: avgQuality[0]?.avgScore || 0,
          last_sync: recentSync?.data_sources?.[0]?.last_sync || null,
          system_status: 'operational',
          quality_improvements_enabled: true
        },
        metrics: {
          // 품질 개선 메트릭
          places_with_enhancement: await Place.countDocuments({ 'enhancement_history.0': { $exists: true } }),
          // 주소 보강 완료
          addresses_enhanced: await Place.countDocuments({ 'address.district': { $ne: '' } }),
          // 위치 좌표 완료
          coordinates_enhanced: await Place.countDocuments({ 'location.coordinates.0': { $ne: 0 } }),
          // 최근 24시간 업데이트
          recent_updates: await Place.countDocuments({
            'data_sources.last_sync': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          })
        }
      };
      
    } catch (error) {
      console.error('Quality summary error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = APIService;