const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

// 라우터
const placesRouter = require('./routes/places');
const categoriesRouter = require('./routes/categories');
const coursesRouter = require('./routes/courses');

// 미들웨어
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger, performanceLogger, cacheLogger } = require('./middleware/requestLogger');

// 유틸리티
const { connectDatabase } = require('./config/database');
const { connectRedis, closeRedis } = require('./config/redis');

// 환경 변수 로드
dotenv.config();

// Express 앱 생성
const app = express();
const PORT = process.env.PORT || 3000;

// 보안 미들웨어
app.use(helmet());
app.use(compression());

// CORS 설정
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://hyu-yangji.pages.dev',
    'https://*.pages.dev'
  ],
  credentials: true
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 100 요청
  message: {
    error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
  }
});
app.use('/api', limiter);

// Body 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 로깅 미들웨어
app.use(requestLogger);
app.use(performanceLogger);

// 정적 파일 제공 (이미지 등)
app.use('/static', express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hyu-yangji-api',
    version: '1.0.0'
  });
});

// API 라우트
app.use('/api/places', placesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/courses', coursesRouter);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'HYU양지 API 서버',
    version: '1.0.0',
    endpoints: [
      'GET /health - 헬스 체크',
      'GET /api/places - 장소 목록',
      'GET /api/categories - 카테고리 목록',
      'POST /api/courses/recommend - 코스 추천'
    ]
  });
});

// 에러 핸들러
app.use(notFoundHandler);
app.use(errorHandler);

// 서버 시작
async function startServer() {
  try {
    // 데이터베이스 연결
    await connectDatabase();
    logger.info('Database connected successfully');

    // Redis 연결
    await connectRedis();
    logger.info('Redis connected successfully');

    // 서버 시작
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await closeRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await closeRedis();
  process.exit(0);
});

// 서버 시작
startServer();