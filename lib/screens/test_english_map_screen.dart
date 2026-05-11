import 'package:flutter/material.dart';

class TestEnglishMapScreen extends StatelessWidget {
  const TestEnglishMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Test Map',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF1565C0),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Test Map Screen',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1565C0),
              ),
            ),
            SizedBox(height: 16),
            Text(
              'If you see this, screen navigation is working',
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