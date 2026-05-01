const logger = require('../utils/logger');

/**
 * 404 에러 핸들러 - 요청한 리소스를 찾을 수 없을 때
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Cannot find ${req.originalUrl} on this server`);
  error.status = 404;
  error.code = 'NOT_FOUND';
  next(error);
};

/**
 * 에러 핸들러 미들웨어
 */
const errorHandler = (err, req, res, next) => {
  // 에러 로깅
  logger.error('Error occurred:', {
    error: {
      message: err.message,
      stack: err.stack,
      status: err.status,
      code: err.code
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.method !== 'GET' ? req.body : undefined,
      query: req.query
    }
  });

  // 기본 에러 객체
  let error = {
    success: false,
    message: err.message || '서버 내부 오류가 발생했습니다.',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  };

  // 에러 상태 코드
  let statusCode = err.status || 500;

  // 개발 환경에서는 스택 트레이스 포함
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }

  // 에러 타입별 처리
  switch (err.code) {
    case 'NOT_FOUND':
      statusCode = 404;
      break;
    
    case 'UNAUTHORIZED':
      statusCode = 401;
      error.message = '인증이 필요합니다.';
      break;
    
    case 'FORBIDDEN':
      statusCode = 403;
      error.message = '접근 권한이 없습니다.';
      break;
    
    case 'VALIDATION_ERROR':
      statusCode = 400;
      error.message = '입력값이 유효하지 않습니다.';
      if (err.details) {
        error.details = err.details;
      }
      break;
    
    case 'DUPLICATE_ENTRY':
      statusCode = 409;
      error.message = '중복된 항목입니다.';
      break;
    
    case 'DATABASE_ERROR':
      statusCode = 500;
      error.message = '데이터베이스 오류가 발생했습니다.';
      break;
    
    case 'RATE_LIMIT_EXCEEDED':
      statusCode = 429;
      error.message = '요청 횟수를 초과했습니다.';
      break;
  }

  // Sequelize 에러 처리
  if (err.name === 'SequelizeError') {
    statusCode = 500;
    error.code = 'DATABASE_ERROR';
    
    if (err.errors && err.errors.length > 0) {
      error.details = err.errors.map(e => ({
        field: e.path,
        message: e.message,
        type: e.type,
        value: e.value
      }));
    }
  }

  // PostgreSQL 에러 처리
  if (err.code === '23505') { // 고유 제약 위반
    statusCode = 409;
    error.code = 'DUPLICATE_ENTRY';
    error.message = '이미 존재하는 데이터입니다.';
  } else if (err.code === '23503') { // 외래 키 제약 위반
    statusCode = 400;
    error.code = 'FOREIGN_KEY_VIOLATION';
    error.message = '참조하는 데이터가 존재하지 않습니다.';
  } else if (err.code === '23502') { // NOT NULL 제약 위반
    statusCode = 400;
    error.code = 'NOT_NULL_VIOLATION';
    error.message = '필수 값이 누락되었습니다.';
  }

  // JWT 에러 처리
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error.code = 'INVALID_TOKEN';
    error.message = '유효하지 않은 토큰입니다.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    error.code = 'TOKEN_EXPIRED';
    error.message = '토큰이 만료되었습니다.';
  }

  // 파일 업로드 에러 처리
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    error.code = 'FILE_TOO_LARGE';
    error.message = '파일 크기가 너무 큽니다.';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    error.code = 'INVALID_FILE_TYPE';
    error.message = '허용되지 않은 파일 형식입니다.';
  }

  // 응답 전송
  res.status(statusCode).json(error);
};

module.exports = {
  notFoundHandler,
  errorHandler
};