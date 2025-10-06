import React, { useState, useEffect } from 'react';
import { messagesAPI } from '../api/messages';

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
    if (!replyText) return;

    try {
      const senderId = 1;
      const senderName = localStorage.getItem('userEmail') || 'Receptionist';
      const senderType = 'RECEPTIONIST';

      await messagesAPI.createMessage(
        { message: replyText, parentMessageId },
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
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Community Messages
          </h1>
          <p className="text-sm text-gray-500">
            Staff communication and announcements
          </p>
        </div>

        {/* New Message Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowNewMessage(!showNewMessage)}
            className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
          >
            {showNewMessage ? 'Cancel' : 'New Message'}
          </button>
        </div>

        {/* New Message Form */}
        {showNewMessage && (
          <div className="mb-8 border border-gray-200 p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                  placeholder="Enter subject"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                  rows="4"
                  placeholder="Enter your message"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isAnnouncement}
                    onChange={(e) => setFormData({ ...formData, isAnnouncement: e.target.checked })}
                    className="border-gray-300"
                  />
                  <span className="text-sm">Post as Announcement</span>
                </label>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
              >
                Post Message
              </button>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border border-red-300 bg-red-50">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-light mb-4">Announcements</h2>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border-l-4 border-black bg-yellow-50 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {announcement.subject && (
                        <h3 className="font-medium text-black mb-2">{announcement.subject}</h3>
                      )}
                      <p className="text-sm text-gray-700 mb-2">{announcement.message}</p>
                      <p className="text-xs text-gray-500">
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
        <div className="mb-8">
          <h2 className="text-2xl font-light mb-4">Messages</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 border border-gray-200">
              <p className="text-gray-500">No messages found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="border border-gray-200 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {message.subject && (
                        <h3 className="font-medium text-black mb-2">{message.subject}</h3>
                      )}
                      <p className="text-sm text-gray-700 mb-2">{message.message}</p>
                      <p className="text-xs text-gray-500">
                        By {message.senderName} • {new Date(message.createdAt).toLocaleString()}
                      </p>
                      {message.replyCount > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleReply(message.id)}
                        className="px-3 py-1 border border-gray-200 text-xs hover:border-black transition-colors"
                      >
                        Reply
                      </button>
                      {message.replyCount > 0 && (
                        <button
                          onClick={() => handleViewReplies(message.id)}
                          className="px-3 py-1 border border-gray-200 text-xs hover:border-black transition-colors"
                        >
                          View Replies
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Replies */}
                  {selectedMessage === message.id && replies.length > 0 && (
                    <div className="mt-4 ml-8 space-y-2">
                      {replies.map((reply) => (
                        <div key={reply.id} className="border-l-2 border-gray-300 pl-4 py-2">
                          <p className="text-sm text-gray-700 mb-1">{reply.message}</p>
                          <p className="text-xs text-gray-500">
                            {reply.senderName} • {new Date(reply.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityMessages;