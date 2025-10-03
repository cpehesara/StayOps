import React, { useState } from 'react';

const GuestRequests = ({ requests = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const getRequestIcon = (type) => {
    switch (type) {
      case 'housekeeping': return '🏠';
      case 'maintenance': return '🔧';
      case 'room-service': return '🍽️';
      case 'laundry': return '👕';
      case 'spa': return '💆';
      default: return '📋';
    }
  };

  const handleAssign = (requestId) => {
    console.log(`Assigning request ${requestId}`);
  };

  const handleComplete = (requestId) => {
    console.log(`Completing request ${requestId}`);
  };

  const handleDetails = (requestId) => {
    console.log(`Viewing details for request ${requestId}`);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.roomNumber.includes(searchTerm) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.requestType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProgressCount = requests.filter(r => r.status === 'in-progress').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-16 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Guest Requests
          </h1>
          <p className="text-sm text-gray-500">
            Manage and track all service requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border border-gray-200 p-6 hover:border-black transition-colors">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Pending</div>
            <div className="text-3xl font-light">{pendingCount}</div>
          </div>
          
          <div className="border border-gray-200 p-6 hover:border-black transition-colors">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">In Progress</div>
            <div className="text-3xl font-light">{inProgressCount}</div>
          </div>
          
          <div className="border border-gray-200 p-6 hover:border-black transition-colors">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Completed</div>
            <div className="text-3xl font-light">{completedCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-12 flex-wrap">
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-64 px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
          >
            <option value="all">All Types</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="maintenance">Maintenance</option>
            <option value="room-service">Room Service</option>
            <option value="laundry">Laundry</option>
            <option value="spa">Spa Services</option>
          </select>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-gray-400 text-sm">No requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div 
                key={request.id} 
                className="border border-gray-200 hover:border-black transition-colors"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-light tracking-tight">
                          {request.guestName}
                        </h3>
                        <span className="text-xs text-gray-400">
                          Room {request.roomNumber}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        {request.requestType.replace('-', ' ')}
                      </p>
                      <p className="text-black mb-6">
                        {request.description}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 text-xs ${
                        request.priority === 'high' ? 'bg-black text-white' : 
                        request.priority === 'medium' ? 'bg-gray-300 text-black' : 
                        'border border-gray-300 text-black'
                      }`}>
                        {request.priority}
                      </span>
                      <span className={`px-3 py-1 text-xs ${
                        request.status === 'completed' ? 'bg-black text-white' : 
                        request.status === 'in-progress' ? 'bg-gray-300 text-black' : 
                        'border border-gray-300 text-black'
                      }`}>
                        {request.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6 pb-6 border-b border-gray-100">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Request Time</div>
                      <div className="text-gray-900">{request.requestTime}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Estimated</div>
                      <div className="text-gray-900">{request.estimatedTime}</div>
                    </div>
                    {request.assignedTo && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Assigned To</div>
                        <div className="text-gray-900">{request.assignedTo}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {request.status === 'pending' && (
                      <button 
                        onClick={() => handleAssign(request.id)}
                        className="px-4 py-2 bg-black text-white text-xs hover:bg-gray-900 transition-colors"
                      >
                        Assign
                      </button>
                    )}
                    {request.status === 'in-progress' && (
                      <button 
                        onClick={() => handleComplete(request.id)}
                        className="px-4 py-2 bg-black text-white text-xs hover:bg-gray-900 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    <button 
                      onClick={() => handleDetails(request.id)}
                      className="px-4 py-2 border border-gray-200 text-black text-xs hover:border-black transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Demo with sample data
const mockRequests = [
  {
    id: 'REQ001',
    guestName: 'John Smith',
    roomNumber: '101',
    requestType: 'housekeeping',
    description: 'Extra towels and toiletries needed',
    priority: 'medium',
    status: 'pending',
    requestTime: '2024-01-15 10:30',
    assignedTo: 'Maria Garcia',
    estimatedTime: '30 mins'
  },
  {
    id: 'REQ002',
    guestName: 'Emily Johnson',
    roomNumber: '205',
    requestType: 'maintenance',
    description: 'Air conditioning not working properly',
    priority: 'high',
    status: 'in-progress',
    requestTime: '2024-01-15 09:15',
    assignedTo: 'Mike Wilson',
    estimatedTime: '2 hours'
  },
  {
    id: 'REQ003',
    guestName: 'Michael Brown',
    roomNumber: '301',
    requestType: 'room-service',
    description: 'Room service - Dinner for 2',
    priority: 'medium',
    status: 'completed',
    requestTime: '2024-01-15 19:00',
    assignedTo: 'James Lee',
    estimatedTime: '45 mins'
  },
  {
    id: 'REQ004',
    guestName: 'Sarah Davis',
    roomNumber: '102',
    requestType: 'laundry',
    description: 'Laundry pickup and delivery',
    priority: 'low',
    status: 'pending',
    requestTime: '2024-01-15 11:45',
    assignedTo: null,
    estimatedTime: '24 hours'
  }
];

export default () => <GuestRequests requests={mockRequests} />;