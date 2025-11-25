// src/api/service.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// ==================== SERVICE REQUEST CRUD ====================

export const createServiceRequest = async (serviceRequestData) => {
  try {
    console.log('Creating service request:', serviceRequestData);
    
    const response = await fetch(`${API_BASE_URL}/api/service-requests/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(serviceRequestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Failed to create service request: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Created service request:', data);
    return data;
  } catch (error) {
    console.error('Error creating service request:', error);
    throw error;
  }
};

export const updateServiceRequest = async (id, serviceRequestData) => {
  try {
    console.log(`Updating service request ${id}:`, serviceRequestData);
    
    const response = await fetch(`${API_BASE_URL}/api/service-requests/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(serviceRequestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update service request: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Updated service request:', data);
    return data;
  } catch (error) {
    console.error('Error updating service request:', error);
    throw error;
  }
};

export const getServiceRequestById = async (id) => {
  try {
    console.log(`Fetching service request ${id}`);
    
    const response = await fetch(`${API_BASE_URL}/api/service-requests/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service request: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched service request:', data);
    return data;
  } catch (error) {
    console.error('Error fetching service request by ID:', error);
    throw error;
  }
};

export const getAllServiceRequests = async () => {
  try {
    console.log('Fetching all service requests');
    
    const response = await fetch(`${API_BASE_URL}/api/service-requests/all`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service requests: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched all service requests:', data);
    return data;
  } catch (error) {
    console.error('Error fetching all service requests:', error);
    throw error;
  }
};

export const deleteServiceRequest = async (id) => {
  try {
    console.log(`Deleting service request ${id}`);
    
    const response = await fetch(`${API_BASE_URL}/api/service-requests/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete service request: ${response.status}`);
    }

    console.log('Deleted service request:', id);
    return { success: true, id };
  } catch (error) {
    console.error('Error deleting service request:', error);
    throw error;
  }
};

// ==================== SERVICE REQUEST FILTERING ====================

export const getServiceRequestsByStatus = async (status) => {
  try {
    console.log(`Fetching service requests with status: ${status}`);
    
    const response = await fetch(`${API_BASE_URL}/api/service-requests/status/${encodeURIComponent(status)}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service requests by status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched service requests with status ${status}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching service requests by status:', error);
    throw error;
  }
};

export const getServiceRequestsByType = async (serviceType) => {
  try {
    console.log(`Fetching service requests with type: ${serviceType}`);
    
    const response = await fetch(`${API_BASE_URL}/api/service-requests/type/${encodeURIComponent(serviceType)}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service requests by type: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched service requests with type ${serviceType}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching service requests by type:', error);
    throw error;
  }
};

export const getServiceRequestsByPriority = async (priority) => {
  try {
    console.log(`Fetching service requests with priority: ${priority}`);
    
    const response = await fetch(`${API_BASE_URL}/api/service-requests/priority/${encodeURIComponent(priority)}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service requests by priority: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched service requests with priority ${priority}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching service requests by priority:', error);
    throw error;
  }
};

export const getServiceRequestsByReservation = async (reservationId) => {
  try {
    console.log(`Fetching service requests for reservation: ${reservationId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/service-requests/reservation/${reservationId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service requests by reservation: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched service requests for reservation ${reservationId}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching service requests by reservation:', error);
    throw error;
  }
};

export const getServiceRequestsByRoom = async (roomId) => {
  try {
    console.log(`Fetching service requests for room: ${roomId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/service-requests/room/${roomId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service requests by room: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched service requests for room ${roomId}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching service requests by room:', error);
    throw error;
  }
};

export const getServiceRequestsByAssignedStaff = async (staffId) => {
  try {
    console.log(`Fetching service requests for staff: ${staffId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/service-requests/staff/${encodeURIComponent(staffId)}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service requests by staff: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched service requests for staff ${staffId}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching service requests by staff:', error);
    throw error;
  }
};

export const getPendingRequests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/service-requests/pending`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pending requests: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    throw error;
  }
};

export const getUrgentRequests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/service-requests/urgent`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch urgent requests: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching urgent requests:', error);
    throw error;
  }
};

export const getIncompleteRequests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/service-requests/incomplete`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch incomplete requests: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching incomplete requests:', error);
    throw error;
  }
};

// ==================== SERVICE REQUEST STATUS MANAGEMENT ====================

export const assignToStaff = async (requestId, staffId) => {
  try {
    console.log(`Assigning service request ${requestId} to staff ${staffId}`);
    
    const response = await fetch(
      `${API_BASE_URL}/api/service-requests/${requestId}/assign?staffId=${encodeURIComponent(staffId)}`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to assign request: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error assigning service request:', error);
    throw error;
  }
};

export const updateStatus = async (requestId, status) => {
  try {
    console.log(`Updating service request ${requestId} status to ${status}`);
    
    const response = await fetch(
      `${API_BASE_URL}/api/service-requests/${requestId}/status?status=${encodeURIComponent(status)}`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update status: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating service request status:', error);
    throw error;
  }
};

export const markServiceRequestCompleted = async (id) => {
  try {
    console.log(`Marking service request ${id} as completed`);
    
    const response = await fetch(`${API_BASE_URL}/api/service-requests/${id}/complete`, {
      method: "POST",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to mark as completed: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking service request as completed:', error);
    throw error;
  }
};

export const getServiceRequestsByDateRange = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/service-requests/date-range?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch requests by date range: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching service requests by date range:', error);
    throw error;
  }
};

export default {
  createServiceRequest,
  updateServiceRequest,
  getServiceRequestById,
  getAllServiceRequests,
  deleteServiceRequest,
  getServiceRequestsByStatus,
  getServiceRequestsByType,
  getServiceRequestsByPriority,
  getServiceRequestsByReservation,
  getServiceRequestsByRoom,
  getServiceRequestsByAssignedStaff,
  getPendingRequests,
  getUrgentRequests,
  getIncompleteRequests,
  assignToStaff,
  updateStatus,
  markServiceRequestCompleted,
  getServiceRequestsByDateRange
};