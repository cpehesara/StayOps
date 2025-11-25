const API_BASE_URL = 'http://localhost:8080/api/v1/guests';

export const guestAPI = {
  /**
   * Fetch all guests
   */
  getAllGuests: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getAll`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch guests:', errorText);
        throw new Error(`Failed to fetch guests: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('getAllGuests error:', error);
      throw error;
    }
  },

  /**
   * Fetch a single guest by ID
   */
  getGuestById: async (guestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${guestId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch guest details:', errorText);
        throw new Error(`Failed to fetch guest details: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('getGuestById error:', error);
      throw error;
    }
  },

  /**
   * Create a new guest with optional identity image
   */
  createGuest: async (guestData, identityImage) => {
    try {
      const formData = new FormData();
      formData.append('guest', new Blob([JSON.stringify(guestData)], { type: 'application/json' }));
      
      if (identityImage) {
        formData.append('identityImage', identityImage);
      }

      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create guest:', errorText);
        throw new Error(`Failed to create guest: ${response.status} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('createGuest error:', error);
      throw error;
    }
  },

  /**
   * Update guest with optional identity image (multipart/form-data)
   * Use this when you need to update the identity image
   */
  updateGuestWithImage: async (guestId, guestData, identityImage) => {
    try {
      console.log(`Sending PUT request with image to: ${API_BASE_URL}/${guestId}`);
      console.log('Request payload:', JSON.stringify(guestData, null, 2));
      
      const formData = new FormData();
      formData.append('guest', new Blob([JSON.stringify(guestData)], { type: 'application/json' }));
      
      if (identityImage) {
        formData.append('identityImage', identityImage);
      }

      const response = await fetch(`${API_BASE_URL}/${guestId}`, {
        method: 'PUT',
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('Backend error response:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          console.error('Could not read error response:', e);
        }
        
        throw new Error(`Failed to update guest: ${errorMessage}`);
      }
      
      const result = await response.json();
      console.log('Update successful:', result);
      return result;
    } catch (error) {
      console.error('updateGuestWithImage error:', error);
      throw error;
    }
  },

  /**
   * Update guest basic information (JSON only, no image)
   * Use this for quick updates without changing the identity image
   */
  updateGuest: async (guestId, guestData) => {
    try {
      console.log(`Sending PUT request to: ${API_BASE_URL}/${guestId}/basic`);
      console.log('Request payload:', JSON.stringify(guestData, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/${guestId}/basic`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('Backend error response:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          console.error('Could not read error response:', e);
        }
        
        throw new Error(`Failed to update guest: ${errorMessage}`);
      }
      
      const result = await response.json();
      console.log('Update successful:', result);
      return result;
    } catch (error) {
      console.error('updateGuest error:', error);
      throw error;
    }
  },

  /**
   * Delete a guest by ID
   */
  deleteGuest: async (guestId) => {
    try {
      console.log(`Sending DELETE request to: ${API_BASE_URL}/${guestId}`);
      
      const response = await fetch(`${API_BASE_URL}/${guestId}`, {
        method: 'DELETE'
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('Backend error response:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          console.error('Could not read error response:', e);
        }
        
        throw new Error(`Failed to delete guest: ${errorMessage}`);
      }
      
      console.log('Delete successful');
      return true;
    } catch (error) {
      console.error('deleteGuest error:', error);
      throw error;
    }
  },

  /**
   * Get guest QR code image
   */
  getGuestQrImage: async (guestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${guestId}/qr`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch QR code:', errorText);
        throw new Error(`Failed to fetch QR code: ${response.status}`);
      }
      return response.blob();
    } catch (error) {
      console.error('getGuestQrImage error:', error);
      throw error;
    }
  },

  /**
   * Register guest from mobile
   */
  registerGuest: async (registrationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to register guest:', errorText);
        throw new Error(`Failed to register guest: ${response.status} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('registerGuest error:', error);
      throw error;
    }
  }
};