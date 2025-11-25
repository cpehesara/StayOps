// src/api/admin.js

// Detect environment and choose correct backend URL
// Replace with your real LAN IP (e.g., 192.168.1.23)
const LAPTOP_IP = "192.168.1.23"; 

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "https://nonprotuberant-nonprojective-son.ngrok-free.dev/api"           // when running on laptop
    : `http://${LAPTOP_IP}:8080/api`;       // when accessed from phone/LAN

// Basic Auth header
const authHeader = () => {
  const credentials = btoa("admin:admin"); // encode admin/admin
  return {
    "Content-Type": "application/json",
    "Authorization": `Basic ${credentials}`,
  };
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: authHeader(),
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

export const adminAPI = {
  // Receptionist Management
  registerReceptionist: async (receptionistData) => {
    return apiRequest('/receptionists/register', {
      method: "POST",
      body: JSON.stringify(receptionistData),
    });
  },

  getReceptionists: async () => {
    return apiRequest('/receptionists');
  },

  updateReceptionist: async (id, receptionistData) => {
    return apiRequest(`/receptionists/${id}`, {
      method: "PUT",
      body: JSON.stringify(receptionistData),
    });
  },

  deleteReceptionist: async (id) => {
    return apiRequest(`/receptionists/${id}`, {
      method: "DELETE",
    });
  },

  // Room Management
  getRooms: async () => {
    return apiRequest('/rooms');
  },

  createRoom: async (roomData) => {
    return apiRequest('/rooms', {
      method: "POST",
      body: JSON.stringify(roomData),
    });
  },

  updateRoom: async (id, roomData) => {
    return apiRequest(`/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(roomData),
    });
  },

  deleteRoom: async (id) => {
    return apiRequest(`/rooms/${id}`, {
      method: "DELETE",
    });
  },

  getRoomStats: async () => {
    return apiRequest('/rooms/stats');
  },

  // User Management
  getUsers: async () => {
    return apiRequest('/users');
  },

  createUser: async (userData) => {
    return apiRequest('/users', {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id, userData) => {
    return apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id) => {
    return apiRequest(`/users/${id}`, {
      method: "DELETE",
    });
  },

  // System Settings
  getSystemSettings: async () => {
    return apiRequest('/system/settings');
  },

  updateSystemSettings: async (settings) => {
    return apiRequest('/system/settings', {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  // Authentication
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: "POST",
    });
  },

  // Reports
  getReports: async (type, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/${type}?${queryString}`);
  },

  // Health Check
  healthCheck: async () => {
    return apiRequest('/health');
  }
};
