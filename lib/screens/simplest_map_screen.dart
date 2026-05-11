import 'package:flutter/material.dart';

class SimplestMapScreen extends StatelessWidget {
  const SimplestMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Campus Map', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF1565C0),
      ),
      body: const Center(
        child: Text(
          'Map Area Working',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1565C0),
          ),
        ),
      ),
    );
  }
}