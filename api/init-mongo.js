// MongoDB 초기화 스크립트
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'hyu_yangji');

// 기본 관리자 사용자 생성
try {
  db.createUser({
    user: process.env.MONGO_INITDB_ROOT_USERNAME || 'admin',
    pwd: process.env.MONGO_INITDB_ROOT_PASSWORD || 'password',
    roles: [
      {
        role: 'readWriteAnyDatabase',
        db: 'admin'
      },
      {
        role: 'dbAdminAnyDatabase',
        db: 'admin'
      }
    ]
  });
  print('✅ Created admin user');
} catch (error) {
  if (error.code === 11000) {
    print('ℹ️  Admin user already exists');
  } else {
    print('❌ Error creating admin user:', error.message);
  }
}

// 기본 컬렉션 생성
try {
  // 장소 컬렉션에 인덱스 생성
  db.createCollection('places');
  
  // 지리공간 인덱스
  db.places.createIndex({ location: '2dsphere' });
  
  // 검색 인덱스
  db.places.createIndex(
    { name: 'text', 'address.full': 'text', 'category.sub': 'text', tags: 'text' },
    { 
      weights: { name: 10, 'address.district': 5, 'category.sub': 3, tags: 1 },
      name: 'place_search_index'
    }
  );
  
  // 상태 인덱스
  db.places.createIndex({ 
    'status.visibility': 1, 
    'status.verification': 1,
    'category.main': 1,
    'quality.overall_score': -1 
  });
  
  print('✅ Created places collection with indexes');
} catch (error) {
  if (error.code === 11000) {
    print('ℹ️  Places collection already exists');
  } else {
    print('❌ Error creating places collection:', error.message);
  }
}

// 사용자 컬렉션 생성
try {
  db.createCollection('users');
  
  // 사용자 인덱스
  db.users.createIndex({ email: 1 }, { unique: true });
  db.users.createIndex({ username: 1 }, { unique: true });
  db.users.createIndex({ 'status.active': 1 });
  
  print('✅ Created users collection with indexes');
} catch (error) {
  if (error.code === 11000) {
    print('ℹ️  Users collection already exists');
  } else {
    print('❌ Error creating users collection:', error.message);
  }
}

// 기본 데이터 삽입 (개발 환경용)
if (process.env.NODE_ENV !== 'production') {
  try {
    // 기본 장소 데이터
    const defaultPlaces = [
      {
        name: '한양대학교 서울캠퍼스',
        address: {
          full: '서울특별시 성동구 왕십리로 222 한양대학교',
          city: '서울특별시',
          district: '성동구'
        },
        location: {
          type: 'Point',
          coordinates: [127.0442, 37.5562]
        },
        category: {
          main: 'activity',
          sub: '대학교',
          tags: ['교육', '역사', '사진']
        },
        description: {
          short: '한국의 명문대학교 한양대학교 서울캠퍼스',
          full: '100년의 전통을 자랑하는 한양대학교 서울캠퍼스는 아름다운 캠퍼스와 풍부한 역사를 가지고 있습니다.'
        },
        data_sources: [{
          source: 'system',
          type: 'admin',
          confidence: 1.0,
          timestamp: new Date(),
          verified: true
        }],
        status: {
          visibility: 'visible',
          verification: 'verified',
          priority: 'high'
        },
        created_by: 'system',
        created_at: new Date()
      }
    ];
    
    db.places.insertMany(defaultPlaces);
    print('✅ Inserted default places');
    
  } catch (error) {
    if (error.code === 11000) {
      print('ℹ️  Default places already exist');
    } else {
      print('❌ Error inserting default places:', error.message);
    }
  }
}

print('🎉 MongoDB initialization completed');