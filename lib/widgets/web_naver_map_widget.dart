import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';

class WebNaverMapWidget extends StatefulWidget {
  final double latitude;
  final double longitude;
  final double zoom;

  const WebNaverMapWidget({
    Key? key,
    required this.latitude,
    required this.longitude,
    this.zoom = 15.0,
  }) : super(key: key);

  @override
  State<WebNaverMapWidget> createState() => _WebNaverMapWidgetState();
}

class _WebNaverMapWidgetState extends State<WebNaverMapWidget> {
  NaverMapController? _mapController;

  @override
  Widget build(BuildContext context) {
    if (!kIsWeb) {
      return const Center(
        child: Text('웹 환경에서만 사용 가능합니다.'),
      );
    }

    return NaverMap(
      options: NaverMapViewOptions(
        initialCameraPosition: NCameraPosition(
          target: NLatLng(widget.latitude, widget.longitude),
          zoom: widget.zoom,
        ),
        indoorEnable: true,
        locationButtonEnable: true,
        compassEnable: true,
        scaleBarEnable: true,
        logoClickEnable: false,
        buildingHeight: 0.5,
        nightModeEnable: false,
      ),
      onMapReady: (NaverMapController controller) {
        setState(() {
          _mapController = controller;
        });
        _addTestMarkers();
      },
    );
  }

  void _addTestMarkers() {
    if (_mapController == null) return;

    // 한양대학교 정문
    final marker1 = NMarker(
      id: 'main_gate',
      position: NLatLng(37.5568, 127.0448),
    );
    _mapController!.addOverlay(marker1);

    // 한양대학교 후문
    final marker2 = NMarker(
      id: 'back_gate',
      position: NLatLng(37.5598, 127.0458),
    );
    _mapController!.addOverlay(marker2);

    // 한양대학교 쪽문
    final marker3 = NMarker(
      id: 'side_gate',
      position: NLatLng(37.5548, 127.0428),
    );
    _mapController!.addOverlay(marker3);
  }

  // 카메라 이동 메서드
  Future<void> moveCamera(double latitude, double longitude, double zoom) async {
    if (_mapController != null) {
      final update = NCameraUpdate.scrollAndZoomTo(
        target: NLatLng(latitude, longitude),
        zoom: zoom,
      );
      await _mapController!.updateCamera(update);
    }
  }
}