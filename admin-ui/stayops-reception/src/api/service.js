// src/api/service.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// Standard headers without authentication
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// ✅ Create new service request
export const createServiceRequest = async (serviceRequestData) => {
  try {
    console.log('Creating service request:', serviceRequestData);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/service-requests`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(serviceRequestData),
    });
    
    console.log('Service request creation response status:', response.status);
    console.log('Service request creation response headers:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      
      let parsedError;
      try {
        parsedError = JSON.parse(errorText);
        console.error('Parsed backend error:', parsedError);
      } catch (parseError) {
        console.error('Could not parse error response as JSON:', parseError);
      }
      
      throw new Error(`Failed to create service request: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Created service request:', data);
    return data;
  } catch (error) {
    console.error('Error creating service request:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      serviceRequestData: serviceRequestData
    });
    throw error;
  }
};

// ✅ Update service request
export const updateServiceRequest = async (id, serviceRequestData) => {
  try {
    console.log(`Updating service request ${id}:`, serviceRequestData);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/service-requests/${id}`, {
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

// ✅ Get service request by ID
export const getServiceRequestById = async (id) => {
  try {
    console.log(`Fetching service request ${id}`);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/service-requests/${id}`, {
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

// ✅ Get all service requests
export const getAllServiceRequests = async () => {
  try {
    console.log('Fetching all service requests');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/service-requests`, {
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

// ✅ Delete service request
export const deleteServiceRequest = async (id) => {
  try {
    console.log(`Deleting service request ${id}`);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/service-requests/${id}`, {
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

// ✅ Get service requests by status (if needed for filtering)
export const getServiceRequestsByStatus = async (status) => {
  try {
    console.log(`Fetching service requests with status: ${status}`);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/service-requests?status=${encodeURIComponent(status)}`, {
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

// ✅ Get service requests by guest ID (if needed for guest-specific requests)
export const getServiceRequestsByGuestId = async (guestId) => {
  try {
    console.log(`Fetching service requests for guest: ${guestId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/service-requests?guestId=${encodeURIComponent(guestId)}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service requests by guest ID: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched service requests for guest ${guestId}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching service requests by guest ID:', error);
    throw error;
  }
};

// ✅ Mark service request as completed
export const markServiceRequestCompleted = async (id) => {
  try {
    console.log(`Marking service request ${id} as completed`);
    
    // First get the current request data
    const currentRequest = await getServiceRequestById(id);
    
    // Update with completed status
    const updatedRequest = {
      ...currentRequest,
      status: 'COMPLETED',
      completedAt: new Date().toISOString()
    };
    
    return await updateServiceRequest(id, updatedRequest);
  } catch (error) {
    console.error('Error marking service request as completed:', error);
    throw error;
  }
};

// ✅ Mark service request as in progress
export const markServiceRequestInProgress = async (id) => {
  try {
    console.log(`Marking service request ${id} as in progress`);
    
    // First get the current request data
    const currentRequest = await getServiceRequestById(id);
    
    // Update with in progress status
    const updatedRequest = {
      ...currentRequest,
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString()
    };
    
    return await updateServiceRequest(id, updatedRequest);
  } catch (error) {
    console.error('Error marking service request as in progress:', error);
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
  getServiceRequestsByGuestId,
  markServiceRequestCompleted,
  markServiceRequestInProgress
};