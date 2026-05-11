// 메인 애플리케이션 클래스
// 모듈 임포트 대신 직접 데이터 선언 (브라우저 호환성을 위해)
const placesData = [
    {
        id: 1,
        name: '스타벅스 한양대점',
        category: 'cafe',
        rating: 4.5,
        quality_score: 92,
        address: '서울특별시 성동구 한양대학교길 25',
        description: '한양대학교 내에 위치한 대표적인 카페',
        image: 'https://picsum.photos/seed/hyu-cafe1/400/300.jpg',
        lat: 37.5559,
        lng: 127.0465,
        distance: 0.1,
        tags: ['와이파이', '공부하기좋음', '24시간']
    },
    {
        id: 2,
        name: '한양대 학생회관 식당',
        category: 'restaurant',
        rating: 4.2,
        quality_score: 88,
        address: '서울특별시 성동구 한양대학교길 1',
        description: '학생들을 위한 저렴하고 맛있는 식당',
        image: 'https://picsum.photos/seed/hyu-restaurant1/400/300.jpg',
        lat: 37.5560,
        lng: 127.0466,
        distance: 0.05,
        tags: ['학생할인', '다양한메뉴', '단체석']
    },
    {
        id: 3,
        name: '한양대 박물관',
        category: 'culture',
        rating: 4.8,
        quality_score: 95,
        address: '서울특별시 성동구 한양대학교길 94',
        description: '한양대학교의 박물관',
        image: 'https://picsum.photos/seed/hyu-museum1/400/300.jpg',
        lat: 37.5561,
        lng: 127.0467,
        distance: 0.2,
        tags: ['무료입장', '역사전시', '교육적']
    },
    {
        id: 4,
        name: '한양대 도서관',
        category: 'study',
        rating: 4.7,
        quality_score: 94,
        address: '서울특별시 성동구 한양대학교길 55',
        description: '24시간 열람이 가능한 대학 도서관',
        image: 'https://picsum.photos/seed/hyu-library1/400/300.jpg',
        lat: 37.5562,
        lng: 127.0468,
        distance: 0.15,
        tags: ['24시간', '조용한', '자료풍부']
    },
    {
        id: 5,
        name: '커피스토리 한양대',
        category: 'cafe',
        rating: 4.3,
        quality_score: 85,
        address: '서울특별시 성동구 한양대학교길 30',
        description: '아늑한 분위기의 수제 커피 전문점',
        image: 'https://picsum.photos/seed/hyu-cafe2/400/300.jpg',
        lat: 37.5563,
        lng: 127.0469,
        distance: 0.12,
        tags: ['수제커피', '디저트', '아늑함']
    },
    {
        id: 6,
        name: '한양대 체육관',
        category: 'culture',
        rating: 4.1,
        quality_score: 82,
        address: '서울특별시 성동구 한양대학교길 70',
        description: '다양한 스포츠 시설을 갖춘 체육관',
        image: 'https://picsum.photos/seed/hyu-gym1/400/300.jpg',
        lat: 37.5564,
        lng: 127.0470,
        distance: 0.18,
        tags: ['운동시설', '샤워실', '수영장']
    }
];

