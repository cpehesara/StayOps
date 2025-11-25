class RoomFilter {
  final String? checkInDate;
  final String? checkOutDate;
  final String? roomType;
  final int? guestId;
  final bool active;

  RoomFilter({
    this.checkInDate,
    this.checkOutDate,
    this.roomType,
    this.guestId,
    required this.active,
  });

  factory RoomFilter.fromJson(Map<String, dynamic> json) {
    return RoomFilter(
      checkInDate: json['checkInDate'],
      checkOutDate: json['checkOutDate'],
      roomType: json['roomType'],
      guestId: json['guestId'],
      active: json['active'] ?? false,
    );
  }
}