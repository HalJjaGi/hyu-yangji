const DataQualityService = require('../services/DataQualityService');

class DataQualityMiddleware {
  constructor() {
    this.dataQualityService = new DataQualityService();
  }

  // 장소 데이터 품질 검사 미들웨어
  async validatePlaceData(req, res, next) {
    try {
      // POST/PUT 요청의 데이터만 검사
      if (req.method === 'POST' || req.method === 'PUT') {
        const placeData = req.body;
        
        // 데이터 품질 검증 및 보강
        const result = await this.dataQualityService.validateAndEnhanceData(placeData);
        
        if (!result.success) {
          return res.status(400).json({
            success: false,
            error: 'Data quality validation failed',
            details: result.errors,
            suggestion: 'Please check the required fields and format'
          });
        }
        
        // 보강된 데이터로 교체
        req.body = result.data;
        
        // 품질 정보를 response에 추가 (나중에 사용 가능하도록)
        req.dataQuality = {
          quality_score: result.quality_score,
          improvements: result.improvements,
          metadata: result.metadata
        };
      }
      
      next();
    } catch (error) {
      console.error('Data quality middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during data quality validation',
        message: error.message
      });
    }
  }

  // 응답에 품질 정보 추가 미들웨어
  addQualityInfo(req, res, next) {
    // 기존 res.json 메서드를 오버라이드
    const originalJson = res.json;
    
    res.json = function(data) {
      // 품질 정보가 있다면 추가
      if (req.dataQuality && data.success === true) {
        data.data_quality = req.dataQuality;
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  }

  // 대량 데이터 품질 검사 미들웨어
  async validateBulkData(req, res, next) {
    try {
      if (req.method === 'POST' && Array.isArray(req.body)) {
        const originalData = req.body;
        const validatedData = [];
        const errors = [];
        
        for (let i = 0; i < originalData.length; i++) {
          const item = originalData[i];
          const result = await this.dataQualityService.validateAndEnhanceData(item);
          
          if (result.success) {
            validatedData.push(result.data);
          } else {
            errors.push({
              index: i,
              errors: result.errors,
              data: item
            });
          }
        }
        
        // 오류가 있는 경우
        if (errors.length > 0) {
          return res.status(207).json({
            success: true,
            message: 'Bulk validation completed with some errors',
            validated_count: validatedData.length,
            error_count: errors.length,
            data: validatedData,
            errors: errors
          });
        }
        
        // 모두 성공인 경우
        req.body = validatedData;
      }
      
      next();
    } catch (error) {
      console.error('Bulk data quality validation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Bulk data quality validation failed',
        message: error.message
      });
    }
  }

  // API 동기화 데이터 품질 검사 미들웨어
  async validateSyncData(req, res, next) {
    try {
      if (req.path === '/api/sync/start' && req.method === 'POST') {
        console.log('Starting API data quality validation for sync...');
        
        const syncResult = {
          total_places: 0,
          validated_places: 0,
          enhanced_places: 0,
          quality_issues: [],
          average_quality_score: 0
        };
        
        // 동기화가 완료된 후 품질 검사
        const originalEnd = res.end;
        res.end = function(chunk, encoding) {
          originalEnd.call(this, chunk, encoding);
          
          // 비동기적으로 품질 검사 실행
          setTimeout(async () => {
            try {
              const Place = require('../models/Place');
              const places = await Place.find({
                'data_sources.source': { $in: ['seoul_culture_api', 'tourism_api'] }
              }).limit(100); // 최근 100개만 검사
            
              let totalScore = 0;
              let checkedCount = 0;
              
              for (const place of places) {
                const result = await this.dataQualityService.validateAndEnhanceData(place.toObject());
                syncResult.total_places++;
                
                if (result.success) {
                  syncResult.validated_places++;
                  totalScore += result.quality_score;
                  checkedCount++;
                  
                  if (result.quality_score < 0.7) {
                    syncResult.quality_issues.push({
                      place_id: place.id,
                      name: place.name,
                      quality_score: result.quality_score,
                      issues: result.improvements
                    });
                  }
                  
                  // 품질 개선된 데이터 업데이트
                  if (result.quality_score > (place.quality?.overall_score || 0)) {
                    await Place.findByIdAndUpdate(place._id, {
                      $set: {
                        quality: result.data.quality,
                        address: result.data.address,
                        contact: result.data.contact,
                        operating_hours: result.data.operating_hours,
                        description: result.data.description,
                        auto_tags: result.data.auto_tags,
                        enhancement_history: result.data.enhancement_history,
                        updated_at: new Date()
                      }
                    });
                    syncResult.enhanced_places++;
                  }
                }
              }
              
              syncResult.average_quality_score = checkedCount > 0 ? totalScore / checkedCount : 0;
              
              console.log('Data quality validation completed:', syncResult);
              
              // 품질 보고서 저장 (나중에 분석용)
              const qualityReport = {
                timestamp: new Date().toISOString(),
                sync_result: syncResult,
                metrics: this.dataQualityService.getMetrics()
              };
              
              // TODO: 품질 보고서를 로그 파일이나 데이터베이스에 저장
              console.log('Quality report generated:', qualityReport);
              
            } catch (error) {
              console.error('Error in post-sync data quality validation:', error);
            }
          }, 1000); // 1초 후 실행
        };
      }
      
      next();
    } catch (error) {
      console.error('Sync data quality middleware error:', error);
      next();
    }
  }
}

// 미들웨어 생성 함수
function createDataQualityMiddleware(options = {}) {
  const middleware = new DataQualityMiddleware();
  
  return {
    validatePlaceData: middleware.validatePlaceData.bind(middleware),
    addQualityInfo: middleware.addQualityInfo.bind(middleware),
    validateBulkData: middleware.validateBulkData.bind(middleware),
    validateSyncData: middleware.validateSyncData.bind(middleware)
  };
}

module.exports = createDataQualityMiddleware;