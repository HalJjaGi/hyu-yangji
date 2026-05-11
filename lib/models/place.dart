class Place {
  final int id;
  final String name;
  final String category;
  final double rating;
  final int qualityScore;
  final String address;
  final String description;
  final String imageUrl;
  final double latitude;
  final double longitude;
  final double distance;
  final List<String> tags;

  Place({
    required this.id,
    required this.name,
    required this.category,
    required this.rating,
    required this.qualityScore,
    required this.address,
    required this.description,
    required this.imageUrl,
    required this.latitude,
    required this.longitude,
    required this.distance,
    required this.tags,
  });

  factory Place.fromJson(Map<String, dynamic> json) {
    return Place(
      id: json['id'],
      name: json['name'],
      category: json['category'],
      rating: (json['rating'] as num).toDouble(),
      qualityScore: json['quality_score'],
      address: json['address'],
      description: json['description'],
      imageUrl: json['image'],
      latitude: (json['lat'] as num).toDouble(),
      longitude: (json['lng'] as num).toDouble(),
      distance: (json['distance'] as num).toDouble(),
      tags: List<String>.from(json['tags']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'rating': rating,
      'quality_score': qualityScore,
      'address': address,
      'description': description,
      'image': imageUrl,
      'lat': latitude,
      'lng': longitude,
      'distance': distance,
      'tags': tags,
    };
  }

  // 카테고리별 색상 반환
  String get categoryColor {
    switch (category.toLowerCase()) {
      case 'cafe':
        return '#8B5CF6'; // 보라색
      case 'restaurant':
        return '#EF4444'; // 빨간색
      case 'study':
        return '#3B82F6'; // 파란색
      case 'convenience':
        return '#10B981'; // 초록색
      default:
        return '#6B7280'; // 회색
    }
  }

  // 카테고리별 아이콘 반환
  String get categoryIcon {
    switch (category.toLowerCase()) {
      case 'cafe':
        return '☕';
      case 'restaurant':
        return '🍽️';
      case 'study':
        return '📚';
      case 'convenience':
        return '🏪';
      default:
        return '📍';
    }
  }
}