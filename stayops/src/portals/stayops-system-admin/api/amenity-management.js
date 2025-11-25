// Amenity Management API Service
const BASE_URL = 'https://nonprotuberant-nonprojective-son.ngrok-free.dev/api/amenities';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

/**
 * Amenity Management
 */

// Create a new amenity
export const createAmenity = async (amenityData) => {
  try {
    const response = await fetch(`${BASE_URL}/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(amenityData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating amenity:', error);
    throw error;
  }
};

// Get all amenities with pagination and filtering
export const getAllAmenities = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || '',
      category: params.category || '',
      type: params.type || '',
      status: params.status || '',
      sortBy: params.sortBy || 'name',
      sortOrder: params.sortOrder || 'asc'
    });

    const response = await fetch(`${BASE_URL}/getAll?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting amenities:', error);
    throw error;
  }
};

// Get amenity by ID
export const getAmenityById = async (amenityId) => {
  try {
    const response = await fetch(`${BASE_URL}/get/${amenityId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting amenity by ID:', error);
    throw error;
  }
};

// Update amenity
export const updateAmenity = async (amenityId, amenityData) => {
  try {
    const response = await fetch(`${BASE_URL}/update/${amenityId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(amenityData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating amenity:', error);
    throw error;
  }
};

// Delete amenity
export const deleteAmenity = async (amenityId) => {
  try {
    const response = await fetch(`${BASE_URL}/delete/${amenityId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting amenity:', error);
    throw error;
  }
};

/**
 * Availability Management
 */

// Update amenity availability
export const updateAmenityAvailability = async (amenityId, availabilityData) => {
  try {
    const response = await fetch(`${BASE_URL}/availability/${amenityId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(availabilityData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating amenity availability:', error);
    throw error;
  }
};

// Block amenity
export const blockAmenity = async (amenityId, reason, startDate, endDate) => {
  try {
    const response = await fetch(`${BASE_URL}/block/${amenityId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason, startDate, endDate }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error blocking amenity:', error);
    throw error;
  }
};

// Unblock amenity
export const unblockAmenity = async (amenityId) => {
  try {
    const response = await fetch(`${BASE_URL}/unblock/${amenityId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error unblocking amenity:', error);
    throw error;
  }
};

// Get amenity availability for date range
export const getAmenityAvailability = async (amenityId, startDate, endDate) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate
    });

    const response = await fetch(`${BASE_URL}/availability/${amenityId}?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting amenity availability:', error);
    throw error;
  }
};

/**
 * Booking Management
 */

// Create amenity booking
export const createAmenityBooking = async (bookingData) => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating amenity booking:', error);
    throw error;
  }
};

// Get amenity bookings
export const getAmenityBookings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      amenityId: params.amenityId || '',
      guestId: params.guestId || '',
      status: params.status || '',
      startDate: params.startDate || '',
      endDate: params.endDate || '',
      sortBy: params.sortBy || 'bookingDate',
      sortOrder: params.sortOrder || 'desc'
    });

    const response = await fetch(`${BASE_URL}/bookings?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting amenity bookings:', error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status, notes = '') => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/status/${bookingId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/cancel/${bookingId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// Get available time slots for amenity
export const getAvailableTimeSlots = async (amenityId, date) => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/available-slots/${amenityId}?date=${date}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};

/**
 * Pricing & Packages
 */

// Update amenity pricing
export const updateAmenityPricing = async (amenityId, pricingData) => {
  try {
    const response = await fetch(`${BASE_URL}/pricing/${amenityId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(pricingData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating amenity pricing:', error);
    throw error;
  }
};

// Create amenity package
export const createAmenityPackage = async (packageData) => {
  try {
    const response = await fetch(`${BASE_URL}/packages/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(packageData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating amenity package:', error);
    throw error;
  }
};

// Get all packages
export const getAllPackages = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || '',
      type: params.type || '',
      sortBy: params.sortBy || 'name',
      sortOrder: params.sortOrder || 'asc'
    });

    const response = await fetch(`${BASE_URL}/packages?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting packages:', error);
    throw error;
  }
};

// Update package
export const updatePackage = async (packageId, packageData) => {
  try {
    const response = await fetch(`${BASE_URL}/packages/update/${packageId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(packageData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating package:', error);
    throw error;
  }
};

// Delete package
export const deletePackage = async (packageId) => {
  try {
    const response = await fetch(`${BASE_URL}/packages/delete/${packageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting package:', error);
    throw error;
  }
};

// Get package by ID
export const getPackageById = async (packageId) => {
  try {
    const response = await fetch(`${BASE_URL}/packages/get/${packageId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting package by ID:', error);
    throw error;
  }
};

/**
 * Analytics & Reports
 */

// Get amenity usage statistics
export const getAmenityUsageStats = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      startDate: params.startDate || '',
      endDate: params.endDate || '',
      amenityId: params.amenityId || '',
      groupBy: params.groupBy || 'day'
    });

    const response = await fetch(`${BASE_URL}/analytics/usage?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting amenity usage stats:', error);
    throw error;
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      startDate: params.startDate || '',
      endDate: params.endDate || '',
      groupBy: params.groupBy || 'day'
    });

    const response = await fetch(`${BASE_URL}/analytics/revenue?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    throw error;
  }
};

// Export all API endpoints
export default {
  // Amenity Management
  createAmenity,
  getAllAmenities,
  getAmenityById,
  updateAmenity,
  deleteAmenity,
  
  // Availability Management
  updateAmenityAvailability,
  blockAmenity,
  unblockAmenity,
  getAmenityAvailability,
  
  // Booking Management
  createAmenityBooking,
  getAmenityBookings,
  updateBookingStatus,
  cancelBooking,
  getAvailableTimeSlots,
  
  // Pricing & Packages
  updateAmenityPricing,
  createAmenityPackage,
  getAllPackages,
  updatePackage,
  deletePackage,
  getPackageById,
  
  // Analytics & Reports
  getAmenityUsageStats,
  getRevenueAnalytics
};
