import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllServiceRequests,
  createServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
  updateServiceRequestStatus,
  markAsCompleted,
  getPendingRequests,
  getUrgentRequests
} from '../api/service-request-api';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';
import '../styles/service-requests.css';
import { staffAPI } from '../api/staff';

const ServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [filters, setFilters] = useState({
    status: 'ALL',
    type: 'ALL',
    priority: 'ALL'
  });

  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    status: 'PENDING',
    requestedBy: '',
    priority: 'MEDIUM',
    reservationId: '',
    roomId: '',
    assignedTo: '',
    notes: ''
  });

  // Staff for assignment (used primarily during edit)
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const serviceTypes = ['HOUSEKEEPING', 'ROOM_SERVICE', 'MAINTENANCE', 'LAUNDRY'];
  const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  useEffect(() => {
    fetchServiceRequests();
    // Preload staff list for quick edit experience (non-blocking)
    preloadStaff();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...serviceRequests];

    if (filters.status !== 'ALL') {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    if (filters.type !== 'ALL') {
      filtered = filtered.filter(req => req.serviceType === filters.type);
    }

    if (filters.priority !== 'ALL') {
      filtered = filtered.filter(req => req.priority === filters.priority);
    }

    // Search removed

    setFilteredRequests(filtered);
  }, [serviceRequests, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllServiceRequests();
      setServiceRequests(data);
    } catch (error) {
      showErrorToast('Failed to fetch service requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const preloadStaff = async () => {
    try {
      setStaffLoading(true);
      const data = await staffAPI.getAllStaff();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch staff list:', error);
      // Do not toast here to avoid noise; list will just be empty
    } finally {
      setStaffLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleQuickFilter = async (filterType) => {
    try {
      setLoading(true);
      setActiveQuickFilter(filterType);
      let data;
      switch (filterType) {
        case 'pending':
          data = await getPendingRequests();
          break;
        case 'urgent':
          data = await getUrgentRequests();
          break;
        default:
          data = await getAllServiceRequests();
      }
      setServiceRequests(data);
    } catch (error) {
      showErrorToast('Failed to fetch filtered requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      serviceType: '',
      description: '',
      status: 'PENDING',
      requestedBy: '',
      priority: 'MEDIUM',
      reservationId: '',
      roomId: '',
      assignedTo: '',
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (request) => {
    setModalMode('edit');
    setSelectedRequest(request);
    setFormData({
      serviceType: request.serviceType || '',
      description: request.description || '',
      status: request.status || 'PENDING',
      requestedBy: request.requestedBy || '',
      priority: request.priority || 'MEDIUM',
      reservationId: request.reservationId || '',
      roomId: request.roomId || '',
      assignedTo: request.assignedTo || '',
      notes: request.notes || ''
    });
    // Ensure staff is loaded when entering edit
    if (!staff || staff.length === 0) {
      preloadStaff();
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        reservationId: formData.reservationId ? parseInt(formData.reservationId) : null,
        roomId: formData.roomId ? parseInt(formData.roomId) : null
      };

      if (modalMode === 'create') {
        await createServiceRequest(payload);
        showSuccessToast('Service request created successfully');
      } else {
        await updateServiceRequest(selectedRequest.id, payload);
        showSuccessToast('Service request updated successfully');
      }

      setShowModal(false);
      fetchServiceRequests();
    } catch (error) {
      showErrorToast(modalMode === 'create' ? 'Failed to create service request' : 'Failed to update service request');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service request?')) {
      try {
        await deleteServiceRequest(id);
        showSuccessToast('Service request deleted successfully');
        fetchServiceRequests();
      } catch (error) {
        showErrorToast('Failed to delete service request');
        console.error(error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === 'COMPLETED') {
        await markAsCompleted(id);
      } else {
        await updateServiceRequestStatus(id, newStatus);
      }
      showSuccessToast('Status updated successfully');
      fetchServiceRequests();
    } catch (error) {
      showErrorToast('Failed to update status');
      console.error(error);
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'PENDING': 'badge-warning',
      'IN_PROGRESS': 'badge-info',
      'COMPLETED': 'badge-success',
      'CANCELLED': 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
  };

  const getPriorityBadgeClass = (priority) => {
    const classes = {
      'LOW': 'badge-secondary',
      'MEDIUM': 'badge-info',
      'HIGH': 'badge-warning',
      'URGENT': 'badge-danger'
    };
    return classes[priority] || 'badge-secondary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: serviceRequests.length,
    pending: serviceRequests.filter(r => r.status === 'PENDING').length,
    inProgress: serviceRequests.filter(r => r.status === 'IN_PROGRESS').length,
    completed: serviceRequests.filter(r => r.status === 'COMPLETED').length,
    urgent: serviceRequests.filter(r => r.priority === 'URGENT' && r.status !== 'COMPLETED').length
  };

  return (
    <div className="service-requests-container">
      <div className="service-requests-wrapper">
        {/* Header */}
        <div className="service-requests-header">
          <div className="service-requests-header-info">
            <h1>Service Request Management</h1>
            <p>View and manage service requests across all departments</p>
          </div>
          <div className="service-requests-header-actions">
            <button className="btn-primary" onClick={openCreateModal}>
              + New Request
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Requests</div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card stat-danger">
            <div className="stat-value">{stats.urgent}</div>
            <div className="stat-label">Urgent</div>
          </div>
        </div>

        {/* Controls Bar with Quick Filters */}
        <div className="controls-bar">
          <div className="quick-filters">
            <button
              className={`filter-btn ${activeQuickFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleQuickFilter('all')}
            >
              All Requests
            </button>
            <button
              className={`filter-btn filter-warning ${activeQuickFilter === 'pending' ? 'active' : ''}`}
              onClick={() => handleQuickFilter('pending')}
            >
              Pending Only
            </button>
            <button
              className={`filter-btn filter-danger ${activeQuickFilter === 'urgent' ? 'active' : ''}`}
              onClick={() => handleQuickFilter('urgent')}
            >
              Urgent Only
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Types</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            {/* Search removed */}
          </div>
        </div>

        {/* Service Requests Table */}
        {loading ? (
          <div className="loading-state">Loading service requests...</div>
        ) : filteredRequests.length > 0 ? (
          <div className="service-requests-table-container">
            <table className="service-requests-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Room</th>
                  <th>Requested By</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr 
                    key={request.id}
                    onClick={() => openEditModal(request)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>#{request.id}</td>
                    <td>
                      <span className="service-type-badge">
                        {request.serviceType}
                      </span>
                    </td>
                    <td>
                      <span className="description-text" title={request.description}>
                        {request.description || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td>{request.roomNumber || 'N/A'}</td>
                    <td>{request.requestedBy || 'N/A'}</td>
                    <td>{request.assignedTo || 'Unassigned'}</td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(request);
                          }}
                          title="Edit Request"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(request.id);
                          }}
                          title="Delete Request"
                        >
                          🗑️
                        </button>
                        {request.status !== 'COMPLETED' && (
                          <button
                            className="btn-action btn-complete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(request.id, 'COMPLETED');
                            }}
                            title="Mark as Completed"
                          >
                            ✅
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            No service requests found matching your filters.
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{modalMode === 'create' ? 'Create Service Request' : 'Edit Service Request'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <form onSubmit={handleSubmit} id="service-request-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Service Type *</label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      >
                        <option value="">Select Type</option>
                        {serviceTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Priority *</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      >
                        {priorities.map(priority => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Requested By</label>
                      <input
                        type="text"
                        name="requestedBy"
                        value={formData.requestedBy}
                        onChange={handleInputChange}
                        placeholder="Guest name or ID"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Reservation ID</label>
                      <input
                        type="number"
                        name="reservationId"
                        value={formData.reservationId}
                        onChange={handleInputChange}
                        placeholder="Optional"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Room ID</label>
                      <input
                        type="number"
                        name="roomId"
                        value={formData.roomId}
                        onChange={handleInputChange}
                        placeholder="Optional"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Assigned To</label>
                      {modalMode === 'edit' ? (
                        <select
                          name="assignedTo"
                          value={formData.assignedTo || ''}
                          onChange={handleInputChange}
                          className="form-input"
                        >
                          <option value="">Unassigned</option>
                          {staffLoading && <option disabled>Loading staff...</option>}
                          {!staffLoading && staff.map((s) => (
                            <option key={s.id || s.staffId || s.email || s.name} value={s.name || s.staffId}>
                              {s.name || s.staffId}{s.role ? ` (${s.role})` : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name="assignedTo"
                          value={formData.assignedTo}
                          onChange={handleInputChange}
                          placeholder="Staff member name"
                          className="form-input"
                        />
                      )}
                    </div>

                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the service request in detail..."
                        rows="3"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Additional notes or special instructions..."
                        rows="2"
                        className="form-input"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" form="service-request-form" className="btn-primary">
                  {modalMode === 'create' ? 'Create Request' : 'Update Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRequests;