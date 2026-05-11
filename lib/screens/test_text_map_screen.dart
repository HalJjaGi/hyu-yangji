import 'package:flutter/material.dart';

class TestTextMapScreen extends StatelessWidget {
  const TestTextMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test Map'),
        backgroundColor: Colors.blue,
      ),
      body: Container(
        color: Colors.yellow,
        child: const Center(
          child: Text(
            'TEST',
            style: TextStyle(
              color: Colors.black,
              fontSize: 20,
            ),
          ),
        ),
      ),
    );
  }
}