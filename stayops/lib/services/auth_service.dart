import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:stayops/config/api_config.dart';

class AuthService {
  // Update base URL to use the specified IP address
  static const String _baseUrl = 'http://10.203.254.101:8080/api';

  // Simplified network diagnostics method (web-compatible)
  static Future<Map<String, dynamic>> diagnoseConnection() async {
    Map<String, dynamic> diagnostics = {
      'api_responding': false,
      'errors': <String>[],
    };

    try {
      // Simple HTTP health check (removed Socket.connect - not web compatible)
      print('Testing HTTP response...');
      final response = await http.get(
        Uri.parse('http://10.203.254.101:8080/'),
        headers: {'Accept': 'application/json'},
      ).timeout(Duration(seconds: 5));

      print('Health check response: ${response.statusCode}');
      diagnostics['api_responding'] = true;
    } catch (e) {
      diagnostics['errors'].add('HTTP test failed - $e');
      print('✗ HTTP test failed: $e');
    }

    return diagnostics;
  }

  static Future<Map<String, dynamic>?> login(
      String email, String password) async {
    try {
      print('Attempting to login with email: $email');
      print('API URL: ${_baseUrl}/v1/auth/login');

      // Skip diagnostics to avoid blocking login attempts
      // final diagnostics = await diagnoseConnection();
      // if (!diagnostics['api_responding']) {
      //   print('Connection diagnostics failed. Cannot reach backend.');
      //   return null;
      // }

      final response = await http
          .post(
            Uri.parse('${_baseUrl}/v1/auth/login'),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'StayOps-Flutter-App',
            },
            body: jsonEncode({
              'email': email,
              'password': password,
            }),
          )
          .timeout(Duration(seconds: 10));

      print('Login response status: ${response.statusCode}');
      print('Login response headers: ${response.headers}');
      print('Login response body: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        print('Login successful: ${responseData['guest']['fullName']}');
        return responseData;
      } else {
        print('Login failed with status: ${response.statusCode}');
        print('Error response: ${response.body}');
        return null;
      }
    } catch (e) {
      print('Login error: $e');

      // Provide specific error messages for common issues
      if (e.toString().contains('Connection refused') ||
          e.toString().contains('ERR_CONNECTION_TIMED_OUT')) {
        print(
            'Backend server is not running or not accessible at 192.168.1.100:8080');
      } else if (e.toString().contains('TimeoutException')) {
        print('Request timed out - backend may be slow or unreachable');
      } else if (e.toString().contains('Failed to fetch')) {
        print(
            'Network connectivity issue - check if backend is running and accessible');
      }

      return null;
    }
  }

  static Future<bool> testConnection() async {
    try {
      print('Testing connection to ${_baseUrl}');

      // Test the actual login endpoint with a simple request
      final response = await http.post(
        Uri.parse('${_baseUrl}/v1/auth/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ).timeout(Duration(seconds: 5));

      print('Connection test response: ${response.statusCode}');
      print('Connection test body: ${response.body}');

      return true;
    } catch (e) {
      print('Connection test failed: $e');
      if (e.toString().contains('Connection refused') ||
          e.toString().contains('ERR_CONNECTION_TIMED_OUT')) {
        print(
            'Backend server is not running or not accessible at 10.203.254.101:8080');
      }
      return false;
    }
  }

  static Future<Map<String, dynamic>?> fetchGuestData(String guestId) async {
    try {
      print('Fetching guest data for ID: $guestId');

      // Use the full API path with v1
      final url = 'http://10.203.254.101:8080/api/v1/guests/$guestId';
      print('Guest data URL: $url'); // Add this debug line to verify URL

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'StayOps-Flutter-App',
        },
      ).timeout(Duration(seconds: 10));

      print('Guest data response status: ${response.statusCode}');
      print('Guest data response headers: ${response.headers}');
      print('Guest data response body: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        print('Guest data fetched successfully');
        return responseData;
      } else if (response.statusCode == 404) {
        print('Guest not found with ID: $guestId');
        return null;
      } else {
        print('Failed to fetch guest data. Status: ${response.statusCode}');
        print('Error details: ${response.body}');
        return null;
      }
    } catch (e) {
      print('Guest data fetch error: $e');

      if (e.toString().contains('Connection refused') ||
          e.toString().contains('ERR_CONNECTION_TIMED_OUT')) {
        print(
            'Backend server is not running or not accessible at 10.203.254.101:8080');
      } else if (e.toString().contains('TimeoutException')) {
        print('Request timed out - backend may be slow or unreachable');
      } else if (e.toString().contains('Failed to fetch')) {
        print(
            'Network connectivity issue - check if backend is running and accessible');
      }

      return null;
    }
  }
}
