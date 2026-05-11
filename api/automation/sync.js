const cron = require('node-cron');
const APIService = require('../services/APIService');
const Place = require('../models/Place');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/automation.log' })
  ]
});

class SyncAutomation {
  constructor() {
    this.apiService = new APIService();
    this.syncJobs = new Map();
    this.isRunning = false;
  }

  // 자동 동기화 시작
  startAutomation() {
    logger.info('Starting data synchronization automation');
    
    // 매일 오전 3시에 전체 데이터 동기화
    this.scheduleJob('daily-sync', '0 3 * * *', async () => {
      await this.runFullSync('scheduled');
    });
    
    // 매 6시간마다 API 상태 확인
    this.scheduleJob('api-status', '0 */6 * * *', async () => {
      await this.checkAPIHealth();
    });
    
    // 매주 월요일 오전 9시에 품질 검사
    this.scheduleJob('quality-check', '0 9 * * 1', async () => {
      await this.runQualityCheck();
    });
    
    logger.info('Automation jobs scheduled');
  }

  // 동기화 작업 스케줄링
  scheduleJob(name, cronExpression, task) {
    try {
      if (this.syncJobs.has(name)) {
        this.stopJob(name);
      }
      
      const job = cron.schedule(cronExpression, task, {
        scheduled: true,
        timezone: "Asia/Seoul"
      });
      
      this.syncJobs.set(name, {
        job,
        name,
        cronExpression,
        lastRun: null,
        status: 'scheduled'
      });
      
      logger.info(`Scheduled job: ${name}`, { cronExpression });
      
    } catch (error) {
      logger.error(`Failed to schedule job: ${name}`, { error: error.message });
    }
  }

  // 작업 중지
  stopJob(name) {
    const jobInfo = this.syncJobs.get(name);
    if (jobInfo) {
      jobInfo.job.stop();
      jobInfo.status = 'stopped';
      logger.info(`Stopped job: ${name}`);
    }
  }

