import React, { useState, useEffect, useCallback } from 'react';
import serviceRequestApi from '../api/serviceRequestApi';
import '../styles/service-requests.css';

const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // Form state
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    requestedBy: '',
    roomId: '',
    roomNumber: '',
    reservationId: '',
    assignedTo: '',
    notes: ''
  });

  // Load service requests
  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...requests];

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }

    if (filterPriority !== 'ALL') {
      filtered = filtered.filter(req => req.priority === filterPriority);
    }

    if (filterType !== 'ALL') {
      filtered = filtered.filter(req => req.serviceType === filterType);
    }

    setFilteredRequests(filtered);
  }, [requests, filterStatus, filterPriority, filterType]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const data = await serviceRequestApi.getAllServiceRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Failed to load service requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // applyFilters defined above with useCallback

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await serviceRequestApi.createServiceRequest(formData);
      setShowCreateModal(false);
      resetForm();
      fetchServiceRequests();
    } catch (err) {
      alert('Failed to create service request: ' + err);
    }
  };

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    try {
      await serviceRequestApi.updateServiceRequest(selectedRequest.id, formData);
      setShowEditModal(false);
      setSelectedRequest(null);
      resetForm();
      fetchServiceRequests();
    } catch (err) {
      alert('Failed to update service request: ' + err);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this service request?')) {
      try {
        await serviceRequestApi.deleteServiceRequest(id);
        fetchServiceRequests();
      } catch (err) {
        alert('Failed to delete service request: ' + err);
      }
    }
  };

  const handleAssignToStaff = async (id) => {
    const staffId = prompt('Enter Staff ID to assign:');
    if (staffId) {
      try {
        await serviceRequestApi.assignToStaff(id, staffId);
        fetchServiceRequests();
      } catch (err) {
        alert('Failed to assign staff: ' + err);
      }
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      await serviceRequestApi.markAsCompleted(id);
      fetchServiceRequests();
    } catch (err) {
      alert('Failed to mark as completed: ' + err);
    }
  };

  const handleEditClick = (request) => {
    setSelectedRequest(request);
    setFormData({
      serviceType: request.serviceType || '',
      description: request.description || '',
      priority: request.priority || 'MEDIUM',
      status: request.status || 'PENDING',
      requestedBy: request.requestedBy || '',
      roomId: request.roomId || '',
      roomNumber: request.roomNumber || '',
      reservationId: request.reservationId || '',
      assignedTo: request.assignedTo || '',
      notes: request.notes || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      serviceType: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      requestedBy: '',
      roomId: '',
      roomNumber: '',
      reservationId: '',
      assignedTo: '',
      notes: ''
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'URGENT': return 'priority-urgent';
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'status-completed';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'PENDING': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="service-requests-container">
        <div className="loading-state">Loading service requests...</div>
      </div>
    );
  }

  return (
    <div className="service-requests-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Service Requests</h1>
          <p className="page-subtitle">MANAGE ALL SERVICE REQUESTS</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          Create Request
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label className="filter-label">STATUS</label>
          <select 
            className="filter-select" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">PRIORITY</label>
          <select 
            className="filter-select" 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">TYPE</label>
          <select 
            className="filter-select" 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="HOUSEKEEPING">Housekeeping</option>
            <option value="ROOM_SERVICE">Room Service</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="LAUNDRY">Laundry</option>
          </select>
        </div>
      </div>

      {/* Service Requests List */}
      <div className="requests-list">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-text">No service requests found</div>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <div className="request-info">
                  <h3 className="request-id">Request #{request.id}</h3>
                  <span className={`priority-badge ${getPriorityClass(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className={`status-badge ${getStatusClass(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="request-actions">
                  <button className="btn-action" onClick={() => handleEditClick(request)}>
                    Edit
                  </button>
                  {request.status !== 'COMPLETED' && (
                    <>
                      <button className="btn-action" onClick={() => handleAssignToStaff(request.id)}>
                        Assign
                      </button>
                      <button className="btn-action" onClick={() => handleMarkCompleted(request.id)}>
                        Complete
                      </button>
                    </>
                  )}
                  <button className="btn-action-danger" onClick={() => handleDeleteRequest(request.id)}>
                    Delete
                  </button>
                </div>
              </div>

              <div className="request-body">
                <div className="request-detail">
                  <span className="detail-label">TYPE:</span>
                  <span className="detail-value">{request.serviceType}</span>
                </div>
                <div className="request-detail">
                  <span className="detail-label">ROOM:</span>
                  <span className="detail-value">{request.roomNumber || '—'}</span>
                </div>
                <div className="request-detail">
                  <span className="detail-label">REQUESTED BY:</span>
                  <span className="detail-value">{request.requestedBy || '—'}</span>
                </div>
                <div className="request-detail">
                  <span className="detail-label">ASSIGNED TO:</span>
                  <span className="detail-value">{request.assignedTo || 'Unassigned'}</span>
                </div>
              </div>

              {request.description && (
                <div className="request-description">
                  <span className="detail-label">DESCRIPTION:</span>
                  <p className="description-text">{request.description}</p>
                </div>
              )}

              {request.notes && (
                <div className="request-notes">
                  <span className="detail-label">NOTES:</span>
                  <p className="notes-text">{request.notes}</p>
                </div>
              )}

              <div className="request-footer">
                <span className="request-date">
                  Created: {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Service Request</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateRequest} className="request-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Service Type *</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="ROOM_SERVICE">Room Service</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="LAUNDRY">Laundry</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., 205"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Requested By</label>
                  <input
                    type="text"
                    name="requestedBy"
                    value={formData.requestedBy}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Guest name or ID"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Describe the service request..."
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="2"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Service Request #{selectedRequest?.id}</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <form onSubmit={handleUpdateRequest} className="request-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Service Type *</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="ROOM_SERVICE">Room Service</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="LAUNDRY">Laundry</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned To</label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Staff ID or name"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Describe the service request..."
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="2"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;