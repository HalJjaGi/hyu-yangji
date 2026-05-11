// 간단한 테스트 스크립트
console.log('테스트 스크립트 로드됨');

// DOM이 준비되면 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded 이벤트 발생');
    
    // places-grid 요소에 테스트 콘텐츠 추가
    const placesGrid = document.getElementById('places-grid');
    if (placesGrid) {
        placesGrid.innerHTML = `
            <div class="col-span-full text-center py-8">
                <h3 class="text-2xl font-bold text-green-600 mb-4">✅ 테스트 성공!</h3>
                <p class="text-gray-600">JavaScript가 정상적으로 실행되고 있습니다.</p>
            </div>
        `;
        console.log('places-grid 요소에 테스트 콘텐츠 추가 성공');
    } else {
        console.error('places-grid 요소를 찾을 수 없음');
    }
});