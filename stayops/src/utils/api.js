// src/utils/api.js
import axios from 'axios';
import { showApiError, showApiSuccess } from './toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://nonprotuberant-nonprojective-son.ngrok-free.dev',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      showApiError('You do not have permission to perform this action');
    } else if (error.response?.status >= 500) {
      showApiError('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiMethods = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

// Helper function for handling API calls with loading states
export const apiCall = async (apiFunction, options = {}) => {
  const { 
    showLoading = true, 
    showSuccess = false, 
    successMessage = 'Operation completed successfully',
    showError = true 
  } = options;

  try {
    if (showLoading) {
      // You can implement a global loading state here
      console.log('Loading...');
    }

    const response = await apiFunction();
    
    if (showSuccess) {
      showApiSuccess(successMessage);
    }
    
    return { data: response.data, success: true };
  } catch (error) {
    if (showError) {
      showApiError(error);
    }
    return { error, success: false };
  } finally {
    if (showLoading) {
      // Hide loading state
      console.log('Loading complete');
    }
  }
};

export default api;