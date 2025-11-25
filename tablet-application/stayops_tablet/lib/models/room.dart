class Room {
  final int roomId;
  final String roomNumber;
  final String roomType;
  final double pricePerNight;
  final String status;
  final List<String> galleryImages;
  final String? panoramaUrl;
  final String? bedType;
  final int? squareFootage;
  final String? viewType;
  final int? floorNumber;
  final List<String> amenities;

  Room({
    required this.roomId,
    required this.roomNumber,
    required this.roomType,
    required this.pricePerNight,
    required this.status,
    required this.galleryImages,
    this.panoramaUrl,
    this.bedType,
    this.squareFootage,
    this.viewType,
    this.floorNumber,
    required this.amenities,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    // Helper function to safely parse int
    int? parseInt(dynamic value) {
      if (value == null) return null;
      if (value is int) return value;
      if (value is String) return int.tryParse(value);
      if (value is double) return value.toInt();
      return null;
    }

    // Helper function to safely parse double
    double parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is double) return value;
      if (value is int) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? 0.0;
      return 0.0;
    }

    // Helper function to safely parse string list
    List<String> parseStringList(dynamic value) {
      if (value == null) return [];
      if (value is List) {
        return value.map((e) => e.toString()).where((s) => s.isNotEmpty).toList();
      }
      if (value is String) {
        if (value.isEmpty) return [];
        // Handle comma-separated strings
        return value.split(',').map((e) => e.trim()).where((s) => s.isNotEmpty).toList();
      }
      return [];
    }

    return Room(
      roomId: parseInt(json['id'] ?? json['roomId']) ?? 0,
      roomNumber: (json['roomNumber'] ?? json['room_number'] ?? '').toString(),
      roomType: (json['type'] ?? json['roomType'] ?? 'Standard').toString(),
      pricePerNight: parseDouble(json['pricePerNight'] ?? json['price_per_night'] ?? 0),
      status: (json['availabilityStatus'] ?? json['status'] ?? 'AVAILABLE').toString(),
      galleryImages: parseStringList(json['galleryImages'] ?? json['gallery_images']),
      panoramaUrl: json['panoramaUrl']?.toString() ?? json['panorama_url']?.toString(),
      bedType: json['bedType']?.toString() ?? json['bed_type']?.toString(),
      squareFootage: parseInt(json['squareFootage'] ?? json['square_footage']),
      viewType: json['viewType']?.toString() ?? json['view_type']?.toString(),
      floorNumber: parseInt(json['floorNumber'] ?? json['floor_number']),
      amenities: parseStringList(json['amenities']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'roomId': roomId,
      'roomNumber': roomNumber,
      'roomType': roomType,
      'pricePerNight': pricePerNight,
      'status': status,
      'galleryImages': galleryImages,
      'panoramaUrl': panoramaUrl,
      'bedType': bedType,
      'squareFootage': squareFootage,
      'viewType': viewType,
      'floorNumber': floorNumber,
      'amenities': amenities,
    };
  }
}