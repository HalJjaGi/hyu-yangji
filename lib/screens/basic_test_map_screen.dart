import 'package:flutter/material.dart';

class BasicTestMapScreen extends StatelessWidget {
  const BasicTestMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test Map'),
        backgroundColor: Colors.blue,
      ),
      body: const Center(
        child: Text('Map Screen Test'),
      ),
    );
  }
}