const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Playwright 디버깅 시작...');
  
  const browser = await chromium.launch({ 
    headless: true, // 헤드리스 모드로 실행
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📄 페이지 접속 중...');
    await page.goto('https://hyu-yangji.churchhub.co.kr/', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    // 3초 대기
    await page.waitForTimeout(3000);
    
    console.log('🔍 페이지 분석 시작...');
    
    // 간단한 진단 정보 수집
    const diagnosis = await page.evaluate(() => {
      return {
        title: document.title,
        hasPlacesGrid: !!document.getElementById('places-grid'),
        placesGridContent: document.getElementById('places-grid')?.innerHTML.substring(0, 200) || '없음',
        hasMapContainer: !!document.getElementById('map-container'),
        bodyStyle: window.getComputedStyle(document.body).cssText,
        scriptTags: document.querySelectorAll('script').length,
        linkTags: document.querySelectorAll('link[rel="stylesheet"]').length,
        consoleErrors: []
      };
    });
    
    console.log('📊 진단 결과:');
    console.log(JSON.stringify(diagnosis, null, 2));
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: '/tmp/hyu-yangji-diagnosis.png',
      fullPage: true 
    });
    
    console.log('📸 스크린샷 저장 완료: /tmp/hyu-yangji-diagnosis.png');
    
    // CSS 로딩 상태 확인
    const cssCheck = await page.evaluate(() => {
      const div = document.createElement('div');
      div.className = 'hidden';
      document.body.appendChild(div);
      const isHidden = window.getComputedStyle(div).display === 'none';
      document.body.removeChild(div);
      return isHidden;
    });
    
    console.log('🎨 CSS Tailwind 로딩 상태:', cssCheck ? '정상' : '실패');
    
    // JavaScript 실행 상태
    const jsCheck = await page.evaluate(() => {
      return {
        appExists: typeof window.app !== 'undefined',
        placesLoaded: document.getElementById('places-grid')?.children.length > 0
      };
    });
    
    console.log('⚡ JavaScript 상태:', jsCheck);
    
    // 네트워크 요청 확인
    const failedResources = await page.evaluate(() => {
      const resources = [];
      const performance = window.performance || window.webkitPerformance;
      if (performance) {
        const entries = performance.getEntriesByType('resource');
        entries.forEach(entry => {
          if (entry.duration === 0) {
            resources.push({
              url: entry.name,
              type: entry.initiatorType,
              duration: entry.duration
            });
          }
        });
      }
      return resources;
    });
    
    console.log('🌐 리소스 로딩 상태:', failedResources.length, '개 리소스');
    
    // 최종 진단
    const issues = [];
    if (!cssCheck) issues.push('CSS 로딩 실패');
    if (!jsCheck.appExists) issues.push('JavaScript 앱 미초기화');
    if (!jsCheck.placesLoaded) issues.push('장소 데이터 미로딩');
    
    if (issues.length > 0) {
      console.log('⚠️ 발견된 문제:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('✅ 모든 시스템 정상');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 테스트 완료');
  }
})();