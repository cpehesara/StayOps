import React, { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsAPI } from '../api/notifications';
import '../styles/notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread
  const userId = 1; // TODO: replace with real auth user id
  const userType = 'RECEPTIONIST';
  const pollingRef = useRef(null);

  const fetchNotifications = useCallback(async (withSpinner = true) => {
    if (withSpinner) setLoading(true);
    if (withSpinner) setError(null);
    
    try {
      let data;
      if (filter === 'unread') {
        data = await notificationsAPI.getUnreadNotifications(userId, userType);
      } else {
        data = await notificationsAPI.getUserNotifications(userId, userType);
      }
      
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      if (withSpinner) setError(err.message);
    } finally {
      if (withSpinner) setLoading(false);
    }
  }, [filter, userId, userType]);

  // Initial fetch and on filter change
  useEffect(() => {
    fetchNotifications();
  }, [filter, fetchNotifications]);

  // Poll every 10s; clear on unmount
  useEffect(() => {
    clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      fetchNotifications(false);
    }, 10000);
    return () => clearInterval(pollingRef.current);
  }, [fetchNotifications]);

  // Pause polling when tab hidden; resume with immediate fetch when visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(pollingRef.current);
      } else {
        fetchNotifications();
        pollingRef.current = setInterval(() => fetchNotifications(false), 10000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      // optimistic
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
      await notificationsAPI.markAsRead(notificationId);
      fetchNotifications(false);
    } catch (err) {
      console.error('Error marking as read:', err);
      setError(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // optimistic
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await notificationsAPI.markAllAsRead(userId, userType);
      fetchNotifications(false);
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        // optimistic
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        await notificationsAPI.deleteNotification(notificationId);
        fetchNotifications(false);
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
          <div style={{ marginLeft: 'auto' }}>
            <button className="filter-button" onClick={() => fetchNotifications()} title="Refresh">Refresh</button>
          </div>
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