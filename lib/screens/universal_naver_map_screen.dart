import 'package:flutter/material.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';

class UniversalNaverMapScreen extends StatefulWidget {
  const UniversalNaverMapScreen({super.key});

  @override
  State<UniversalNaverMapScreen> createState() => _UniversalNaverMapScreenState();
}

class _UniversalNaverMapScreenState extends State<UniversalNaverMapScreen> {
  // 한양대학교 서울 캠퍼스 중심 좌표
  final LatLng _hanyangCenter = const LatLng(37.5560, 127.0466);
  
  // 네이버 클라이언트 ID
  static const String _naverClientId = 'pctubllds4';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Universal Naver Map',
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
          // 정보 패널
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
                      'Universal Naver Map',
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
                  'flutter_naver_map + flutter_naver_map_web\n'
                  'Web, Android, iOS 모두에서 동작하는 네이버 지도',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '클라이언트 ID: $_naverClientId',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
          
          // 네이버 지도 영역
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(12),
              ),
              child: _buildNaverMap(),
            ),
          ),
          
          // 하단 정보
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.grey[100],
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Universal Features',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1565C0),
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  '• Web, Android, iOS 모두 지원\n'
                  '• 동일한 코드 베이스\n'
                  '• 실제 네이버 지도 표시\n'
                  '• 마커 및 오버레이 가능\n'
                  '• 줌/팬/회전 기능\n'
                  '• 위치 기반 서비스',
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

  Widget _buildNaverMap() {
    try {
      return NaverMap(
        options: const NaverMapViewOptions(
          initialCameraPosition: CameraPosition(
            target: LatLng(37.5560, 127.0466), // 한양대 서울 캠퍼스
            zoom: 16.0,
          ),
          mapType: NaverMapType.basic,
          indoorEnable: false,
          lightingEnable: false,
          locationButtonEnable: false,
          scrollGesturesEnable: true,
          zoomGesturesEnable: true,
          tiltGesturesEnable: false,
          rotationGesturesEnable: false,
        ),
        onMapCreated: (NaverMapController controller) {
          // 지도 생성 완료
          debugPrint('🗺️ Universal 네이버 지도 생성 완료');
        },
        onMapTap: (LatLng position) {
          debugPrint('📍 지도 탭: ${position.latitude}, ${position.longitude}');
        },
      );
    } catch (e) {
      debugPrint('❌ Universal 네이버 지도 에러: $e');
      return _buildErrorWidget();
    }
  }

  Widget _buildErrorWidget() {
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: Colors.red[50],
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            color: Colors.red,
            size: 48,
          ),
          SizedBox(height: 16),
          Text(
            '지도 로딩 실패',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.red,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'flutter_naver_map_web 설치 확인 필요',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}