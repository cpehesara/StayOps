const API_BASE_URL = 'http://localhost:8080/api';

export const notificationsAPI = {
  // Create notification
  createNotification: async (notificationData) => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create notification');
    }
    
    return response.json();
  },

  // Get user notifications
  getUserNotifications: async (userId, userType) => {
    const response = await fetch(
      `${API_BASE_URL}/notifications/user/${userId}?userType=${userType}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    
    return response.json();
  },

  // Get unread notifications
  getUnreadNotifications: async (userId, userType) => {
    const response = await fetch(
      `${API_BASE_URL}/notifications/user/${userId}/unread?userType=${userType}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch unread notifications');
    }
    
    return response.json();
  },

  // Get unread count
  getUnreadCount: async (userId, userType) => {
    const response = await fetch(
      `${API_BASE_URL}/notifications/user/${userId}/unread-count?userType=${userType}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }
    
    return response.json();
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {
        method: 'PUT',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  },

  // Mark all as read
  markAllAsRead: async (userId, userType) => {
    const response = await fetch(
      `${API_BASE_URL}/notifications/user/${userId}/read-all?userType=${userType}`,
      {
        method: 'PUT',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${notificationId}`,
      {
        method: 'DELETE',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
  },

  // Delete all notifications
  deleteAllNotifications: async (userId, userType) => {
    const response = await fetch(
      `${API_BASE_URL}/notifications/user/${userId}/delete-all?userType=${userType}`,
      {
        method: 'DELETE',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to delete all notifications');
    }
  },

  // Get system notifications (admin-specific)
  getSystemNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/system`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch system notifications');
    }
    
    return response.json();
  },

  // Send broadcast notification (admin-specific)
  sendBroadcastNotification: async (notificationData) => {
    const response = await fetch(`${API_BASE_URL}/notifications/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send broadcast notification');
    }
    
    return response.json();
  }
};