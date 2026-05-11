/**
 * 자동 동기화 스케줄러 서비스
 * 
 * 주기적으로 데이터 동기화를 수행하고 결과를 로깅
 */

const cron = require('node-cron');
const logger = require('../utils/logger');
const APIService = require('./APIService');

class SchedulerService {
  constructor() {
    this.tasks = new Map();
    this.apiService = new APIService();
    this.isRunning = false;
  }

  /**
   * 자동 동기화 시작
   */
  start() {
    if (this.isRunning) {
      logger.warn('Scheduler already running');
      return false;
    }

    logger.info('Starting scheduler service...');
    this.isRunning = true;

    // 기본 스케줄: 매일 새벽 2시에 전체 동기화
    this.scheduleFullSync('0 2 * * *');

    // 추가 스케줄: 매 6시간마다 빠른 동기화
    this.scheduleQuickSync('0 */6 * * *');

    logger.info('Scheduler service started successfully');
    return true;
  }

  /**
   * 전체 동기화 스케줄 (모든 데이터 소스)
   */
  scheduleFullSync(cronExpression) {
    const task = cron.schedule(cronExpression, async () => {
      try {
        logger.info('Starting full synchronization...', {
          timestamp: new Date().toISOString()
        });

        // 서울 API 동기화
        const seoulResult = await this.apiService.syncSeoulData(true);
        
        // 관광 API 동기화
        const tourismResult = await this.apiService.syncTourismData(true);

        const results = {
          seoul: seoulResult,
          tourism: tourismResult,
          timestamp: new Date().toISOString()
        };

        logger.info('Full synchronization completed', results);

        // 품질 보고서 저장
        await this.saveQualityReport(results, 'full_sync');

      } catch (error) {
        logger.error('Full synchronization error:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Seoul'
    });

    this.tasks.set('full_sync', task);
    logger.info('Full sync scheduled', { cron: cronExpression });
  }

  /**
   * 빠른 동기화 스케줄 (최근 데이터만)
   */
  scheduleQuickSync(cronExpression) {
    const task = cron.schedule(cronExpression, async () => {
      try {
        logger.info('Starting quick synchronization...', {
          timestamp: new Date().toISOString()
        });

        // 강제 업데이트 없이 최신 데이터만 확인
        const seoulResult = await this.apiService.syncSeoulData(false);

        const results = {
          seoul: seoulResult,
          timestamp: new Date().toISOString()
        };

        logger.info('Quick synchronization completed', results);

        // 간단한 품질 확인
        await this.saveQualityReport(results, 'quick_sync');

      } catch (error) {
        logger.error('Quick synchronization error:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Seoul'
    });

    this.tasks.set('quick_sync', task);
    logger.info('Quick sync scheduled', { cron: cronExpression });
  }

  /**
   * 품질 보고서 저장
   */
  async saveQualityReport(syncResults, syncType) {
    try {
      const Place = require('../models/Place');
      
      // 기본 통계
      const totalPlaces = await Place.countDocuments();
      const avgQuality = await Place.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$quality_score' } } }
      ]);

      // 보고서 생성
      const QualityReport = require('../models/QualityReport');
      
      await QualityReport.create({
        timestamp: new Date(),
        sync_type: syncType,
        sync_results: syncResults,
        quality_metrics: {
          total_places: totalPlaces,
          average_quality_score: avgQuality[0]?.avgScore || 0.5,
          system_status: 'operational'
        }
      });

      logger.info('Quality report saved successfully');

    } catch (error) {
      logger.error('Failed to save quality report:', error);
    }
  }

  /**
   * 수동 동기화 실행
   */
  async runManualSync(sources = ['all'], force = true) {
    try {
      logger.info('Running manual synchronization', { sources, force });

      const results = {};

      if (sources.includes('all') || sources.includes('seoul')) {
        results.seoul = await this.apiService.syncSeoulData(force);
      }

      if (sources.includes('all') || sources.includes('tourism')) {
        results.tourism = await this.apiService.syncTourismData(force);
      }

      await this.saveQualityReport(results, 'manual');

      return {
        success: true,
        message: 'Manual synchronization completed',
        data: results,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Manual synchronization error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 스케줄러 중지
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Scheduler not running');
      return false;
    }

    logger.info('Stopping scheduler service...');

    this.tasks.forEach((task, name) => {
      task.stop();
      logger.info(`Stopped task: ${name}`);
    });

    this.tasks.clear();
    this.isRunning = false;

    logger.info('Scheduler service stopped');
    return true;
  }

  /**
   * 상태 확인
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTasks: Array.from(this.tasks.keys()),
      taskCount: this.tasks.size
    };
  }
}

module.exports = SchedulerService;