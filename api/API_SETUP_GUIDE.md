# API 연동 설정 가이드

## 🎯 개요

HYU양지:GO 시스템은 다음 공개 API와 연동되어 자동으로 데이터를 수집합니다:

1. **서울열린데이터광장** - 서울시 공공 데이터
2. **한국관광공사** - 관광지 정보

## 🔑 API 키 발급

### 1. 서울열린데이터광장 API 키

1. **접속**: [https://data.seoul.go.kr/](https://data.seoul.go.kr/)
2. **회원가입**: 오른쪽 상단 '회원가입' 클릭
3. **로그인**: 가입 후 로그인
4. **API 키 발급**:
   - 상단 메뉴 > '개방서비스' > 'API 인증키 신청'
   - 서비스 선택: '서울열린데이터광장'
   - 인증키 발급 신청서 작성
   - 발급된 키 복사

### 2. 한국관광공사 API 키

1. **접속**: [https://api.visitkorea.or.kr](https://api.visitkorea.or.kr)
2. **회원가입**: '회원가입' 클릭
3. **로그인**: 가입 후 로그인
4. **API 키 발급**:
   - 메인 메뉴 > '개발자센터' > '인증키 신청'
   - '키 발급' 탭 > '새 인증키 발급'
   - 애플리케이션 정보 작성
   - 발급된 키 복사

## ⚙️ 환경 설정

### 1. .env 파일 설정

```bash
# .env 파일 복사
cp .env.example .env

# .env 파일 편집
SEOUL_API_KEY=your_actual_seoul_api_key_here
TOURISM_API_KEY=your_actual_tourism_api_key_here
```

### 2. 필수 환경 변수

```bash
# 데이터베이스
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hyu_yangji

# API 키
SEOUL_API_KEY=your_seoul_api_key
TOURISM_API_KEY=your_tourism_api_key

# JWT 보안
JWT_SECRET=your-super-secret-jwt-key-change-this

# 서버 설정
PORT=3003
NODE_ENV=development
FRONTEND_URL=http://localhost:8002
```

## 🧪 API 테스트

### 1. 기본 연결 테스트

```bash
# API 서비스 테스트
node test-api.js
```

### 2. 개별 API 테스트

```javascript
// API 테스트 코드
const APIService = require('./services/APIService');

async function testAPI() {
  const apiService = new APIService();
  
  // API 상태 확인
  const status = await apiService.checkAPIStatus();
  console.log('API Status:', status);
  
  // 서울 데이터 테스트
  const seoulResult = await apiService.fetchSeoulData('culture', 1, 5);
  console.log('Seoul API:', seoulResult.success ? '✅' : '❌');
  
  // 관광 데이터 테스트
  const tourismResult = await apiService.fetchTourismData('areaBased', {
    areaCode: 1,
    numOfRows: 5
  });
  console.log('Tourism API:', tourismResult.success ? '✅' : '❌');
}
```

## 🔄 동기화 실행

### 1. 수동 동기화

```bash
# API 동기화 시작
curl -X POST http://localhost:3003/api/sync/start \
  -H "Content-Type: application/json" \
  -d '{"sources": ["all"], "force": false}'
```

### 2. 자동 동기화 확인

```javascript
// 자동화 작업 확인
const syncAutomation = require('./automation/sync');

// 자동화 시작
syncAutomation.startAutomation();

// 작업 상태 확인
const jobs = syncAutomation.getAllJobInfo();
console.log('Scheduled Jobs:', jobs);
```

## 📊 모니터링

### 1. API 상태 모니터링

```bash
# API 상태 확인
curl http://localhost:3003/api/sync/status
```

### 2. 로그 확인

```bash
# API 서비스 로그
tail -f logs/api-service.log

# 동기화 로그
tail -f logs/automation.log

# 에러 로그
tail -f logs/errors.log
```

### 3. 데이터베이스 확인

```javascript
// 수집된 데이터 확인
const Place = require('./models/Place');

// 총 장소 수
const totalCount = await Place.countDocuments();
console.log('Total Places:', totalCount);

// API 소스별 장소 수
const seoulCount = await Place.countDocuments({
  'data_sources.source': 'seoul_culture_api'
});

const tourismCount = await Place.countDocuments({
  'data_sources.source': 'tourism_api'
});

console.log('Seoul API Places:', seoulCount);
console.log('Tourism API Places:', tourismCount);
```

## 🚨 문제 해결

### 1. API 키 오류

**에러 메시지**: `API key is invalid`

**해결 방법**:
1. API 키 재발급
2. .env 파일 키 업데이트
3. 서버 재시작

### 2. 레이트 리밋 초과

**에러 메시지**: `429 Too Many Requests`

**해결 방법**:
1. API 호출 간격 조정
2. 키 업그레이드 (프리미엄 플랜)
3. 캐싱 시스템 구현

### 3. 데이터 파싱 오류

**에러 메시지**: `Cannot read property 'xxx' of undefined`

**해결 방법**:
1. API 응답 구조 확인
2. 데이터 처리 로직 수정
3. 에러 핸들링 추가

### 4. 데이터베이스 연결 오류

**에러 메시지**: `MongoDB connection failed`

**해결 방법**:
1. MongoDB URI 확인
2. 네트워크 연결 확인
3. IP 화이트리스트 확인 (Atlas의 경우)

## 📈 성능 최적화

### 1. 캐싱 구현

```javascript
// Redis 캐싱
const redis = require('redis');
const client = redis.createClient();

// API 응답 캐싱
async function getCachedData(key, fetchFunction) {
  const cached = await client.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await fetchFunction();
  await client.setex(key, 3600, JSON.stringify(data)); // 1시간 캐싱
  return data;
}
```

### 2. 배치 처리

```javascript
// 대량 데이터 처리 시 배치로 분할
async function batchProcess(items, batchSize = 100) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processBatch(batch);
    
    // API 레이트 리밋 방지
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

### 3. 인덱스 최적화

```javascript
// MongoDB 인덱스
Place.schema.index({
  'data_sources.source': 1,
  'data_sources.reference_id': 1
});

Place.schema.index({
  'status.verification': 1,
  'category.main': 1
});
```

## 📝 참고 사항

### API 사용 제한

- **서울열린데이터광장**: 일일 1000회 호출
- **한국관광공사**: 일일 25000회 호출

### 지원되는 데이터 종류

#### 서울열린데이터광장
- 문화시설 정보
- 맛집 정보
- 전통시장 정보

#### 한국관광공사
- 관광지 정보
- 숙박 정보
- 축제 정보

### 데이터 업데이트 주기

- **자동 동기화**: 매일 오전 3시
- **수동 동기화**: 관리자 필요시
- **실시간 업데이트**: 사용자 등록 시

---

**최종 업데이트**: 2026년 5월 6일
**버전**: 1.0.0