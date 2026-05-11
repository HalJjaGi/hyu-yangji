import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:hyu_yangji/models/place.dart';
import 'package:hyu_yangji/services/data_service.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  late final WebViewController _controller;
  final DataService _dataService = DataService();
  List<Place> _places = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPlaces();
    _initWebView();
  }

  void _loadPlaces() {
    setState(() {
      _places = _dataService.getPlaces();
    });
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Update loading bar.
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('WebView Error: ${error.description}');
          },
        ),
      )
      ..loadHtmlString(_getNaverMapHtml());
  }

  String _getNaverMapHtml() {
    // 한양대학교 중심 좌표
    final hanyangCenter = [37.5560, 127.0466];
    
    // 장소 마커 데이터 생성
    final markers = _places.map((place) {
      return '''
        {
          position: new naver.maps.LatLng(${place.latitude}, ${place.longitude}),
          map: map,
          title: '${place.name}',
          icon: {
            content: '<div style="background: ${place.categoryColor}; color: white; padding: 8px; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${place.qualityScore}</div>',
            size: new naver.maps.Size(40, 40),
            anchor: new naver.maps.Point(20, 20)
          }
        }
      ''';
    }).join(',');

    return '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>한양대학교 지도</title>
    <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=hyu_yangji_test"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
        }
        
        #map {
            width: 100%;
            height: 100%;
        }
        
        .map-info {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            max-width: 300px;
        }
        
        .map-title {
            font-size: 18px;
            font-weight: bold;
            color: #1565C0;
            margin-bottom: 8px;
        }
        
        .map-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 12px;
        }
        
        .stats {
            display: flex;
            gap: 15px;
            margin-top: 12px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-value {
            font-size: 16px;
            font-weight: bold;
            color: #1565C0;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 2px;
        }
        
        .category-filters {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.95);
            padding: 12px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            display: flex;
            gap: 8px;
        }
        
        .filter-chip {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid #e0e0e0;
            background: white;
            color: #666;
        }
        
        .filter-chip.active {
            background: #1565C0;
            color: white;
            border-color: #1565C0;
        }
        
        .filter-chip:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .current-location {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #1565C0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
            z-index: 1000;
            transition: all 0.3s ease;
        }
        
        .current-location:hover {
            transform: scale(1.1);
            background: #0d47a1;
        }
        
        .marker-popup {
            padding: 15px;
            max-width: 280px;
        }
        
        .marker-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
        }
        
        .marker-category {
            display: inline-block;
            padding: 3px 10px;
            background: #1565C0;
            color: white;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            margin-bottom: 8px;
        }
        
        .marker-address {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
        }
        
        .marker-quality {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
            color: #666;
        }
        
        .quality-score {
            background: #1565C0;
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 11px;
        }
        
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 2000;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #1565C0;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <div class="map-info">
        <div class="map-title">HYU양지:GO</div>
        <div class="map-subtitle">한양대학교 서울 캠퍼스</div>
        <div class="stats">
            <div class="stat-item">
                <div class="stat-value">${_places.length}</div>
                <div class="stat-label">장소</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${_places.isNotEmpty ? (_places.fold(0.0, (sum, place) => sum + place.qualityScore) / _places.length).toStringAsFixed(0) : '0'}</div>
                <div class="stat-label">평균 품질</div>
            </div>
        </div>
    </div>
    
    <div class="category-filters">
        <span class="filter-chip active" data-category="all">전체</span>
        <span class="filter-chip" data-category="cafe">카페</span>
        <span class="filter-chip" data-category="restaurant">식당</span>
        <span class="filter-chip" data-category="study">공부</span>
        <span class="filter-chip" data-category="convenience">편의</span>
    </div>
    
    <div class="current-location" onclick="getCurrentLocation()">
        📍
    </div>
    
    <div id="loading" class="loading" style="display: none;">
        <div class="loading-spinner"></div>
        <div>지도 로딩 중...</div>
    </div>

    <script>
        let map;
        let markers = [];
        let infoWindows = [];
        
        function initMap() {
            // 한양대학교 중심 좌표
            const hanyangCenter = new naver.maps.LatLng(${hanyangCenter[0]}, ${hanyangCenter[1]});
            
            map = new naver.maps.Map('map', {
                center: hanyangCenter,
                zoom: 16,
                mapTypeId: naver.maps.MapTypeId.NORMAL,
                scaleControl: false,
                mapDataControl: false,
                logoControl: false
            });
            
            // 장소 마커 추가
            addMarkers();
            
            // 카테고리 필터 이벤트
            setupCategoryFilters();
            
            // 현재 위치 버튼 이벤트
            setupLocationButton();
        }
        
        function addMarkers() {
            const places = ${_toJsonString(_places)};
            
            places.forEach(place => {
                const position = new naver.maps.LatLng(place.latitude, place.longitude);
                
                // 마커 생성
                const marker = new naver.maps.Marker({
                    position: position,
                    map: map,
                    title: place.name,
                    icon: {
                        content: '<div style="background: ' + place.categoryColor + '; color: white; padding: 8px; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">' + place.qualityScore + '</div>',
                        size: new naver.maps.Size(40, 40),
                        anchor: new naver.maps.Point(20, 20)
                    }
                });
                
                // 인포윈도우 내용
                const infoWindowContent = `
                    <div class="marker-popup">
                        <div class="marker-title">${place.name}</div>
                        <div class="marker-category">${place.categoryIcon} ${place.category}</div>
                        <div class="marker-address">📍 ${place.address}</div>
                        <div class="marker-quality">
                            <span>품질점수:</span>
                            <span class="quality-score">${place.qualityScore}점</span>
                        </div>
                    </div>
                `;
                
                const infoWindow = new naver.maps.InfoWindow({
                    content: infoWindowContent,
                    backgroundColor: 'white',
                    borderColor: '#1565C0',
                    borderWidth: 1,
                    pixelOffset: new naver.maps.Point(0, -10),
                    zIndex: 100
                });
                
                // 마커 클릭 이벤트
                naver.maps.Event.addListener(marker, 'click', function() {
                    infoWindows.forEach(iw => iw.close());
                    infoWindow.open(map, marker);
                });
                
                markers.push(marker);
                infoWindows.push(infoWindow);
            });
        }
        
        function setupCategoryFilters() {
            const filterChips = document.querySelectorAll('.filter-chip');
            
            filterChips.forEach(chip => {
                chip.addEventListener('click', function() {
                    // 활성화 상태 변경
                    filterChips.forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    
                    const category = this.dataset.category;
                    
                    // 카테고리별 마커 필터링
                    markers.forEach((marker, index) => {
                        if (category === 'all' || _places[index].category === category) {
                            marker.setMap(map);
                        } else {
                            marker.setMap(null);
                        }
                    });
                });
            });
        }
        
        function setupLocationButton() {
            // 현재 위치로 이동 함수는 이미 HTML에 있음
        }
        
        function getCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    const currentLocation = new naver.maps.LatLng(
                        position.coords.latitude,
                        position.coords.longitude
                    );
                    
                    map.setCenter(currentLocation);
                    
                    // 현재 위치 마커 추가
                    const currentMarker = new naver.maps.Marker({
                        position: currentLocation,
                        map: map,
                        icon: {
                            content: '<div style="background: #4CAF50; color: white; padding: 8px; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold;">👤</div>',
                            size: new naver.maps.Size(40, 40),
                            anchor: new naver.maps.Point(20, 20)
                        }
                    });
                    
                    setTimeout(() => {
                        currentMarker.setMap(null);
                    }, 5000);
                }, function(error) {
                    alert('현재 위치를 가져올 수 없습니다: ' + error.message);
                });
            } else {
                alert('이 브라우저에서는 Geolocation이 지원되지 않습니다.');
            }
        }
        
        function _toJsonString(obj) {
            return JSON.stringify(obj.map(item => ({
                ...item,
                categoryColor: item.categoryColor,
                categoryIcon: item.categoryIcon
            })));
        }
        
        // 지도 초기화
        naver.maps.onJSContentLoaded = initMap;
    </script>
</body>
</html>
    ''';
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
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              _controller.reload();
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF1565C0)),
                  ),
                  SizedBox(height: 16),
                  Text(
                    '지도 로딩 중...',
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF1565C0),
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