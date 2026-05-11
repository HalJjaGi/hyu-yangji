// 실시간 검색 기능

// 검색 데이터 (현재는 테스트 데이터)
const searchData = [
    {
        name: "스타벅스 홍익대점",
        category: "cafe",
        address: "서울특별시 마포구 홍익대학교길 25",
        quality_score: 0.92,
        description: "캠퍼스 내 대표 카페"
    },
    {
        name: "홍대 학생회관 식당",
        category: "restaurant",
        address: "서울특별시 마포구 홍익대학교길 1",
        quality_score: 0.88,
        description: "학생들을 위한 식당"
    },
    {
        name: "홍익대학교 미술관",
        category: "culture",
        address: "서울특별시 마포구 홍익대학교길 94",
        quality_score: 0.95,
        description: "대한민국 대표 미술관"
    },
    {
        name: "교보문고 홍대점",
        category: "shopping",
        address: "서울특별시 마포구 양화로 156",
        quality_score: 0.91,
        description: "대형 서점"
    },
    {
        name: "이디야 커피 홍대점",
        category: "cafe",
        address: "서울특별시 마포구 홍익대학교길 15",
        quality_score: 0.87,
        description: "저렴한 커피"
    }
];

// 페이지 로드 시 검색 기능 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 검색 이벤트 리스너
    const searchInput = document.getElementById('main-search');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) {
                showSearchResults();
            }
        });
    }
    
    // 검색 외부 클릭 시 닫기
    document.addEventListener('click', function(event) {
        const searchResults = document.getElementById('search-results');
        const searchBox = document.querySelector('.search-box');
        
        if (searchResults && searchBox && !searchBox.contains(event.target)) {
            searchResults.style.display = 'none';
        }
    });
});

// 실시간 검색 처리
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    const searchResults = document.getElementById('search-results');
    
    if (query.length === 0) {
        if (searchResults) {
            searchResults.style.display = 'none';
        }
        return;
    }
    
    // 검색 실행
    const results = searchData.filter(place => 
        place.name.toLowerCase().includes(query) ||
        place.address.toLowerCase().includes(query) ||
        place.category.toLowerCase().includes(query)
    );
    
    // 검색 결과 표시
    displaySearchResults(results, query);
    showSearchResults();
}

// 검색 결과 표시
function displaySearchResults(results, query) {
    const container = document.getElementById('search-results-container');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-search text-3xl mb-2"></i>
                <p>'${query}'에 대한 검색 결과가 없습니다.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = results.slice(0, 5).map(place => {
        const qualityText = Math.round(place.quality_score * 100);
        const qualityClass = place.quality_score >= 0.9 ? 'quality-good' : 'quality-medium';
        
        return `
            <div class="search-result-item p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition" onclick="selectPlace('${place.name}')">
                <div class="flex justify-between items-start mb-2">
                    <div class="place-name font-bold text-lg">${place.name}</div>
                    <div class="place-category text-white px-3 py-1 rounded-full text-xs" style="background: linear-gradient(135deg, var(--secondary-color), var(--primary-color))">
                        ${getCategoryName(place.category)}
                    </div>
                </div>
                <div class="place-address text-sm text-gray-600 mb-2">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    ${place.address}
                </div>
                <div class="flex items-center gap-2">
                    <div class="quality-score px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-600">
                        품질 ${qualityText}점
                    </div>
                    <i class="fas fa-star text-yellow-500 ${qualityClass}"></i>
                </div>
            </div>
        `;
    }).join('');
}

// 검색 결과 표시
function showSearchResults() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.style.display = 'block';
    }
}

// 검색 결과 숨기기
function hideSearchResults() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// 장소 선택
function selectPlace(placeName) {
    const place = searchData.find(p => p.name === placeName);
    if (place) {
        alert(`'${placeName}'를 선택했습니다!\\n\\n주소: ${place.address}\\n품질 점수: ${Math.round(place.quality_score * 100)}점`);
        hideSearchResults();
        const searchInput = document.getElementById('main-search');
        if (searchInput) {
            searchInput.value = '';
        }
    }
}

// 카테고리 이름 변환
function getCategoryName(category) {
    const names = {
        'cafe': '카페',
        'restaurant': '식당',
        'culture': '문화시설',
        'shopping': '쇼핑'
    };
    return names[category] || category;
}