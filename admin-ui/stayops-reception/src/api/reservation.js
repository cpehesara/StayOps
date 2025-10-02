// src/api/reservation.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const getHeaders = () => ({
  "Content-Type": "application/json",
});

// ==================== RESERVATION CRUD ====================

export const createReservation = async (reservationData) => {
  try {
    console.log('Creating reservation:', reservationData);
    console.log('Request URL:', `${API_BASE_URL}/api/reservations/create`);
    console.log('Request headers:', getHeaders());
    console.log('Request body:', JSON.stringify(reservationData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/reservations/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(reservationData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);

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
      
      throw new Error(`Failed to create reservation: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Created reservation:', data);
    return data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      reservationData: reservationData
    });
    throw error;
  }
};

export const updateReservation = async (reservationId, reservationData) => {
  try {
    console.log(`Updating reservation ${reservationId}:`, reservationData);
    
    const response = await fetch(`${API_BASE_URL}/api/reservations/update/${reservationId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(reservationData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update reservation: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Updated reservation:', data);
    return data;
  } catch (error) {
    console.error('Error updating reservation:', error);
    throw error;
  }
};

export const deleteReservation = async (reservationId) => {
  try {
    console.log(`Deleting reservation ${reservationId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/reservations/delete/${reservationId}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete reservation: ${response.status}`);
    }

    console.log('Deleted reservation:', reservationId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
};

export const getReservationById = async (reservationId) => {
  try {
    console.log(`Fetching reservation ${reservationId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/reservations/get/${reservationId}`, {
      method: "GET",
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reservation: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched reservation:', data);
    return data;
  } catch (error) {
    console.error('Error fetching reservation:', error);
    throw error;
  }
};

export const getAllReservations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reservations/getAll`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched all reservations:', data);
    return data;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
};

// ==================== ROOM STATUS & AVAILABILITY ====================

/**
 * Get room status for a specific date
 * Shows AVAILABLE, OCCUPIED, RESERVED, ARRIVING, or DEPARTING
 */
export const getRoomStatusForDate = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/room-status?date=${date}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch room status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Room status for ${date}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching room status:', error);
    throw error;
  }
};

/**
 * Get room status for a date range
 */
export const getRoomStatusForDateRange = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/room-status/range?startDate=${startDate}&endDate=${endDate}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch room status range: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Room status range ${startDate} to ${endDate}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching room status range:', error);
    throw error;
  }
};

/**
 * Legacy endpoint - returns simplified room reservation statuses
 */
export const getRoomReservationStatuses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reservations/reservations`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched room reservation statuses:', data);
    return data;
  } catch (error) {
    console.error('Error fetching room reservation statuses:', error);
    throw error;
  }
};

// ==================== CALENDAR & DATE QUERIES ====================

export const getMonthlyReservations = async (year, month) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/calendar?year=${year}&month=${month}`,
      { method: "GET", headers: getHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch reservations");
    return await response.json();
  } catch (err) {
    console.error("Error fetching monthly reservations:", err);
    throw err;
  }
};

export const getDailyReservations = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/day?date=${date}`,
      { method: "GET", headers: getHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch reservations");
    return await response.json();
  } catch (err) {
    console.error("Error fetching daily reservations:", err);
    throw err;
  }
};

export const getReservationsForDateRange = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/date-range?startDate=${startDate}&endDate=${endDate}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.length} reservations for date range ${startDate} to ${endDate}`);
    return data;
  } catch (error) {
    console.error('Error fetching reservations for date range:', error);
    throw error;
  }
};

// ==================== ARRIVALS & DEPARTURES ====================

/**
 * Get expected arrivals for a specific date
 */
export const getArrivals = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/arrivals?date=${date}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch arrivals: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Arrivals for ${date}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching arrivals:', error);
    throw error;
  }
};

/**
 * Get expected departures for a specific date
 */
export const getDepartures = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/departures?date=${date}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch departures: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Departures for ${date}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching departures:', error);
    throw error;
  }
};

/**
 * Get comprehensive daily operations summary
 */
export const getDailySummary = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/daily-summary?date=${date}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch daily summary: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Daily summary for ${date}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    throw error;
  }
};

// ==================== STATUS MANAGEMENT ====================

/**
 * Update reservation status
 */
export const updateReservationStatus = async (reservationId, status) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/${reservationId}/status?status=${status}`,
      { method: "PATCH", headers: getHeaders() }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Updated reservation status:', data);
    return data;
  } catch (error) {
    console.error('Error updating reservation status:', error);
    throw error;
  }
};

/**
 * Check in a reservation
 */
export const checkInReservation = async (reservationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/${reservationId}/check-in`,
      { method: "POST", headers: getHeaders() }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to check in: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Checked in reservation:', data);
    return data;
  } catch (error) {
    console.error('Error checking in reservation:', error);
    throw error;
  }
};

/**
 * Check out a reservation
 */
export const checkOutReservation = async (reservationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/${reservationId}/check-out`,
      { method: "POST", headers: getHeaders() }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to check out: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Checked out reservation:', data);
    return data;
  } catch (error) {
    console.error('Error checking out reservation:', error);
    throw error;
  }
};

/**
 * Cancel a reservation
 */
export const cancelReservation = async (reservationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/${reservationId}/cancel`,
      { method: "POST", headers: getHeaders() }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to cancel: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Cancelled reservation:', data);
    return data;
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
};

// ==================== GUEST & SEARCH ====================

/**
 * Get all reservations for a specific guest
 */
export const getGuestReservations = async (guestId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/guest/${guestId}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch guest reservations: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Reservations for guest ${guestId}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching guest reservations:', error);
    throw error;
  }
};

/**
 * Search reservations with multiple criteria
 */
export const searchReservations = async (criteria) => {
  try {
    const params = new URLSearchParams();
    if (criteria.guestId) params.append('guestId', criteria.guestId);
    if (criteria.status) params.append('status', criteria.status);
    if (criteria.checkInDate) params.append('checkInDate', criteria.checkInDate);
    if (criteria.checkOutDate) params.append('checkOutDate', criteria.checkOutDate);

    const response = await fetch(
      `${API_BASE_URL}/api/reservations/search?${params}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to search reservations: ${response.status}`);
    }

    const data = await response.json();
    console.log('Search results:', data);
    return data;
  } catch (error) {
    console.error('Error searching reservations:', error);
    throw error;
  }
};

// ==================== OCCUPANCY STATISTICS ====================

/**
 * Get current occupancy statistics
 */
export const getCurrentOccupancy = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/occupancy/current`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch occupancy: ${response.status}`);
    }

    const data = await response.json();
    console.log('Current occupancy:', data);
    return data;
  } catch (error) {
    console.error('Error fetching current occupancy:', error);
    throw error;
  }
};

/**
 * Get occupancy statistics for a specific date
 */
export const getOccupancyForDate = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/occupancy/date?date=${date}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch occupancy: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Occupancy for ${date}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching occupancy for date:', error);
    throw error;
  }
};

// ==================== RESERVATION DETAILS API ====================

export const createReservationDetails = async (reservationId, detailsData) => {
  try {
    console.log(`Creating details for reservation ${reservationId}:`, detailsData);
    
    const response = await fetch(
      `${API_BASE_URL}/api/reservation-details/create/${reservationId}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(detailsData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create reservation details: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Created reservation details:', data);
    return data;
  } catch (error) {
    console.error('Error creating reservation details:', error);
    throw error;
  }
};

export const getReservationDetails = async (reservationId) => {
  try {
    console.log(`Fetching details for reservation ${reservationId}`);
    
    const response = await fetch(
      `${API_BASE_URL}/api/reservation-details/get/${reservationId}`,
      {
        method: "GET",
        headers: getHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch reservation details: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched reservation details:', data);
    return data;
  } catch (error) {
    console.error('Error fetching reservation details:', error);
    throw error;
  }
};

export const updateReservationDetails = async (reservationId, detailsData) => {
  try {
    console.log(`Updating details for reservation ${reservationId}:`, detailsData);
    
    const response = await fetch(
      `${API_BASE_URL}/api/reservation-details/update/${reservationId}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(detailsData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update reservation details: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Updated reservation details:', data);
    return data;
  } catch (error) {
    console.error('Error updating reservation details:', error);
    throw error;
  }
};

export const deleteReservationDetails = async (reservationId) => {
  try {
    console.log(`Deleting details for reservation ${reservationId}`);
    
    const response = await fetch(
      `${API_BASE_URL}/api/reservation-details/delete/${reservationId}`,
      {
        method: "DELETE",
        headers: getHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete reservation details: ${response.status}`);
    }

    console.log('Deleted reservation details for:', reservationId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting reservation details:', error);
    throw error;
  }
};