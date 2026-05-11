const winston = require('winston');

// 로거 설정
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/requests.log' })
  ]
});

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // 요청 정보 로깅
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };
  
  logger.info('Request received', requestInfo);
  
  // 응답 완료 시 로깅
  res.on('finish', () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const responseInfo = {
      ...requestInfo,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };
    
    if (res.statusCode >= 400) {
      logger.error('Request failed', responseInfo);
    } else {
      logger.info('Request completed', responseInfo);
    }
  });
  
  next();
};

module.exports = requestLogger;