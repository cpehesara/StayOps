import React, { useState, useEffect } from 'react';
import '../styles/guest-requests.css';

const GuestRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // TODO: Fetch requests from API
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await requestsAPI.getAllRequests();
      // setRequests(data);
      
      // Temporary: Set empty array
      setRequests([]);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (requestId) => {
    console.log(`Assigning request ${requestId}`);
    // TODO: Implement assign functionality with API
  };

  const handleComplete = (requestId) => {
    console.log(`Completing request ${requestId}`);
    // TODO: Implement complete functionality with API
  };

  const handleDetails = (requestId) => {
    console.log(`Viewing details for request ${requestId}`);
    // TODO: Implement view details modal or navigation
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.roomNumber?.includes(searchTerm) ||
                         request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.requestType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProgressCount = requests.filter(r => r.status === 'in-progress').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="guest-requests-container">
      <div className="guest-requests-wrapper">
        
        {/* Header */}
        <div className="guest-requests-header">
          <h1 className="guest-requests-title">Guest Requests</h1>
          <p className="guest-requests-subtitle">Manage and track all service requests</p>
        </div>

        {/* Stats Cards */}
        <div className="requests-stats">
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{pendingCount}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{inProgressCount}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{completedCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="requests-filters">
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
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
        {loading ? (
          <div className="empty-state">
            <p className="empty-state-text">Loading requests...</p>
          </div>
        ) : (
          <div className="requests-list">
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">
                  {requests.length === 0 ? 'No requests available' : 'No requests found matching your search'}
                </p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-card-content">
                    
                    {/* Request Header */}
                    <div className="request-header">
                      <div className="request-info">
                        <div className="request-info-top">
                          <h3 className="request-guest-name">{request.guestName}</h3>
                          <span className="request-room">Room {request.roomNumber}</span>
                        </div>
                        <p className="request-type">
                          {request.requestType?.replace('-', ' ')}
                        </p>
                        <p className="request-description">{request.description}</p>
                      </div>
                      
                      <div className="request-badges">
                        <span className={`badge badge-priority ${request.priority}`}>
                          {request.priority}
                        </span>
                        <span className={`badge badge-status ${request.status}`}>
                          {request.status?.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Request Details Grid */}
                    <div className="request-details-grid">
                      <div className="request-detail-item">
                        <div className="request-detail-label">Request Time</div>
                        <div className="request-detail-value">{request.requestTime}</div>
                      </div>
                      <div className="request-detail-item">
                        <div className="request-detail-label">Estimated</div>
                        <div className="request-detail-value">{request.estimatedTime}</div>
                      </div>
                      {request.assignedTo && (
                        <div className="request-detail-item">
                          <div className="request-detail-label">Assigned To</div>
                          <div className="request-detail-value">{request.assignedTo}</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="request-actions">
                      {request.status === 'pending' && (
                        <button 
                          onClick={() => handleAssign(request.id)}
                          className="btn-assign"
                        >
                          Assign
                        </button>
                      )}
                      {request.status === 'in-progress' && (
                        <button 
                          onClick={() => handleComplete(request.id)}
                          className="btn-complete"
                        >
                          Complete
                        </button>
                      )}
                      <button 
                        onClick={() => handleDetails(request.id)}
                        className="btn-details"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestRequests;