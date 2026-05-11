const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');
const winston = require('winston');

// 라우트 임포트
const placeRoutes = require('./routes/places');
const adminRoutes = require('./routes/admin');
const syncRoutes = require('./routes/sync');

// 미들웨어 임포트
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// 로거 설정
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// 미들웨어 설정
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8002',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// 기본 라우트
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API 라우트
app.use('/api/places', placeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/scheduler', require('./routes/scheduler'));

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path
  });
});

// 에러 핸들러
app.use(errorHandler);

// MongoDB 연결
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyu_yangji', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4  // IPv4 강제
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // 연결 성공 이벤트
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established');
    });
    
    // 연결 에러 이벤트
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    // 연결 종료 이벤트
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection disconnected');
    });
    
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// 자동 동기화 스케줄러 (매일 오전 3시)
cron.schedule('0 3 * * *', () => {
  logger.info('Starting scheduled data synchronization...');
  // TODO: API 동기화 로직 추가
}, {
  scheduled: true,
  timezone: "Asia/Seoul"
});

// 서버 시작
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8002'}`);
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

// 에러 핸들링
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 서버 시작
startServer();