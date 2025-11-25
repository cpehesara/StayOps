const API_BASE_URL = 'http://localhost:8080/api';

// Replace null/undefined with empty strings and trim strings
const sanitizeMessageData = (data) => {
  const input = data || {};
  const sanitized = {};
  Object.entries(input).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      sanitized[key] = '';
    } else if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  });
  return sanitized;
};

export const messagesAPI = {
  // Create message
  createMessage: async (messageData, senderId, senderName, senderType) => {
    const bodyData = sanitizeMessageData(messageData);
    const response = await fetch(
      `${API_BASE_URL}/community-messages?senderId=${senderId}&senderName=${encodeURIComponent(senderName)}&senderType=${senderType}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to create message');
    }
    
    return response.json();
  },

  // Update message
  updateMessage: async (messageId, messageData, userId) => {
    const bodyData = sanitizeMessageData(messageData);
    const response = await fetch(
      `${API_BASE_URL}/community-messages/${messageId}?userId=${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update message');
    }
    
    return response.json();
  },

  // Delete message
  deleteMessage: async (messageId, userId) => {
    const response = await fetch(
      `${API_BASE_URL}/community-messages/${messageId}?userId=${userId}`,
      {
        method: 'DELETE',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to delete message');
    }
  },

  // Get message by ID
  getMessage: async (messageId) => {
    const response = await fetch(`${API_BASE_URL}/community-messages/${messageId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch message');
    }
    
    return response.json();
  },

  // Get all messages
  getAllMessages: async () => {
    const response = await fetch(`${API_BASE_URL}/community-messages`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    
    return response.json();
  },

  // Get main messages (no parent)
  getMainMessages: async () => {
    const response = await fetch(`${API_BASE_URL}/community-messages/main`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch main messages');
    }
    
    return response.json();
  },

  // Get replies
  getReplies: async (parentMessageId) => {
    const response = await fetch(
      `${API_BASE_URL}/community-messages/${parentMessageId}/replies`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch replies');
    }
    
    return response.json();
  },

  // Get announcements
  getAnnouncements: async () => {
    const response = await fetch(`${API_BASE_URL}/community-messages/announcements`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch announcements');
    }
    
    return response.json();
  },

  // Get user messages
  getUserMessages: async (senderId) => {
    const response = await fetch(
      `${API_BASE_URL}/community-messages/user/${senderId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user messages');
    }
    
    return response.json();
  },
};