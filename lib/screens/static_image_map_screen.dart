import 'package:flutter/material.dart';

class StaticImageMapScreen extends StatelessWidget {
  const StaticImageMapScreen({super.key});

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
          // 안내 정보
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            color: Colors.blue.shade50,
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.map,
                      color: Color(0xFF1565C0),
                      size: 24,
                    ),
                    SizedBox(width: 8),
                    Text(
                      '한양대 캠퍼스 지도',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1565C0),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 8),
                Text(
                  '한양대학교 서울 캠퍼스 전체 지도',
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF616161), // Colors.grey[700]
                  ),
                ),
              ],
            ),
          ),
          
          // 지도 이미지 영역
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: Color(0xFFE0E0E0)), // Colors.grey[300]
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(2, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // 지도 이미지
                  Expanded(
                    child: Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Color(0xFFF5F5F5), // Colors.grey[100]
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(12),
                        ),
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.map_outlined,
                            size: 64,
                            color: Color(0xFF1565C0),
                          ),
                          SizedBox(height: 16),
                          Text(
                            '한양대학교 서울 캠퍼스',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1565C0),
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            '지도 이미지 영역',
                            style: TextStyle(
                              fontSize: 14,
                              color: Color(0xFF757575), // Colors.grey[600]
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  // 지도 범례/스케일
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: const BorderRadius.vertical(
                        bottom: Radius.circular(12),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildLegendItem(Icons.school, '교육시설'),
                        _buildLegendItem(Icons.restaurant, '식당'),
                        _buildLegendItem(Icons.local_cafe, '카페'),
                        _buildLegendItem(Icons.directions_bus, '교통'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // 캠퍼스 안내
          Container(
            padding: const EdgeInsets.all(16),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '캠퍼스 정보',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1565C0),
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  '• 총면적: 약 25만 평\n'
                  '• 주요 건물: 본관, 제1공학관, 제2공학관 등\n'
                  '• 대표 시설: 대강당, 박물관, 도서관\n'
                  '• 교통: 2호선 한양대역, 수도권 광역급전철',
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF616161), // Colors.grey[700]
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(IconData icon, String label) {
    return Column(
      children: [
        Icon(
          icon,
          size: 24,
          color: Color(0xFF1565C0),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Color(0xFF616161), // Colors.grey[700]
          ),
        ),
      ],
    );
  }
}