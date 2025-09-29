// src/api/reservation.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// Basic Auth Header
const BASIC_AUTH = "Basic " + btoa("admin:admin");

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": BASIC_AUTH,
});

// ✅ Fetch reservations for the full month
export const getMonthlyReservations = async (year, month) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/calendar?year=${year}&month=${month}`,
      { method: "GET", headers: getHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch reservations");
    return await response.json();
  } catch (err) {
    console.warn("Backend not ready. Using mock data instead.");
    return [
      { date: `${year}-${month.toString().padStart(2, "0")}-05`, checkIns: 3, checkOuts: 1 },
      { date: `${year}-${month.toString().padStart(2, "0")}-12`, checkIns: 2, checkOuts: 0 },
      { date: `${year}-${month.toString().padStart(2, "0")}-20`, checkIns: 1, checkOuts: 4 },
    ];
  }
};

// ✅ Fetch reservations for a specific day
export const getDailyReservations = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/day?date=${date}`,
      { method: "GET", headers: getHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch reservations");
    return await response.json();
  } catch (err) {
    console.warn("Backend not ready. Using mock data instead.");
    return {
      date,
      reservations: [
        { guest: "John Doe", type: "Check-in", room: "A101" },
        { guest: "Jane Smith", type: "Check-out", room: "B202" },
      ],
    };
  }
};

// ✅ Fetch room reservation statuses - returns simplified format
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

// ✅ Fetch all reservations with full details
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

// ✅ Fetch reservations for a specific date range
export const getReservationsForDateRange = async (startDate, endDate) => {
  try {
    // Use the getAll endpoint and filter on frontend if no specific date range endpoint
    const allReservations = await getAllReservations();
    
    // Filter reservations that overlap with the date range
    const filteredReservations = allReservations.filter(reservation => {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Check if reservation overlaps with the date range
      return checkIn <= end && checkOut >= start;
    });
    
    console.log(`Fetched ${filteredReservations.length} reservations for date range ${startDate} to ${endDate}`);
    return filteredReservations;
  } catch (error) {
    console.error('Error fetching reservations for date range:', error);
    throw error;
  }
};

// ✅ Create a new reservation
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

// ✅ Update a reservation
export const updateReservation = async (reservationId, reservationData) => {
  try {
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

// ✅ Delete a reservation
export const deleteReservation = async (reservationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reservations/delete/${reservationId}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete reservation: ${response.status}`);
    }

    console.log('Deleted reservation:', reservationId);
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
};

// ✅ Get a single reservation by ID
export const getReservationById = async (reservationId) => {
  try {
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