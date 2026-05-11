import 'package:flutter/material.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';

class NaverRealMapScreen extends StatefulWidget {
  const NaverRealMapScreen({super.key});

  @override
  State<NaverRealMapScreen> createState() => _NaverRealMapScreenState();
}

class _NaverRealMapScreenState extends State<NaverRealMapScreen> {
  // 한양대학교 서울 캠퍼스 중심 좌표
  final LatLng _hanyangCenter = const LatLng(37.5560, 127.0466);
  
  // 네이버 클라이언트 ID (문자열로 처리)
  static const String _naverClientId = 'pctubllds4';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          '네이버 지도',
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
            color: Colors.white,
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
                      '네이버 지도 - 한양대 캠퍼스',
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
                  '실제 네이버 지도 API를 사용한 캠퍼스 맵',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
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
                  '지도 기능',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1565C0),
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  '• 실제 네이버 지도 표시\n'
                  '• 한양대 중심 좌표\n'
                  '• 줌/팬 기능 지원\n'
                  '• 마커 추가 가능',
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
          debugPrint('🗺️ 네이버 지도 생성 완료');
        },
        onMapTap: (LatLng position) {
          debugPrint('📍 지도 탭: ${position.latitude}, ${position.longitude}');
        },
      );
    } catch (e) {
      debugPrint('❌ 네이버 지도 에러: $e');
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
            '네이버 지도 API 키를 확인해주세요',
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