const vlogData = [
    {
        id: 1,
        title: '스타벅스 한양대점 방문 Vlog',
        creator: '양지친구',
        placeName: '스타벅스 한양대점',
        thumbnail: 'https://picsum.photos/seed/vlog1/400/300.jpg',
        duration: '2:15',
        views: 1240,
        likes: 89,
        createdAt: '10분 전',
        tags: ['카페', '스터디', '와이파이'],
        videoUrl: '#',
        description: '한양대학교 대표 카페인 스타벅스의 분위기를 담았어요! 공부하기 좋은 환경이에요.'
    },
    {
        id: 2,
        title: '한양대 도서관 하루종일 스터디',
        creator: 'H양지',
        placeName: '한양대 도서관',
        thumbnail: 'https://picsum.photos/seed/vlog2/400/300.jpg',
        duration: '3:42',
        views: 890,
        likes: 67,
        createdAt: '1시간 전',
        tags: ['스터디', '도서관', '24시간'],
        videoUrl: '#',
        description: '24시간 열람실에서의 하루! 조용한 환경에서 집중력 UP!'
    },
    {
        id: 3,
        title: '학생회관 점심 맛집 투어',
        creator: '양지맛집',
        placeName: '한양대 학생회관 식당',
        thumbnail: 'https://picsum.photos/seed/vlog3/400/300.jpg',
        duration: '1:58',
        views: 2150,
        likes: 156,
        createdAt: '2시간 전',
        tags: ['식당', '학생할인', '점심'],
        videoUrl: '#',
        description: '한양대학교에서 가장 맛있는 점심 메뉴들을 소개합니다! 가성비 최고!'
    },
    {
        id: 4,
        title: '한양대 박물관 전시 관람',
        creator: '문화양지',
        placeName: '한양대 박물관',
        thumbnail: 'https://picsum.photos/seed/vlog4/400/300.jpg',
        duration: '4:20',
        views: 567,
        likes: 43,
        createdAt: '3시간 전',
        tags: ['문화', '박물관', '전시'],
        videoUrl: '#',
        description: '한양대학교 박물관의 특별 전시를 구경했어요. 역사를 느낄 수 있는 시간이었어요.'
    },
    {
        id: 5,
        title: '커피스토리 아늑한 오후',
        creator: '카페양지',
        placeName: '커피스토리 한양대',
        thumbnail: 'https://picsum.photos/seed/vlog5/400/300.jpg',
        duration: '2:33',
        views: 780,
        likes: 92,
        createdAt: '5시간 전',
        tags: ['카페', '수제커피', '디저트'],
        videoUrl: '#',
        description: '아늑한 분위기에서 수제 커피와 디저트를 즐기는 오후, 추천해요!'
    },
    {
        id: 6,
        title: '체육관에서 땀 흘리기',
        creator: '운동양지',
        placeName: '한양대 체육관',
        thumbnail: 'https://picsum.photos/seed/vlog6/400/300.jpg',
        duration: '1:45',
        views: 1340,
        likes: 78,
        createdAt: '6시간 전',
        tags: ['운동', '체육관', '헬스'],
        videoUrl: '#',
        description: '한양대학교 체육관에서 다양한 운동을 즐기는 모습! 건강한 하루를 위해서!'
    }
];

// 유틸리티 함수들
function createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (innerHTML) {
        element.innerHTML = innerHTML;
    }
    return element;
}

function findById(id) {
    console.log('🔍 findById called with:', {
        id: id,
        idType: typeof id,
        idValue: id,
        callStack: new Error().stack
    });
    
    // ID 타입 체크
    if (typeof id !== 'string') {
        console.error('❌ findById: id must be a string, got:', typeof id, id);
        return null;
    }
    
    if (!id || id.trim() === '') {
        console.error('❌ findById: id is empty or null');
        return null;
    }
    
    console.log('📍 Looking for element with id:', id);
    const element = document.getElementById(id);
    
    console.log('📦 getElementById result:', {
        element: element,
        elementType: typeof element,
        elementToString: element?.toString?.() || 'NO_TO_STRING',
        elementConstructor: element?.constructor?.name || 'NO_CONSTRUCTOR',
        isNull: element === null,
        isUndefined: element === undefined
    });
    
    // 엄격한 타입 체크
    if (!element) {
        console.warn('⚠️ Element not found with id:', id);
        return null;
    }
    
    // DOM 요소인지 확인
    if (!(element instanceof HTMLElement)) {
        console.error('❌ findById: Found element is not a DOM element:', element);
        console.error('Element details:', {
            tagName: element?.tagName,
            nodeType: element?.nodeType,
            toString: element?.toString?.()
        });
        return null;
    }
    
    // addEventListener 메서드가 있는지 확인
    if (typeof element.addEventListener !== 'function') {
        console.error('❌ findById: Element does not have addEventListener method:', element);
        console.error('Element methods:', Object.getOwnPropertyNames(element));
        return null;
    }
    
    console.log('✅ findById successfully found:', element);
    return element;
}