  // 전체 동기화 실행
  async runFullSync(trigger = 'manual') {
    if (this.isRunning) {
      logger.warn('Sync already running, skipping...');
      return;
    }
    
    this.isRunning = true;
    const startTime = new Date();
    
    try {
      logger.info('Starting full data synchronization', { trigger });
      
      const results = {
        trigger,
        started_at: startTime,
        sources: {},
        summary: {
          total: 0,
          created: 0,
          updated: 0,
          duplicates: 0,
          errors: 0
        },
        duration: 0
      };
      
      // 1. 서울열린데이터광장 동기화
      logger.info('Syncing Seoul Open Data API...');
      try {
        const seoulResult = await this.syncSeoulData();
        results.sources.seoul = seoulResult;
        results.summary.total += seoulResult.total;
        results.summary.created += seoulResult.created;
        results.summary.updated += seoulResult.updated;
        results.summary.duplicates += seoulResult.duplicates;
        results.summary.errors += seoulResult.errors;
      } catch (error) {
        logger.error('Seoul API sync failed', { error: error.message });
        results.sources.seoul = { error: error.message };
        results.summary.errors++;
      }
      
      // 2. 한국관광공사 API 동기화
      logger.info('Syncing Korea Tourism API...');
      try {
        const tourismResult = await this.syncTourismData();
        results.sources.tourism = tourismResult;
        results.summary.total += tourismResult.total;
        results.summary.created += tourismResult.created;
        results.summary.updated += tourismResult.updated;
        results.summary.duplicates += tourismResult.duplicates;
        results.summary.errors += tourismResult.errors;
      } catch (error) {
        logger.error('Tourism API sync failed', { error: error.message });
        results.sources.tourism = { error: error.message };
        results.summary.errors++;
      }
      
      // 3. 결과 처리 및 저장
      results.duration = Date.now() - startTime;
      
      // 동기화 결과 로깅
      this.logSyncResults(results);
      
      // 알림 전송 (필요시)
      if (results.summary.errors > 0) {
        await this.sendErrorAlert(results);
      }
      
      logger.info('Full synchronization completed', {
        duration: `${results.duration}ms`,
        summary: results.summary
      });
      
      return results;
      
    } catch (error) {
      logger.error('Full sync failed', { error: error.message });
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  // 서울열린데이터광장 동기화
  async syncSeoulData() {
    try {
      const apiResult = await this.apiService.fetchAllSeoulData();
      const places = this.apiService.validateAPIData(apiResult.data, 'seoul_api');
      
      let created = 0;
      let updated = 0;
      let duplicates = 0;
      const errors = [];
      
      for (const placeData of places) {
        try {
          const processedData = this.processSeoulData(placeData);
          
          // 중복 체크
          const existingPlace = await Place.findOne({
            'data_sources.reference_id': processedData.data_sources[0].reference_id,
            'data_sources.source': 'seoul_culture_api'
          });
          
          if (existingPlace) {
            // 기존 데이터 업데이트
            await Place.findByIdAndUpdate(existingPlace._id, {
              $set: {
                ...processedData,
                updated_at: new Date()
              }
            });
            updated++;
          } else {
            // 새로운 데이터 생성
            await Place.create(processedData);
            created++;
          }
          
        } catch (error) {
          errors.push({
            name: placeData.FACIL_NM || 'Unknown',
            error: error.message
          });
          logger.warn('Failed to process Seoul data', {
            name: placeData.FACIL_NM,
            error: error.message
          });
        }
      }
      
      return {
        source: 'seoul_culture_api',
        total: places.length,
        created,
        updated,
        duplicates: 0,
        errors: errors.length,
        details: errors
      };
      
    } catch (error) {
      throw new Error(`Seoul data sync failed: ${error.message}`);
    }
  }

  // 한국관광공사 API 동기화
  async syncTourismData() {
    try {
      const apiResult = await this.apiService.fetchAllTourismData(1);
      const places = this.apiService.validateAPIData(apiResult.data, 'tourism_api');
      
      let created = 0;
      let updated = 0;
      let duplicates = 0;
      const errors = [];
      
      for (const placeData of places) {
        try {
          const processedData = this.processTourismData(placeData);
          
          // 중복 체크
          const existingPlace = await Place.findOne({
            'data_sources.reference_id': processedData.data_sources[0].reference_id,
            'data_sources.source': 'tourism_api'
          });
          
          if (existingPlace) {
            // 기존 데이터 업데이트
            await Place.findByIdAndUpdate(existingPlace._id, {
              $set: {
                ...processedData,
                updated_at: new Date()
              }
            });
            updated++;
          } else {
            // 새로운 데이터 생성
            await Place.create(processedData);
            created++;
          }
          
        } catch (error) {
          errors.push({
            name: placeData.title || 'Unknown',
            error: error.message
          });
          logger.warn('Failed to process Tourism data', {
            name: placeData.title,
            error: error.message
          });
        }
      }
      
      return {
        source: 'tourism_api',
        total: places.length,
        created,
        updated,
        duplicates: 0,
        errors: errors.length,
        details: errors
      };
      
    } catch (error) {
      throw new Error(`Tourism data sync failed: ${error.message}`);
    }
  }

  // API 상태 확인
  async checkAPIHealth() {
    try {
      const status = await this.apiService.checkAPIStatus();
      
      logger.info('API health check completed', {
        seoul: status.seoul_api.status,
        tourism: status.tourism_api.status
      });
      
      // API 상태가 좋지 않으면 알림
      if (status.seoul_api.status !== 'healthy' || status.tourism_api.status !== 'healthy') {
        await this.sendAPIHealthAlert(status);
      }
      
      return status;
      
    } catch (error) {
      logger.error('API health check failed', { error: error.message });
      throw error;
    }
  }

  // 데이터 품질 검사
  async runQualityCheck() {
    try {
      logger.info('Starting data quality check');
      
      const qualityMetrics = {
        total_places: await Place.countDocuments(),
        low_quality: 0,
        missing_location: 0,
        missing_contact: 0,
        stale_data: 0
      };
      
      // 품질이 낮은 데이터 검사
      qualityMetrics.low_quality = await Place.countDocuments({
        'quality.overall_score': { $lt: 0.5 }
      });
      
      // 위치 정보 없는 데이터 검사
      qualityMetrics.missing_location = await Place.countDocuments({
        location: { $exists: false }
      });
      
      // 연락처 정보 없는 데이터 검사
      qualityMetrics.missing_contact = await Place.countDocuments({
        'contact.phone': { $exists: false, $eq: '' }
      });
      
      // 오래된 데이터 검사 (30일 이상 업데이트 안됨)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      qualityMetrics.stale_data = await Place.countDocuments({
        updated_at: { $lt: thirtyDaysAgo }
      });
      
      logger.info('Quality check completed', qualityMetrics);
      
      // 품질 리포트 생성
      await this.generateQualityReport(qualityMetrics);
      
      return qualityMetrics;
      
    } catch (error) {
      logger.error('Quality check failed', { error: error.message });
      throw error;
    }
  }

  // 데이터 처리 함수들
  processSeoulData(apiData) {
    return {
      name: apiData.FACIL_NM || apiData.SVCNM || 'Unknown',
      address: {
        full: apiData.ADDR || '',
        city: '서울특별시',
        district: this.apiService.extractDistrict(apiData.ADDR || ''),
        detail: apiData.DTL_ADDR || ''
      },
      location: this.apiService.transformLocation(apiData),
      category: {
        main: this.categorizePlace(apiData),
        sub: apiData.CLSFC_NM || '기타',
        tags: this.extractTags(apiData)
      },
      contact: {
        phone: apiData.TEL_NO || '',
        website: apiData.HMPG_URL || ''
      },
      description: {
        short: (apiData.FACIL_DSC || '').substring(0, 200),
        full: apiData.FACIL_DSC || apiData.SVC_DESC || ''
      },
      pricing: {
        level: this.estimatePriceLevel(apiData),
        min: 0,
        max: 0,
        currency: 'KRW'
      },
      data_sources: [{
        source: 'seoul_culture_api',
        type: 'api',
        confidence: 0.85,
        timestamp: new Date(),
        verified: true,
        reference_id: apiData.FACIL_ID || apiData.SVC_ID || ''
      }],
      status: {
        visibility: 'visible',
        verification: 'verified',
        priority: 'normal'
      },
      created_by: 'system',
      created_at: new Date(),
      updated_by: 'system',
      updated_at: new Date()
    };
  }

