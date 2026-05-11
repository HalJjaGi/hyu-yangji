# HYU양지:GO - AI 기반 동선 추천 서비스

한양대 주변 지역을 중심으로 한 AI 기반 동선 추천 서비스입니다.

## 🎯 시스템 개요

### 핵심 기능
- **🤖 AI 동선 추천**: 사용자 선호도를 기반으로 최적의 동선을 추천합니다.
- **📍 장소 관리**: 사용자가 직접 장소를 등록하고 관리할 수 있습니다.
- **🔄 하이브리드 데이터**: 공공 API 데이터 + 사용자 등록 데이터를 융합합니다.
- **⭐ 리뷰 시스템**: 장소별 리뷰와 평점을 관리합니다.
- **📱 모바일 최적화**: 모바일 환경에서 최적화된 UI를 제공합니다.

### 시스템 아키텍처
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend   │     │   Backend    │     │  Database   │
│ (Nginx +     │────►│ (Express.js) │────►│ (MongoDB)    │
│   HTML/JS)   │     │     API      │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
       ↑                    ↓                    ↓
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User      │     │   Data       │     │   Cloud     │
│  Interface  │     │   Sources     │     │  Services   │
└─────────────┘     └──────────────┘     └─────────────┘
```

## 🚀 빠른 시작

### 사전 요구사항
- Docker와 Docker Compose 설치
- Node.js 16.0 이상 (로컬 개발 시)
- MongoDB Atlas 계정 (프로덕션 환경)

### 1. 환경 설정
```bash
# 환경 변수 파일 복사
cp .env.example .env

# .env 파일 수정 (필수 값들 설정)
# MONGODB_URI, JWT_SECRET, API 키들 등
```

### 2. Docker로 실행 (추천)
```bash
# 모든 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 상태 확인
docker-compose ps
```

### 3. 로컬 개발 환경으로 실행
```bash
# API 서버
cd api
npm install
npm run dev

# 웹 서버
# 기존대로 build/web 폴더를 Nginx로 서빙
```

## 📁 프로젝트 구조

```
hyu_yangji/
├── api/                    # 백엔드 API 서버
│   ├── models/             # 데이터 모델 (Place, User)
│   ├── routes/             # API 라우트
│   ├── middleware/         # 미들웨어 (인증, 에러 처리)
│   ├── services/          # 비즈니스 로직
│   ├── automation/        # 자동화 (동기화, 품질 검사)
│   ├── config/            # 설정 파일
│   └── logs/              # 로그 파일
├── admin/                # 관리자 페이지 (개발 예정)
├── build/web/            # 빌드된 웹 파일
├── dist/                 # 배포 파일
├── docker-compose.yml    # Docker Compose 설정
├── Dockerfile.api        # API 서버 Dockerfile
├── Dockerfile.web        # 웹 서버 Dockerfile
└── README.md             # 이 파일
```

## 🔧 API 문서

### 기본 URL
- 개발 환경: `http://localhost:3003`
- 프로덕션 환경: `https://hyu-yangji.churchhub.co.kr/api`

### 인증
현재는 개발용 임시 인증만 구현되어 있습니다. 실제 운영 시에는 JWT 인증이 필요합니다.

```javascript
// 임시 관리자 인증 헤더
headers: {
  'X-Admin-Token': 'temp-token'
}
```

### 주요 엔드포인트

#### 장소 관리
```http
GET    /api/places              # 장소 목록 조회
GET    /api/places/:id          # 장소 상세 조회
POST   /api/places              # 장소 등록 (사용자)
PUT    /api/places/:id          # 장소 수정
DELETE /api/places/:id          # 장소 삭제
GET    /api/places/nearby/:lat/:lng  # 주변 장소 조회
GET    /api/places/search/:query     # 장소 검색
```

#### 관리자 기능
```http
GET    /api/admin/pending      # 대기 중인 장소 목록
GET    /api/admin/review/:id    # 장소 상세 검토
PUT    /api/admin/approve/:id   # 장소 승인
PUT    /api/admin/reject/:id    # 장소 거절
PUT    /api/admin/merge/:id     # API 데이터와 병합
GET    /api/admin/dashboard     # 관리자 대시보드
```

#### 데이터 동기화
```http
POST   /api/sync/start         # API 데이터 동기화 시작
GET    /api/sync/status        # 동기화 상태 조회
```

## 🗄️ 데이터 모델

