class Vlog {
  final int id;
  final String title;
  final String creator;
  final String duration;
  final int views;
  final int likes;
  final String thumbnailUrl;
  final List<String> tags;

  Vlog({
    required this.id,
    required this.title,
    required this.creator,
    required this.duration,
    required this.views,
    required this.likes,
    required this.thumbnailUrl,
    required this.tags,
  });

  factory Vlog.fromJson(Map<String, dynamic> json) {
    return Vlog(
      id: json['id'],
      title: json['title'],
      creator: json['creator'],
      duration: json['duration'],
      views: json['views'],
      likes: json['likes'],
      thumbnailUrl: json['thumbnail'],
      tags: List<String>.from(json['tags']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'creator': creator,
      'duration': duration,
      'views': views,
      'likes': likes,
      'thumbnail': thumbnailUrl,
      'tags': tags,
    };
  }

  // 포맷된 조회수
  String get formattedViews {
    if (views >= 10000) {
      return '${(views / 10000).toStringAsFixed(1)}만';
    } else if (views >= 1000) {
      return '${(views / 1000).toStringAsFixed(1)}천';
    }
    return views.toString();
  }

  // 포맷된 좋아요수
  String get formattedLikes {
    if (likes >= 10000) {
      return '${(likes / 10000).toStringAsFixed(1)}만';
    } else if (likes >= 1000) {
      return '${(likes / 1000).toStringAsFixed(1)}천';
    }
    return likes.toString();
  }
}