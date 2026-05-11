import 'package:flutter/material.dart';
import 'package:hyu_yangji/models/place.dart';
import 'package:hyu_yangji/services/data_service.dart';

class SimpleMapScreen extends StatefulWidget {
  const SimpleMapScreen({super.key});

  @override
  State<SimpleMapScreen> createState() => _SimpleMapScreenState();
}

class _SimpleMapScreenState extends State<SimpleMapScreen> {
  final DataService _dataService = DataService();
  List<Place> _places = [];
  String _selectedCategory = 'all';

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
      _loadPlaces();
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
          
          // 지도 영역 (임시로 구현)
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF1565C0).withOpacity(0.1),
                    const Color(0xFF1565C0).withOpacity(0.05),
                  ],
                ),
              ),
              child: Stack(
                children: [
                  // 배경 맵 스타일
                  Positioned.fill(
                    child: CustomPaint(
                      painter: _MapBackgroundPainter(),
                    ),
                  ),
                  
                  // 장소 마커들
                  ..._filteredPlaces.map((place) {
                    final position = _calculatePosition(place);
                    return Positioned(
                      left: position.dx,
                      top: position.dy,
                      child: _buildPlaceMarker(place),
                    );
                  }).toList(),
                  
                  // 중앙 정보
                  Positioned(
                    top: 50,
                    left: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.95),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'HYU양지:GO',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1565C0),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '한양대학교 서울 캠퍼스',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Text(
                                '${_filteredPlaces.length}개 장소',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF1565C0),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Text(
                                '품질: ${_filteredPlaces.isNotEmpty ? (_filteredPlaces.fold(0.0, (sum, place) => sum + place.qualityScore) / _filteredPlaces.length).toStringAsFixed(0) : '0'}점',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF1565C0),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  // 현재 위치 버튼
                  Positioned(
                    bottom: 16,
                    right: 16,
                    child: FloatingActionButton(
                      onPressed: () {
                        // 현재 위치 기능 (나중에 구현)
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('현재 위치 기능은 준비 중입니다'),
                          ),
                        );
                      },
                      backgroundColor: const Color(0xFF1565C0),
                      child: const Icon(Icons.my_location),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // 장소 목록
          Container(
            height: 200,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${_selectedCategory == 'all' ? '모든' : _getCategoryName(_selectedCategory)} 장소',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1565C0),
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _filteredPlaces.length,
                    itemBuilder: (context, index) {
                      final place = _filteredPlaces[index];
                      return Container(
                        width: 150,
                        margin: const EdgeInsets.only(right: 12),
                        child: Card(
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  place.name,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
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
                                    Text(
                                      '${place.qualityScore}점',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF1565C0),
                                      ),
                                    ),
                                    const Spacer(),
                                    Text(
                                      '${place.distance}km',
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
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

  Widget _buildPlaceMarker(Place place) {
    return GestureDetector(
      onTap: () {
        _showPlaceDetails(place);
      },
      child: Container(
        padding: const EdgeInsets.all(8),
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
        child: Text(
          '${place.qualityScore}',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 10,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  void _showPlaceDetails(Place place) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    place.name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1565C0),
                    ),
                  ),
                  const Spacer(),
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
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: Color(0xFF1565C0)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      place.address,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
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
              Text(
                place.description,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[700],
                ),
              ),
              const SizedBox(height: 16),
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
        ),
      ),
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

  Offset _calculatePosition(Place place) {
    // 간단한 위치 계산 (실제로는 지도 좌표계 변환 필요)
    final baseX = 100.0;
    final baseY = 100.0;
    final spread = 200.0;
    
    final x = baseX + (place.longitude - 127.0466) * spread;
    final y = baseY + (37.5560 - place.latitude) * spread;
    
    return Offset(x, y);
  }
}

class _MapBackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF1565C0).withOpacity(0.1)
      ..style = PaintingStyle.fill;
    
    // 간단한 배경 그리기 (실제 지도 데이터로 대체 필요)
    for (int i = 0; i < 20; i++) {
      for (int j = 0; j < 20; j++) {
        final rect = Rect.fromLTWH(
          i * size.width / 20,
          j * size.height / 20,
          size.width / 20,
          size.height / 20,
        );
        
        if ((i + j) % 2 == 0) {
          canvas.drawRect(rect, paint);
        }
      }
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}