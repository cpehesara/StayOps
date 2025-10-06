const API_BASE_URL = 'http://localhost:8080/api';

export const complaintsAPI = {
  // Create complaint
  createComplaint: async (complaintData, guestId) => {
    const response = await fetch(
      `${API_BASE_URL}/complaints?guestId=${guestId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintData),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to create complaint');
    }
    
    return response.json();
  },

  // Update complaint
  updateComplaint: async (complaintId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update complaint');
    }
    
    return response.json();
  },

  // Delete complaint
  deleteComplaint: async (complaintId, guestId) => {
    const response = await fetch(
      `${API_BASE_URL}/complaints/${complaintId}?guestId=${guestId}`,
      {
        method: 'DELETE',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to delete complaint');
    }
  },

  // Get complaint by ID
  getComplaint: async (complaintId) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch complaint');
    }
    
    return response.json();
  },

  // Get guest complaints
  getGuestComplaints: async (guestId) => {
    const response = await fetch(`${API_BASE_URL}/complaints/guest/${guestId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch guest complaints');
    }
    
    return response.json();
  },

  // Get complaints by status
  getComplaintsByStatus: async (status) => {
    const response = await fetch(`${API_BASE_URL}/complaints/status/${status}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch complaints');
    }
    
    return response.json();
  },

  // Get complaints by category
  getComplaintsByCategory: async (category) => {
    const response = await fetch(
      `${API_BASE_URL}/complaints/category/${category}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch complaints');
    }
    
    return response.json();
  },

  // Get complaints by priority
  getComplaintsByPriority: async (priority) => {
    const response = await fetch(
      `${API_BASE_URL}/complaints/priority/${priority}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch complaints');
    }
    
    return response.json();
  },

  // Get staff complaints
  getStaffComplaints: async (staffId) => {
    const response = await fetch(`${API_BASE_URL}/complaints/staff/${staffId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch staff complaints');
    }
    
    return response.json();
  },

  // Get active complaints
  getActiveComplaints: async () => {
    const response = await fetch(`${API_BASE_URL}/complaints/active`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch active complaints');
    }
    
    return response.json();
  },

  // Get complaint count by status
  getComplaintCountByStatus: async (status) => {
    const response = await fetch(
      `${API_BASE_URL}/complaints/count/status/${status}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch complaint count');
    }
    
    return response.json();
  },
};