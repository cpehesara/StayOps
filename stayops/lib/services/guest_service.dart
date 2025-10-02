import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:stayops/config/api_config.dart';

class GuestService {
  // Use centralized API configuration
  static const String _baseUrl = 'http://10.203.254.101:8080/api/v1';

  // Get guest data by ID
  static Future<Map<String, dynamic>?> getGuestById(String guestId) async {
    try {
      print('Fetching guest data for ID: $guestId');

      final response = await http
          .get(
            Uri.parse('$_baseUrl${ApiConfig.guestsEndpoint}/$guestId'),
            headers: ApiConfig.getCleanHeaders(), // NO BASIC AUTHORIZATION
          )
          .timeout(ApiConfig.connectionTimeout);

      print('Response status: ${response.statusCode}');
      print('Response headers: ${response.headers}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> guestData = jsonDecode(response.body);
        return guestData;
      } else {
        print('Failed to fetch guest data. Status: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('Error fetching guest data: $e');
      return null;
    }
  }

  // Register a new guest
  static Future<Map<String, dynamic>?> registerGuest({
    required String email,
    required String password,
    required String confirmPassword,
  }) async {
    try {
      print('Registering new guest with email: $email');

      final Map<String, dynamic> signupBody = {
        "email": email,
        "password": password,
        "confirmPassword": confirmPassword,
      };

      final response = await http
          .post(
            Uri.parse('$_baseUrl${ApiConfig.guestsEndpoint}/register'),
            headers: ApiConfig.getCleanHeaders(), // NO BASIC AUTHORIZATION
            body: jsonEncode(signupBody),
          )
          .timeout(ApiConfig.connectionTimeout);

      print('Register response status: ${response.statusCode}');
      print('Register response headers: ${response.headers}');
      print('Register response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final Map<String, dynamic> result = jsonDecode(response.body);
        return result;
      } else {
        print('Failed to register guest. Status: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('Error registering guest: $e');
      return null;
    }
  }

  // Get all guests (optional)
  static Future<List<Map<String, dynamic>>?> getAllGuests() async {
    try {
      print('Fetching all guests...');

      final response = await http
          .get(
            Uri.parse('$_baseUrl${ApiConfig.guestsEndpoint}'),
            headers: ApiConfig.defaultHeaders,
          )
          .timeout(ApiConfig.connectionTimeout);

      print('Get all guests response status: ${response.statusCode}');
      print('Get all guests response body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> guestsData = jsonDecode(response.body);
        return guestsData.cast<Map<String, dynamic>>();
      } else {
        print('Failed to fetch guests. Status: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('Error fetching guests: $e');
      return null;
    }
  }

  // Test connection to the backend
  static Future<bool> testConnection() async {
    try {
      print('Testing connection to backend server...');

      final response = await http
          .get(
            Uri.parse('$_baseUrl${ApiConfig.guestsEndpoint}'),
            headers: ApiConfig.getCleanHeaders(), // NO BASIC AUTHORIZATION
          )
          .timeout(ApiConfig.requestTimeout);

      print('Connection test - Status: ${response.statusCode}');
      print('Connection test - Headers: ${response.headers}');
      print('Connection test - Body: ${response.body}');

      return response.statusCode == 200;
    } catch (e) {
      print('Connection test failed: $e');
      return false;
    }
  }
}
