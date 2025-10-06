import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../api/notifications';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = 1; // Replace with actual user ID from context/auth
      const userType = 'RECEPTIONIST';
      
      let data;
      if (filter === 'unread') {
        data = await notificationsAPI.getUnreadNotifications(userId, userType);
      } else {
        data = await notificationsAPI.getUserNotifications(userId, userType);
      }
      
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userId = 1;
      const userType = 'RECEPTIONIST';
      await notificationsAPI.markAllAsRead(userId, userType);
      fetchNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationsAPI.deleteNotification(notificationId);
        fetchNotifications();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getNotificationColor = (type) => {
    const colors = {
      INFO: 'bg-blue-50 border-blue-200',
      SUCCESS: 'bg-green-50 border-green-200',
      WARNING: 'bg-yellow-50 border-yellow-200',
      ERROR: 'bg-red-50 border-red-200',
      RESERVATION: 'bg-purple-50 border-purple-200',
      PAYMENT: 'bg-indigo-50 border-indigo-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Notifications
          </h1>
          <p className="text-sm text-gray-500">
            View and manage your notifications
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 border text-sm transition-colors ${
              filter === 'all'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 border text-sm transition-colors ${
              filter === 'unread'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            Unread
          </button>
          <button
            onClick={handleMarkAllAsRead}
            className="ml-auto px-4 py-2 border border-gray-200 text-black text-sm hover:border-black transition-colors"
          >
            Mark All as Read
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border border-red-300 bg-red-50">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 border border-gray-200">
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border p-4 ${getNotificationColor(notification.type)} ${
                  !notification.isRead ? 'border-l-4 border-l-black' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-black">
                        {notification.title}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-white border border-gray-300 rounded">
                        {notification.type}
                      </span>
                      {!notification.isRead && (
                        <span className="text-xs px-2 py-1 bg-black text-white">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="px-3 py-1 border border-gray-300 text-xs hover:border-black transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="px-3 py-1 border border-gray-300 text-xs hover:border-red-500 hover:text-red-500 transition-colors"
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