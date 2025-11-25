const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true',
});

export const updateFilterCriteria = async (filterData) => {
  try {
    console.log('Sending filter criteria to backend:', filterData);
    
    const response = await fetch(`${API_BASE_URL}/api/room-filter/update-criteria`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(filterData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update filter: ${response.status}`);
    }
    
    console.log('Filter criteria updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating filter criteria:', error);
    throw error;
  }
};

export const getCurrentFilterCriteria = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/room-filter/current-criteria`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch filter: ${response.status}`);
    }
    
    const criteria = await response.json();
    console.log('Current filter criteria:', criteria);
    return criteria;
  } catch (error) {
    console.error('Error fetching filter criteria:', error);
    throw error;
  }
};

export const getFilteredRooms = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/room-filter/filtered-rooms`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch filtered rooms: ${response.status}`);
    }
    
    const rooms = await response.json();
    console.log('Fetched filtered rooms:', rooms.length, 'rooms');
    return rooms;
  } catch (error) {
    console.error('Error fetching filtered rooms:', error);
    throw error;
  }
};

export const clearFilter = async () => {
  try {
    console.log('Clearing filter criteria');
    
    const response = await fetch(`${API_BASE_URL}/api/room-filter/clear-filter`, {
      method: "POST",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to clear filter: ${response.status}`);
    }
    
    console.log('Filter criteria cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('Error clearing filter:', error);
    throw error;
  }
};

// Guest room selection functions
export const getAllGuestSelections = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/room-filter/guest-selections`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch guest selections: ${response.status}`);
    }
    
    const selections = await response.json();
    // Only log when there are actual selections to avoid console spam
    if (Object.keys(selections).length > 0) {
      console.log('Guest selections received:', Object.keys(selections).length);
    }
    return selections;
  } catch (error) {
    console.error('Error fetching guest selections:', error);
    throw error;
  }
};

export const getGuestSelection = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/room-filter/guest-selection/${sessionId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch guest selection: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching guest selection:', error);
    return null;
  }
};