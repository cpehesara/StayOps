class Reservation {
  final int reservationId;
  final String guestId;
  final List<int> roomIds;
  final String checkInDate;
  final String checkOutDate;
  final String status;
  final String createdAt;
  final String updatedAt;

  Reservation({
    required this.reservationId,
    required this.guestId,
    required this.roomIds,
    required this.checkInDate,
    required this.checkOutDate,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Reservation.fromJson(Map<String, dynamic> json) {
    return Reservation(
      reservationId: json['reservationId'],
      guestId: json['guestId'],
      roomIds: List<int>.from(json['roomIds']),
      checkInDate: json['checkInDate'],
      checkOutDate: json['checkOutDate'],
      status: json['status'],
      createdAt: json['createdAt'],
      updatedAt: json['updatedAt'],
    );
  }
}
