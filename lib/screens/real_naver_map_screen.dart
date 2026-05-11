import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class RealNaverMapScreen extends StatefulWidget {
  const RealNaverMapScreen({super.key});

  @override
  State<RealNaverMapScreen> createState() => _RealNaverMapScreenState();
}

class _RealNaverMapScreenState extends State<RealNaverMapScreen> {
  late WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';

  // 네이버 지도 API 키 (새로운 ncpKeyId 사용)
  static const String _naverKeyId = 'pctubllds4';

  @override
  void initState() {
    super.initState();
    _initializeWebView();
  }

  void _initializeWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // 로딩 진행률
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            setState(() {
              _hasError = true;
              _errorMessage = '네트워크 오류: ${error.description}';
            });
          },
        ),
      )
      ..loadHtmlString(_getNaverMapHtml());
  }

  String _getNaverMapHtml() {
    return '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>한양대 캠퍼스 지도</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body, html {
            height: 100%;
            width: 100%;
            overflow: hidden;
        }
        #map {
            width: 100%;
            height: 100%;
        }
        .error-message {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
            width: 100%;
            background-color: #f5f5f5;
            font-family: Arial, sans-serif;
            padding: 20px;
            text-align: center;
        }
        .error-title {
            color: #d32f2f;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .error-detail {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .retry-button {
            background-color: #1976d2;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .retry-button:hover {
            background-color: #1565c0;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <!-- 네이버 지도 API 로드 (ncpKeyId 사용) -->
    <script type="text/javascript" 
            src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=$_naverKeyId&callback=initMap"></script>
    
    <script>
        var map = null;
        var errorOccurred = false;
        
        // 인증 실패 처리
        window.navermap_authFailure = function() {
            errorOccurred = true;
            showError('네이버 지도 API 인증 실패', '클라이언트 아이디를 확인해주세요.');
        };
        
        // 에러 표시 함수
        function showError(title, detail) {
            document.getElementById('map').innerHTML = `
                <div class="error-message">
                    <div class="error-title">${title}</div>
                    <div class="error-detail">${detail}</div>
                    <button class="retry-button" onclick="location.reload()">다시 시도</button>
                </div>
            `;
        }
        
        // 지도 초기화 함수
        function initMap() {
            try {
                // 한양대학교 서울 캠퍼스 중심 좌표
                var hanyangCenter = new naver.maps.LatLng(37.5560, 127.0466);
                
                var mapOptions = {
                    center: hanyangCenter,
                    zoom: 16,
                    scaleControl: true,
                    mapDataControl: true,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: naver.maps.Position.TOP_RIGHT
                    },
                    mapTypeControl: true,
                    mapTypeControlOptions: {
                        style: naver.maps.MapTypeControlStyle.DROPDOWN,
                        position: naver.maps.Position.TOP_RIGHT
                    }
                };
                
                // 지도 생성
                map = new naver.maps.Map('map', mapOptions);
                
                // 마커 추가
                var marker = new naver.maps.Marker({
                    position: hanyangCenter,
                    map: map,
                    title: '한양대학교 서울 캠퍼스',
                    icon: {
                        content: '<div style="background-color: #1565C0; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">H</div>',
                        size: new naver.maps.Size(30, 30),
                        anchor: new naver.maps.Point(15, 15)
                    }
                });
                
                // 정보 창
                var infoWindow = new naver.maps.InfoWindow({
                    content: '<div style="padding: 10px; font-size: 14px;"><strong>한양대학교 서울 캠퍼스</strong><br/>서울특별시 성동구 행당동</div>',
                    maxWidth: 200
                });
                
                // 마커 클릭 이벤트
                naver.maps.Event.addListener(marker, 'click', function(e) {
                    if (infoWindow.getMap()) {
                        infoWindow.close();
                    } else {
                        infoWindow.open(map, marker);
                    }
                });
                
                // 초기에 정보 창 열기
                infoWindow.open(map, marker);
                
                console.log('🗺️ 한양대 캠퍼스 지도 로드 성공');
                
            } catch (error) {
                console.error('❌ 지도 생성 오류:', error);
                showError('지도 생성 오류', error.message);
                errorOccurred = true;
            }
        }
        
        // API 로드 타임아웃 체크
        setTimeout(function() {
            if (typeof naver === 'undefined' && !errorOccurred) {
                showError('API 로드 실패', '네이버 지도 API를 로드할 수 없습니다.');
            }
        }, 10000); // 10초 타임아웃
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
          '실제 네이버 지도',
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
          // 안내 정보
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
                      '네이버 지도 API v3',
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
                  '공식 JavaScript API로 구현된 실제 네이버 지도\n'
                  'ncpKeyId: $_naverKeyId',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[700],
                  ),
                ),
              ],
            ),
          ),
          
          // 지도 영역
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(12),
              ),
              child: _isLoading
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Color(0xFF1565C0),
                            ),
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
                    )
                  : _hasError
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.error_outline,
                                color: Colors.red,
                                size: 48,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                '지도 로딩 실패',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.red[700],
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _errorMessage,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey[600],
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton(
                                onPressed: () {
                                  setState(() {
                                    _isLoading = true;
                                    _hasError = false;
                                  });
                                  _initializeWebView();
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color(0xFF1565C0),
                                  foregroundColor: Colors.white,
                                ),
                                child: const Text('다시 시도'),
                              ),
                            ],
                          ),
                        )
                      : WebViewWidget(controller: _controller),
            ),
          ),
          
          // 기능 설명
          Container(
            padding: const EdgeInsets.all(16),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '실제 네이버 지도 기능',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1565C0),
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  '• 실제 네이버 지도 타일 표시\n'
                  '• 한양대 캠퍼스 중심 위치\n'
                  '• 마커 및 정보 창\n'
                  '• 줌/팬/회전 기능\n'
                  '• 지도 타입 변경\n'
                  '• 스케일 및 축척 표시',
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
}