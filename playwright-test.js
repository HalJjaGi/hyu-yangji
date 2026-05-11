const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Playwright 테스트 시작...');
  
  // 브라우저 실행
  const browser = await chromium.launch({ 
    headless: false, // 테스트를 위해 헤드리스 모드 비활성화
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📄 페이지 로딩 중...');
    
    // 페이지로 이동
    await page.goto('https://hyu-yangji.churchhub.co.kr/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ 페이지 로딩 완료');
    
    // 콘솔 로그 캡처
    page.on('console', msg => {
      console.log(`🖥️  [${msg.type()}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      console.log(`❌ 페이지 에러: ${error.message}`);
    });
    
    // 3초 대기 (자바스크립트 실행 시간)
    await page.waitForTimeout(3000);
    
    console.log('🔍 분석 시작...');
    
    // 1. HTML 구조 분석
    const htmlStructure = await page.evaluate(() => {
      return {
        title: document.title,
        hasPlacesGrid: !!document.getElementById('places-grid'),
        placesGridChildren: document.getElementById('places-grid')?.childElementCount || 0,
        hasMapContainer: !!document.getElementById('map-container'),
        bodyClasses: document.body.className,
        headLinks: Array.from(document.head.querySelectorAll('link')).map(link => ({
          href: link.href,
          rel: link.rel
        }))
      };
    });
    
    console.log('📊 HTML 구조 분석:', htmlStructure);
    
    // 2. CSS 적용 상태 확인
    const cssStatus = await page.evaluate(() => {
      const testElement = document.createElement('div');
      testElement.className = 'hidden test-tailwind';
      document.body.appendChild(testElement);
      
      const styles = window.getComputedStyle(testElement);
      const hasTailwind = styles.display === 'none';
      
      document.body.removeChild(testElement);
      
      // 주요 요소들의 스타일 확인
      const mainElements = {
        body: {
          background: window.getComputedStyle(document.body).backgroundColor,
          fontFamily: window.getComputedStyle(document.body).fontFamily
        },
        placesGrid: null,
        mapContainer: null
      };
      
      if (document.getElementById('places-grid')) {
        const grid = document.getElementById('places-grid');
        mainElements.placesGrid = {
          display: window.getComputedStyle(grid).display,
          gridTemplateColumns: window.getComputedStyle(grid).gridTemplateColumns,
          gap: window.getComputedStyle(grid).gap
        };
      }
      
      if (document.getElementById('map-container')) {
        const map = document.getElementById('map-container');
        mainElements.mapContainer = {
          height: window.getComputedStyle(map).height,
          width: window.getComputedStyle(map).width
        };
      }
      
      return {
        hasTailwind,
        mainElements,
        computedStyles: mainElements
      };
    });
    
    console.log('🎨 CSS 적용 상태:', cssStatus);
    
    // 3. JavaScript 실행 상태 확인
    const jsStatus = await page.evaluate(() => {
      return {
        hasApp: typeof app !== 'undefined',
        hasLeaflet: typeof L !== 'undefined',
        consoleErrors: [],
        placesGridContent: document.getElementById('places-grid')?.innerHTML || ''
      };
    });
    
    console.log('⚡ JavaScript 상태:', jsStatus);
    
    // 4. 스크린샷 촬영
    await page.screenshot({ 
      path: '/tmp/playwright-screenshot.png',
      fullPage: true 
    });
    
    console.log('📸 스크린샷 촬영 완료: /tmp/playwright-screenshot.png');
    
    // 5. 네트워크 요청 분석
    const networkRequests = [];
    page.on('request', request => {
      if (request.url().includes('.css') || request.url().includes('tailwind')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });
    
    await page.waitForTimeout(2000);
    
    console.log('🌐 네트워크 요청:', networkRequests);
    
    // 6. 최종 진단
    console.log('\n🔍 === 최종 진단 결과 ===');
    
    const issues = [];
    
    if (!cssStatus.hasTailwind) {
      issues.push('❌ Tailwind CSS가 로드되지 않음');
    }
    
    if (htmlStructure.placesGridChildren === 0) {
      issues.push('❌ places-grid에 콘텐츠가 없음');
    }
    
    if (!jsStatus.hasApp) {
      issues.push('❌ JavaScript 앱이 초기화되지 않음');
    }
    
    if (issues.length === 0) {
      console.log('✅ 모든 시스템이 정상적으로 작동합니다!');
    } else {
      console.log('⚠️  발견된 문제:');
      issues.forEach(issue => console.log(`  ${issue}`));
    }
    
    console.log('\n📋 === 권장 조치 ===');
    
    if (!cssStatus.hasTailwind) {
      console.log('1. Tailwind CSS CDN을 확인하고 대체 CDN을 추가하세요.');
    }
    
    if (htmlStructure.placesGridChildren === 0) {
      console.log('2. JavaScript 초기화 로직을 확인하세요.');
    }
    
    if (!jsStatus.hasApp) {
      console.log('3. App.js 파일의 경로와 실행을 확인하세요.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 에러 발생:', error);
    
    // 에러 발생 시에도 스크린샷 촬영
    try {
      await page.screenshot({ 
        path: '/tmp/playwright-error-screenshot.png',
        fullPage: true 
      });
      console.log('📸 에러 스크린샷: /tmp/playwright-error-screenshot.png');
    } catch (screenshotError) {
      console.error('스크린샷 촬영 실패:', screenshotError);
    }
  } finally {
    await browser.close();
    console.log('🏁 Playwright 테스트 완료');
  }
})();