function findBySelector(selector) {
    return document.querySelector(selector);
}

function findAllBySelector(selector) {
    return document.querySelectorAll(selector);
}

function addEventListener(element, event, handler) {
    // 가장 엄격한 체크
    if (!element) {
        console.error('addEventListener: element is null or undefined for event:', event);
        throw new Error(`addEventListener: element is null for event: ${event}`);
    }
    
    if (!(element instanceof HTMLElement)) {
        console.error('addEventListener: element is not a DOM element:', element);
        console.error('Element type:', typeof element, 'Element:', element);
        throw new Error(`addEventListener: element is not a DOM element for event: ${event}`);
    }
    
    if (typeof element.addEventListener !== 'function') {
        console.error('addEventListener: element does not have addEventListener method:', element);
        console.error('Element details:', {
            tagName: element.tagName,
            nodeType: element.nodeType,
            toString: element.toString()
        });
        throw new Error(`addEventListener: element does not have addEventListener method for event: ${event}`);
    }
    
    // 이벤트 타입 체크
    if (typeof event !== 'string' || !event) {
        console.error('addEventListener: event must be a non-empty string, got:', event);
        throw new Error(`addEventListener: invalid event type: ${event}`);
    }
    
    // 핸들러 타입 체크
    if (typeof handler !== 'function') {
        console.error('addEventListener: handler must be a function, got:', typeof handler);
        throw new Error(`addEventListener: handler is not a function for event: ${event}`);
    }
    
    // 모든 체크 통과 후에만 실행
    try {
        element.addEventListener(event, handler);
        console.log(`✅ addEventListener successfully added for ${event} on ${element.tagName || element}`);
    } catch (error) {
        console.error(`❌ Error adding event listener for ${event}:`, error);
        throw error;
    }
}

function scrollToElement(element, behavior = 'smooth') {
    if (element) {
        element.scrollIntoView({ behavior });
    }
}

function addClass(element, ...classNames) {
    if (element) {
        element.classList.add(...classNames);
    }
}

function removeClass(element, ...classNames) {
    if (element) {
        element.classList.remove(...classNames);
    }
}

