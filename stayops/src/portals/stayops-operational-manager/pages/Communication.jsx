import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/communication.css';

const Communication = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inbox');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    recipient: '',
    subject: '',
    message: '',
    priority: 'normal',
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
    setShowNewMessage(false);
    setMessageForm({
      recipient: '',
      subject: '',
      message: '',
      priority: 'normal',
    });
  };

  const handleBroadcastMessage = () => {
    // Navigate to Community Messages page
    navigate('/receptionist/messages');
  };

  const handleEmergencyAlert = () => {
    // Navigate to Community Messages page with emergency flag
    navigate('/receptionist/messages', { state: { isEmergency: true } });
  };

  const handleScheduleMeeting = () => {
    // Show meeting apps modal
    setShowMeetingModal(true);
  };

  const handleOpenMeetingApp = (appName) => {
    let appUrl = '';
    
    switch(appName) {
      case 'zoom':
        appUrl = 'zoommtg://';
        break;
      case 'meet':
        appUrl = 'https://meet.google.com/';
        break;
      case 'teams':
        appUrl = 'msteams://';
        break;
      case 'webex':
        appUrl = 'webex://';
        break;
      case 'ringcentral':
        appUrl = 'rcapp://';
        break;
      default:
        break;
    }

    if (appUrl) {
      window.location.href = appUrl;
      // Show a fallback message after a short delay
      setTimeout(() => {
        alert(`If ${appName} didn't open, please make sure the application is installed on your system.`);
      }, 1000);
    }
    
    setShowMeetingModal(false);
  };

  // TODO: Fetch data from API
  const messages = [];
  const announcements = [];
  const quickContacts = [];

  // Calculate unread count
  const unreadCount = messages.filter(m => m.unread).length;

  return (
    <div className="communication-container">
      <div className="communication-wrapper">
        
        {/* Header */}
        <div className="communication-header">
          <h1 className="communication-title">Communication Center</h1>
          <p className="communication-subtitle">Manage internal communications and announcements</p>
        </div>

        <div className="communication-layout">
          {/* Main Content */}
          <div className="communication-main">
            
            {/* Tabs */}
            <div className="communication-tabs">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`tab-button ${activeTab === 'inbox' ? 'active' : ''}`}
              >
                Inbox ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
              >
                Sent
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
              >
                Announcements
              </button>
            </div>

            {/* New Message Button */}
            <div className="compose-button-wrapper">
              <button
                onClick={() => setShowNewMessage(!showNewMessage)}
                className="btn-compose"
              >
                {showNewMessage ? 'Cancel' : 'Compose Message'}
              </button>
            </div>

            {/* New Message Form */}
            {showNewMessage && (
              <div className="message-form-card">
                <h2 className="form-title">New Message</h2>
                <form onSubmit={handleSendMessage}>
                  <div className="form-group">
                    <label className="form-label">Recipient *</label>
                    <select
                      value={messageForm.recipient}
                      onChange={(e) =>
                        setMessageForm({ ...messageForm, recipient: e.target.value })
                      }
                      className="form-select"
                      required
                    >
                      <option value="">Select recipient</option>
                      <option value="all">All Staff</option>
                      <option value="reception">Reception Team</option>
                      <option value="housekeeping">Housekeeping</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="management">Management</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <input
                      type="text"
                      value={messageForm.subject}
                      onChange={(e) =>
                        setMessageForm({ ...messageForm, subject: e.target.value })
                      }
                      className="form-input"
                      placeholder="Enter subject"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea
                      value={messageForm.message}
                      onChange={(e) =>
                        setMessageForm({ ...messageForm, message: e.target.value })
                      }
                      className="form-textarea"
                      rows="6"
                      placeholder="Type your message here"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      value={messageForm.priority}
                      onChange={(e) =>
                        setMessageForm({ ...messageForm, priority: e.target.value })
                      }
                      className="form-select"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <button type="submit" className="btn-send">
                    Send Message
                  </button>
                </form>
              </div>
            )}

            {/* Messages List */}
            {activeTab === 'inbox' && (
              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-state-text">No messages in inbox</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message-card priority-${message.priority}`}
                    >
                      <div className="message-header">
                        <div className="message-info">
                          <div className="message-from-wrapper">
                            <h3 className={`message-from ${message.unread ? 'unread' : ''}`}>
                              {message.from}
                            </h3>
                            {message.unread && (
                              <span className="badge badge-new">NEW</span>
                            )}
                            {message.priority === 'high' && (
                              <span className="badge badge-urgent">URGENT</span>
                            )}
                          </div>
                          <p className="message-subject">{message.subject}</p>
                          <p className="message-preview">{message.preview}</p>
                        </div>
                        <span className="message-time">{message.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Announcements */}
            {activeTab === 'announcements' && (
              <div className="announcements-list">
                {announcements.length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-state-text">No announcements available</p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="announcement-card">
                      <div className="announcement-header">
                        <h3 className="announcement-title">{announcement.title}</h3>
                        <span className="badge badge-announcement">ANNOUNCEMENT</span>
                      </div>
                      <p className="announcement-message">{announcement.message}</p>
                      <p className="announcement-meta">
                        {announcement.author} • {announcement.date}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sent Messages */}
            {activeTab === 'sent' && (
              <div className="empty-state">
                <p className="empty-state-text">No sent messages</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="communication-sidebar">
            
            {/* Quick Contacts */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Quick Contacts</h3>
              <div className="contacts-list">
                {quickContacts.length === 0 ? (
                  <p className="empty-state-text">No contacts available</p>
                ) : (
                  quickContacts.map((contact, index) => (
                    <div key={index} className="contact-item">
                      <div className="contact-info">
                        <div className={`status-indicator status-${contact.status}`} />
                        <div>
                          <p className="contact-name">{contact.name}</p>
                          <p className="contact-role">{contact.role}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Quick Actions</h3>
              <div className="actions-list">
                <button 
                  className="action-button"
                  onClick={handleBroadcastMessage}
                >
                  Broadcast Message
                </button>
                <button 
                  className="action-button"
                  onClick={handleEmergencyAlert}
                >
                  Emergency Alert
                </button>
                <button 
                  className="action-button"
                  onClick={handleScheduleMeeting}
                >
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Apps Modal */}
      {showMeetingModal && (
        <div className="modal-overlay" onClick={() => setShowMeetingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Schedule Meeting</h2>
              <p className="modal-subtitle">Choose your preferred meeting platform</p>
            </div>
            
            <div className="modal-body">
              <div className="meeting-apps-grid">
                <button 
                  className="app-button"
                  onClick={() => handleOpenMeetingApp('zoom')}
                >
                  <div className="app-icon zoom">🎥</div>
                  <span className="app-name">Zoom</span>
                </button>

                <button 
                  className="app-button"
                  onClick={() => handleOpenMeetingApp('meet')}
                >
                  <div className="app-icon meet">📹</div>
                  <span className="app-name">Google Meet</span>
                </button>

                <button 
                  className="app-button"
                  onClick={() => handleOpenMeetingApp('teams')}
                >
                  <div className="app-icon teams">💼</div>
                  <span className="app-name">Microsoft Teams</span>
                </button>

                <button 
                  className="app-button"
                  onClick={() => handleOpenMeetingApp('webex')}
                >
                  <div className="app-icon webex">🌐</div>
                  <span className="app-name">Webex</span>
                </button>

                <button 
                  className="app-button"
                  onClick={() => handleOpenMeetingApp('ringcentral')}
                  style={{ gridColumn: 'span 2' }}
                >
                  <div className="app-icon ringcentral">☎️</div>
                  <span className="app-name">RingCentral</span>
                </button>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-modal-close"
                onClick={() => setShowMeetingModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;