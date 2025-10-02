class Guest {
  final String? guestId;
  final String? fullName;
  final String? email;
  final String? phone;
  final String? nationality;
  final String? identityType;
  final String? identityNumber;
  final String? qrCodeBase64;
  final String? imageUrl;
  final Map<String, dynamic>? additionalData;

  Guest({
    this.guestId,
    this.fullName,
    this.email,
    this.phone,
    this.nationality,
    this.identityType,
    this.identityNumber,
    this.qrCodeBase64,
    this.imageUrl,
    this.additionalData,
  });

  // Factory constructor to create Guest from JSON
  factory Guest.fromJson(Map<String, dynamic> json) {
    return Guest(
      guestId: json['guestId']?.toString(),
      fullName: json['fullName']?.toString(),
      email: json['email']?.toString(),
      phone: json['phone']?.toString(),
      nationality: json['nationality']?.toString(),
      identityType: json['identityType']?.toString(),
      identityNumber: json['identityNumber']?.toString(),
      qrCodeBase64: json['qrCodeBase64']?.toString(),
      imageUrl: json['imageUrl']?.toString(),
      additionalData: json,
    );
  }

  // Convert Guest to JSON
  Map<String, dynamic> toJson() {
    return {
      'guestId': guestId,
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'nationality': nationality,
      'identityType': identityType,
      'identityNumber': identityNumber,
      'qrCodeBase64': qrCodeBase64,
      'imageUrl': imageUrl,
    };
  }

  // Get display name
  String get displayName {
    return fullName ?? 'Unknown Guest';
  }

  // Check if guest has complete profile
  bool get isProfileComplete {
    return email != null &&
        fullName != null &&
        phone != null &&
        identityNumber != null;
  }

  @override
  String toString() {
    return 'Guest(guestId: $guestId, email: $email, name: $fullName)';
  }
}
