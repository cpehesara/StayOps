// src/portals/stayops-receptionist/api/receptionistService.js
import { API_BASE_URL } from '../../../config/api';

const BASE_URL = `${API_BASE_URL}/api/receptionists`;

// Get auth headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
});

// Handle API response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'API request failed');
  }
  return response.json();
};

/**
 * Receptionist Management API
 */

// Create new receptionist
export const createReceptionist = async (receptionistData) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(receptionistData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating receptionist:', error);
    throw error;
  }
};

// Update receptionist by ID
export const updateReceptionist = async (id, updateData) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating receptionist:', error);
    throw error;
  }
};

// Get receptionist by ID
export const getReceptionistById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting receptionist by ID:', error);
    throw error;
  }
};

// Get all receptionists
export const getAllReceptionists = async () => {
  try {
    const response = await fetch(`${BASE_URL}/getAll`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting all receptionists:', error);
    throw error;
  }
};

// Delete receptionist by ID
export const deleteReceptionist = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting receptionist:', error);
    throw error;
  }
};

// Get receptionist by user ID
export const getReceptionistByUserId = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/user/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting receptionist by user ID:', error);
    throw error;
  }
};

// Get current receptionist profile (based on logged-in user)
export const getCurrentReceptionistProfile = async () => {
  try {
    // Get current user data from session storage
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    if (!userData.id) {
      throw new Error('No user session found');
    }

    // Fetch receptionist data using user ID
    return await getReceptionistByUserId(userData.id);
  } catch (error) {
    console.error('Error getting current receptionist profile:', error);
    throw error;
  }
};

// Update current receptionist profile
export const updateCurrentReceptionistProfile = async (profileData) => {
  try {
    // Get current user data from session storage
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    if (!userData.id) {
      throw new Error('No user session found');
    }

    // First get the receptionist ID by user ID
    const receptionistProfile = await getReceptionistByUserId(userData.id);
    
    // Then update using the receptionist ID
    return await updateReceptionist(receptionistProfile.id, profileData);
  } catch (error) {
    console.error('Error updating current receptionist profile:', error);
    throw error;
  }
};

export default {
  createReceptionist,
  updateReceptionist,
  getReceptionistById,
  getAllReceptionists,
  deleteReceptionist,
  getReceptionistByUserId,
  getCurrentReceptionistProfile,
  updateCurrentReceptionistProfile
};