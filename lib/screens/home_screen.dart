import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:hyu_yangji/models/place.dart';
import 'package:hyu_yangji/services/data_service.dart';
import 'package:hyu_yangji/widgets/place_card.dart';
import 'package:hyu_yangji/widgets/category_filter.dart';
import 'package:hyu_yangji/widgets/sort_options.dart';
import 'package:hyu_yangji/screens/static_image_map_screen.dart';
import 'package:hyu_yangji/pages/map_test_page.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final DataService _dataService = DataService();
  List<Place> _places = [];
  String _selectedCategory = 'all';
  String _selectedSort = 'quality';

  @override
  void initState() {
    super.initState();
    _loadPlaces();
  }

  void _loadPlaces() {
    setState(() {
      _places = _dataService.getPlacesByCategory(_selectedCategory);
      _applySorting();
    });
  }

  void _applySorting() {
    setState(() {
      if (_selectedSort == 'quality') {
        _places = _dataService.getPlacesSortedByQuality();
      } else if (_selectedSort == 'distance') {
        _places = _dataService.getPlacesSortedByDistance();
      }
      
      // 현재 선택된 카테고리에 맞게 필터링
      if (_selectedCategory != 'all') {
        _places = _places.where((place) => place.category.toLowerCase() == _selectedCategory.toLowerCase()).toList();
      }
    });
  }

  void _onCategoryChanged(String category) {
    setState(() {
      _selectedCategory = category;
      _loadPlaces();
    });
  }

  void _onSortChanged(String sort) {
    setState(() {
      _selectedSort = sort;
      _applySorting();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'HYU양지:GO',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFF1565C0),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: Colors.white),
            onPressed: () {
              // 검색 기능 (나중에 구현)
            },
          ),
          IconButton(
            icon: const Icon(Icons.map, color: Colors.white),
            onPressed: () {
              // 지도 화면으로 이동 (나중에 구현)
            },
          ),
        ],
      ),
      drawer: _buildDrawer(),
      body: Column(
        children: [
          // 카테고리 필터
          CategoryFilter(
            selectedCategory: _selectedCategory,
            onCategoryChanged: _onCategoryChanged,
          ),
          
          // 정렬 옵션
          SortOptions(
            selectedSort: _selectedSort,
            onSortChanged: _onSortChanged,
          ),
          
          // 장소 목록
          Expanded(
            child: _places.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.location_off,
                          size: 64,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 16),
                        Text(
                          '해당 카테고리의 장소가 없습니다',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  )
                : Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.75,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: _places.length,
                      itemBuilder: (context, index) {
                        return PlaceCard(place: _places[index]);
                      },
                    ),
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // 현재 위치에서 가장 가까운 장소 찾기 (나중에 구현)
        },
        backgroundColor: const Color(0xFF1565C0),
        child: const Icon(Icons.my_location),
      ),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(
              color: Color(0xFF1565C0),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.school,
                  size: 48,
                  color: Colors.white,
                ),
                const SizedBox(height: 16),
                const Text(
                  'HYU양지:GO',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '한양대학교 서울 캠퍼스',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.home),
            title: const Text('홈'),
            onTap: () {
              Navigator.pop(context);
            },
          ),
          ListTile(
            leading: const Icon(Icons.map),
            title: const Text('캠퍼스 지도'),
            onTap: () {
              debugPrint('📍 캠퍼스 지도 메뉴 클릭됨!');
              Navigator.pop(context);
              debugPrint('📍 이전 화면 닫기 완료');
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const StaticImageMapScreen()),
              );
              debugPrint('📍 화면 전환 시도 완료');
            },
          ),
          ListTile(
            leading: const Icon(Icons.location_on),
            title: const Text('지도 테스트'),
            onTap: () {
              debugPrint('📍 지도 테스트 메뉴 클릭됨!');
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const MapTestPage()),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.video_library),
            title: const Text('Vlog'),
            onTap: () {
              Navigator.pop(context);
              // Vlog 화면으로 이동
            },
          ),
          ListTile(
            leading: const Icon(Icons.star),
            title: const Text('즐겨찾기'),
            onTap: () {
              Navigator.pop(context);
              // 즐겨찾기 화면으로 이동
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('설정'),
            onTap: () {
              Navigator.pop(context);
              // 설정 화면으로 이동
            },
          ),
        ],
      ),
    );
  }
}