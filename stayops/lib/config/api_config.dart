class ApiConfig {
  // API Configuration
  static const String baseUrl = 'http://10.203.254.101:8080/api/v1';

  // Alternative URLs for testing (comment/uncomment as needed)
  // static const String baseUrl = 'http://10.203.254.101:8080/api/v1';
  // static const String baseUrl = 'http://10.203.254.101:8080/api/v1';
  // static const String baseUrl = 'https://your-domain.com/api/v1';

  // API Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String guestsEndpoint = '/guests';

  // Request Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration requestTimeout = Duration(seconds: 15);

  // Default Headers (NO BASIC AUTHORIZATION)
  // Only includes content-type headers, no authentication
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Helper method to create headers with JWT token if needed in the future
  static Map<String, String> getHeadersWithToken(String? token) {
    final headers = Map<String, String>.from(defaultHeaders);
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // Helper method to ensure clean headers without any auth
  static Map<String, String> getCleanHeaders() {
    return Map<String, String>.from(defaultHeaders);
  }
}