// 컴포넌트 함수들
function createPlaceCard(place) {
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

function createVlogCard(vlog) {
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

function getCategoryIcon(category) {
    const icons = {
        'cafe': '<i class="fas fa-coffee"></i>',
        'restaurant': '<i class="fas fa-utensils"></i>',
        'culture': '<i class="fas fa-palette"></i>',
        'study': '<i class="fas fa-book"></i>'
    };
    return icons[category] || '<i class="fas fa-store"></i>';
}

function getCategoryName(category) {
    const names = {
        'cafe': '카페',
        'restaurant': '식당',
        'culture': '문화',
        'study': '스터디'
    };
    return names[category] || '기타';
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

class App {
    constructor() {
        try {
            console.log('🏗️ App constructor 시작');
            
            // 기본 데이터 초기화 (안전한 것만)
            this.currentPlaces = [...placesData];
            this.currentCategory = 'all';
            this.currentSort = 'quality';
            this.map = null;
            this.markers = [];
            
            console.log('✅ 기본 데이터 초기화 완료');
            
            // ⚠️ 생성자에서는 DOM 초기화를 하지 않음!
            // 초기화는 외부에서 별도로 호출해야 함
            console.log('⏳ DOM 초기화는 외부에서 별도로 호출 필요');
            
            console.log('✅ App constructor 성공');
        } catch (error) {
            console.error('❌ App constructor 에러:', error);
            // 생성자에서는 alert만 사용 (DOM 아직 준비 안 될 수 있음)
            try {
                alert('애플리케이션 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
            } catch (alertError) {
                console.error('❌ alert도 실패:', alertError);
            }
        }
    }
    
    // 기본 초기화
    initializeBasic() {
        console.log('기본 초기화 시작');
        this.setupSidebar();
        this.initializePlaces();
        this.initializeFilters();
        this.initializeSorting();
        this.initializeLoadMore();
        console.log('기본 초기화 완료');
    }
    
    // 고급 초기화 (지도 등)
    initializeAdvanced() {
        console.log('고급 초기화 시작');
        try {
            this.initializeMap();
            this.initializeVlog();
        } catch (error) {
            console.error('고급 초기화 에러:', error);
        }
        console.log('고급 초기화 완료');
    }
    
    init() {
        try {
            console.log('init 시작');
            this.setupSidebar();
            this.initializePlaces();
            this.initializeFilters();
            this.initializeSorting();
            this.initializeLoadMore();
            this.initializeMap();
            this.initializeVlog();
            console.log('init 성공');
        } catch (error) {
            console.error('init 에러:', error);
            this.showError('기능 초기화에 실패했습니다.');
        }
    }
    
    // 사이드바 설정
    setupSidebar() {
        console.log('🔧 setupSidebar starting...');
        
        // 각 요소를 안전하게 찾기
        const menuToggle = findById('menu-toggle');
        const closeSidebar = findById('close-sidebar');
        const sidebar = findById('sidebar');
        
        console.log('📋 setupSidebar elements:', {
            menuToggle: !!menuToggle,
            closeSidebar: !!closeSidebar,
            sidebar: !!sidebar,
            menuToggleType: typeof menuToggle,
            closeSidebarType: typeof closeSidebar,
            sidebarType: typeof sidebar
        });
        
        if (menuToggle && closeSidebar && sidebar) {
            console.log('✅ All elements found, setting up event listeners...');
            
            // menuToggle 클릭 이벤트 - 강화된 에러 처리
            try {
                console.log('🎯 Adding click listener to menuToggle');
                addEventListener(menuToggle, 'click', () => {
                    console.log('🔄 menuToggle clicked');
                    this.removeClass(sidebar, '-translate-x-full');
                });
            } catch (error) {
                console.error('❌ Failed to add listener to menuToggle:', error);
            }
            
            // closeSidebar 클릭 이벤트 - 강화된 에러 처리
            try {
                console.log('🎯 Adding click listener to closeSidebar');
                addEventListener(closeSidebar, 'click', () => {
                    console.log('🔄 closeSidebar clicked');
                    this.addClass(sidebar, '-translate-x-full');
                });
            } catch (error) {
                console.error('❌ Failed to add listener to closeSidebar:', error);
            }
            
            // 사이드바 외부 클릭 시 닫기 - 강화된 에러 처리
            try {
                console.log('🎯 Adding document click listener');
                addEventListener(document, 'click', (event) => {
                    try {
                        if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                            console.log('🔄 Outside click detected, closing sidebar');
                            this.addClass(sidebar, '-translate-x-full');
                        }
                    } catch (containsError) {
                        console.error('❌ Error in contains check:', containsError);
                    }
                });
            } catch (error) {
                console.error('❌ Failed to add listener to document:', error);
            }
            
            console.log('✅ Sidebar setup completed successfully');
        } else {
            console.error('❌ setupSidebar failed - missing elements:', {
                menuToggle: menuToggle,
                closeSidebar: closeSidebar,
                sidebar: sidebar
            });
        }
    }
    
    // 장소 목록 초기화
    initializePlaces() {
        const container = findById('places-grid');
        console.log('initializePlaces 호출됨, container:', container);
        
        if (container) {
            this.renderPlaces(this.currentPlaces);
            console.log('장소 렌더링 성공');
        } else {
            console.error('places-grid 요소를 찾을 수 없음');
            // 기본 콘텐츠 표시
            const mainContent = document.querySelector('main');
            if (mainContent) {
                const placesSection = mainContent.querySelector('section');
                if (placesSection) {
                    placesSection.innerHTML = `
                        <div class="container mx-auto px-4 py-8">
                            <h2 class="text-4xl font-bold text-center mb-12">추천 장소</h2>
                            <div id="places-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                <!-- 장소 카드들이 여기에 표시됩니다 -->
                            </div>
                        </div>
                    `;
                }
            }
        }
    }
    
    // 장소 렌더링
    renderPlaces(places) {
        const container = findById('places-grid');
        if (!container) return;
        
        container.innerHTML = '';
        places.forEach(place => {
            const card = createPlaceCard(place);
            container.appendChild(card);
        });
    }
    
    // 필터링 초기화
    initializeFilters() {
        const filterButtons = findAllBySelector('.category-filter');
        filterButtons.forEach(button => {
            addEventListener(button, 'click', (e) => {
                this.handleFilterClick(e.target);
            });
        });
    }
    
    // 필터링 핸들러
    handleFilterClick(button) {
        const filterButtons = findAllBySelector('.category-filter');
        
        // 활성화 상태 변경
        filterButtons.forEach(btn => {
            this.removeClass(btn, 'bg-purple-600', 'text-white');
            this.addClass(btn, 'bg-gray-200', 'text-gray-700');
        });
        
        this.removeClass(button, 'bg-gray-200', 'text-gray-700');
        this.addClass(button, 'bg-purple-600', 'text-white');
        
        // 필터링 적용
        const category = button.dataset.category;
        this.filterPlaces(category);
    }
    
    // 장소 필터링
    filterPlaces(category) {
        this.currentCategory = category;
        if (category === 'all') {
            this.currentPlaces = [...placesData];
        } else {
            this.currentPlaces = placesData.filter(place => place.category === category);
        }
        
        // 정렬 적용
        this.applySorting();
        
        // 장소 다시 렌더링
        this.renderPlaces(this.currentPlaces);
        
        // 지도 마커 업데이트
        if (this.map) {
            this.addPlaceMarkers();
        }
    }
    
    // 정렬 초기화
    initializeSorting() {
        const sortSelect = findById('sort-select');
        if (sortSelect) {
            addEventListener(sortSelect, 'change', (e) => {
                this.currentSort = e.target.value;
                this.applySorting();
                this.renderPlaces(this.currentPlaces);
            });
        }
    }
    
    // 정렬 적용
    applySorting() {
        switch(this.currentSort) {
            case 'quality':
                this.currentPlaces.sort((a, b) => b.quality_score - a.quality_score);
                break;
            case 'distance':
                this.currentPlaces.sort((a, b) => a.distance - b.distance);
                break;
            case 'rating':
                this.currentPlaces.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                this.currentPlaces.sort((a, b) => b.id - a.id);
                break;
        }
    }
    
    // 더보기 초기화
    initializeLoadMore() {
        const loadMoreBtn = findById('load-more');
        if (loadMoreBtn) {
            addEventListener(loadMoreBtn, 'click', () => {
                this.handleLoadMore();
            });
        }
    }
    
    // 더보기 핸들러
    handleLoadMore() {
        const loadMoreBtn = findById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fas fa-check mr-2"></i>모든 장소를 보셨습니다';
            loadMoreBtn.disabled = true;
            this.addClass(loadMoreBtn, 'opacity-50');
        }
    }
    
    // 지도 초기화
    initializeMap() {
        const mapContainer = findById('map-container');
        if (!mapContainer) return;
        
        // 지도가 이미 로드되었는지 확인
        if (typeof L === 'undefined') {
            console.log('Leaflet이 로드되지 않았습니다.');
            return;
        }
        
        // 로딩 표시 제거
        mapContainer.innerHTML = '';
        
        // 지도 생성
        this.map = L.map('map-container').setView([37.556, 127.047], 15);
        
        // 타일 레이어 추가
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // 장소 마커 추가
        this.addPlaceMarkers();
        
        // 모든 마커가 보이도록 지도 범위 조정
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }
    
    // 장소 마커 추가
    addPlaceMarkers() {
        if (!this.map) return;
        
        // 기존 마커 제거
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
        
        // 각 장소에 마커 추가
        this.currentPlaces.forEach(place => {
            const marker = L.marker([place.lat, place.lng]).addTo(this.map);
            
            // 팝업 내용 생성
            const popupContent = this.createPopupContent(place);
            marker.bindPopup(popupContent);
            this.markers.push(marker);
        });
    }
    
    // 팝업 콘텐츠 생성
    createPopupContent(place) {
        return `
            <div class="p-2">
                <h3 class="font-bold text-lg mb-2">${place.name}</h3>
                <p class="text-sm text-gray-600 mb-2">${place.description}</p>
                <div class="flex items-center gap-2 text-sm mb-2">
                    <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded">${getCategoryName(place.category)}</span>
                    <span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">★ ${place.rating}</span>
                </div>
                <button onclick="app.showPlaceDetails(${place.id})" class="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">
                    상세정보
                </button>
            </div>
        `;
    }
    
    // Vlog 초기화
    initializeVlog() {
        const vlogFeed = findById('vlog-feed');
        if (vlogFeed) {
            this.renderVlogFeed(vlogData);
        }
    }
    
    // Vlog 피드 렌더링
    renderVlogFeed(vlogs) {
        const vlogFeed = findById('vlog-feed');
        if (!vlogFeed) return;
        
        vlogFeed.innerHTML = '';
        vlogs.forEach(vlog => {
            const vlogCard = createVlogCard(vlog);
            vlogFeed.appendChild(vlogCard);
        });
    }
    
    // 장소 상세 정보 보기
    showPlaceDetails(placeId) {
        const place = placesData.find(p => p.id === placeId);
        if (place) {
            alert(`${place.name}\\n\\n${place.description}\\n\\n주소: ${place.address}\\n평점: ${place.rating}/5\\n품질 점수: ${place.quality_score}/100`);
        }
    }
    
    // 지도에서 장소 보기
    showOnMap(placeId) {
        const place = placesData.find(p => p.id === placeId);
        if (place) {
            // 지도 섹션으로 스크롤
            const mapSection = findById('map');
            if (mapSection) {
                scrollToElement(mapSection);
                
                // 지도가 있는 경우 해당 장소로 이동
                if (this.map) {
                    this.map.setView([place.lat, place.lng], 17);
                    
                    // 해당 마커 찾아 팝업 열기
                    const marker = this.markers.find(m => {
                        const latLng = m.getLatLng();
                        return latLng.lat === place.lat && latLng.lng === place.lng;
                    });
                    
                    if (marker) {
                        marker.openPopup();
                    }
                }
            }
        }
    }
    
    // Vlog 재생
    playVlog(vlogId) {
        const vlog = vlogData.find(v => v.id === vlogId);
        if (vlog) {
            alert(`${vlog.title}\\n\\n실제 구현에서는:\\n• Vlog 플레이어로 이동\\n• 전체 화면 재생\\n• 댓글 및 공유 기능\\n• 연관 Vlog 추천\\n\\n현재는 데모 버전입니다.`);
        }
    }
    
    // Vlog 좋아요
    likeVlog(vlogId) {
        const vlog = vlogData.find(v => v.id === vlogId);
        if (vlog) {
            vlog.likes += 1;
            alert('좋아요를 눌렀습니다! 💕\\n\\n실제 구현에서는:\\n• 실시간 좋아요 수 업데이트\\n• 사용자 좋아요 기록\\n• 추천 알고리즘 반영\\n• 크리에이터 알림');
        }
    }
    
    // Vlog 촬영 시작
    startVlogRecording() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            alert('Vlog 촬영 기능은 준비 중입니다.\\n\\n실제 구현에서는:\\n1. 카메라 접근 권한 요청\\n2. 녹화 시작/중지\\n3. 기본 편집 기능\\n4. SNS 공유 기능\\n\\n현재는 데모 버전으로, 장소 정보와 함께 촬영 가이드를 제공합니다.');
            this.showVlogRecordingGuide();
        } else {
            alert('죄송합니다. 현재 브라우저에서 Vlog 촬영을 지원하지 않습니다.');
        }
    }
    
    // Vlog 촬영 가이드
    showVlogRecordingGuide() {
        const guide = `
🎬 Vlog 촬영 가이드

📱 촬영 팁:
• 밝은 곳에서 촬영하세요
• 수평을 유지하세요
• 주변 소음을 줄여주세요
• 장소의 특징을 보여주세요

✂️ 편집 가이드:
• 15초 ~ 3분 길이로
• 자막 추가하기
• 배경 음악 활용
• 장소 태그 필수!

🔥 공유 팁:
• #한양대학교 #양지 태그 사용
• 장소 정확히 태깅하기
• 다른 Vlogger와 소통하기
        `;
        alert(guide);
    }
    
    // Vlog 튜토리얼
    showVlogTutorial() {
        const tutorial = `
🎥 Vlog 촬영 튜토리얼

1단계: 장소 선택
• 방문할 장소를 고르세요
• Vlog 촬영에 좋은 장소인지 확인

2단계: 촬영 준비
• 충전기 확인
• 저장 공간 확보
• 조명 확인

3단계: 촬영 시작
• 15초 쇼츠부터 시작
• 장소의 분위기 잡기
• 자연스러운 모습 촬영

4단계: 편집
• 앱으로 간단 편집
• 자막 추가
• 음악 삽입

5단계: 공유
• #한양대학교 #양지 태그
• 장소 태그
• SNS에 공유
        `;
        alert(tutorial);
    }
    
    // 에러 표시 함수
    showError(message) {
        try {
            console.error('에러 발생:', message);
            
            const placesGrid = document.getElementById('places-grid');
            if (!placesGrid) {
                console.error('showError: places-grid element not found');
                // fallback: alert으로 에러 메시지 표시
                alert(`오류가 발생했습니다: ${message}`);
                return;
            }
            
            // DOM 요소인지 확인
            if (!(placesGrid instanceof HTMLElement)) {
                console.error('showError: places-grid is not a DOM element:', placesGrid);
                alert(`오류가 발생했습니다: ${message}`);
                return;
            }
            
            // 안전하게 innerHTML 설정
            try {
                placesGrid.innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong class="font-bold">오류!</strong>
                        <span class="block sm:inline">${message}</span>
                    </div>
                `;
                console.log('✅ Error message displayed successfully');
            } catch (htmlError) {
                console.error('showError: Failed to set innerHTML:', htmlError);
                alert(`오류가 발생했습니다: ${message}`);
            }
        } catch (error) {
            console.error('showError: Unexpected error:', error);
            // 최후의 수단으로 alert 사용
            alert(`시스템 오류: ${message}`);
        }
    }
    
    // 지도 컨트롤 함수
    zoomIn() {
        if (this.map) {
            this.map.zoomIn();
        }
    }
    
    zoomOut() {
        if (this.map) {
            this.map.zoomOut();
        }
    }
    
    resetView() {
        if (this.map) {
            this.map.setView([37.556, 127.047], 15);
        }
    }
    
    // 유틸리티 메서드들 (DOM 유틸리티 래퍼)
    addClass(element, ...classNames) {
        if (element) {
            element.classList.add(...classNames);
        }
    }
    
    removeClass(element, ...classNames) {
        if (element) {
            element.classList.remove(...classNames);
        }
    }
}

// 전역 앱 인스턴스 생성
let app;

// 페이지 로딩 시 CSS 확인
function checkCSSLoading() {
    const testElement = document.createElement('div');
    testElement.className = 'hidden';
    document.body.appendChild(testElement);
    
    const isLoaded = window.getComputedStyle(testElement).display === 'none';
    document.body.removeChild(testElement);
    
    if (!isLoaded) {
        console.warn('Tailwind CSS가 제대로 로드되지 않았습니다.');
        // 대체 CSS 로드
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css';
        document.head.appendChild(link);
    }
    return isLoaded;
}

// 페이지가 완전히 로드된 후 안전하게 앱 초기화
function initializeApp() {
    console.log('🚀 앱 초기화 시작');
    
    try {
        // 1. DOM 상태 확인
        console.log('📊 DOM 상태:', document.readyState);
        
        if (document.readyState !== 'complete') {
            console.log('⏳ DOM 아직 준비되지 않음, 100ms 후 재시도');
            setTimeout(initializeApp, 100);
            return;
        }
        
        // 2. 필수 요소들 확인
        const requiredElements = ['menu-toggle', 'close-sidebar', 'sidebar', 'places-grid'];
        const missingElements = [];
        const foundElements = {};
        
        for (const elementId of requiredElements) {
            const element = document.getElementById(elementId);
            if (!element) {
                missingElements.push(elementId);
            } else {
                foundElements[elementId] = element;
                console.log(`✅ ${elementId} 요소 발견`);
            }
        }
        
        if (missingElements.length > 0) {
            console.error('❌ 필수 요소 누락:', missingElements);
            
            // 2번만 더 시도
            setTimeout(() => {
                console.log('🔄 2차 시도: 필수 요소 재확인');
                initializeApp();
            }, 200);
            return;
        }
        
        // 3. 브라우저 호환성 확인
        console.log('🔍 브라우저 호환성 확인');
        const testElement = foundElements['places-grid'];
        if (typeof testElement.addEventListener !== 'function') {
            console.error('❌ 브라우저가 addEventListener를 지원하지 않음');
            alert('이 브라우저는 일부 기능을 지원하지 않을 수 있습니다.');
        }
        
        // 4. 기본 화면 표시
        try {
            foundElements['places-grid'].innerHTML = '<div class="col-span-full text-center py-8"><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div><p class="mt-4 text-gray-600">장소를 불러오는 중...</p></div>';
            console.log('✅ 기본 화면 표시 완료');
        } catch (htmlError) {
            console.error('❌ 기본 화면 표시 실패:', htmlError);
        }
        
        // 5. 앱 인스턴스 생성 (극도로 안전하게)
        setTimeout(() => {
            try {
                console.log('🏗️ App 인스턴스 생성 시작');
                
                // global app 변수 확인
                if (typeof app !== 'undefined' && app) {
                    console.log('⚠️ app 인스턴스가 이미 존재함, 제거 후 재생성');
                    app = null;
                }
                
                app = new App();
                console.log('✅ App 인스턴스 생성 성공');
                
                // 기본 초기화 시도
                setTimeout(() => {
                    try {
                        app.initializeBasic();
                        console.log('✅ 기본 초기화 성공');
                    } catch (basicError) {
                        console.error('❌ 기본 초기화 실패:', basicError);
                    }
                }, 100);
                
            } catch (error) {
                console.error('❌ App 인스턴스 생성 실패:', error);
                
                // 최후의 수단: 기본 화면만 표시
                try {
                    if (foundElements['places-grid']) {
                        foundElements['places-grid'].innerHTML = '<div class="col-span-full text-center py-8"><div class="text-red-600 text-4xl mb-4">⚠️</div><p class="text-gray-600">일시적인 오류가 발생했습니다.</p><p class="text-sm text-gray-500 mt-2">잠시 후 새로고침해주세요.</p></div>';
                    }
                } catch (finalError) {
                    console.error('❌ 최종 대체 화면도 실패:', finalError);
                }
            }
            }
        }, 500); // 0.5초 지연으로 안정성 확보
        
    } catch (error) {
        console.error('초기화 함수 에러:', error);
    }
}

// 여러 이벤트에 의해 초기화 (안전장치)
if (document.readyState === 'complete') {
    initializeApp();
} else {
    window.addEventListener('load', initializeApp);
    document.addEventListener('DOMContentLoaded', () => {
        if (document.readyState === 'complete') {
            initializeApp();
        }
    });
}

// 전역 함수들 (호환성을 위해)
window.showPlaceDetails = (placeId) => app.showPlaceDetails(placeId);
window.showOnMap = (placeId) => app.showOnMap(placeId);
window.playVlog = (vlogId) => app.playVlog(vlogId);
window.likeVlog = (vlogId) => app.likeVlog(vlogId);
window.startVlogRecording = () => app.startVlogRecording();
window.showVlogTutorial = () => app.showVlogTutorial();
window.zoomIn = () => app.zoomIn();
window.zoomOut = () => app.zoomOut();
window.resetView = () => app.resetView();