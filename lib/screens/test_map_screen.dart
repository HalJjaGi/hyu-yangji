import 'package:flutter/material.dart';
import 'package:hyu_yangji/models/place.dart';
import 'package:hyu_yangji/services/data_service.dart';

class TestMapScreen extends StatefulWidget {
  const TestMapScreen({super.key});

  @override
  State<TestMapScreen> createState() => _TestMapScreenState();
}

class _TestMapScreenState extends State<TestMapScreen> {
  final DataService _dataService = DataService();
  List<Place> _places = [];

  @override
  void initState() {
    super.initState();
    _loadPlaces();
  }

  void _loadPlaces() {
    setState(() {
      _places = _dataService.getPlaces();
    });
    debugPrint('📍 로드된 장소 수: ${_places.length}');
    for (var place in _places) {
      debugPrint('📍 ${place.name} (${place.latitude}, ${place.longitude})');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          '테스트 지도',
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
          // 디버그 정보
          Container(
            color: Colors.black87,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '🔍 디버그 정보',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '장소 수: ${_places.length}',
                  style: const TextStyle(color: Colors.greenAccent, fontSize: 14),
                ),
                if (_places.isNotEmpty)
                  Text(
                    '첫 번째 장소: ${_places.first.name}',
                    style: const TextStyle(color: Colors.greenAccent, fontSize: 14),
                  ),
                Text(
                  '화면 크기: ${MediaQuery.of(context).size.width}x${MediaQuery.of(context).size.height}',
                  style: const TextStyle(color: Colors.orangeAccent, fontSize: 14),
                ),
              ],
            ),
          ),
          
          // 지도 영역 - 가장 간단한 버전
          Expanded(
            child: Container(
              color: Colors.blue.withOpacity(0.1), // 배경색으로 확인
              child: Stack(
                children: [
                  // 1. 배경 그리드 (단순한 버전)
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: Colors.red, width: 2),
                      ),
                      child: const Center(
                        child: Text(
                          '지도 영역\n(여기에 내용이 표시되어야 함)',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1565C0),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ),
                  
                  // 2. 한양대 중심 마커 (가장 간단하게)
                  Positioned(
                    left: MediaQuery.of(context).size.width / 2 - 25,
                    top: MediaQuery.of(context).size.height / 2 - 25,
                    child: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 3),
                      ),
                      child: const Icon(Icons.school, color: Colors.white, size: 30),
                    ),
                  ),
                  
                  // 3. 장소 마커 (하나만 테스트)
                  if (_places.isNotEmpty)
                    Positioned(
                      left: MediaQuery.of(context).size.width / 2 + 50,
                      top: MediaQuery.of(context).size.height / 2 + 50,
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: Colors.blue,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        child: Center(
                          child: Text(
                            '${_places.first.qualityScore}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          
          // 하단 정보
          Container(
            height: 100,
            padding: const EdgeInsets.all(16),
            color: Colors.grey[200],
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '테스트 정보',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1565C0),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '지도 영역에 빨간 테두리와 배경색이 보여야 정상',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[700],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}