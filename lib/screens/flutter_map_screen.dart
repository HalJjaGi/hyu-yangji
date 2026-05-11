import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:hyu_yangji/models/place.dart';
import 'package:hyu_yangji/services/data_service.dart';

class FlutterMapScreen extends StatefulWidget {
  const FlutterMapScreen({super.key});

  @override
  State<FlutterMapScreen> createState() => _FlutterMapScreenState();
}

class _FlutterMapScreenState extends State<FlutterMapScreen> {
  final DataService _dataService = DataService();
  List<Place> _places = [];
  String _selectedCategory = 'all';
  
  final MapController _mapController = MapController();
  
  // 한양대학교 중심 좌표
  final LatLng _hanyangCenter = const LatLng(37.5560, 127.0466);

  @override
  void initState() {
    super.initState();
    _loadPlaces();
  }

  void _loadPlaces() {
    setState(() {
      _places = _dataService.getPlaces();
    });
  }

  void _filterByCategory(String category) {
    setState(() {
      _selectedCategory = category;
    });
  }

  List<Place> get _filteredPlaces {
    if (_selectedCategory == 'all') {
      return _places;
    }
    return _places.where((place) => place.category.toLowerCase() == _selectedCategory.toLowerCase()).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          '캠퍼스 지도',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFF1565C0),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location, color: Colors.white),
            onPressed: () {
              _mapController.move(_hanyangCenter, 16.0);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // 카테고리 필터
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildCategoryChip('all', '전체'),
                  const SizedBox(width: 8),
                  _buildCategoryChip('cafe', '카페'),
                  const SizedBox(width: 8),
                  _buildCategoryChip('restaurant', '식당'),
                  const SizedBox(width: 8),
                  _buildCategoryChip('study', '공부'),
                  const SizedBox(width: 8),
                  _buildCategoryChip('convenience', '편의'),
                ],
              ),
            ),
          ),
          
          // 지도 영역
          Expanded(
            child: FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _hanyangCenter,
                initialZoom: 16.0,
                minZoom: 14.0,
                maxZoom: 19.0,
                onTap: (tapPosition, point) {
                  // 지도 탭 이벤트
                },
              ),
              children: [
                // OpenStreetMap 타일 레이어
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.example.hyu_yangji',
                  maxZoom: 19,
                ),
                
                // 마커 레이어
                MarkerLayer(
                  markers: _filteredPlaces.map((place) {
                    return Marker(
                      width: 40.0,
                      height: 40.0,
                      point: LatLng(place.latitude, place.longitude),
                      child: GestureDetector(
                        onTap: () {
                          _showPlaceDetails(place);
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: Color(int.parse(place.categoryColor.replaceAll('#', '0xFF'))),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.3),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Center(
                            child: Text(
                              '${place.qualityScore}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                
                // 현재 위치 마커 (한양대 중심)
                MarkerLayer(
                  markers: [
                    Marker(
                      width: 50.0,
                      height: 50.0,
                      point: _hanyangCenter,
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.8),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.5),
                              blurRadius: 6,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.school,
                          color: Colors.white,
                          size: 30,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // 장소 목록
          Container(
            height: 180,
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey, width: 1)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      '${_selectedCategory == 'all' ? '모든' : _getCategoryName(_selectedCategory)} 장소',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1565C0),
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '${_filteredPlaces.length}개',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _filteredPlaces.length,
                    itemBuilder: (context, index) {
                      final place = _filteredPlaces[index];
                      return Container(
                        width: 140,
                        margin: const EdgeInsets.only(right: 12),
                        child: Card(
                          elevation: 3,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        place.name,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Color(int.parse(place.categoryColor.replaceAll('#', '0xFF'))),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    place.category,
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(
                                      Icons.star,
                                      size: 12,
                                      color: Colors.yellow[700],
                                    ),
                                    const SizedBox(width: 2),
                                    Text(
                                      '${place.qualityScore}점',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF1565C0),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(
                                      Icons.location_on,
                                      size: 12,
                                      color: Colors.grey[600],
                                    ),
                                    const SizedBox(width: 2),
                                    Expanded(
                                      child: Text(
                                        '${place.distance}km',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const Spacer(),
                                GestureDetector(
                                  onTap: () {
                                    // 지도에서 해당 장소로 이동
                                    _mapController.move(
                                      LatLng(place.latitude, place.longitude),
                                      17.0,
                                    );
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF1565C0).withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                        color: const Color(0xFF1565C0),
                                        width: 1,
                                      ),
                                    ),
                                    child: const Text(
                                      '지도에서 보기',
                                      style: TextStyle(
                                        fontSize: 9,
                                        color: Color(0xFF1565C0),
                                        fontWeight: FontWeight.bold,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String category, String label) {
    final isSelected = _selectedCategory == category;
    
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          _filterByCategory(category);
        }
      },
      selectedColor: const Color(0xFF1565C0),
      checkmarkColor: Colors.white,
    );
  }

  void _showPlaceDetails(Place place) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: Colors.white,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      place.name,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1565C0),
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Color(int.parse(place.categoryColor.replaceAll('#', '0xFF'))),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      place.category,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // 주소
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: Color(0xFF1565C0)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      place.address,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              
              // 품질 점수
              Row(
                children: [
                  const Icon(Icons.star, size: 16, color: Color(0xFF1565C0)),
                  const SizedBox(width: 8),
                  Text(
                    '품질 점수: ${place.qualityScore}점',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1565C0),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              
              // 거리
              Row(
                children: [
                  const Icon(Icons.directions_walk, size: 16, color: Color(0xFF1565C0)),
                  const SizedBox(width: 8),
                  Text(
                    '거리: ${place.distance}km',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[700],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              
              // 설명
              Text(
                place.description,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[800],
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 16),
              
              // 태그
              if (place.tags.isNotEmpty)
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  children: place.tags.map((tag) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '#$tag',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[700],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              
              const SizedBox(height: 24),
              
              // 액션 버튼
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF1565C0)),
                      ),
                      child: const Text('닫기'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  String _getCategoryName(String category) {
    switch (category) {
      case 'cafe':
        return '카페';
      case 'restaurant':
        return '식당';
      case 'study':
        return '공부';
      case 'convenience':
        return '편의';
      default:
        return '기타';
    }
  }
}