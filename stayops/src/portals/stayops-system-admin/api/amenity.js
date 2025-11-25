// amenity.js - API service for amenities
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nonprotuberant-nonprojective-son.ngrok-free.dev';

// Helper function for headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
});

// Get all amenities (master list) - matches Spring controller
export const getAllAmenities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/amenities/getAll`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching amenities:', error);
    throw error;
  }
};

// Create new amenity (master amenity) - matches Spring controller
export const createAmenity = async (amenityData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/amenities/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(amenityData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating amenity:', error);
    throw error;
  }
};

// Delete amenity completely (from master list) - matches Spring controller
export const deleteAmenity = async (amenityId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/amenities/delete/${amenityId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting amenity:', error);
    throw error;
  }
};

// =============================================================================
// HOTEL-SPECIFIC AMENITY FUNCTIONS
// =============================================================================

// Get amenities for a specific hotel
// Backend endpoint: GET /api/amenities/hotel/{hotelId}
export const getHotelAmenities = async (hotelId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/amenities/hotel/${hotelId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching amenities for hotel ${hotelId}:`, error);
    throw error;
  }
};

// Get available amenities not yet assigned to hotel
// Backend needs: GET /api/amenities/hotel/{hotelId}/available
export const getAvailableAmenitiesForHotel = async (hotelId) => {
  try {
    // Temporary implementation - returns all amenities until backend is updated
    console.warn('getAvailableAmenitiesForHotel: Using fallback implementation');
    return await getAllAmenities();
  } catch (error) {
    console.error('Error fetching available amenities:', error);
    throw error;
  }
};

// Add existing amenity to hotel
// Backend needs: POST /api/amenities/hotel/{hotelId}/amenity/{amenityId}
export const addAmenityToHotel = async (hotelId, amenityId) => {
  try {
    console.warn('addAmenityToHotel: Backend endpoint not implemented yet');
    console.log(`Would add amenity ${amenityId} to hotel ${hotelId}`);
    return true;
  } catch (error) {
    console.error('Error adding amenity to hotel:', error);
    throw error;
  }
};

// Remove amenity from hotel
// Backend needs: DELETE /api/amenities/hotel/{hotelId}/amenity/{amenityId}
export const removeAmenityFromHotel = async (hotelId, amenityId) => {
  try {
    console.warn('removeAmenityFromHotel: Backend endpoint not implemented yet');
    console.log(`Would remove amenity ${amenityId} from hotel ${hotelId}`);
    return true;
  } catch (error) {
    console.error('Error removing amenity from hotel:', error);
    throw error;
  }
};

const amenityAPI = {
  getAllAmenities,
  createAmenity,
  deleteAmenity,
  getHotelAmenities,
  getAvailableAmenitiesForHotel,
  addAmenityToHotel,
  removeAmenityFromHotel,
};

export default amenityAPI;
