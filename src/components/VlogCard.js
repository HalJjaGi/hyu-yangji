// Vlog 카드 컴포넌트
export function createVlogCard(vlog) {
    const card = document.createElement('div');
    card.className = 'vlog-card bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl';
    card.innerHTML = `
        <div class="relative">
            <img src="${vlog.thumbnail}" alt="${vlog.title}" class="w-full h-48 object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4">
                <div class="flex items-center justify-between text-white mb-2">
                    <span class="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                        ${vlog.duration}
                    </span>
                    <div class="flex items-center text-sm">
                        <i class="fas fa-eye mr-1"></i>
                        <span>${formatNumber(vlog.views)}</span>
                    </div>
                </div>
                <h4 class="text-white font-bold text-lg mb-1">${vlog.title}</h4>
                <p class="text-white/80 text-sm">${vlog.creator} • ${vlog.createdAt}</p>
            </div>
        </div>
        <div class="p-4">
            <p class="text-gray-600 text-sm mb-3">${vlog.description}</p>
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center text-sm text-gray-500">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    <span>${vlog.placeName}</span>
                </div>
                <div class="flex gap-2">
                    ${vlog.tags.map(tag => `
                        <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                <button onclick="playVlog(${vlog.id})" class="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center">
                    <i class="fas fa-play mr-2"></i>재생
                </button>
                <button onclick="likeVlog(${vlog.id})" class="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center ml-2">
                    <i class="fas fa-heart mr-2"></i>좋아요
                </button>
            </div>
        </div>
    `;
    return card;
}

// 숫자 포맷팅
export function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}