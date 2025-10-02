import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  print('🧪 Testing Guest Endpoint Directly');
  print('================================');

  const guestId = 'ff469f4e-5d9b-4c05-b2e3-74aeb85596c8';
  const url = 'http://192.168.1.100:8080/api/v1/guests/$guestId';

  print('🔗 URL: $url');
  print('📡 Making request...');

  try {
    final response = await http.get(
      Uri.parse(url),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ).timeout(Duration(seconds: 10));

    print('✅ Response received!');
    print('📊 Status Code: ${response.statusCode}');
    print('📋 Headers: ${response.headers}');
    print('');

    if (response.statusCode == 200) {
      final jsonData = jsonDecode(response.body);
      print('✅ SUCCESS! Guest data retrieved:');
      print('🆔 Guest ID: ${jsonData['guestId']}');
      print('👤 Full Name: ${jsonData['fullName']}');
      print('📧 Email: ${jsonData['email']}');
      print('📱 Phone: ${jsonData['phone']}');
      print('🌍 Nationality: ${jsonData['nationality']}');
      print('🆔 Identity Type: ${jsonData['identityType']}');
      print('🔢 Identity Number: ${jsonData['identityNumber']}');

      if (jsonData['imageUrl'] != null) {
        print('🖼️ Profile Image: ${jsonData['imageUrl']}');
      }

      if (jsonData['qrCodeBase64'] != null) {
        print(
            '📱 QR Code: Available (${jsonData['qrCodeBase64'].toString().length} characters)');
      }
    } else {
      print('❌ FAILED: Status ${response.statusCode}');
      print('💬 Response: ${response.body}');
    }
  } catch (e) {
    print('❌ ERROR: $e');
    if (e.toString().contains('Connection refused')) {
      print('🔧 Server appears to be down or unreachable');
    } else if (e.toString().contains('TimeoutException')) {
      print('⏱️ Request timed out - server may be slow');
    }
  }
}
