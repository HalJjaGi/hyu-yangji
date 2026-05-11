import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';

// 웹용 지도 스크린
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as latlong;

// 모바일용 지도 스크린 (웹 빌드 시 문제 방지를 위해 조건부 import)
// import 'package:flutter_naver_map/flutter_naver_map.dart';

class UniversalMapScreen extends StatefulWidget {
  const UniversalMapScreen({super.key});

  @override
  State<UniversalMapScreen> createState() => _UniversalMapScreenState();
}

class _UniversalMapScreenState extends State<UniversalMapScreen> {
  // 한양대학교 서울 캠퍼스 중심 좌표
  static const latlong.LatLng _hanyangCenter = latlong.LatLng(37.5560, 127.0466);

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
          // 플랫폼 안내
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.blue.shade50,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.map,
                      color: Color(0xFF1565C0),
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      kIsWeb ? '웹용 지도 (OpenStreetMap)' : '모바일용 지도 (네이버 지도)',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1565C0),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  kIsWeb
                      ? '웹에서는 OpenStreetMap 기반의 간단한 지도를 표시합니다.'
                      : '모바일에서는 네이버 지도 API를 사용한 정식 지도를 표시합니다.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[700],
                  ),
                ),
              ],
            ),
          ),
          
          // 플랫폼별 지도
          Expanded(
            child: kIsWeb
                ? _buildWebMap()
                : _BuildMobileMap(),
          ),
          
          // 기능 설명
          Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  kIsWeb ? '웹 지도 기능' : '모바일 지도 기능',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1565C0),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  kIsWeb
                      ? '• OpenStreetMap 타일 사용\n'
                          '• 기본적인 줌/팬 기능\n'
                          '• 한양대 캠퍼스 중심 표시\n'
                          '• 마커 위치 표시'
                      : '• 공식 네이버 지도 타일 사용\n'
                          '• 완벽한 줌/팬/회전 기능\n'
                          '• 마커 및 오버레이\n'
                          '• 실시간 위치 추적 가능\n'
                          '• 지도 타입 변경\n'
                          '• 경로 탐색 지원',
                  style: TextStyle(
                    fontSize: 14,
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

  // 웹용 지도 (flutter_map + OpenStreetMap)
  Widget _buildWebMap() {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12),
      ),
      child: FlutterMap(
        options: MapOptions(
          initialCenter: _hanyangCenter,
          initialZoom: 16.0,
          minZoom: 10.0,
          maxZoom: 18.0,
        ),
        children: [
          // OpenStreetMap 타일 레이어
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.hyu.yangji',
            maxZoom: 18,
          ),
          
          // 한양대 마커
          MarkerLayer(
            markers: [
              Marker(
                width: 32.0,
                height: 32.0,
                point: _hanyangCenter,
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF1565C0),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.3),
                        blurRadius: 4,
                        offset: const Offset(2, 2),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      'H',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 모바일용 지도 (플레이스홀더 - 나중에 실제 네이버 지도 구현)
  Widget _BuildMobileMap() {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.map,
            size: 64,
            color: Color(0xFF1565C0),
          ),
          SizedBox(height: 16),
          Text(
            '네이버 지도 준비 중',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1565C0),
            ),
          ),
          SizedBox(height: 8),
          Text(
            '모바일 앱에서 완벽한\n네이버 지도를 사용할 수 있습니다',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}