# API Connection Fix & Troubleshooting Guide

## ✅ What I Fixed

### 1. **Improved Error Handling**
- Added more specific error messages for different connection failures
- Added timeout configuration (30 seconds for login attempts)
- Better handling of network errors vs authentication errors

### 2. **Created Centralized API Configuration**
- **File**: `/lib/config/api_config.dart`
- **Purpose**: Single place to manage all API settings
- **Features**:
  - Easy to change API endpoint URL
  - Configurable timeouts
  - Default headers management

### 3. **Removed Unreliable Connection Test**
- The previous connection test was trying to reach `/auth/test` endpoint
- Now goes directly to login attempt for better reliability
- Provides clearer error messages for connection issues

### 4. **Added API Test & Debug Page**
- **File**: `/lib/pages/api_test_page.dart`
- **Access**: Click "API Test & Debug" button on login page
- **Features**:
  - Test connection to your API
  - Test login with credentials
  - Real-time debug output
  - Pre-filled with test credentials

## 🔧 Current Configuration

```dart
// lib/config/api_config.dart
static const String baseUrl = 'http://10.211.147.133:8080/api/v1';
static const String loginEndpoint = '/auth/login';
```

## 🚨 Troubleshooting the Connection Error

The error `ERR_CONNECTION_TIMED_OUT` suggests several possible issues:

### **Option 1: Check Network Access**
Your API server at `10.211.147.133:8080` might not be:
- Running/active
- Accessible from your current network
- Accepting connections from your machine

### **Option 2: Update API Endpoint**
If the server IP/port has changed, update it in `/lib/config/api_config.dart`:

```dart
// Change this line if your server is at a different address:
static const String baseUrl = 'http://YOUR_NEW_IP:PORT/api/v1';

// Examples:
// static const String baseUrl = 'http://localhost:8080/api/v1';
// static const String baseUrl = 'https://your-domain.com/api/v1';
// static const String baseUrl = 'http://192.168.1.100:8080/api/v1';
```

### **Option 3: Test with Postman First**
Before using the mobile app, verify your API works:
1. Open Postman
2. Create POST request to: `http://10.211.147.133:8080/api/v1/auth/login`
3. Set Headers: `Content-Type: application/json`
4. Set Body (JSON):
   ```json
   {
     "email": "chanmunekp@gmail.com",
     "password": "Test@1234"
   }
   ```
5. Send request and verify you get a successful response

### **Option 4: Use the Built-in API Test Page**
1. Run the Flutter app: `flutter run -d chrome`
2. On the login page, click "API Test & Debug" (bottom of the page)
3. The page will show:
   - Current API configuration
   - Connection test results
   - Login test results with detailed logs

## 🔍 Debug Steps

1. **Verify API Server Status**
   - Ensure your Spring Boot server is running
   - Check server logs for any startup errors
   - Verify the server is listening on port 8080

2. **Check Network Configuration**
   - Can you ping `10.211.147.133` from your machine?
   - Is there a firewall blocking port 8080?
   - Are you on the same network as the server?

3. **Test with Different Tools**
   - Try accessing `http://10.211.147.133:8080` in a web browser
   - Use curl: `curl -X POST http://10.211.147.133:8080/api/v1/auth/login`
   - Use the app's built-in API test page

4. **Update Configuration if Needed**
   - If server is on localhost: change to `http://localhost:8080/api/v1`
   - If server moved: update the IP address in `api_config.dart`

## 📱 Testing the Fixed App

1. **Run the app**: `flutter run -d chrome` (from the stayops directory)
2. **Try normal login** with your credentials
3. **Use API Test page** for detailed debugging
4. **Check console output** for detailed error messages

The app now provides much better error messages to help identify whether the issue is:
- Network connectivity 
- Server unavailability
- Invalid credentials
- Server-side errors

## 🎯 Next Steps

1. First, verify your server is accessible using Postman or browser
2. Update the API URL in `api_config.dart` if needed
3. Use the API Test page to debug connection issues
4. Once connection works, test normal login flow

All the improvements are in place - you just need to ensure the API server is reachable from your development machine!