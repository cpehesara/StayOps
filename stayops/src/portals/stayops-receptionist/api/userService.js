// src/portals/stayops-receptionist/api/userService.js
import { API_BASE_URL } from '../../../config/api';

const BASE_URL = `${API_BASE_URL}/api/users`;
const RECEPTIONIST_BASE_URL = `${API_BASE_URL}/api/receptionists`;

// Get auth headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
});

// Handle API response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
};

/**
 * User Profile Management
 */

// Get current user profile (specifically for receptionists)
export const getCurrentUserProfile = async () => {
  try {
    // Get current user data from session storage
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    if (!userData.id) {
      throw new Error('No user session found');
    }

    // Check if user is a receptionist and return profile from session data
    if (userData.role === 'RECEPTIONIST') {
      // Use session data directly since backend receptionist profile endpoint is not available
      return {
        id: userData.id,
        fullName: userData.name || userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        department: 'Receptionist',
        role: userData.role,
        shift: userData.shift || '',
        employeeId: userData.employeeId || '',
        startDate: userData.startDate || '',
        status: 'ACTIVE',
        // Additional receptionist-specific fields
        receptionistId: userData.id,
        emergencyContact: userData.emergencyContact || '',
        address: userData.address || '',
        skills: userData.skills || []
      };
    }

    // For non-receptionist users, use the generic user API
    const response = await fetch(`${BASE_URL}/get/${userData.id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting current user profile:', error);
    throw error;
  }
};

// Update current user profile (specifically for receptionists)
export const updateCurrentUserProfile = async (profileData) => {
  try {
    // Get current user data from session storage
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    if (!userData.id) {
      throw new Error('No user session found');
    }

    // Check if user is a receptionist - update session storage
    if (userData.role === 'RECEPTIONIST') {
      // Update session storage with new profile data
      const updatedUserData = {
        ...userData,
        name: profileData.fullName,
        fullName: profileData.fullName,
        phone: profileData.phone || profileData.phoneNumber,
        department: profileData.department,
        shift: profileData.shift,
        emergencyContact: profileData.emergencyContact,
        address: profileData.address,
        skills: profileData.skills || []
      };
      
      sessionStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      // Return the updated data
      return {
        success: true,
        message: 'Profile updated successfully',
        data: updatedUserData
      };
    }

    // For non-receptionist users or if receptionist update fails, use the generic user API
    const response = await fetch(`${BASE_URL}/profile/${userData.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change current user password
export const changeCurrentUserPassword = async (currentPassword, newPassword) => {
  try {
    // Get current user data from session storage
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    if (!userData.id) {
      throw new Error('No user session found');
    }

    const response = await fetch(`${BASE_URL}/password/change/${userData.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Upload user avatar
export const uploadCurrentUserAvatar = async (file) => {
  try {
    // Get current user data from session storage
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    if (!userData.id) {
      throw new Error('No user session found');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${BASE_URL}/profile/avatar/${userData.id}`, {
      method: 'POST',
      headers: {
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      },
      body: formData,
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

// Enable/Disable Two-Factor Authentication
export const updateTwoFactorAuth = async (enabled, method = 'EMAIL') => {
  try {
    // Get current user data from session storage
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    if (!userData.id) {
      throw new Error('No user session found');
    }

    const endpoint = enabled ? 'enable' : 'disable';
    const body = enabled ? JSON.stringify({ method }) : undefined;

    const response = await fetch(`${BASE_URL}/2fa/${endpoint}/${userData.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: body,
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating two-factor auth:', error);
    throw error;
  }
};

// Get user preferences/settings
export const getUserSettings = async () => {
  try {
    // Get current user data from session storage
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    if (!userData.id) {
      throw new Error('No user session found');
    }

    const response = await fetch(`${BASE_URL}/settings/${userData.id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting user settings:', error);
    // Return default settings if API call fails
    return {
      notifications: {
        email: true,
        push: false,
        sms: true
      },
      appearance: {
        theme: 'light',
        language: 'en'
      },
      security: {
        twoFactor: false,
        sessionTimeout: 30
      }
    };
  }
};

// Update user preferences/settings
export const updateUserSettings = async (settings) => {
  try {
    // Get current user data from session storage
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    if (!userData.id) {
      throw new Error('No user session found');
    }

    const response = await fetch(`${BASE_URL}/settings/${userData.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

export default {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  changeCurrentUserPassword,
  uploadCurrentUserAvatar,
  updateTwoFactorAuth,
  getUserSettings,
  updateUserSettings
};