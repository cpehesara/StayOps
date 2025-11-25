// src/services/authService.js
import { API_BASE_URL, API_ENDPOINTS, ROLE_ROUTES } from '../config/api';

class AuthService {
  /**
   * Login user with backend API
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WEB_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Invalid email or password');
      }

      const data = await response.json();
      
      // Transform backend response to frontend format
      const userData = {
        id: data.userId,
        email: data.email,
        name: data.fullName || data.username,
        role: data.role,
        username: data.username,
        portal: ROLE_ROUTES[data.role] || '/dashboard',
        token: data.token || `token_${Date.now()}`, // Use backend token or generate temporary one
        entityId: data.entityId
      };

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Validate token with backend
   */
  async validateToken(token) {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.VALIDATE_TOKEN}?token=${token}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          }
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.valid || false;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        }
      });
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  /**
   * Debug: Get all users from backend
   */
  async debugUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DEBUG_USERS}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Debug users error:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER_BY_EMAIL(email)}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }
}

export default new AuthService();