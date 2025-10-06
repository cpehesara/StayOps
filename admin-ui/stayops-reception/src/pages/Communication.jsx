import React, { useState } from 'react';

const Communication = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [showNewMessage, setShowNewMessage] = useState(false);
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

  const messages = [
    {
      id: 1,
      from: 'John Manager',
      subject: 'Room 205 - Maintenance Required',
      preview: 'The air conditioning in room 205 needs immediate attention...',
      time: '10:30 AM',
      unread: true,
      priority: 'high',
    },
    {
      id: 2,
      from: 'Sarah Receptionist',
      subject: 'Guest Check-in Update',
      preview: 'VIP guest Mr. Johnson will be arriving at 3 PM today...',
      time: '9:15 AM',
      unread: true,
      priority: 'normal',
    },
    {
      id: 3,
      from: 'Hotel Admin',
      subject: 'Weekly Staff Meeting - Friday',
      preview: 'Reminder: Weekly staff meeting scheduled for Friday at 2 PM...',
      time: 'Yesterday',
      unread: false,
      priority: 'normal',
    },
    {
      id: 4,
      from: 'Michael Housekeeping',
      subject: 'Cleaning Schedule Update',
      preview: 'Updated cleaning schedule for this week has been posted...',
      time: 'Dec 5',
      unread: false,
      priority: 'low',
    },
  ];

  const announcements = [
    {
      id: 1,
      title: 'Holiday Schedule Announcement',
      message: 'Please review the updated holiday schedule for December. All staff members are required to confirm their availability by end of this week.',
      date: '2024-12-06',
      author: 'Hotel Management',
    },
    {
      id: 2,
      title: 'New Safety Protocol',
      message: 'Updated safety and security protocols have been implemented. Please attend the mandatory training session on Monday.',
      date: '2024-12-05',
      author: 'Security Department',
    },
  ];

  const quickContacts = [
    { name: 'Front Desk', role: 'Reception', status: 'online' },
    { name: 'Housekeeping', role: 'Cleaning', status: 'online' },
    { name: 'Maintenance', role: 'Technical', status: 'busy' },
    { name: 'Security', role: 'Safety', status: 'online' },
    { name: 'Restaurant', role: 'F&B', status: 'offline' },
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-red-300 bg-red-50',
      normal: 'border-gray-200 bg-white',
      low: 'border-gray-200 bg-gray-50',
    };
    return colors[priority] || colors.normal;
  };

  const getStatusColor = (status) => {
    const colors = {
      online: 'bg-green-500',
      busy: 'bg-yellow-500',
      offline: 'bg-gray-400',
    };
    return colors[status] || colors.offline;
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Communication Center
          </h1>
          <p className="text-sm text-gray-500">
            Manage internal communications and announcements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="mb-6 flex gap-3 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`px-6 py-3 text-sm transition-colors ${
                  activeTab === 'inbox'
                    ? 'border-b-2 border-black font-medium'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Inbox (2)
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`px-6 py-3 text-sm transition-colors ${
                  activeTab === 'sent'
                    ? 'border-b-2 border-black font-medium'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Sent
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`px-6 py-3 text-sm transition-colors ${
                  activeTab === 'announcements'
                    ? 'border-b-2 border-black font-medium'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Announcements
              </button>
            </div>

            {/* New Message Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowNewMessage(!showNewMessage)}
                className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
              >
                {showNewMessage ? 'Cancel' : 'Compose Message'}
              </button>
            </div>

            {/* New Message Form */}
            {showNewMessage && (
              <div className="mb-6 border border-gray-200 p-6">
                <h2 className="text-xl font-light mb-4">New Message</h2>
                <form onSubmit={handleSendMessage}>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-2">
                      Recipient *
                    </label>
                    <select
                      value={messageForm.recipient}
                      onChange={(e) =>
                        setMessageForm({ ...messageForm, recipient: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
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
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={messageForm.subject}
                      onChange={(e) =>
                        setMessageForm({ ...messageForm, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                      placeholder="Enter subject"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={messageForm.message}
                      onChange={(e) =>
                        setMessageForm({ ...messageForm, message: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                      rows="6"
                      placeholder="Type your message here"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-2">
                      Priority
                    </label>
                    <select
                      value={messageForm.priority}
                      onChange={(e) =>
                        setMessageForm({ ...messageForm, priority: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            )}

            {/* Messages List */}
            {activeTab === 'inbox' && (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`border p-4 cursor-pointer transition-colors hover:border-black ${getPriorityColor(
                      message.priority
                    )}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-medium ${
                              message.unread ? 'font-semibold' : ''
                            }`}
                          >
                            {message.from}
                          </h3>
                          {message.unread && (
                            <span className="px-2 py-1 text-xs bg-black text-white">
                              NEW
                            </span>
                          )}
                          {message.priority === 'high' && (
                            <span className="px-2 py-1 text-xs bg-red-500 text-white">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium mb-1">{message.subject}</p>
                        <p className="text-sm text-gray-600">{message.preview}</p>
                      </div>
                      <span className="text-xs text-gray-500 ml-4">
                        {message.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Announcements */}
            {activeTab === 'announcements' && (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium">{announcement.title}</h3>
                      <span className="px-3 py-1 text-xs bg-black text-white">
                        ANNOUNCEMENT
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      {announcement.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {announcement.author} • {announcement.date}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Sent Messages */}
            {activeTab === 'sent' && (
              <div className="text-center py-12 border border-gray-200">
                <p className="text-gray-500">No sent messages</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Contacts */}
            <div className="border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-medium mb-4">Quick Contacts</h3>
              <div className="space-y-3">
                {quickContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          contact.status
                        )}`}
                      />
                      <div>
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border border-gray-200 p-4">
              <h3 className="text-sm font-medium mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 border border-gray-200 text-sm text-left hover:border-black transition-colors">
                  Broadcast Message
                </button>
                <button className="w-full px-4 py-2 border border-gray-200 text-sm text-left hover:border-black transition-colors">
                  Emergency Alert
                </button>
                <button className="w-full px-4 py-2 border border-gray-200 text-sm text-left hover:border-black transition-colors">
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communication;