const winston = require('winston');
const path = require('path');
const fs = require('fs');

// 로그 디렉토리 생성
const logDir = process.env.LOG_DIR || './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 로그 레벨
const logLevel = process.env.LOG_LEVEL || 'info';

// 로그 포맷
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    return JSON.stringify(logEntry);
  })
);

// 개발용 포맷 (콘솔)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// 로거 생성
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // 모든 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // HTTP 요청 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// 개발 환경에서는 콘솔에도 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: devFormat,
    level: logLevel
  }));
}

// 커스텀 로깅 메서드들
logger.success = (message, meta = {}) => {
  logger.log('info', message, { ...meta, type: 'success' });
};

logger.warn = (message, meta = {}) => {
  logger.log('warn', message, meta);
};

logger.error = (message, meta = {}) => {
  logger.log('error', message, meta);
};

logger.debug = (message, meta = {}) => {
  logger.log('debug', message, meta);
};

logger.http = (message, meta = {}) => {
  logger.log('http', message, meta);
};

// API 에러 로깅
logger.logApiError = (req, res, error) => {
  const errorInfo = {
    type: 'api_error',
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.method !== 'GET' ? req.body : undefined,
      query: req.query
    },
    response: {
      statusCode: res.statusCode
    },
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code
    }
  };

  logger.error('API Error', errorInfo);
};

// 데이터베이스 쿼리 로깅
logger.logQuery = (query, params, duration) => {
  const queryInfo = {
    type: 'database_query',
    query: query.trim(),
    params: params,
    duration: `${duration}ms`
  };

  if (duration > 1000) {
    logger.warn('Slow query detected', queryInfo);
  } else {
    logger.debug('Database query', queryInfo);
  }
};

// 성능 로깅
logger.logPerformance = (operation, duration, meta = {}) => {
  const perfInfo = {
    type: 'performance',
    operation,
    duration: `${duration}ms`,
    ...meta
  };

  if (duration > 2000) {
    logger.warn('Slow operation', perfInfo);
  } else {
    logger.debug('Performance metric', perfInfo);
  }
};

// 보안 이벤트 로깅
logger.logSecurityEvent = (event, meta = {}) => {
  const securityInfo = {
    type: 'security_event',
    event,
    timestamp: new Date().toISOString(),
    ...meta
  };

  logger.warn('Security event', securityInfo);
};

// 사용자 활동 로깅
logger.logUserActivity = (userId, action, meta = {}) => {
  const activityInfo = {
    type: 'user_activity',
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...meta
  };

  logger.info('User activity', activityInfo);
};

// 시스템 상태 로깅
logger.logSystemStatus = (component, status, meta = {}) => {
  const statusInfo = {
    type: 'system_status',
    component,
    status,
    timestamp: new Date().toISOString(),
    ...meta
  };

  if (status === 'error') {
    logger.error('System status error', statusInfo);
  } else if (status === 'warning') {
    logger.warn('System status warning', statusInfo);
  } else {
    logger.info('System status', statusInfo);
  }
};

module.exports = logger;