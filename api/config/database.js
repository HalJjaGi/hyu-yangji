const { Pool } = require('pg');
const logger = require('../utils/logger');

// 데이터베이스 연결 풀
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/hyu_yangji',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 데이터베이스 연결 테스트
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
}

// 쿼리 실행 헬퍼
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Query executed: ${text} - Duration: ${duration}ms`);
    return result;
  } catch (error) {
    logger.error(`Query failed: ${text}`, error);
    throw error;
  }
}

// 트랜잭션 헬퍼
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// 데이터베이스 연결 함수
async function connectDatabase() {
  try {
    await testConnection();
    logger.info('Database connection pool created successfully');
    
    // 연결 풀 이벤트 리스너
    pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });
    
    return pool;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

// 데이터베이스 연결 종료 함수
async function disconnectDatabase() {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database connection pool:', error);
    throw error;
  }
}

// 초기 데이터베이스 스키마 생성
async function initializeDatabase() {
  const createTablesQuery = `
    -- 장소 테이블
    CREATE TABLE IF NOT EXISTS places (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      sub_category VARCHAR(100),
      address TEXT,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      phone VARCHAR(50),
      operating_hours JSONB,
      price_range VARCHAR(50),
      avg_price_per_person DECIMAL(10, 2),
      rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
      review_count INTEGER DEFAULT 0,
      is_free BOOLEAN DEFAULT false,
      description TEXT,
      website VARCHAR(255),
      data_source VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_synced_at TIMESTAMP
    );

    -- 메뉴 테이블
    CREATE TABLE IF NOT EXISTS menus (
      id SERIAL PRIMARY KEY,
      place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
      menu_name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      category VARCHAR(100),
      description TEXT,
      is_popular BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 카테고리 테이블
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      icon VARCHAR(50),
      color VARCHAR(7),
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 코스 테이블
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      budget_min DECIMAL(10, 2) NOT NULL,
      budget_max DECIMAL(10, 2) NOT NULL,
      total_estimated_price DECIMAL(10, 2),
      duration_minutes INTEGER,
      difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('초급', '중급', '고급')),
      tags TEXT[],
      is_popular BOOLEAN DEFAULT false,
      view_count INTEGER DEFAULT 0,
      rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
      review_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 코스 장소 연결 테이블
    CREATE TABLE IF NOT EXISTS course_places (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
      visit_order INTEGER NOT NULL,
      estimated_time_spent_minutes INTEGER,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_places_category ON places(category, is_active);
    CREATE INDEX IF NOT EXISTS idx_places_rating ON places(rating DESC, review_count);
    CREATE INDEX IF NOT EXISTS idx_places_price ON places(avg_price_per_person);
    CREATE INDEX IF NOT EXISTS idx_places_location ON places(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_courses_budget ON courses(budget_min, budget_max);
    CREATE INDEX IF NOT EXISTS idx_courses_popular ON courses(is_popular, view_count);

    -- 업데이트 트리거
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    await query(createTablesQuery);
    logger.info('Database schema initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database schema:', error);
    throw error;
  }
}

module.exports = {
  query,
  transaction,
  connectDatabase,
  disconnectDatabase,
  initializeDatabase,
  pool
};