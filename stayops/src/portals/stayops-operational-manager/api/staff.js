import { API_BASE_URL } from '../../../config/api';
const API_ROOT = `http://localhost:8080/api/staff`;

// Counter for generating sequential staff IDs starting from 003
let staffIdCounter = 3;

const getAuthHeaders = () => {
  let token = null;
  try {
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      token = JSON.parse(userData)?.token || sessionStorage.getItem('token');
    } else {
      token = sessionStorage.getItem('token');
    }
  } catch {
    token = sessionStorage.getItem('token');
  }
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handle = async (response, fallbackMsg) => {
  if (!response.ok) {
    let errorMessage = fallbackMsg || `HTTP ${response.status}`;
    try {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorText || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const staffAPI = {
  /**
   * Fetch all staff members
   */
  getAllStaff: async () => {
    try {
      const response = await fetch(`${API_ROOT}/getAll`, { headers: getAuthHeaders() });
      return await handle(response, 'Failed to fetch staff');
    } catch (error) {
      console.error('getAllStaff error:', error);
      throw error;
    }
  },

  /**
   * Fetch a single staff member by ID
   */
  getStaffById: async (staffId) => {
    try {
      const response = await fetch(`${API_ROOT}/get/${staffId}`, { headers: getAuthHeaders() });
      return await handle(response, 'Failed to fetch staff details');
    } catch (error) {
      console.error('getStaffById error:', error);
      throw error;
    }
  },

  /**
   * Create a new staff member
   */
  createStaff: async (staffData) => {
    try {
      console.log('Sending POST request to:', `${API_ROOT}/create`);
      
      // Generate a unique staff ID if not provided
      const staffId = staffData.staffId || `ST-${String(staffIdCounter).padStart(3, '0')}`;
      
      // Increment counter for next staff member
      if (!staffData.staffId) {
        staffIdCounter++;
      }
      
      const requestPayload = {
        staffId: staffId,
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        role: staffData.role, // RECEPTIONIST, HOUSEKEEPING, CHEF, MANAGER, SECURITY, MAINTENANCE
        status: staffData.status, // ACTIVE, INACTIVE, ON_LEAVE
        hireDate: staffData.hireDate, // LocalDate format: YYYY-MM-DD
        departmentId: parseInt(staffData.departmentId) // Long value
      };
      
      console.log('Request payload:', JSON.stringify(requestPayload, null, 2));

      const response = await fetch(`${API_ROOT}/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestPayload),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await handle(response, 'Failed to create staff');
      console.log('Create successful:', result);
      return result;
    } catch (error) {
      console.error('createStaff error:', error);
      throw error;
    }
  },

  /**
   * Update an existing staff member
   */
  updateStaff: async (staffId, staffData) => {
    try {
      console.log(`Sending PUT request to: ${API_ROOT}/update/${staffId}`);
      console.log('Request payload:', JSON.stringify(staffData, null, 2));
      
      const response = await fetch(`${API_ROOT}/update/${staffId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          staffId: staffData.staffId || staffId,
          name: staffData.name,
          email: staffData.email,
          phone: staffData.phone,
          role: staffData.role, // RECEPTIONIST, HOUSEKEEPING, CHEF, MANAGER, SECURITY, MAINTENANCE
          status: staffData.status, // ACTIVE, INACTIVE, ON_LEAVE
          hireDate: staffData.hireDate, // LocalDate format: YYYY-MM-DD
          departmentId: parseInt(staffData.departmentId) // Long value
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await handle(response, 'Failed to update staff');
      console.log('Update successful:', result);
      return result;
    } catch (error) {
      console.error('updateStaff error:', error);
      throw error;
    }
  },

  /**
   * Delete a staff member by ID
   */
  deleteStaff: async (staffId) => {
    try {
      console.log(`Sending DELETE request to: ${API_ROOT}/delete/${staffId}`);
      
      const response = await fetch(`${API_ROOT}/delete/${staffId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      await handle(response, 'Failed to delete staff');
      console.log('Delete successful');
      return true;
    } catch (error) {
      console.error('deleteStaff error:', error);
      throw error;
    }
  }
};