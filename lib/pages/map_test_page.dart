import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

import '../widgets/platform_map_widget.dart';

class MapTestPage extends StatefulWidget {
  const MapTestPage({Key? key}) : super(key: key);

  @override
  State<MapTestPage> createState() => _MapTestPageState();
}

class _MapTestPageState extends State<MapTestPage> {
  // 한양대학교 서울 캠퍼스 중심 좌표
  final double _defaultLat = 37.5568;
  final double _defaultLng = 127.0448;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('지도 테스트'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // 플랫폼 정보 표시
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.grey[100],
            child: Text(
              '현재 플랫폼: ${kIsWeb ? "웹" : Theme.of(context).platform.name}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          
          // 지도 표시
          Expanded(
            child: PlatformMapWidget(
              latitude: _defaultLat,
              longitude: _defaultLng,
              zoom: 16.0,
            ),
          ),
          
          // 컨트롤 버튼들
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('지도 로드 완료!')),
                    );
                  },
                  child: const Text('상태 확인'),
                ),
                ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('지도 확대 기능은 모바일에서만 지원됩니다')),
                    );
                  },
                  child: const Text('확대'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}