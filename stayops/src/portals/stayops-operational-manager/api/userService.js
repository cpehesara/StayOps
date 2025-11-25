// src/portals/stayops-receptionist/api/userService.js
import { API_BASE_URL } from '../../../config/api';
import receptionistService from './receptionistService';

const BASE_URL = `${API_BASE_URL}/api/users`;

// Get auth headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
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

    // Check if user is a receptionist and get receptionist-specific data
    if (userData.role === 'RECEPTIONIST') {
      try {
        const receptionistProfile = await receptionistService.getCurrentReceptionistProfile();
        // Map receptionist data to user profile format
        return {
          id: receptionistProfile.userId || userData.id,
          fullName: receptionistProfile.fullName || receptionistProfile.name || userData.name,
          email: receptionistProfile.email || userData.email,
          phone: receptionistProfile.phone || receptionistProfile.phoneNumber || '',
          department: receptionistProfile.department || 'Receptionist',
          role: userData.role,
          shift: receptionistProfile.shift || '',
          employeeId: receptionistProfile.employeeId || '',
          startDate: receptionistProfile.startDate || '',
          status: receptionistProfile.status || 'ACTIVE',
          // Additional receptionist-specific fields
          receptionistId: receptionistProfile.id,
          emergencyContact: receptionistProfile.emergencyContact || '',
          address: receptionistProfile.address || '',
          skills: receptionistProfile.skills || []
        };
      } catch (receptionistError) {
        console.warn('Failed to get receptionist profile, falling back to basic user data:', receptionistError);
        // Fall back to basic user data if receptionist API fails
        return {
          id: userData.id,
          fullName: userData.name || userData.fullName || '',
          email: userData.email || '',
          phone: '',
          department: userData.role || 'Receptionist',
          role: userData.role
        };
      }
    }

    // For non-receptionist users, use the generic user API
    const response = await fetch(`${BASE_URL}/${userData.id}`, {
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

    // Check if user is a receptionist and update receptionist-specific data
    if (userData.role === 'RECEPTIONIST') {
      try {
        // Map profile data to receptionist update format
        const receptionistUpdateData = {
          fullName: profileData.fullName,
          phone: profileData.phone || profileData.phoneNumber,
          department: profileData.department,
          shift: profileData.shift,
          emergencyContact: profileData.emergencyContact,
          address: profileData.address,
          skills: profileData.skills || []
        };

        return await receptionistService.updateCurrentReceptionistProfile(receptionistUpdateData);
      } catch (receptionistError) {
        console.warn('Failed to update receptionist profile, falling back to generic user update:', receptionistError);
        // Fall back to generic user update if receptionist API fails
      }
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