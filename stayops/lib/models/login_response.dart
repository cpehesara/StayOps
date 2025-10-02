class LoginResponse {
  final String token;
  final String tokenType;
  final int expiresIn;
  final Guest guest;

  LoginResponse({
    required this.token,
    required this.tokenType,
    required this.expiresIn,
    required this.guest,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'] ?? '',
      tokenType: json['tokenType'] ?? 'Bearer',
      expiresIn: json['expiresIn'] ?? 86400,
      guest: Guest.fromJson(json['guest']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'tokenType': tokenType,
      'expiresIn': expiresIn,
      'guest': guest.toJson(),
    };
  }
}

class Guest {
  final String guestId;
  final String fullName;
  final String email;
  final String phone;
  final String nationality;
  final String identityType;
  final String identityNumber;
  final String? qrCodeBase64;
  final String? imageUrl;

  Guest({
    required this.guestId,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.nationality,
    required this.identityType,
    required this.identityNumber,
    this.qrCodeBase64,
    this.imageUrl,
  });

  String get displayName => fullName.isNotEmpty ? fullName : 'Guest';

  factory Guest.fromJson(Map<String, dynamic> json) {
    return Guest(
      guestId: json['guestId']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      nationality: json['nationality']?.toString() ?? '',
      identityType: json['identityType']?.toString() ?? '',
      identityNumber: json['identityNumber']?.toString() ?? '',
      qrCodeBase64: json['qrCodeBase64']?.toString(),
      imageUrl: json['imageUrl']?.toString(),
    );
  }

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
}
