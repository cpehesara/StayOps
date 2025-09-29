// Guest authentication API functions aligned with Spring Boot AuthController

const API_BASE_URL = "http://localhost:8080/api/v1";

// Standard headers without authentication
const getHeaders = () => ({
  "Content-Type": "application/json",
});

export const guestAuthAPI = {
  // POST /api/v1/auth/login
  login: async (loginData) => {
    try {
      console.log("Attempting guest login with:", loginData);
      console.log("Request URL:", `${API_BASE_URL}/auth/login`);
      console.log("Request headers:", getHeaders());
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(loginData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);

      // Handle different response scenarios
      let data = null;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.warn("Failed to parse JSON response:", jsonError);
          data = { message: "Invalid JSON response from server" };
        }
      } else {
        // Handle non-JSON responses
        const textResponse = await response.text();
        console.log("Non-JSON response:", textResponse);
        data = { 
          message: textResponse || `HTTP ${response.status}: ${response.statusText}`,
          rawResponse: textResponse 
        };
      }

      console.log("Parsed response data:", data);

      if (!response.ok) {
        // Handle specific error cases with more helpful messages
        if (response.status === 401) {
          throw new Error(`Authentication failed: The credentials '${loginData.email}' / '${loginData.password}' are not valid. Check if this guest user exists in the backend database.`);
        } else if (response.status === 404) {
          throw new Error("Login endpoint not found. Please check if the backend server is running and the AuthController is properly mapped.");
        } else if (response.status === 500) {
          throw new Error(`Server error (${response.status}): ${data?.message || response.statusText}. Check backend logs for details.`);
        } else if (response.status === 403) {
          throw new Error("Forbidden: The request was understood but refused. Check Spring Security configuration.");
        } else {
          throw new Error(data?.message || `HTTP Error: ${response.status} ${response.statusText}`);
        }
      }

      // Store token if available in response
      if (data && (data.token || data.accessToken || data.jwtToken)) {
        const token = data.token || data.accessToken || data.jwtToken;
        localStorage.setItem("guestToken", token);
        console.log("Token stored:", token);
      } else {
        console.warn("No token found in successful response:", data);
      }

      return data;
    } catch (error) {
      console.error("Guest login error:", error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error("Network error: Cannot connect to server. Please check if the backend is running on localhost:8080");
      }
      
      throw error;
    }
  },

  // POST /api/v1/auth/validate-token
  validateToken: async (token) => {
    try {
      const tokenToValidate = token || localStorage.getItem("guestToken");
      
      if (!tokenToValidate) {
        throw new Error("No token provided for validation");
      }

      const response = await fetch(`${API_BASE_URL}/auth/validate-token?token=${encodeURIComponent(tokenToValidate)}`, {
        method: "POST",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const isValid = await response.json();
      console.log("Token validation result:", isValid);
      
      return isValid;
    } catch (error) {
      console.error("Token validation error:", error);
      throw error;
    }
  },

  // Utility functions
  logout: () => {
    localStorage.removeItem("guestToken");
    console.log("Guest logged out, token removed");
  },

  getToken: () => {
    return localStorage.getItem("guestToken");
  },

  isAuthenticated: async () => {
    const token = localStorage.getItem("guestToken");
    if (!token) return false;
    
    try {
      return await guestAuthAPI.validateToken(token);
    } catch (error) {
      console.error("Authentication check failed:", error);
      return false;
    }
  },
};
