import { API_BASE_URL } from '../../../config/api';

const API_PREFIX = `${API_BASE_URL}/api`;

function authHeaders() {
  try {
    const raw = sessionStorage.getItem('userData');
    const user = raw ? JSON.parse(raw) : null;
    const token = user?.token || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export const notificationsAPI = {
  // Create notification
  createNotification: async (notificationData) => {
    const response = await fetch(`${API_PREFIX}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
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
      `${API_PREFIX}/notifications/user/${userId}?userType=${userType}`,
      { headers: { ...authHeaders() } }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    
    return response.json();
  },

  // Get unread notifications
  getUnreadNotifications: async (userId, userType) => {
    const response = await fetch(
      `${API_PREFIX}/notifications/user/${userId}/unread?userType=${userType}`,
      { headers: { ...authHeaders() } }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch unread notifications');
    }
    
    return response.json();
  },

  // Get unread count
  getUnreadCount: async (userId, userType) => {
    const response = await fetch(
      `${API_PREFIX}/notifications/user/${userId}/unread-count?userType=${userType}`,
      { headers: { ...authHeaders() } }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }
    
    return response.json();
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_PREFIX}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { ...authHeaders() }
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  },

  // Mark all as read
  markAllAsRead: async (userId, userType) => {
    const response = await fetch(
      `${API_PREFIX}/notifications/user/${userId}/read-all?userType=${userType}`,
      {
        method: 'PUT',
        headers: { ...authHeaders() }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to mark all as read');
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await fetch(`${API_PREFIX}/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: { ...authHeaders() }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
  },
};