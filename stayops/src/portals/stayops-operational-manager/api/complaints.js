import { API_BASE_URL as OM_API_BASE_URL } from '../../../config/api';
const API_ROOT = `${OM_API_BASE_URL}/api`;

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

const handle = async (resp, fallbackMsg) => {
  if (!resp.ok) {
    let errorDetails = '';
    try {
      const errorData = await resp.json();
      errorDetails = JSON.stringify(errorData);
    } catch {
      errorDetails = await resp.text().catch(() => '');
    }
    
    const msg = errorDetails || fallbackMsg || `HTTP ${resp.status}`;
    console.error('API Error:', {
      status: resp.status,
      statusText: resp.statusText,
      details: errorDetails
    });
    throw new Error(msg);
  }
  try {
    return await resp.json();
  } catch {
    return null;
  }
};

export const complaintsAPI = {
  // Create complaint
  createComplaint: async (complaintData, guestId) => {
    const normalizeGuestId = (gid) => {
      if (!gid) return '';
      const m = String(gid).match(/\d+/);
      return m ? m[0] : String(gid);
    };
    const numericGuestId = normalizeGuestId(guestId);
    const response = await fetch(
      `${API_ROOT}/complaints${numericGuestId ? `?guestId=${numericGuestId}` : ''}`,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          ...(numericGuestId ? { 'X-Guest-Id': String(numericGuestId) } : {}),
        },
        body: JSON.stringify(
          numericGuestId
            ? { ...complaintData, guestId: Number(numericGuestId) || numericGuestId }
            : complaintData
        ),
      }
    );
    return handle(response, 'Failed to create complaint');
  },

  // Update complaint
  updateComplaint: async (complaintId, updateData, guestId) => {
    const normalizeGuestId = (gid) => {
      if (!gid) return '';
      const gidStr = String(gid);
      // Extract only numeric characters from strings like "GUEST468148"
      const m = gidStr.match(/\d+/);
      return m ? m[0] : '';
    };
    const numericGuestId = normalizeGuestId(
      guestId || updateData?.guestId || updateData?.guestID || updateData?.guest_id
    );
    
    // Create a clean update payload without guestId field (it should only be in query param)
    const cleanUpdateData = { ...updateData };
    delete cleanUpdateData.guestId;
    delete cleanUpdateData.guestID;
    delete cleanUpdateData.guest_id;
    delete cleanUpdateData.guestName;
    
    console.log('Sending update request:', {
      url: `${API_ROOT}/complaints/${complaintId}${numericGuestId ? `?guestId=${numericGuestId}` : ''}`,
      data: cleanUpdateData,
      extractedGuestId: numericGuestId,
    });
    
    const response = await fetch(`${API_ROOT}/complaints/${complaintId}${numericGuestId ? `?guestId=${numericGuestId}` : ''}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(cleanUpdateData),
    });
    return handle(response, 'Failed to update complaint');
  },

  // Delete complaint
  deleteComplaint: async (complaintId, guestId) => {
    const normalizeGuestId = (gid) => {
      if (!gid) return '';
      const gidStr = String(gid);
      // Extract only numeric characters from strings like "GUEST468148"
      const m = gidStr.match(/\d+/);
      return m ? m[0] : '';
    };
    const numericGuestId = normalizeGuestId(guestId);
    const response = await fetch(
      `${API_ROOT}/complaints/${complaintId}${numericGuestId ? `?guestId=${numericGuestId}` : ''}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );
    await handle(response, 'Failed to delete complaint');
  },

  // Get complaint by ID
  getComplaint: async (complaintId) => {
    const response = await fetch(`${API_ROOT}/complaints/${complaintId}`, {
      headers: getAuthHeaders(),
    });
    return handle(response, 'Failed to fetch complaint');
  },

  // Get guest complaints
  getGuestComplaints: async (guestId) => {
    const response = await fetch(`${API_ROOT}/complaints/guest/${guestId}`, {
      headers: getAuthHeaders(),
    });
    return handle(response, 'Failed to fetch guest complaints');
  },

  // Get complaints by status
  getComplaintsByStatus: async (status) => {
    const response = await fetch(`${API_ROOT}/complaints/status/${status}`, {
      headers: getAuthHeaders(),
    });
    const result = await handle(response, 'Failed to fetch complaints');
    return result || [];
  },

  // Get complaints by category
  getComplaintsByCategory: async (category) => {
    const response = await fetch(
      `${API_ROOT}/complaints/category/${category}`,
      { headers: getAuthHeaders() }
    );
    const result = await handle(response, 'Failed to fetch complaints');
    return result || [];
  },

  // Get complaints by priority
  getComplaintsByPriority: async (priority) => {
    const response = await fetch(
      `${API_ROOT}/complaints/priority/${priority}`,
      { headers: getAuthHeaders() }
    );
    const result = await handle(response, 'Failed to fetch complaints');
    return result || [];
  },

  // Get staff complaints
  getStaffComplaints: async (staffId) => {
    const response = await fetch(`${API_ROOT}/complaints/staff/${staffId}`, {
      headers: getAuthHeaders(),
    });
    const result = await handle(response, 'Failed to fetch staff complaints');
    return result || [];
  },

  // Get active complaints
  getActiveComplaints: async () => {
    const response = await fetch(`${API_ROOT}/complaints/active`, {
      headers: getAuthHeaders(),
    });
    const result = await handle(response, 'Failed to fetch active complaints');
    return result || [];
  },

  // Get complaint count by status
  getComplaintCountByStatus: async (status) => {
    const response = await fetch(
      `${API_ROOT}/complaints/count/status/${status}`,
      { headers: getAuthHeaders() }
    );
    return handle(response, 'Failed to fetch complaint count');
  },
};