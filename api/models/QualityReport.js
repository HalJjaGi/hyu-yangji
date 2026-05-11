const mongoose = require('mongoose');

const QualityReportSchema = new mongoose.Schema({
  // 기본 정보
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  
  // 동기화 타입
  sync_type: {
    type: String,
    required: true,
    enum: ['full_sync', 'quick_sync', 'manual'],
    default: 'manual'
  },
  
  // 동기화 결과
  sync_results: {
    seoul: {
      success: Boolean,
      source: String,
      imported: Number,
      updated: Number,
      errors: Number,
      total_processed: Number,
      quality_improvements: Boolean
    },
    tourism: {
      success: Boolean,
      source: String,
      imported: Number,
      updated: Number,
      errors: Number,
      total_processed: Number,
      quality_improvements: Boolean
    }
  },
  
  // 품질 메트릭스
  quality_metrics: {
    total_places: {
      type: Number,
      min: 0
    },
    average_quality_score: {
      type: Number,
      min: 0,
      max: 1
    },
    quality_distribution: [{
      _id: String,
      count: Number
    }],
    source_distribution: [{
      _id: String,
      count: Number
    }],
    last_sync: Date,
    system_status: {
      type: String,
      enum: ['operational', 'warning', 'error'],
      default: 'operational'
    }
  },
  
  // 추가 메트릭스
  metrics: {
    places_with_enhancement: {
      type: Number,
      min: 0,
      default: 0
    },
    addresses_enhanced: {
      type: Number,
      min: 0,
      default: 0
    },
    coordinates_enhanced: {
      type: Number,
      min: 0,
      default: 0
    },
    recent_updates: {
      type: Number,
      min: 0,
      default: 0
    },
    processing_time_ms: {
      type: Number,
      min: 0
    },
    data_quality_score: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  
  // 오류 정보
  errors: [{
    source: String,
    error_type: String,
    error_message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    stack_trace: String
  }],
  
  // 성능 정보
  performance: {
    api_response_time_ms: Number,
    database_time_ms: Number,
    validation_time_ms: Number,
    total_time_ms: Number
  }
}, {
  // 자동 타임스탬프 (created_at, updated_at)
  timestamps: true
});

// 인덱싱 최적화
QualityReportSchema.index({ timestamp: -1 });
QualityReportSchema.index({ 'sync_type': 1, 'timestamp': -1 });
QualityReportSchema.index({ 'quality_metrics.system_status': 1 });

// 통계 계산 메서드
QualityReportSchema.statics.getRecentReports = async function(days = 7, limit = 100) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  return this.find({
    timestamp: { $gte: since }
  })
  .sort({ timestamp: -1 })
  .limit(limit);
};

QualityReportSchema.statics.getDailyStats = async function(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: since }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        total_reports: { $sum: 1 },
        successful_syncs: {
          $sum: {
            $cond: {
              if: { $eq: ['$quality_metrics.system_status', 'operational'] },
              then: 1,
              else: 0
            }
          }
        },
        avg_quality_score: { $avg: '$quality_metrics.average_quality_score' },
        total_places_added: { $sum: '$sync_results.seoul.imported' },
        avg_response_time: { $avg: '$performance.total_time_ms' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// 데이터 정리 메서드 (오래된 보고서 삭제)
QualityReportSchema.statics.cleanupOldReports = async function(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const result = await this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });
  
  return {
    deletedCount: result.deletedCount,
    cutoffDate,
    daysToKeep
  };
};

module.exports = mongoose.model('QualityReport', QualityReportSchema);