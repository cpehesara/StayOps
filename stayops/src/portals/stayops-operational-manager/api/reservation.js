// src/api/reservation.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Accept": "application/json",
});

// ==================== RESERVATION CRUD ====================

export const createReservation = async (reservationData) => {
  try {
    console.log('Creating reservation:', reservationData);
    
    const response = await fetch(`${API_BASE_URL}/api/reservations/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(reservationData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Failed to create reservation: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Created reservation:', data);
    return data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

export const updateReservation = async (reservationId, reservationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reservations/update/${reservationId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(reservationData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update reservation: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating reservation:', error);
    throw error;
  }
};

export const deleteReservation = async (reservationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reservations/delete/${reservationId}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete reservation: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
};

export const getReservationById = async (reservationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reservations/get/${reservationId}`, {
      method: "GET",
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reservation: ${response.status}`);
    }

    return await response.json();
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

    return await response.json();
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
};

// ==================== ROOM STATUS & AVAILABILITY ====================

export const getRoomStatusForDate = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/room-status?date=${date}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch room status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching room status:', error);
    throw error;
  }
};

export const getRoomStatusForDateRange = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/room-status/range?startDate=${startDate}&endDate=${endDate}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch room status range: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching room status range:', error);
    throw error;
  }
};

export const getAllRoomReservations = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/reservations`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch room reservations: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching room reservations:', error);
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

    return await response.json();
  } catch (error) {
    console.error('Error fetching reservations for date range:', error);
    throw error;
  }
};

// ==================== ARRIVALS & DEPARTURES ====================

export const getArrivals = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/arrivals?date=${date}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch arrivals: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching arrivals:', error);
    throw error;
  }
};

export const getDepartures = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/departures?date=${date}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch departures: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching departures:', error);
    throw error;
  }
};

export const getDailySummary = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/daily-summary?date=${date}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch daily summary: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    throw error;
  }
};

// ==================== STATUS MANAGEMENT ====================

export const updateReservationStatus = async (reservationId, status) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/${reservationId}/status?status=${status}`,
      { method: "PATCH", headers: getHeaders() }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update status: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating reservation status:', error);
    throw error;
  }
};

export const checkInReservation = async (reservationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/${reservationId}/check-in`,
      { method: "POST", headers: getHeaders() }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to check in: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking in reservation:', error);
    throw error;
  }
};

export const checkOutReservation = async (reservationId, guestId) => {
  try {
    let url = `${API_BASE_URL}/api/reservations/${reservationId}/check-out`;
    if (guestId) {
      const numericGuestId = /^(\d+)$/.test(guestId)
        ? guestId
        : (guestId.match(/\d+/)?.[0] || guestId);
      url = `${url}?guestId=${encodeURIComponent(numericGuestId)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ guestId: Number(numericGuestId) || numericGuestId })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to check out: ${errorText}`);
      }
      return await response.json();
    }

    const response = await fetch(url, { method: "POST", headers: getHeaders() });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to check out: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking out reservation:', error);
    throw error;
  }
};

export const cancelReservation = async (reservationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/${reservationId}/cancel`,
      { method: "POST", headers: getHeaders() }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to cancel: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
};

// ==================== GUEST & SEARCH ====================

export const getGuestReservations = async (guestId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/guest/${guestId}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch guest reservations: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching guest reservations:', error);
    throw error;
  }
};

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

    return await response.json();
  } catch (error) {
    console.error('Error searching reservations:', error);
    throw error;
  }
};

// ==================== OCCUPANCY STATISTICS ====================

export const getCurrentOccupancy = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/occupancy/current`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch occupancy: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching current occupancy:', error);
    throw error;
  }
};

export const getOccupancyForDate = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/occupancy/date?date=${date}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch occupancy: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching occupancy for date:', error);
    throw error;
  }
};

// ==================== RESERVATION DETAILS ====================

export const getReservationDetails = async (reservationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservation-details/get/${reservationId}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch reservation details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching reservation details:', error);
    throw error;
  }
};

export const createReservationDetails = async (reservationId, detailsData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservation-details/create/${reservationId}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(detailsData)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create reservation details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating reservation details:', error);
    throw error;
  }
};

export const updateReservationDetails = async (reservationId, detailsData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservation-details/update/${reservationId}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(detailsData)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update reservation details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating reservation details:', error);
    throw error;
  }
};

// ==================== RESERVATION HISTORY ====================

export const getReservationHistory = async (reservationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/reservation-history/${reservationId}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch reservation history: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching reservation history:', error);
    throw error;
  }
};

export const recordReservationHistory = async (historyData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/reservation-history`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(historyData)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to record history: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error recording reservation history:', error);
    throw error;
  }
};

// ==================== RESERVATION HOLDS ====================

export const createHold = async (holdData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/holds/create`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(holdData)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create hold: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating hold:', error);
    throw error;
  }
};

export const getHoldByToken = async (holdToken) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/holds/${holdToken}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch hold: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching hold:', error);
    throw error;
  }
};

export const convertHoldToReservation = async (holdToken) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/holds/${holdToken}/convert`,
      { method: "POST", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to convert hold: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error converting hold:', error);
    throw error;
  }
};

export const cancelHold = async (holdToken) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/holds/${holdToken}/cancel`,
      { method: "DELETE", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to cancel hold: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error cancelling hold:', error);
    throw error;
  }
};

export const extendHold = async (holdToken, additionalMinutes) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/holds/${holdToken}/extend?additionalMinutes=${additionalMinutes}`,
      { method: "PATCH", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to extend hold: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error extending hold:', error);
    throw error;
  }
};

export const getGuestHolds = async (guestId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/holds/guest/${guestId}`,
      { method: "GET", headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch guest holds: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching guest holds:', error);
    throw error;
  }
};