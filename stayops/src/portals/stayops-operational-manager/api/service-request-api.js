import api from '../../../utils/api';

const BASE_URL = '/api/service-requests';

/**
 * Service Request API
 * Handles all service request operations
 */

// ========== CRUD OPERATIONS ==========

export const createServiceRequest = async (data) => {
  try {
    const response = await api.post(`${BASE_URL}/create`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating service request:', error);
    throw error;
  }
};

export const getServiceRequestById = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service request:', error);
    throw error;
  }
};

export const getAllServiceRequests = async () => {
  try {
    const response = await api.get(`${BASE_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all service requests:', error);
    throw error;
  }
};

export const updateServiceRequest = async (id, data) => {
  try {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating service request:', error);
    throw error;
  }
};

export const deleteServiceRequest = async (id) => {
  try {
    await api.delete(`${BASE_URL}/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting service request:', error);
    throw error;
  }
};

// ========== FILTERING & SEARCH ==========

export const getServiceRequestsByStatus = async (status) => {
  try {
    const response = await api.get(`${BASE_URL}/status/${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service requests by status:', error);
    throw error;
  }
};

export const getServiceRequestsByType = async (serviceType) => {
  try {
    const response = await api.get(`${BASE_URL}/type/${serviceType}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service requests by type:', error);
    throw error;
  }
};

export const getServiceRequestsByPriority = async (priority) => {
  try {
    const response = await api.get(`${BASE_URL}/priority/${priority}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service requests by priority:', error);
    throw error;
  }
};

export const getServiceRequestsByReservation = async (reservationId) => {
  try {
    const response = await api.get(`${BASE_URL}/reservation/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service requests by reservation:', error);
    throw error;
  }
};

export const getServiceRequestsByRoom = async (roomId) => {
  try {
    const response = await api.get(`${BASE_URL}/room/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service requests by room:', error);
    throw error;
  }
};

export const getServiceRequestsByAssignedStaff = async (staffId) => {
  try {
    const response = await api.get(`${BASE_URL}/staff/${staffId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service requests by staff:', error);
    throw error;
  }
};

export const getServiceRequestsByGuest = async (guestId) => {
  try {
    const response = await api.get(`${BASE_URL}/guest/${guestId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service requests by guest:', error);
    throw error;
  }
};

export const getPendingRequests = async () => {
  try {
    const response = await api.get(`${BASE_URL}/pending`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    throw error;
  }
};

export const getUrgentRequests = async () => {
  try {
    const response = await api.get(`${BASE_URL}/urgent`);
    return response.data;
  } catch (error) {
    console.error('Error fetching urgent requests:', error);
    throw error;
  }
};

export const getIncompleteRequests = async () => {
  try {
    const response = await api.get(`${BASE_URL}/incomplete`);
    return response.data;
  } catch (error) {
    console.error('Error fetching incomplete requests:', error);
    throw error;
  }
};

export const getServiceRequestsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`${BASE_URL}/date-range`, {
      params: {
        startDate: startDate,
        endDate: endDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching service requests by date range:', error);
    throw error;
  }
};

// ========== STATUS UPDATES & ASSIGNMENT ==========

export const assignToStaff = async (id, staffId) => {
  try {
    const response = await api.patch(`${BASE_URL}/${id}/assign`, null, {
      params: { staffId }
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning service request to staff:', error);
    throw error;
  }
};

export const updateServiceRequestStatus = async (id, status) => {
  try {
    const response = await api.patch(`${BASE_URL}/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating service request status:', error);
    throw error;
  }
};

export const markAsCompleted = async (id) => {
  try {
    const response = await api.post(`${BASE_URL}/${id}/complete`);
    return response.data;
  } catch (error) {
    console.error('Error marking service request as completed:', error);
    throw error;
  }
};

export default {
  createServiceRequest,
  getServiceRequestById,
  getAllServiceRequests,
  updateServiceRequest,
  deleteServiceRequest,
  getServiceRequestsByStatus,
  getServiceRequestsByType,
  getServiceRequestsByPriority,
  getServiceRequestsByReservation,
  getServiceRequestsByRoom,
  getServiceRequestsByAssignedStaff,
  getServiceRequestsByGuest,
  getPendingRequests,
  getUrgentRequests,
  getIncompleteRequests,
  getServiceRequestsByDateRange,
  assignToStaff,
  updateServiceRequestStatus,
  markAsCompleted
};