const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Basic Auth Header
const BASIC_AUTH = "Basic " + btoa("admin:admin");

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": BASIC_AUTH,
});

const getFormDataHeaders = () => ({
  "Authorization": BASIC_AUTH,
  // Don't set Content-Type for FormData, let browser set it
});

// Get guest details by ID - Updated to match backend URL pattern
export const getGuestDetails = async (guestId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/guests/${guestId}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched guest details:', data);
    return data;
  } catch (error) {
    console.error('Error fetching guest details:', error);
    throw error;
  }
};

export const receptionAPI = {
  // Register a new guest - Updated to match backend endpoint
  registerGuest: async (guestData, identityImage = null) => {
    try {
      // Backend expects multipart/form-data with 'guest' JSON and optional 'identityImage'
      const formData = new FormData();
      
      // Append guest data as JSON string with key 'guest'
      formData.append('guest', JSON.stringify(guestData));
      
      // Append the image file if provided
      if (identityImage) {
        formData.append('identityImage', identityImage);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/guests/create`, {
        method: "POST",
        // Don't send any headers for public endpoints - let browser handle FormData headers
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to register guest: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error registering guest:", error);
      throw error;
    }
  },

  // Mobile registration endpoint - for guests to set their passwords
  registerGuestFromMobile: async (registrationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/guests/register`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to register from mobile: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error registering guest from mobile:", error);
      throw error;
    }
  },

  // Get all guests - Updated to match backend URL
  getAllGuests: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/guests/getAll`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch guests: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching all guests:", error);
      throw error;
    }
  },

  // Get guest by ID - Updated to match backend URL
  getGuestById: async (guestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/guests/${guestId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch guest details: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching guest by ID:", error);
      throw error;
    }
  },

  // Get guest QR code as image - New endpoint for direct image access
  getGuestQrImage: async (guestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/guests/${guestId}/qr`, {
        method: "GET",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch QR image: ${response.status}`);
      }
      
      // Return the blob for direct use in img src
      return await response.blob();
    } catch (error) {
      console.error("Error fetching guest QR image:", error);
      throw error;
    }
  },

  // Get guest QR code as data URL (from the response DTO)
  getGuestQrDataUrl: (guestResponseDTO) => {
    // The backend already provides qrCodeBase64 as a data URL in the response
    return guestResponseDTO.qrCodeBase64;
  },

  // Update guest - Note: This endpoint doesn't exist in your backend, you might need to add it
  updateGuest: async (guestId, guestData) => {
    try {
      // Since update endpoint doesn't exist in backend, this will likely fail
      // You might want to implement PUT /api/v1/guests/{id} in your backend
      const response = await fetch(`${API_BASE_URL}/api/v1/guests/${guestId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(guestData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update guest: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating guest:", error);
      throw error;
    }
  },

  // Delete guest - Note: This endpoint doesn't exist in your backend, you might need to add it
  deleteGuest: async (guestId) => {
    try {
      // Since delete endpoint doesn't exist in backend, this will likely fail
      // You might want to implement DELETE /api/v1/guests/{id} in your backend
      const response = await fetch(`${API_BASE_URL}/api/v1/guests/${guestId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete guest: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting guest:", error);
      throw error;
    }
  },

  // Get all reservations - USED BY RECEPTIONISTDASHBOARD
  getAllReservations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reservations/reservations`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': BASIC_AUTH,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched reservations:', data);
      return data;
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  },
};

export default receptionAPI;