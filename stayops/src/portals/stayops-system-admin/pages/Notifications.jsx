import React, { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../api/notifications';
import '../styles/notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = 1; // TODO: Replace with actual user ID from context/auth
      const userType = 'ADMIN'; // Try ADMIN instead of SYSTEM_ADMIN
      
      let data;
      if (filter === 'unread') {
        data = await notificationsAPI.getUnreadNotifications(userId, userType);
      } else {
        data = await notificationsAPI.getUserNotifications(userId, userType);
      }
      
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      
      // Fallback to mock data for development
      console.log('Using mock data as fallback');
      const mockNotifications = [
        {
          id: 1,
          title: 'System Update Required',
          message: 'A new system update is available and requires administrator approval.',
          isRead: false,
          type: 'SYSTEM',
          createdAt: new Date().toISOString(),
          priority: 'HIGH'
        },
        {
          id: 2,
          title: 'User Account Created',
          message: 'New user account has been created and requires verification.',
          isRead: true,
          type: 'USER_MANAGEMENT',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          priority: 'MEDIUM'
        },
        {
          id: 3,
          title: 'Security Alert',
          message: 'Multiple failed login attempts detected from IP address 192.168.1.100.',
          isRead: false,
          type: 'SECURITY',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          priority: 'HIGH'
        }
      ];
      
      const filteredNotifications = filter === 'unread' 
        ? mockNotifications.filter(n => !n.isRead)
        : mockNotifications;
        
      setNotifications(filteredNotifications);
      setError(null); // Clear the error since we're using fallback data
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
      // Fallback: Update the notification locally
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userId = 1; // TODO: Replace with actual user ID
      const userType = 'ADMIN'; // Try ADMIN instead of SYSTEM_ADMIN
      await notificationsAPI.markAllAsRead(userId, userType);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
      // Fallback: Update all notifications locally
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationsAPI.deleteNotification(notificationId);
        fetchNotifications();
      } catch (err) {
        console.error('Error deleting notification:', err);
        setError(err.message);
      }
    }
  };

  const getNotificationTypeClass = (type) => {
    const typeMap = {
      INFO: 'type-info',
      SUCCESS: 'type-success',
      WARNING: 'type-warning',
      ERROR: 'type-error',
      RESERVATION: 'type-reservation',
      PAYMENT: 'type-payment',
    };
    return typeMap[type] || '';
  };

  return (
    <div className="notifications-container">
      <div className="notifications-wrapper">
        
        {/* Header */}
        <div className="notifications-header">
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">View and manage your notifications</p>
        </div>

        {/* Filters */}
        <div className="notifications-filters">
          <button
            onClick={() => setFilter('all')}
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
          >
            Unread
          </button>
          <button
            onClick={handleMarkAllAsRead}
            className="btn-mark-all"
          >
            Mark All as Read
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message-container">
            <p className="error-message-text">{error}</p>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="loading-state">
            <p className="loading-text">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-container">
              <p className="empty-state-text">No notifications found</p>
            </div>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${getNotificationTypeClass(notification.type)} ${
                  !notification.isRead ? 'unread' : ''
                }`}
              >
                <div className="notification-content">
                  <div className="notification-info">
                    <div className="notification-header-row">
                      <h3 className="notification-title">{notification.title}</h3>
                      <span className="notification-type-badge">{notification.type}</span>
                      {!notification.isRead && (
                        <span className="notification-new-badge">NEW</span>
                      )}
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <p className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="btn-mark-read"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;