  processTourismData(apiData) {
    return {
      name: apiData.title || 'Unknown',
      address: {
        full: apiData.addr1 || '',
        city: '서울특별시',
        district: this.apiService.extractDistrict(apiData.addr1 || ''),
        detail: apiData.addr2 || ''
      },
      location: this.apiService.transformLocation(apiData),
      category: {
        main: this.categorizePlace(apiData),
        sub: apiData.cat1 || '기타',
        tags: this.extractTags(apiData)
      },
      contact: {
        phone: apiData.tel || '',
        website: apiData.homepage || ''
      },
      pricing: {
        level: this.estimatePriceLevel(apiData),
        min: apiData.sminfee || 0,
        max: apiData.smaxfee || 0,
        currency: 'KRW'
      },
      description: {
        short: (apiData.overview || '').substring(0, 200),
        full: apiData.overview || ''
      },
      images: apiData.firstimage ? [{
        url: apiData.firstimage,
        alt: apiData.title || '이미지',
        uploaded_by: 'system'
      }] : [],
      data_sources: [{
        source: 'tourism_api',
        type: 'api',
        confidence: 0.9,
        timestamp: new Date(),
        verified: true,
        reference_id: apiData.contentid || ''
      }],
      status: {
        visibility: 'visible',
        verification: 'verified',
        priority: 'normal'
      },
      created_by: 'system',
      created_at: new Date(),
      updated_by: 'system',
      updated_at: new Date()
    };
  }

  // 보조 함수들
  categorizePlace(data) {
    const name = (data.FACIL_NM || data.title || '').toLowerCase();
    const category = (data.CLSFC_NM || data.cat1 || '').toLowerCase();
    
    if (category.includes('음�식') || name.includes('음식점') || name.includes('맛집') || name.includes('식당') || 
        name.includes('카페') || name.includes('커피')) {
      return 'food';
    }
    
    if (category.includes('문화') || name.includes('갤러리') || name.includes('박물관') || name.includes('전시') ||
        name.includes('문화시설')) {
      return 'culture';
    }
    
    return 'activity';
  }

  extractTags(data) {
    const tags = [];
    const name = (data.FACIL_NM || data.title || '').toLowerCase();
    
    if (name.includes('24시간')) tags.push('24시간');
    if (name.includes('주차')) tags.push('주차가능');
    if (name.includes('무료')) tags.push('무료');
    if (name.includes('예약')) tags.push('예약필요');
    
    return tags;
  }

  estimatePriceLevel(data) {
    const name = (data.FACIL_NM || data.title || '').toLowerCase();
    
    if (name.includes('고급') || name.includes('프리미엄')) return '₩₊₊₊₊';
    if (name.includes('저렴') || name.includes('무료')) return '₩';
    return '₩₊';
  }

  // 로깅 함수들
  logSyncResults(results) {
    logger.info('Sync Results', {
      trigger: results.trigger,
      duration: results.duration,
      summary: results.summary,
      sources: Object.keys(results.sources).map(key => ({
        name: key,
        ...results.sources[key]
      }))
    });
  }

  async sendErrorAlert(results) {
    // TODO: Slack/이메일 알림 구현
    logger.warn('Sending error alert', results);
  }

  async sendAPIHealthAlert(status) {
    // TODO: API 상태 알림 구현
    logger.warn('API health alert', status);
  }

  async generateQualityReport(metrics) {
    // TODO: 품질 리포트 생성 및 저장
    logger.info('Quality report generated', metrics);
  }

  // 작업 정보 조회
  getJobInfo(name) {
    return this.syncJobs.get(name);
  }

  // 모든 작업 정보 조회
  getAllJobInfo() {
    const jobs = {};
    for (const [name, info] of this.syncJobs) {
      jobs[name] = {
        name: info.name,
        cronExpression: info.cronExpression,
        status: info.status,
        lastRun: info.lastRun
      };
    }
    return jobs;
  }

  // 자동화 중지
  stopAllAutomation() {
    logger.info('Stopping all automation jobs');
    for (const [name, jobInfo] of this.syncJobs) {
      this.stopJob(name);
    }
  }
}

// 싱글톤 인스턴스
const syncAutomation = new SyncAutomation();

// 모듈 내보내기
module.exports = syncAutomation;

// 직접 실행 시 (테스트용)
if (require.main === module) {
  (async () => {
    try {
      console.log('🤖 Starting Sync Automation...');
      syncAutomation.startAutomation();
      
      // 10초 후 자동화 중지 (테스트용)
      setTimeout(() => {
        syncAutomation.stopAllAutomation();
        console.log('🛑 Sync Automation stopped (test mode)');
      }, 10000);
      
    } catch (error) {
      console.error('❌ Automation failed:', error.message);
      process.exit(1);
    }
  })();
}