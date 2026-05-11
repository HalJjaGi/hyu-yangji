/**
 * 스케줄러 관리 라우터
 * 
 * 자동 동기화 스케줄러 시작, 중지, 상태 확인 및 수동 실행
 */

const express = require('express');
const router = express.Router();

// 스케줄러 서비스 인스턴스 (전역으로 관리)
let schedulerService = null;

// 스케줄러 서비스 초기화
function initSchedulerService() {
  if (!schedulerService) {
    const SchedulerService = require('../services/SchedulerService');
    schedulerService = new SchedulerService();
  }
  return schedulerService;
}

/**
 * GET /api/scheduler/status
 * 스케줄러 상태 확인
 */
router.get('/status', (req, res) => {
  try {
    const service = initSchedulerService();
    const status = service.getStatus();
    
    res.json({
      success: true,
      message: 'Scheduler status retrieved',
      data: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get scheduler status',
      message: error.message
    });
  }
});

/**
 * POST /api/scheduler/start
 * 스케줄러 시작
 */
router.post('/start', (req, res) => {
  try {
    const service = initSchedulerService();
    const result = service.start();
    
    res.json({
      success: result,
      message: result ? 'Scheduler started successfully' : 'Scheduler already running',
      data: service.getStatus(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start scheduler',
      message: error.message
    });
  }
});

/**
 * POST /api/scheduler/stop
 * 스케줄러 중지
 */
router.post('/stop', (req, res) => {
  try {
    const service = initSchedulerService();
    const result = service.stop();
    
    res.json({
      success: result,
      message: result ? 'Scheduler stopped successfully' : 'Scheduler not running',
      data: service.getStatus(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to stop scheduler',
      message: error.message
    });
  }
});

/**
 * POST /api/scheduler/manual-sync
 * 수동 동기화 실행
 */
router.post('/manual-sync', async (req, res) => {
  try {
    const { sources = ['all'], force = true } = req.body;
    
    const service = initSchedulerService();
    const result = await service.runManualSync(sources, force);
    
    const statusCode = result.success ? 200 : 500;
    
    res.status(statusCode).json({
      ...result,
      message: result.success ? 
        'Manual synchronization completed' : 
        'Manual synchronization failed'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Manual synchronization failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/scheduler/reports
 * 동기화/품질 보고서 목록
 */
router.get('/reports', async (req, res) => {
  try {
    const QualityReport = require('../models/QualityReport');
    const { days = 7, limit = 100 } = req.query;
    
    const reports = await QualityReport.getRecentReports(
      parseInt(days), 
      parseInt(limit)
    );
    
    res.json({
      success: true,
      message: 'Reports retrieved successfully',
      count: reports.length,
      data: reports,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve reports',
      message: error.message
    });
  }
});

/**
 * GET /api/scheduler/stats
 * 일별 통계
 */
router.get('/stats', async (req, res) => {
  try {
    const QualityReport = require('../models/QualityReport');
    const { days = 30 } = req.query;
    
    const stats = await QualityReport.getDailyStats(parseInt(days));
    
    res.json({
      success: true,
      message: 'Daily statistics retrieved',
      count: stats.length,
      data: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
      message: error.message
    });
  }
});

/**
 * POST /api/scheduler/cleanup
 * 오래된 보고서 정리
 */
router.post('/cleanup', async (req, res) => {
  try {
    const QualityReport = require('../models/QualityReport');
    const { daysToKeep = 90 } = req.body;
    
    const result = await QualityReport.cleanupOldReports(parseInt(daysToKeep));
    
    res.json({
      success: true,
      message: 'Old reports cleaned up',
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Cleanup failed',
      message: error.message
    });
  }
});

module.exports = router;