import 'package:flutter/material.dart';

class MinimalMapScreen extends StatelessWidget {
  const MinimalMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          '최소 지도',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF1565C0),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '최소 지도 화면',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1565C0),
              ),
            ),
            SizedBox(height: 16),
            Text(
              '이것이 보인다면 기본적인 화면 전환은 정상입니다.',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Icon(
              Icons.map,
              size: 80,
              color: Color(0xFF1565C0),
            ),
          ],
        ),
      ),
    );
  }
}