### Place (장소)
```javascript
{
  name: "장소명",
  location: {
    type: "Point",
    coordinates: [lng, lat]
  },
  address: {
    full: "전체 주소",
    district: "구"
  },
  category: {
    main: "food|culture|shopping|activity",
    sub: "세부 카테고리"
  },
  data_sources: [{
    source: "api_seoul|user|admin",
    confidence: 0.8,
    verified: true
  }],
  status: {
    visibility: "visible|hidden|pending",
    verification: "verified|pending|rejected"
  },
  quality: {
    overall_score: 0.85,
    completeness: 0.9
  }
}
```

## 🔧 설정

### 환경 변수
```bash
# 데이터베이스
MONGODB_URI=mongodb+srv://...

# API 키
SEOUL_API_KEY=your-seoul-api-key
TOURISM_API_KEY=your-tourism-api-key

# 보안
JWT_SECRET=your-super-secret-key
```

### 카테고리 정의
```javascript
const categories = {
  food: ["한식", "일식", "카페", "주점"],
  culture: ["갤러리", "박물관", "전시회", "공연장"],
  shopping: ["시장", "쇼핑몰", "부티크"],
  activity: ["공원", "문화센터", "체험"]
}
```

## 🔄 데이터 동기화

### 지원되는 API 소스
- **서울열린데이터광장**: 서울시 공공 데이터
- **한국관광공사**: 관광지 정보
- **문화관광부**: 문화시설 정보

### 동기화 스케줄
```javascript
// 매일 오전 3시 자동 동기화
cron.schedule('0 3 * * *', () => {
  // API 데이터 동기화 실행
});
```

## 🛠️ 유지보수

### 로그 모니터링
```bash
# API 로그
docker-compose logs -f api

# 에러 로그
tail -f api/logs/errors.log
```

### 데이터베이스 백업
```bash
# MongoDB Atlas 자동 백업 (3일 보관)
# 수동 백업은 Atlas 콘솔에서 가능
```

### 성능 모니터링
```javascript
// MongoDB Atlas 모니터링
// - 쿼리 성능
// - 인덱스 사용량
// - 연결 상태
```

## 🐛 문제 해결

### 일반적인 문제들

1. **MongoDB 연결 실패**
   ```bash
   # MONGODB_URI 확인
   # 네트워크 연결 상태 확인
   # Atlas IP 화이트리스트 확인
   ```

2. **API 포트 충돌**
   ```bash
   # 다른 프로세스가 3003번 포트 사용 중인지 확인
   lsof -i :3003
   ```

3. **파일 업로드 오류**
   ```bash
   # 업로드 디렉토리 권한 확인
   chmod 755 api/uploads/
   ```

### 디버깅 모드
```bash
# 개발 모드로 실행
NODE_ENV=development npm run dev

# 상세 로그 활성화
DEBUG=api:* npm run dev
```

## 📝 개발 가이드

### 1. 새로운 API 엔드포인트 추가
```javascript
// 1. 라우트 파일에 경로 추가
// api/routes/places.js

// 2. 유효성 검사 스키마 정의
const schema = Joi.object({
  name: Joi.string().required()
});

// 3. 컨트롤러 로직 구현
router.post('/new-endpoint', async (req, res) => {
  // 비즈니스 로직
});
```

### 2. 새로운 데이터 모델 추가
```javascript
// 1. 모델 파일 생성
// api/models/NewModel.js

const mongoose = require('mongoose');
const newSchema = new mongoose.Schema({
  // 스키마 정의
});

module.exports = mongoose.model('NewModel', newSchema);
```

### 3. API 테스트
```bash
# API 테스트 (curl 예시)
curl -X GET http://localhost:3003/api/places \
  -H "Content-Type: application/json"

# 자동화 테스트
npm test
```

## 🤝 기여

1. 이 저장소를 포크합니다.
2. 기능 브랜치를 생성합니다: `git checkout -b feature/new-feature`
3. 변경 사항을 커밋합니다: `git commit -am 'Add new feature'`
4. 브랜치를 푸시합니다: `git push origin feature/new-feature`
5. 풀 리퀘스트를 생성합니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- 개발자: HYU양지:GO 팀
- 이메일: dev@hyu-yangji.com
- 버그 리포트: [GitHub Issues](https://github.com/HalJjaGi/hyu-yangji/issues)

---

**최종 업데이트**: 2026년 5월 6일
**버전**: 1.0.0