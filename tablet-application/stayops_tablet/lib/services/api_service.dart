import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/room.dart';
import '../models/room_filter.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8080';

  Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/v1/auth/web-login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token'] ?? '');
        await prefs.setString('email', email);
        return true;
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  Future<List<Room>> getAvailableRooms() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/room-filter/filtered-rooms'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Room.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Fetch rooms error: $e');
      return [];
    }
  }

  Future<RoomFilter?> getCurrentFilterCriteria() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/room-filter/current-criteria'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return RoomFilter.fromJson(data);
      }
      return null;
    } catch (e) {
      print('Fetch filter criteria error: $e');
      return null;
    }
  }

  Future<bool> sendRoomSelection(int roomId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final email = prefs.getString('email') ?? '';
      
      // Create a session ID based on email + timestamp
      final sessionId = '${email}_${DateTime.now().millisecondsSinceEpoch}';
      
      final response = await http.post(
        Uri.parse('$baseUrl/api/room-filter/guest-selection'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'sessionId': sessionId,
          'roomId': roomId,
          'guestId': email,
        }),
      );

      if (response.statusCode == 200) {
        print('Room selection sent successfully - Room ID: $roomId');
        return true;
      }
      return false;
    } catch (e) {
      print('Send room selection error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}