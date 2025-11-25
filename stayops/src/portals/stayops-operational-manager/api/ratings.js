const API_BASE_URL = 'http://localhost:8080/api';

export const ratingsAPI = {
  // Create rating
  createRating: async (ratingData, guestId) => {
    const response = await fetch(`${API_BASE_URL}/ratings?guestId=${guestId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ratingData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create rating');
    }
    
    return response.json();
  },

  // Update rating
  updateRating: async (ratingId, ratingData, guestId) => {
    const response = await fetch(
      `${API_BASE_URL}/ratings/${ratingId}?guestId=${guestId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update rating');
    }
    
    return response.json();
  },

  // Delete rating
  deleteRating: async (ratingId, guestId) => {
    const response = await fetch(
      `${API_BASE_URL}/ratings/${ratingId}?guestId=${guestId}`,
      {
        method: 'DELETE',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to delete rating');
    }
  },

  // Get rating by ID
  getRating: async (ratingId) => {
    const response = await fetch(`${API_BASE_URL}/ratings/${ratingId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch rating');
    }
    
    return response.json();
  },

  // Get rating by reservation
  getRatingByReservation: async (reservationId) => {
    const response = await fetch(
      `${API_BASE_URL}/ratings/reservation/${reservationId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch rating');
    }
    
    return response.json();
  },

  // Get guest ratings
  getGuestRatings: async (guestId) => {
    const response = await fetch(`${API_BASE_URL}/ratings/guest/${guestId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch guest ratings');
    }
    
    return response.json();
  },

  // Get all published ratings
  getAllPublishedRatings: async () => {
    const response = await fetch(`${API_BASE_URL}/ratings/published`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch published ratings');
    }
    
    return response.json();
  },

  // Get rating statistics
  getRatingStats: async () => {
    const response = await fetch(`${API_BASE_URL}/ratings/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch rating statistics');
    }
    
    return response.json();
  },

  // Publish/unpublish rating
  publishRating: async (ratingId, isPublished) => {
    const response = await fetch(
      `${API_BASE_URL}/ratings/${ratingId}/publish?isPublished=${isPublished}`,
      {
        method: 'PUT',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update rating publication status');
    }
  },
};