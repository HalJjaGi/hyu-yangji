import 'package:flutter/material.dart';

class CategoryFilter extends StatelessWidget {
  final String selectedCategory;
  final Function(String) onCategoryChanged;

  const CategoryFilter({
    super.key,
    required this.selectedCategory,
    required this.onCategoryChanged,
  });

  @override
  Widget build(BuildContext context) {
    final categories = [
      {'id': 'all', 'name': '전체', 'icon': Icons.apps as IconData},
      {'id': 'cafe', 'name': '카페', 'icon': Icons.coffee as IconData},
      {'id': 'restaurant', 'name': '식당', 'icon': Icons.restaurant as IconData},
      {'id': 'study', 'name': '공부', 'icon': Icons.book as IconData},
      {'id': 'convenience', 'name': '편의', 'icon': Icons.store as IconData},
    ]
      .map((category) => Map<String, dynamic>.from(category))
      .toList();

    return Container(
      height: 80,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Colors.white,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = selectedCategory == category['id'];

          return GestureDetector(
            onTap: () => onCategoryChanged(category['id']),
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected 
                    ? const Color(0xFF1565C0) 
                    : Colors.grey[100],
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: isSelected 
                      ? const Color(0xFF1565C0) 
                      : Colors.grey[300]!,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    category['icon'],
                    size: 18,
                    color: isSelected ? Colors.white : Colors.grey[700],
                  ),
                  const SizedBox(width: 8),
                  Text(
                    category['name'],
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : Colors.grey[700],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}