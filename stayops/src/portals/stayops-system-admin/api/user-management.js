import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch all users from the system
 */
export const fetchAllUsers = async () => {
  try {
    const response = await api.get('/users/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role) => {
  try {
    const response = await api.get(`/users/role/${role}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

/**
 * Get active users
 */
export const getActiveUsers = async () => {
  try {
    const response = await api.get('/users/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch active users');
  }
};

/**
 * Create a new user based on role
 */
export const createUser = async (userData) => {
  try {
    const role = userData.role.toUpperCase();
    let endpoint = '';
    let payload = {};

    switch (role) {
      case 'SYSTEM_ADMIN':
        endpoint = '/system-admins';
        payload = {
          username: userData.username || userData.email.split('@')[0],
          password: userData.password,
          email: userData.email,
          fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          phone: userData.phone || '',
          department: userData.department || 'Administration'
        };
        break;

      case 'SERVICE_MANAGER':
        endpoint = '/service-managers';
        payload = {
          username: userData.username || userData.email.split('@')[0],
          password: userData.password,
          email: userData.email,
          fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          phone: userData.phone || '',
          department: userData.department || 'Service',
          specialization: userData.specialization || 'General Service'
        };
        break;

      case 'OPERATIONAL_MANAGER':
        endpoint = '/operational-managers';
        payload = {
          username: userData.username || userData.email.split('@')[0],
          password: userData.password,
          email: userData.email,
          fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          phone: userData.phone || '',
          department: userData.department || 'Operations',
          operationalAreas: userData.operationalAreas || 'General Operations',
          shiftType: userData.shiftType || 'DAY'
        };
        break;

      case 'RECEPTIONIST':
        endpoint = '/receptionists/register';
        payload = {
          username: userData.username || userData.email.split('@')[0],
          password: userData.password,
          email: userData.email,
          fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          phone: userData.phone || '',
          shiftType: userData.shiftType || 'DAY',
          deskNumber: userData.deskNumber || '1'
        };
        break;

      default:
        throw new Error('Invalid user role');
    }

    const response = await api.post(endpoint, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.response?.data || 
                        'Failed to create user';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to create user');
  }
};

/**
 * Update user information based on role
 */
export const updateUser = async (userId, userData) => {
  try {
    // First get the user to determine their role and entity ID
    const user = await getUserById(userId);
    const role = user.role.toUpperCase();
    const entityId = user.entityId;

    if (!entityId) {
      throw new Error('User entity ID not found');
    }

    let endpoint = '';
    let payload = {};

    switch (role) {
      case 'SYSTEM_ADMIN':
        endpoint = `/system-admins/${entityId}`;
        payload = {
          fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          phone: userData.phone,
          department: userData.department,
          active: userData.active !== undefined ? userData.active : true
        };
        break;

      case 'SERVICE_MANAGER':
        endpoint = `/service-managers/${entityId}`;
        payload = {
          fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          phone: userData.phone,
          department: userData.department,
          specialization: userData.specialization,
          active: userData.active !== undefined ? userData.active : true
        };
        break;

      case 'OPERATIONAL_MANAGER':
        endpoint = `/operational-managers/${entityId}`;
        payload = {
          fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          phone: userData.phone,
          department: userData.department,
          operationalAreas: userData.operationalAreas,
          shiftType: userData.shiftType,
          active: userData.active !== undefined ? userData.active : true
        };
        break;

      case 'RECEPTIONIST':
        endpoint = `/receptionists/${entityId}`;
        payload = {
          fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          phone: userData.phone,
          shiftType: userData.shiftType,
          deskNumber: userData.deskNumber,
          active: userData.active !== undefined ? userData.active : true
        };
        break;

      default:
        throw new Error('Invalid user role');
    }

    const response = await api.put(endpoint, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.response?.data || 
                        'Failed to update user';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to update user');
  }
};

/**
 * Deactivate a user
 */
export const deactivateUser = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw new Error(error.response?.data?.message || 'Failed to deactivate user');
  }
};

/**
 * Activate a user
 */
export const activateUser = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/activate`);
    return response.data;
  } catch (error) {
    console.error('Error activating user:', error);
    throw new Error(error.response?.data?.message || 'Failed to activate user');
  }
};

/**
 * Delete a user (soft delete through deactivation or hard delete)
 */
export const deleteUser = async (userId) => {
  try {
    // First get the user to determine their role and entity ID
    const user = await getUserById(userId);
    const role = user.role.toUpperCase();
    const entityId = user.entityId;

    if (!entityId) {
      throw new Error('User entity ID not found');
    }

    let endpoint = '';

    switch (role) {
      case 'SYSTEM_ADMIN':
        endpoint = `/system-admins/${entityId}`;
        break;
      case 'SERVICE_MANAGER':
        endpoint = `/service-managers/${entityId}`;
        break;
      case 'OPERATIONAL_MANAGER':
        endpoint = `/operational-managers/${entityId}`;
        break;
      case 'RECEPTIONIST':
        endpoint = `/receptionists/${entityId}`;
        break;
      default:
        throw new Error('Invalid user role');
    }

    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.response?.data || 
                        'Failed to delete user';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to delete user');
  }
};

/**
 * Check if email exists
 */
export const checkEmailExists = async (email) => {
  try {
    const response = await api.get(`/users/check-email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
};

/**
 * Check if username exists
 */
export const checkUsernameExists = async (username) => {
  try {
    const response = await api.get(`/users/check-username/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

/**
 * Get user statistics
 */
export const getUserStatistics = async () => {
  try {
    const allUsers = await fetchAllUsers();
    
    const stats = {
      total: allUsers.length,
      active: allUsers.filter(u => u.active).length,
      inactive: allUsers.filter(u => !u.active).length,
      byRole: {
        SYSTEM_ADMIN: allUsers.filter(u => u.role === 'SYSTEM_ADMIN').length,
        SERVICE_MANAGER: allUsers.filter(u => u.role === 'SERVICE_MANAGER').length,
        OPERATIONAL_MANAGER: allUsers.filter(u => u.role === 'OPERATIONAL_MANAGER').length,
        RECEPTIONIST: allUsers.filter(u => u.role === 'RECEPTIONIST').length,
      }
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw new Error('Failed to fetch user statistics');
  }
};

/**
 * Bulk operations
 */
export const bulkActivateUsers = async (userIds) => {
  try {
    const promises = userIds.map(id => activateUser(id));
    await Promise.all(promises);
    return { success: true, count: userIds.length };
  } catch (error) {
    console.error('Error in bulk activate:', error);
    throw new Error('Failed to activate users');
  }
};

export const bulkDeactivateUsers = async (userIds) => {
  try {
    const promises = userIds.map(id => deactivateUser(id));
    await Promise.all(promises);
    return { success: true, count: userIds.length };
  } catch (error) {
    console.error('Error in bulk deactivate:', error);
    throw new Error('Failed to deactivate users');
  }
};

export const bulkDeleteUsers = async (userIds) => {
  try {
    const promises = userIds.map(id => deleteUser(id));
    await Promise.all(promises);
    return { success: true, count: userIds.length };
  } catch (error) {
    console.error('Error in bulk delete:', error);
    throw new Error('Failed to delete users');
  }
};

/**
 * Export users to CSV
 */
export const exportUsersToCSV = async (users) => {
  try {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Phone', 'Department', 'Created At'];
    const rows = users.map(user => [
      user.id,
      `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      user.email,
      user.role,
      user.status,
      user.phone || '',
      user.department || '',
      new Date(user.createdAt).toLocaleDateString()
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (error) {
    console.error('Error exporting users:', error);
    throw new Error('Failed to export users');
  }
};

/**
 * Get user details with role-specific information
 */
export const getUserDetails = async (userId) => {
  try {
    const user = await getUserById(userId);
    const role = user.role.toUpperCase();
    const entityId = user.entityId;

    if (!entityId) {
      return user;
    }

    let roleSpecificData = {};
    let endpoint = '';

    switch (role) {
      case 'SYSTEM_ADMIN':
        endpoint = `/system-admins/${entityId}`;
        break;
      case 'SERVICE_MANAGER':
        endpoint = `/service-managers/${entityId}`;
        break;
      case 'OPERATIONAL_MANAGER':
        endpoint = `/operational-managers/${entityId}`;
        break;
      case 'RECEPTIONIST':
        endpoint = `/receptionists/${entityId}`;
        break;
    }

    if (endpoint) {
      const response = await api.get(endpoint);
      roleSpecificData = response.data;
    }

    return {
      ...user,
      roleSpecificData
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw new Error('Failed to fetch user details');
  }
};

export default {
  fetchAllUsers,
  getUserById,
  getUsersByRole,
  getActiveUsers,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
  deleteUser,
  checkEmailExists,
  checkUsernameExists,
  getUserStatistics,
  bulkActivateUsers,
  bulkDeactivateUsers,
  bulkDeleteUsers,
  exportUsersToCSV,
  getUserDetails
};