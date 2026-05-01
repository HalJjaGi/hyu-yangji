const logger = require('../utils/logger');
const { performance } = require('perf_hooks');

/**
 * 요청 로깅 미들웨어
 * 모든 HTTP 요청을 로깅합니다.
 */
const requestLogger = (req, res, next) => {
  const startTime = performance.now();
  
  // 요청 정보 기록
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    query: req.query,
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    headers: sanitizeHeaders(req.headers)
  };

  logger.http('Incoming request', requestInfo);

  // 응답 완료 시 로깅
  res.on('finish', () => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    const responseInfo = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: Math.round(responseTime),
      contentLength: res.get('Content-Length'),
      ip: req.ip || req.connection.remoteAddress
    };

    // 상태 코드별 로깅 레벨
    if (res.statusCode >= 500) {
      logger.error('Server error response', responseInfo);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error response', responseInfo);
    } else if (res.statusCode >= 300) {
      logger.info('Redirect response', responseInfo);
    } else {
      logger.http('Successful response', responseInfo);
    }
  });

  next();
};

/**
 * 성능 로깅 미들웨어
 * 느린 응답을 감지하고 로깅합니다.
 */
const performanceLogger = (req, res, next) => {
  const startTime = performance.now();
  const slowResponseThreshold = 1000; // 1초

  res.on('finish', () => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    if (responseTime > slowResponseThreshold) {
      logger.warn('Slow response detected', {
        method: req.method,
        url: req.originalUrl,
        responseTime: Math.round(responseTime),
        threshold: slowResponseThreshold,
        ip: req.ip
      });
    }
  });

  next();
};

/**
 * 캐시 로깅 미들웨어 (나중에 캐시 기능 추가 시)
 */
const cacheLogger = (req, res, next) => {
  // 캐시 히트/미스 로깅 로직
  next();
};

/**
 * 민감 정보 제거 함수
 */
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'authorization',
    'credit_card', 'ssn', 'social_security'
  ];

  const sanitized = { ...body };

  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive.toLowerCase())
    )) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * 헤더 민감 정보 제거 함수
 */
function sanitizeHeaders(headers) {
  if (!headers || typeof headers !== 'object') {
    return headers;
  }

  const sensitiveHeaders = [
    'authorization', 'cookie', 'token', 'api-key',
    'x-api-key', 'x-auth-token'
  ];

  const sanitized = { ...headers };

  for (const key in sanitized) {
    if (sensitiveHeaders.some(sensitive => 
      key.toLowerCase().includes(sensitive.toLowerCase())
    )) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

module.exports = {
  requestLogger,
  performanceLogger,
  cacheLogger
};