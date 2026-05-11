import 'package:flutter/material.dart';

class FinalMapScreen extends StatelessWidget {
  const FinalMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Campus Map', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF1565C0),
      ),
      body: Container(
        color: const Color(0xFF1565C0).withOpacity(0.05),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.map,
                size: 80,
                color: Color(0xFF1565C0),
              ),
              SizedBox(height: 16),
              Text(
                'Campus Map Working!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1565C0),
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Screen navigation is successful',
                style: TextStyle(fontSize: 16),
              ),
            ],
          ),
        ),
      ),
    );
  }
}