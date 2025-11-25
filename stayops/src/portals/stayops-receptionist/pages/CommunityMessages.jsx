import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X, AlertCircle, Megaphone } from 'lucide-react';
import { messagesAPI } from '../api/messages';
import '../styles/community-messages.css';

const CommunityMessages = () => {
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replies, setReplies] = useState([]);
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    isAnnouncement: false,
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const [mainMessages, announcementData] = await Promise.all([
        messagesAPI.getMainMessages(),
        messagesAPI.getAnnouncements(),
      ]);
      setMessages(mainMessages);
      setAnnouncements(announcementData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const senderId = 1; // Replace with actual user ID
      const senderName = localStorage.getItem('userEmail') || 'Receptionist';
      const senderType = 'RECEPTIONIST';

      await messagesAPI.createMessage(formData, senderId, senderName, senderType);
      
      setFormData({ subject: '', message: '', isAnnouncement: false });
      setShowNewMessage(false);
      fetchMessages();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewReplies = async (messageId) => {
    try {
      const repliesData = await messagesAPI.getReplies(messageId);
      setReplies(repliesData);
      setSelectedMessage(messageId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReply = async (parentMessageId) => {
    const replyText = prompt('Enter your reply:');
    if (!replyText || !replyText.trim()) return;

    try {
      const senderId = 1;
      const senderName = localStorage.getItem('userEmail') || 'Receptionist';
      const senderType = 'RECEPTIONIST';

      await messagesAPI.createMessage(
        { message: replyText.trim(), parentMessageId, subject: 'Reply' },
        senderId,
        senderName,
        senderType
      );

      handleViewReplies(parentMessageId);
      fetchMessages();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="community-messages-container">
      <div className="community-messages-wrapper">
        
        {/* Header */}
        <div className="community-messages-header">
          <div className="community-messages-header-content">
            <div>
              <h1 className="community-messages-title">Community Messages</h1>
              <p className="community-messages-subtitle">Staff communication and announcements</p>
            </div>
          </div>
        </div>

        {/* New Message Button */}
        <div className="new-message-button-container">
          <button
            onClick={() => setShowNewMessage(!showNewMessage)}
            className={`btn-new-message ${showNewMessage ? 'active' : ''}`}
          >
            {showNewMessage ? (
              <>
                <X size={16} /> Cancel
              </>
            ) : (
              <>
                <MessageSquare size={16} /> New Message
              </>
            )}
          </button>
        </div>

        {/* New Message Form */}
        {showNewMessage && (
          <div className="new-message-form-container">
            <h3 className="form-title">Compose Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">SUBJECT</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="form-input"
                  placeholder="Enter subject"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">MESSAGE</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-textarea"
                  placeholder="Enter your message"
                  required
                />
              </div>
              
              <div className="checkbox-container">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isAnnouncement}
                    onChange={(e) => setFormData({ ...formData, isAnnouncement: e.target.checked })}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Post as Announcement</span>
                </label>
              </div>
              
              <button type="submit" className="btn-submit">
                <Send size={16} /> Post Message
              </button>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message-container">
            <div className="error-message-content">
              <AlertCircle size={16} className="error-icon" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="announcements-section">
            <div className="announcements-header">
              <Megaphone size={20} className="announcements-icon" />
              <h2 className="announcements-title">Announcements</h2>
            </div>
            <div className="announcements-list">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-card">
                  <div className="announcement-content">
                    <div className="announcement-body">
                      {announcement.subject && (
                        <h3 className="announcement-subject">{announcement.subject}</h3>
                      )}
                      <p className="announcement-message">{announcement.message}</p>
                      <p className="announcement-meta">
                        By {announcement.senderName} • {new Date(announcement.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="messages-section">
          <h2 className="messages-title">Messages</h2>
          
          {loading ? (
            <div className="loading-state">
              <p className="loading-text">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={32} className="empty-state-icon" />
              <p className="empty-state-text">No messages found</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => (
                <div key={message.id} className="message-card">
                  <div className="message-card-content">
                    <div className="message-body">
                      {message.subject && (
                        <h3 className="message-subject">{message.subject}</h3>
                      )}
                      <p className="message-text">{message.message}</p>
                      <div className="message-meta">
                        <span>By {message.senderName}</span>
                        <span>•</span>
                        <span>{new Date(message.createdAt).toLocaleString()}</span>
                        {message.replyCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="message-meta-highlight">
                              {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="message-actions">
                      <button
                        onClick={() => handleReply(message.id)}
                        className="btn-reply"
                      >
                        Reply
                      </button>
                      {message.replyCount > 0 && (
                        <button
                          onClick={() => handleViewReplies(message.id)}
                          className="btn-view-replies"
                        >
                          View Replies
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Replies */}
                  {selectedMessage === message.id && replies.length > 0 && (
                    <div className="replies-container">
                      <div className="replies-list">
                        {replies.map((reply) => (
                          <div key={reply.id} className="reply-card">
                            <p className="reply-text">{reply.message}</p>
                            <p className="reply-meta">
                              {reply.senderName} • {new Date(reply.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-card-title">About Messages</div>
              <div className="info-card-content">
                <div className="info-list">
                  <div>• Use messages to communicate with your team</div>
                  <div>• Mark important updates as announcements</div>
                  <div>• Reply to messages to keep conversations organized</div>
                </div>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-title">Announcements</div>
              <div className="info-card-content">
                Important updates are highlighted at the top. Use announcements for urgent or critical information that everyone needs to see.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityMessages;