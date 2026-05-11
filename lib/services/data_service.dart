import 'package:hyu_yangji/models/place.dart';
import 'package:hyu_yangji/models/vlog.dart';
import 'package:flutter/foundation.dart';

class DataService {
  static final DataService _instance = DataService._internal();
  
  factory DataService() {
    return _instance;
  }
  
  DataService._internal();

  // 샘플 장소 데이터
  List<Place> getPlaces() {
    return [
      Place(
        id: 1,
        name: '스타벅스 한양대점',
        category: 'cafe',
        rating: 4.5,
        qualityScore: 92,
        address: '서울특별시 성동구 한양대학교길 25',
        description: '한양대학교 내에 위치한 대표적인 카페. 넓은 공간과 쾌적한 환경으로 공부하기 좋습니다.',
        imageUrl: 'https://picsum.photos/seed/hyu-cafe1/400/300.jpg',
        latitude: 37.5559,
        longitude: 127.0465,
        distance: 0.1,
        tags: ['와이파이', '공부하기좋음', '24시간'],
      ),
      Place(
        id: 2,
        name: '한양대 학생회관 식당',
        category: 'restaurant',
        rating: 4.2,
        qualityScore: 88,
        address: '서울특별시 성동구 한양대학교길 1',
        description: '학생들을 위한 저렴하고 맛있는 식당. 다양한 메뉴와 합리적인 가격이 특징입니다.',
        imageUrl: 'https://picsum.photos/seed/hyu-restaurant1/400/300.jpg',
        latitude: 37.5560,
        longitude: 127.0466,
        distance: 0.1,
        tags: ['학식', '저렴함', '다양한메뉴'],
      ),
      Place(
        id: 3,
        name: '이디야 한양대점',
        category: 'cafe',
        rating: 4.3,
        qualityScore: 85,
        address: '서울특별시 성동구 왕십리로 222',
        description: '한양대 근처에 위치한 이디야 커피. 합리적인 가격과 퀄리티 좋은 커피를 제공합니다.',
        imageUrl: 'https://picsum.photos/seed/hyu-cafe2/400/300.jpg',
        latitude: 37.5555,
        longitude: 127.0470,
        distance: 0.2,
        tags: ['가성비', '아메리카노', '디저트'],
      ),
      Place(
        id: 4,
        name: '제1도서관',
        category: 'study',
        rating: 4.8,
        qualityScore: 95,
        address: '서울특별시 성동구 한양대학교길 20',
        description: '한양대학교 메인 도서관. 조용한 환경과 다양한 열람 공간을 갖추고 있습니다.',
        imageUrl: 'https://picsum.photos/seed/hyu-library1/400/300.jpg',
        latitude: 37.5562,
        longitude: 127.0463,
        distance: 0.1,
        tags: ['24시간', '조용함', '인터넷'],
      ),
      Place(
        id: 5,
        name: 'CU 한양대점',
        category: 'convenience',
        rating: 4.0,
        qualityScore: 80,
        address: '서울특별시 성동구 한양대학교길 15',
        description: '학생회관 근처에 위치한 편의점. 24시간 운영으로 편리합니다.',
        imageUrl: 'https://picsum.photos/seed/hyu-cu1/400/300.jpg',
        latitude: 37.5558,
        longitude: 127.0464,
        distance: 0.1,
        tags: ['24시간', '편의점', '도시락'],
      ),
      Place(
        id: 6,
        name: '공대 카페',
        category: 'cafe',
        rating: 4.1,
        qualityScore: 82,
        address: '서울특별시 성동구 한양대학교길 55',
        description: '공학관 내부에 위치한 작은 카페. 공대 학생들을 위한 공간입니다.',
        imageUrl: 'https://picsum.photos/seed/hyu-cafe3/400/300.jpg',
        latitude: 37.5565,
        longitude: 127.0458,
        distance: 0.3,
        tags: ['공대전용', '조용함', '커피'],
      ),
    ];
  }

  // 샘플 Vlog 데이터
  List<Vlog> getVlogs() {
    if (kDebugMode) {
      print('🔍 getVlogs() called - using local data only');
    }
    return [
      Vlog(
        id: 1,
        title: '한양대학교 카페 탐방',
        creator: '지원',
        duration: '3:45',
        views: 15420,
        likes: 892,
        thumbnailUrl: 'https://picsum.photos/seed/hyu-vlog1/400/300.jpg',
        tags: ['한양대', '카페', '탐방'],
      ),
      Vlog(
        id: 2,
        title: '한양대 맛집 3곳 추천',
        creator: '준영',
        duration: '5:12',
        views: 23150,
        likes: 1456,
        thumbnailUrl: 'https://picsum.photos/seed/hyu-vlog2/400/300.jpg',
        tags: ['맛집', '한양대', '추천'],
      ),
      Vlog(
        id: 3,
        title: '한양대 공부 장소 BEST 5',
        creator: '민진',
        duration: '4:30',
        views: 18990,
        likes: 1103,
        thumbnailUrl: 'https://picsum.photos/seed/hyu-vlog3/400/300.jpg',
        tags: ['공부', '도서관', '카페'],
      ),
      Vlog(
        id: 4,
        title: '한양대학교 하루 일상',
        creator: '지원',
        duration: '7:15',
        views: 31280,
        likes: 2104,
        thumbnailUrl: 'https://picsum.photos/seed/hyu-vlog4/400/300.jpg',
        tags: ['일상', '한양대', '캠퍼스'],
      ),
    ];
  }

  // 카테고리별 장소 필터링
  List<Place> getPlacesByCategory(String category) {
    final places = getPlaces();
    if (category == 'all') {
      return places;
    }
    return places.where((place) => place.category.toLowerCase() == category.toLowerCase()).toList();
  }

  // 품질순으로 정렬
  List<Place> getPlacesSortedByQuality() {
    final places = getPlaces();
    places.sort((a, b) => b.qualityScore.compareTo(a.qualityScore));
    return places;
  }

  // 거리순으로 정렬
  List<Place> getPlacesSortedByDistance() {
    final places = getPlaces();
    places.sort((a, b) => a.distance.compareTo(b.distance));
    return places;
  }
}