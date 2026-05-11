// 장소 카드 컴포넌트
export function createPlaceCard(place) {
    const card = document.createElement('div');
    card.className = 'place-card bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl';
    card.innerHTML = `
        <div class="relative">
            <img src="${place.image}" alt="${place.name}" class="w-full h-48 object-cover">
            <div class="absolute top-4 right-4">
                <span class="quality-score bg-white bg-opacity-90 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                    ${place.quality_score}점
                </span>
            </div>
            <div class="absolute top-4 left-4">
                <span class="category-badge bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ${getCategoryIcon(place.category)} ${getCategoryName(place.category)}
                </span>
            </div>
        </div>
        <div class="p-6">
            <div class="flex items-start justify-between mb-3">
                <h3 class="text-xl font-bold text-gray-800">${place.name}</h3>
                <div class="flex items-center text-yellow-500">
                    <i class="fas fa-star"></i>
                    <span class="ml-1 text-gray-700">${place.rating}</span>
                </div>
            </div>
            <p class="text-gray-600 mb-4">${place.description}</p>
            <div class="flex items-center text-gray-500 text-sm mb-4">
                <i class="fas fa-map-marker-alt mr-2"></i>
                <span>${place.address}</span>
            </div>
            <div class="flex flex-wrap gap-2">
                ${place.tags.map(tag => `
                    <span class="tag bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        ${tag}
                    </span>
                `).join('')}
            </div>
            <div class="mt-4 flex gap-2">
                <button onclick="showPlaceDetails(${place.id})" class="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    <i class="fas fa-info-circle mr-2"></i>상세보기
                </button>
                <button onclick="showOnMap(${place.id})" class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-map mr-2"></i>지도보기
                </button>
            </div>
        </div>
    `;
    return card;
}

// 카테고리 아이콘 반환
export function getCategoryIcon(category) {
    const icons = {
        'cafe': '<i class="fas fa-coffee"></i>',
        'restaurant': '<i class="fas fa-utensils"></i>',
        'culture': '<i class="fas fa-palette"></i>',
        'study': '<i class="fas fa-book"></i>'
    };
    return icons[category] || '<i class="fas fa-store"></i>';
}

// 카테고리 이름 반환
export function getCategoryName(category) {
    const names = {
        'cafe': '카페',
        'restaurant': '식당',
        'culture': '문화',
        'study': '스터디'
    };
    return names[category] || '기타';
}