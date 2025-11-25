// src/api/staff.js

const BASE_URL = 'https://nonprotuberant-nonprojective-son.ngrok-free.dev/api/staff';

/**
 * Create a new staff member
 * @param {Object} staffData - Staff data object
 * @returns {Promise} Response from the API
 */
export const createStaff = async (staffData) => {
  try {
    const response = await fetch(`${BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staffData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating staff:', error);
    throw error;
  }
};

/**
 * Update an existing staff member
 * @param {string} staffId - Staff ID
 * @param {Object} staffData - Updated staff data
 * @returns {Promise} Response from the API
 */
export const updateStaff = async (staffId, staffData) => {
  try {
    const response = await fetch(`${BASE_URL}/update/${staffId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staffData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating staff:', error);
    throw error;
  }
};

/**
 * Delete a staff member
 * @param {string} staffId - Staff ID to delete
 * @returns {Promise} Response from the API
 */
export const deleteStaff = async (staffId) => {
  try {
    const response = await fetch(`${BASE_URL}/delete/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.status === 204 ? { success: true } : await response.json();
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw error;
  }
};

/**
 * Get staff member by ID
 * @param {string} staffId - Staff ID
 * @returns {Promise} Staff data
 */
export const getStaffById = async (staffId) => {
  try {
    const response = await fetch(`${BASE_URL}/get/${staffId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting staff by ID:', error);
    throw error;
  }
};

/**
 * Get all staff members
 * @returns {Promise} Array of all staff
 */
export const getAllStaff = async () => {
  try {
    const response = await fetch(`${BASE_URL}/getAll`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting all staff:', error);
    throw error;
  }
};

// Export all API endpoints
export default {
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffById,
  getAllStaff,
};