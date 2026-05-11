#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json
import re

def analyze_website():
    print("🔍 웹사이트 분석 시작...")
    
    try:
        # 웹사이트 요청
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get('https://hyu-yangji.churchhub.co.kr/', headers=headers, timeout=10)
        response.raise_for_status()
        
        print(f"✅ 웹사이트 접속 성공 (상태 코드: {response.status_code})")
        
        # HTML 파싱
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 기본 정보 분석
        analysis = {
            'title': soup.title.string if soup.title else '제목 없음',
            'has_places_grid': soup.find('div', {'id': 'places-grid'}) is not None,
            'has_map_container': soup.find('div', {'id': 'map-container'}) is not None,
            'css_links': [],
            'js_scripts': [],
            'body_classes': soup.body.get('class', []) if soup.body else [],
            'meta_tags': []
        }
        
        # CSS 링크 확인
        for link in soup.find_all('link', {'rel': 'stylesheet'}):
            analysis['css_links'].append({
                'href': link.get('href', ''),
                'integrity': link.get('integrity', '')
            })
        
        # JavaScript 스크립트 확인
        for script in soup.find_all('script'):
            src = script.get('src', '')
            if src:
                analysis['js_scripts'].append(src)
        
        # 메타 태그 확인
        for meta in soup.find_all('meta'):
            analysis['meta_tags'].append({
                'name': meta.get('name', ''),
                'content': meta.get('content', '')
            })
        
        # places-grid 내용 확인
        places_grid = soup.find('div', {'id': 'places-grid'})
        if places_grid:
            analysis['places_grid_content'] = str(places_grid)[:200] + '...'
            analysis['places_grid_children'] = len(places_grid.find_all(recursive=False))
        else:
            analysis['places_grid_content'] = '없음'
            analysis['places_grid_children'] = 0
        
        print("\n📊 분석 결과:")
        print(json.dumps(analysis, indent=2, ensure_ascii=False))
        
        # 문제점 분석
        issues = []
        
        # Tailwind CSS 확인
        tailwind_loaded = any('tailwind' in link['href'].lower() for link in analysis['css_links'])
        if not tailwind_loaded:
            issues.append("❌ Tailwind CSS가 로드되지 않음")
        else:
            print("✅ Tailwind CSS 로드됨")
        
        # App.js 확인
        app_js_loaded = any('App.js' in script for script in analysis['js_scripts'])
        if not app_js_loaded:
            issues.append("❌ App.js가 로드되지 않음")
        else:
            print("✅ App.js 로드됨")
        
        # places-grid 상태
        if analysis['places_grid_children'] == 0:
            issues.append("❌ places-grid에 콘텐츠가 없음")
        else:
            print(f"✅ places-grid에 {analysis['places_grid_children']}개의 자식 요소 존재")
        
        # 결과 출력
        if issues:
            print("\n⚠️ 발견된 문제점:")
            for issue in issues:
                print(f"  {issue}")
        else:
            print("\n✅ 모든 시스템이 정상적으로 작동합니다!")
        
        # CSS 링크 상세 정보
        print("\n🎨 CSS 로딩 상세:")
        for i, link in enumerate(analysis['css_links'], 1):
            print(f"  {i}. {link['href']}")
        
        # JavaScript 스크립트 상세 정보
        print("\n⚡ JavaScript 로딩 상세:")
        for i, script in enumerate(analysis['js_scripts'], 1):
            print(f"  {i}. {script}")
        
        return analysis
        
    except requests.RequestException as e:
        print(f"❌ 네트워크 오류: {e}")
        return None
    except Exception as e:
        print(f"❌ 분석 오류: {e}")
        return None

if __name__ == "__main__":
    result = analyze_website()
    if result:
        print("\n🏁 분석 완료")
    else:
        print("\n❌ 분석 실패")