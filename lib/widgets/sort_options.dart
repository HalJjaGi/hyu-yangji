import 'package:flutter/material.dart';

class SortOptions extends StatelessWidget {
  final String selectedSort;
  final Function(String) onSortChanged;

  const SortOptions({
    super.key,
    required this.selectedSort,
    required this.onSortChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(
            Icons.sort,
            size: 20,
            color: Color(0xFF1565C0),
          ),
          const SizedBox(width: 8),
          const Text(
            '정렬:',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(20),
              ),
              child: DropdownButton<String>(
                value: selectedSort,
                isExpanded: true,
                underline: Container(),
                icon: const Icon(
                  Icons.keyboard_arrow_down,
                  color: Color(0xFF1565C0),
                ),
                style: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF1565C0),
                ),
                items: const [
                  DropdownMenuItem(
                    value: 'quality',
                    child: Row(
                      children: [
                        Icon(Icons.verified, size: 16, color: Color(0xFF1565C0)),
                        SizedBox(width: 8),
                        Text('품질순'),
                      ],
                    ),
                  ),
                  DropdownMenuItem(
                    value: 'distance',
                    child: Row(
                      children: [
                        Icon(Icons.location_on, size: 16, color: Color(0xFF1565C0)),
                        SizedBox(width: 8),
                        Text('거리순'),
                      ],
                    ),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    onSortChanged(value);
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}