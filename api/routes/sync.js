const express = require('express');
const router = express.Router();
const APIService = require('../services/APIService');
const apiService = new APIService();
const createDataQualityMiddleware = require('../middleware/dataQuality');

// 데이터 품질 미들웨어 생성
const dataQuality = createDataQualityMiddleware();

// API 동기화 시작
router.post('/start', async (req, res, next) => {
  try {
    const { sources = ['all'], force = false } = req.body;
    
    console.log('Starting API synchronization:', { sources, force });
    
    const results = {};
    
    for (const source of sources) {
      if (source === 'all' || source === 'seoul') {
        console.log('Starting Seoul API synchronization...');
        results.seoul = await apiService.syncSeoulData(force);
      }
      
      if (source === 'all' || source === 'tourism') {
        console.log('Starting Tourism API synchronization...');
        results.tourism = await apiService.syncTourismData(force);
      }
    }
    
    res.json({
      success: true,
      message: 'API synchronization completed',
      data: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API synchronization error:', error);
    res.status(500).json({
      success: false,
      error: 'Synchronization failed',
      message: error.message
    });
  }
});

// API 동기화 상태 확인
router.get('/status', async (req, res, next) => {
  try {
    const status = {
      services: await APIService.checkAPIStatus(),
      data_quality: await APIService.getDataQualityStatus(),
      last_sync: await APIService.getLastSyncStatus(),
      metrics: {
        total_places: await APIService.getTotalPlacesCount(),
        seoul_places: await APIService.getSeoulPlacesCount(),
        tourism_places: await APIService.getTourismPlacesCount()
      }
    };
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    next(error);
  }
});

// 데이터 품질 보고서 엔드포인트
router.get('/quality-report', async (req, res, next) => {
  try {
    const report = await apiService.getQualitySummary();
    
    res.status(200).json({
      success: true,
      message: 'Data quality report generated',
      report,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Quality report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quality report',
      message: error.message
    });
  }
});

// 데이터 품질 검사 엔드포인트 (자동 동기화 후)
router.post('/start', dataQuality.validateSyncData, async (req, res, next) => {
  try {
    // validateSyncData 미들웨어가 비동기적으로 품질 검사를 수행
    // 기존의 동기화 로직은 그대로 실행
    const { sources = ['all'], force = false } = req.body;
    
    const results = {};
    
    for (const source of sources) {
      if (source === 'all' || source === 'seoul') {
        results.seoul = await apiService.syncSeoulData(force);
      }
      
      if (source === 'all' || source === 'tourism') {
        results.tourism = await apiService.syncTourismData(force);
      }
    }
    
    res.json({
      success: true,
      message: 'API synchronization and quality validation completed',
      data: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API synchronization with quality validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Synchronization with quality validation failed',
      message: error.message
    });
  }
});

// 데이터 품질 보고서
router.get('/quality-report', async (req, res, next) => {
  try {
    const report = {
      generated_at: new Date().toISOString(),
      summary: await APIService.getQualitySummary(),
      issues: await APIService.getQualityIssues(),
      recommendations: await APIService.getQualityRecommendations(),
      metrics: await APIService.getQualityMetrics()
    };
    
    res.json({
      success: true,
      data: report
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;