# StayOps Login API Integration

## Overview
Successfully integrated the login API (`http://10.211.147.133:8080/api/v1/auth/login`) into the StayOps Flutter mobile app.

## Files Created/Modified

### 1. New Files Created:

#### `/lib/services/auth_service.dart`
- **Purpose**: Handles authentication API calls
- **Key Features**:
  - `login(email, password)` method for API authentication
  - `testConnection()` method to verify server connectivity
  - Proper error handling and logging
  - Uses the exact API endpoint and request format you specified

#### `/lib/models/login_response.dart`
- **Purpose**: Models for login response data
- **Structure**:
  ```dart
  class LoginResponse {
    final String token;
    final String tokenType; 
    final int expiresIn;
    final Guest guest;
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
  }
  ```

### 2. Files Modified:

#### `/lib/main.dart`
- **Login Method**: Replaced mock authentication with real API calls
- **Features Added**:
  - Async login with loading states
  - Real API authentication using AuthService
  - Error handling for connection issues
  - Direct navigation to guest details page upon successful login
  - Loading spinner on login button during authentication

#### `/lib/pages/guest_details_page.dart`
- **Import Update**: Updated to use the new Guest model from login_response.dart
- **Compatibility**: Ensures the guest details page works with authenticated guest data

## API Integration Details

### Request Format (Exactly as specified):
```json
{
  "email": "chanmunekp@gmail.com",
  "password": "Test@1234"
}
```

### Expected Response Format:
```json
{
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9HVUVTVCIsInN1YiI6ImNoYW5tdW5la3BAZ21haWwuY29tIiwiaWF0IjoxNzU4NzI4OTYzLCJleHAiOjE3NTg4MTUzNjN9.UjmZKx_SiV_bixcc4_qIC-GA7Mma936XpO4q9Lvm78A",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "guest": {
        "guestId": "8fb9edb9-c153-4206-9523-bd9316b9a693",
        "fullName": "KHTU Jayasekara",
        "email": "chanmunekp@gmail.com",
        "phone": "0764531642",
        "nationality": "SL",
        "identityType": "NIC",
        "identityNumber": "2023052042",
        "qrCodeBase64": "data:image/png;base64,iVBORw0KG...",
        "imageUrl": "https://res.cloudinary.com/di4v3fcqi/image/upload/v1757741304/stayops/guests/guest_8fb9edb9-c153-4206-9523-bd9316b9a693.jpg"
    }
}
```

## Login Flow

1. **User enters credentials** in the login form
2. **App validates input** (email format, required fields)
3. **Connection test** to ensure server is reachable
4. **API call** to `http://10.211.147.133:8080/api/v1/auth/login`
5. **Response handling**:
   - Success: Parse response, store session data, navigate to guest details page
   - Failure: Show appropriate error message
6. **Guest details display** using the authenticated guest's data

## Key Features Implemented

✅ **Real API Authentication**: No more mock login  
✅ **Loading States**: Button shows spinner during authentication  
✅ **Error Handling**: Proper error messages for different failure scenarios  
✅ **Server Connectivity**: Tests connection before attempting login  
✅ **Direct Navigation**: Successful login goes straight to guest details  
✅ **Session Management**: Login response is parsed and stored  
✅ **Guest Profile Display**: Shows all guest data including QR code and image  

## Testing the App

The app should now:
1. Accept real email/password credentials
2. Authenticate against your API server at `http://10.211.147.133:8080`
3. Display the guest's complete profile information upon successful login
4. Show appropriate error messages for failed login attempts

## Notes

- All compilation errors have been resolved
- The app maintains the existing UI/UX design
- The guest details page displays all the response data fields
- QR code and profile images are properly handled
- Error states and loading states are implemented throughout

The integration is complete and ready for testing with real credentials from your API system.