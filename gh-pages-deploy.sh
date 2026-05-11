#!/bin/bash

# GitHub Pages 배포 스크립트
echo "🌿 GitHub Pages 배포 시작..."

# 빌드 파일을 위한 임시 디렉토리
DIST_DIR="dist"
rm -rf $DIST_DIR
mkdir -p $DIST_DIR

# 현재 빌드 결과 복사
cp -r build/web/* $DIST_DIR/
cp index.html $DIST_DIR/

# GitHub Pages 설정 파일 추가
cat > $DIST_DIR/.nojekyll << EOF
# GitHub Pages 설정
EOF

# CNAME 파일 생성 (도메인 설정)
cat > $DIST_DIR/CNAME << EOF
hyu-yangji.churchhub.co.kr
EOF

echo "✅ 배포 파일 준비 완료"
echo "📁 배포할 파일:"
ls -la $DIST_DIR/

echo ""
echo "🔧 GitHub Pages 배포를 위해서는 수동으로 진행해야 합니다:"
echo "1. GitHub 저장소로 이동: https://github.com/HalJjaGi/hyu-yangji"
echo "2. Settings → Pages로 이동"
echo "3. Source를 'gh-pages branch'로 설정"
echo "4. 현재 dist/ 폴더 내용을 gh-pages 브랜치에 푸시"