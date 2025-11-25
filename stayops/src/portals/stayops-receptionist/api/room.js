// src/api/room.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://nonprotuberant-nonprojective-son.ngrok-free.dev";

// Standard headers without authentication
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true',
});

// ✅ Create new room
export const createRoom = async (roomData) => {
  try {
    console.log('Creating room:', roomData);
    
    const response = await fetch(`${API_BASE_URL}/api/rooms/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(roomData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create room: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Created room:', data);
    return data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// ✅ Update room
export const updateRoom = async (roomId, roomData) => {
  try {
    console.log(`Updating room ${roomId}:`, roomData);
    
    const response = await fetch(`${API_BASE_URL}/api/rooms/update/${roomId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(roomData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update room: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Updated room:', data);
    return data;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

// ✅ Delete room
export const deleteRoom = async (roomId) => {
  try {
    console.log(`Deleting room ${roomId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/rooms/delete/${roomId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete room: ${response.status}`);
    }
    
    console.log('Deleted room:', roomId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

// ✅ Get single room by ID
export const getRoomById = async (roomId) => {
  try {
    console.log(`Fetching room ${roomId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/rooms/get/${roomId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch room: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetched room:', data);
    return data;
  } catch (error) {
    console.error('Error fetching room by ID:', error);
    throw error;
  }
};

// ✅ Get all rooms
export const getAllRooms = async () => {
  try {
    console.log('Fetching all rooms');
    
    const response = await fetch(`${API_BASE_URL}/api/rooms/getAll`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error('Response is not JSON:', text);
      throw new Error("Server returned non-JSON response");
    }

    const data = await response.json();
    console.log('Fetched all rooms:', data);
    return data;
  } catch (error) {
    console.error('Error fetching all rooms:', error);
    throw error;
  }
};

// ✅ Get available rooms only (no date filtering)
export const getAvailableRooms = async () => {
  try {
    console.log('Fetching available rooms');
    
    const response = await fetch(`${API_BASE_URL}/api/rooms/get/available`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch available rooms: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetched available rooms:', data);
    return data;
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    throw error;
  }
};

// ✅ Get rooms by type
// NOTE: This endpoint has a conflict with getRoomById due to same path pattern /get/{param}
// The backend will treat numeric strings as IDs and non-numeric as types
export const getRoomsByType = async (roomType) => {
  try {
    console.log(`Fetching rooms by type: ${roomType}`);
    
    const response = await fetch(`${API_BASE_URL}/api/rooms/type/${roomType}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch rooms by type: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetched rooms by type:', data);
    return data;
  } catch (error) {
    console.error('Error fetching rooms by type:', error);
    throw error;
  }
};

// ✅ Get rooms by hotel ID
export const getRoomsByHotel = async (hotelId) => {
  try {
    console.log(`Fetching rooms for hotel ${hotelId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/rooms/hotel/${hotelId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch rooms for hotel: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetched rooms by hotel:', data);
    return data;
  } catch (error) {
    console.error('Error fetching rooms by hotel:', error);
    throw error;
  }
};

// ==================== HELPER FUNCTIONS ====================

// Get available rooms for specific dates
// NOTE: Backend doesn't have this endpoint yet, so we implement client-side filtering
export const getAvailableRoomsForDates = async (checkInDate, checkOutDate) => {
  try {
    console.log(`Fetching available rooms for ${checkInDate} to ${checkOutDate}`);
    console.warn('Backend does not have date-filtered availability endpoint. Using client-side filtering.');
    
    // Get all available rooms and return them
    // The backend should implement proper date-based filtering
    const availableRooms = await getAvailableRooms();
    
    // TODO: When backend implements date-based filtering, replace with:
    // const response = await fetch(
    //   `${API_BASE_URL}/api/rooms/available?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`,
    //   { method: "GET", headers: getHeaders() }
    // );
    
    console.log('Available rooms (no date filter):', availableRooms);
    return availableRooms;
  } catch (error) {
    console.error('Error fetching available rooms for dates:', error);
    throw error;
  }
};