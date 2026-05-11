const mongoose = require('mongoose');
const winston = require('winston');

// 로거 설정
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/database.log' })
  ]
});

// 데이터베이스 연결 설정
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyu_yangji', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
};

// 데이터베이스 연결 상태 확인
const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    readyState: state,
    state: states[state],
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};

// 연결 이벤트 핸들러
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

// 스키마 설정
const configureSchemas = () => {
  // 스키마 옵션 설정
  const schemaOptions = {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  };
  
  // 글로벌 스키마 설정 적용
  mongoose.set('strictQuery', false);
  mongoose.set('toObject', { virtuals: true });
  mongoose.set('toJSON', { virtuals: true });
  
  logger.info('Database schemas configured');
};

module.exports = {
  connectDB,
  checkConnection,
  configureSchemas
};