import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const serviceRequestApi = {
  // ========== CRUD OPERATIONS ==========

  /**
   * Create a new service request
   */
  createServiceRequest: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/service-requests/create`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get service request by ID
   */
  getServiceRequestById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all service requests
   */
  getAllServiceRequests: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/all`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update service request
   */
  updateServiceRequest: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/service-requests/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete service request
   */
  deleteServiceRequest: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/service-requests/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ========== FILTERING & SEARCH ==========

  /**
   * Get service requests by status
   */
  getByStatus: async (status) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/status/${status}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get service requests by type
   */
  getByType: async (serviceType) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/type/${serviceType}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get service requests by priority
   */
  getByPriority: async (priority) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/priority/${priority}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get service requests by reservation
   */
  getByReservation: async (reservationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/reservation/${reservationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get service requests by room
   */
  getByRoom: async (roomId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/room/${roomId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get service requests by assigned staff
   */
  getByAssignedStaff: async (staffId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/staff/${staffId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get service requests by guest
   */
  getByGuest: async (guestId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/guest/${guestId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get pending requests
   */
  getPendingRequests: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/pending`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get urgent requests
   */
  getUrgentRequests: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/urgent`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get incomplete requests
   */
  getIncompleteRequests: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/incomplete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get service requests by date range
   */
  getByDateRange: async (startDate, endDate) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-requests/date-range`, {
        params: {
          startDate: startDate,
          endDate: endDate
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ========== STATUS UPDATES & ASSIGNMENT ==========

  /**
   * Assign service request to staff
   */
  assignToStaff: async (id, staffId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/service-requests/${id}/assign`,
        null,
        { params: { staffId } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update service request status
   */
  updateStatus: async (id, status) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/service-requests/${id}/status`,
        null,
        { params: { status } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mark service request as completed
   */
  markAsCompleted: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/service-requests/${id}/complete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ========== SERVICE TYPES ==========

  /**
   * Get all service types
   */
  getAllServiceTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/service-types/getAll`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create service type
   */
  createServiceType: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/service-types/create`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default serviceRequestApi;