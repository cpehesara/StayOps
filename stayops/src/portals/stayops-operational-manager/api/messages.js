const API_BASE_URL = 'http://localhost:8080/api';

// Standard headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Replace null/undefined values with empty strings for JSON bodies and trim strings
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
    try {
      console.log('Creating message with data:', {
        messageData,
        senderId,
        senderName,
        senderType
      });

      const bodyData = sanitizeMessageData(messageData);

      const response = await fetch(
        `${API_BASE_URL}/community-messages?senderId=${senderId}&senderName=${encodeURIComponent(senderName)}&senderType=${senderType}`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(bodyData),
        }
      );

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create message: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Message created successfully:', result);
      return result;
    } catch (error) {
      console.error('createMessage error:', error);
      throw error;
    }
  },

  // Update message
  updateMessage: async (messageId, messageData, userId) => {
    const bodyData = sanitizeMessageData(messageData);
    const response = await fetch(
      `${API_BASE_URL}/community-messages/${messageId}?userId=${userId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
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
        headers: getHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to delete message');
    }
  },

  // Get message by ID
  getMessage: async (messageId) => {
    const response = await fetch(`${API_BASE_URL}/community-messages/${messageId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch message');
    }
    
    return response.json();
  },

  // Get all messages
  getAllMessages: async () => {
    const response = await fetch(`${API_BASE_URL}/community-messages`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    
    return response.json();
  },

  // Get main messages (no parent)
  getMainMessages: async () => {
    const response = await fetch(`${API_BASE_URL}/community-messages/main`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch main messages');
    }
    
    return response.json();
  },

  // Get replies
  getReplies: async (parentMessageId) => {
    const response = await fetch(
      `${API_BASE_URL}/community-messages/${parentMessageId}/replies`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch replies');
    }
    
    return response.json();
  },

  // Get announcements
  getAnnouncements: async () => {
    const response = await fetch(`${API_BASE_URL}/community-messages/announcements`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch announcements');
    }
    
    return response.json();
  },

  // Get user messages
  getUserMessages: async (senderId) => {
    const response = await fetch(
      `${API_BASE_URL}/community-messages/user/${senderId}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user messages');
    }
    
    return response.json();
  },
};