import React, { useState } from 'react';

const GuestRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

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

  const filteredRequests = mockRequests.filter(request => {
    const matchesSearch = request.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.roomNumber.includes(searchTerm) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.requestType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8 border-b border-black pb-4">
        <h1 className="text-4xl font-bold text-black mb-2">
          GUEST REQUESTS
        </h1>
        <p className="text-gray-600 uppercase tracking-wide">
          Manage and track all guest service requests
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Search */}
        <div className="flex-1 min-w-80">
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:border-gray-600"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border-2 border-black bg-white text-black focus:outline-none focus:border-gray-600"
        >
          <option value="all">ALL STATUS</option>
          <option value="pending">PENDING</option>
          <option value="in-progress">IN PROGRESS</option>
          <option value="completed">COMPLETED</option>
        </select>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 border-2 border-black bg-white text-black focus:outline-none focus:border-gray-600"
        >
          <option value="all">ALL TYPES</option>
          <option value="housekeeping">HOUSEKEEPING</option>
          <option value="maintenance">MAINTENANCE</option>
          <option value="room-service">ROOM SERVICE</option>
          <option value="laundry">LAUNDRY</option>
          <option value="spa">SPA SERVICES</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border-2 border-black p-6 bg-white">
          <div className="text-center">
            <div className="text-4xl mb-2">⏳</div>
            <h3 className="text-3xl font-bold text-black mb-2">
              {mockRequests.filter(r => r.status === 'pending').length}
            </h3>
            <p className="text-black font-semibold uppercase tracking-wide">Pending</p>
          </div>
        </div>
        
        <div className="border-2 border-black p-6 bg-white">
          <div className="text-center">
            <div className="text-4xl mb-2">🔄</div>
            <h3 className="text-3xl font-bold text-black mb-2">
              {mockRequests.filter(r => r.status === 'in-progress').length}
            </h3>
            <p className="text-black font-semibold uppercase tracking-wide">In Progress</p>
          </div>
        </div>
        
        <div className="border-2 border-black p-6 bg-white">
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-3xl font-bold text-black mb-2">
              {mockRequests.filter(r => r.status === 'completed').length}
            </h3>
            <p className="text-black font-semibold uppercase tracking-wide">Completed</p>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="border-2 border-black p-12 text-center bg-white">
            <p className="text-black font-semibold uppercase tracking-wide">No requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="border-2 border-black p-6 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Content */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-2xl">
                      {getRequestIcon(request.requestType)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-1">
                        {request.guestName.toUpperCase()} - ROOM {request.roomNumber}
                      </h3>
                      <p className="text-gray-600 uppercase tracking-wide text-sm font-semibold">
                        {request.requestType.replace('-', ' ')} REQUEST
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-black mb-4 font-medium">
                    {request.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-bold text-black uppercase">Request Time:</span>
                      <br />
                      <span className="text-gray-600">{request.requestTime}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black uppercase">Estimated:</span>
                      <br />
                      <span className="text-gray-600">{request.estimatedTime}</span>
                    </div>
                    {request.assignedTo && (
                      <div>
                        <span className="font-bold text-black uppercase">Assigned to:</span>
                        <br />
                        <span className="text-gray-600">{request.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Content */}
                <div className="flex flex-col gap-4 lg:items-end">
                  {/* Status and Priority */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 border-2 border-black text-xs font-bold uppercase tracking-wide ${
                      request.priority === 'high' ? 'bg-black text-white' : 
                      request.priority === 'medium' ? 'bg-gray-200 text-black' : 
                      'bg-white text-black'
                    }`}>
                      {request.priority} Priority
                    </span>
                    <span className={`px-3 py-1 border-2 border-black text-xs font-bold uppercase tracking-wide ${
                      request.status === 'completed' ? 'bg-black text-white' : 
                      request.status === 'in-progress' ? 'bg-gray-200 text-black' : 
                      'bg-white text-black'
                    }`}>
                      {request.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {request.status === 'pending' && (
                      <button 
                        onClick={() => handleAssign(request.id)}
                        className="px-4 py-2 bg-black text-white font-bold uppercase text-xs tracking-wide hover:bg-gray-800 transition-colors"
                      >
                        Assign
                      </button>
                    )}
                    {request.status === 'in-progress' && (
                      <button 
                        onClick={() => handleComplete(request.id)}
                        className="px-4 py-2 bg-black text-white font-bold uppercase text-xs tracking-wide hover:bg-gray-800 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    <button 
                      onClick={() => handleDetails(request.id)}
                      className="px-4 py-2 border-2 border-black bg-white text-black font-bold uppercase text-xs tracking-wide hover:bg-gray-100 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GuestRequests;