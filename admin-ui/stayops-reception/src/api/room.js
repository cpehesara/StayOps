// src/api/room.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// Standard headers without authentication
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Fetch all rooms - USED BY RECEPTIONISTDASHBOARD
export const getAllRooms = async () => {
  try {
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
    
    const transformedData = data.map(room => ({
      id: room.id,
      roomNumber: room.roomNumber,
      roomType: room.type,
      floor: parseInt(room.floorNumber),
      status: room.availabilityStatus?.toLowerCase() || 'available',
      capacity: room.capacity,
      pricePerNight: room.pricePerNight,
      description: room.description
    }));
    
    console.log('Fetched rooms from API:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Fetch single room by ID
export const getRoomById = async (roomId) => {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch room details");
  return await response.json();
};

// Create new room
export const createRoom = async (roomData) => {
  const response = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(roomData),
  });
  if (!response.ok) throw new Error("Failed to create room");
  return await response.json();
};

// Update room
export const updateRoom = async (roomId, roomData) => {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(roomData),
  });
  if (!response.ok) throw new Error("Failed to update room");
  return await response.json();
};

// Delete room
export const deleteRoom = async (roomId) => {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete room");
};

// Fetch available rooms only
export const getAvailableRooms = async () => {
  const response = await fetch(`${API_BASE_URL}/api/rooms/get/available`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch available rooms");
  return await response.json();
};

// Fetch rooms by type
export const getRoomByType = async (roomType) => {
  const response = await fetch(`${API_BASE_URL}/api/rooms/get/${roomType}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch rooms by type");
  return await response.json();
};
