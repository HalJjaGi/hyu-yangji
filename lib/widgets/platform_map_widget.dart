import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';

import 'web_naver_map_widget.dart';

class PlatformMapWidget extends StatelessWidget {
  final double latitude;
  final double longitude;
  final double zoom;

  const PlatformMapWidget({
    Key? key,
    required this.latitude,
    required this.longitude,
    this.zoom = 15.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) {
      // 웹용 네이버 지도
      return WebNaverMapWidget(
        latitude: latitude,
        longitude: longitude,
        zoom: zoom,
      );
    } else {
      // 모바일용 네이버 지도
      return NaverMap(
        options: NaverMapViewOptions(
          initialCameraPosition: NCameraPosition(
            target: NLatLng(latitude, longitude),
            zoom: zoom,
          ),
          indoorEnable: true,
          locationButtonEnable: true,
          compassEnable: true,
          scaleBarEnable: true,
          logoClickEnable: false,
        ),
        onMapReady: (NaverMapController controller) {
          // 모바일용 맵 컨트롤러 설정
        },
      );
    }
  }
}