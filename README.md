# HYU양지: 한양대 주변 예산 맞춤 데이트/모임 코스 추천 서비스

> "예산을 입력하세요. 한양대 주변 최고의 코스를 짜드립니다."

## 🎯 개요

한양대학교 주변(반경 1.5km)의 식당, 카페, 술집, 전시회, 문화행사 정보를 통합하여 사용자가 설정한 예산에 맞춰 최적의 데이트/모임 코스를 자동으로 추천해주는 서비스입니다.

## 🚀 배포 정보

- **프론트엔드**: Flutter 웹 앱
- **백엔드**: Express.js API (Docker)
- **배포**: Cloudflare Pages (정적 파일) + Cloudflare Workers (API)
- **도메인**: `*.pages.dev` (임시) → 나중에 커스텀 도메인 연결 예정

## 🛠 기술 스택

### Frontend
- **Flutter 3.41** (웹)
- **Dart 3.11**
- **Material Design 3**

### Backend
- **Node.js 18+**
- **Express.js 4.18**
- **PostgreSQL**
- **Redis**
- **Docker**

### Deployment
- **Cloudflare Pages** (프론트엔드)
- **Cloudflare Workers** (백엔드 - 예정)
- **GitHub Actions** (CI/CD)

## 📱 기능

- 예산 기반 코스 추천
- 다양한 카테고리 조합 (식당, 카페, 술집, 전시, 문화행사)
- 무료 리소스 적극 활용
- 실시간 가격 정보
- 사용자 리뷰 및 평점

## 🔧 로컬 개발

```bash
# Flutter 웹 개발
flutter pub get
flutter run -d chrome

# API 서버
cd api
npm install
npm run dev
```

## 🌤 배포

이 프로젝트는 GitHub Actions를 통해 자동으로 Cloudflare Pages에 배포됩니다.

- **메인 브랜치**에 푸시 시 자동 배포
- **임시 도메인**: `https://hyu-yangji-[hash].pages.dev`
- **배포 상태**: [Actions 탭에서 확인](../../actions)

## 📄 라이선스

MIT License