// Complaints.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { complaintsAPI } from '../api/complaints';
import { staffAPI } from '../api/staff';
import '../styles/complaints.css';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    priority: '',
    assignedToId: '',
    resolution: '',
    internalNotes: '',
  });
  const scheduledTimersRef = useRef({});
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Derive a numeric complaint ID compatible with backend
  const getComplaintNumericId = (c) => {
    if (!c) return null;
    if (typeof c.id === 'number') return c.id;
    if (typeof c.complaintId === 'number') return c.complaintId;
    if (typeof c.id === 'string' && /^\d+$/.test(c.id)) return Number(c.id);
    return null;
  };

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      let data;
      if (filter === 'pending') {
        const activeData = await complaintsAPI.getActiveComplaints();
        data = activeData.filter(c => 
          (c.status === 'SUBMITTED' || c.status === 'ACKNOWLEDGED') && !c.assignedToId
        );
      } else if (filter === 'assigned') {
        const allData = await complaintsAPI.getActiveComplaints();
        const inProgressData = await complaintsAPI.getComplaintsByStatus('IN_PROGRESS');
        const combined = [...allData, ...inProgressData];
        const uniqueMap = new Map();
        combined.forEach(c => {
          if (c.assignedToId) {
            uniqueMap.set(c.id, c);
          }
        });
        data = Array.from(uniqueMap.values());
      } else if (filter === 'resolved') {
        const resolvedData = await complaintsAPI.getComplaintsByStatus('RESOLVED');
        const closedData = await complaintsAPI.getComplaintsByStatus('CLOSED');
        data = [...resolvedData, ...closedData];
      } else {
        data = await complaintsAPI.getActiveComplaints();
      }
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleUpdateComplaint = async (complaintId) => {
    try {
      if (complaintId == null || Number.isNaN(Number(complaintId))) {
        setError('Invalid complaint ID. Please refresh and try again.');
        return;
      }
      
      // Build updates object - only include fields that have values
      const updates = {};
      
      if (updateData.status && updateData.status !== '') {
        updates.status = updateData.status;
      }
      
      if (updateData.priority && updateData.priority !== '') {
        updates.priority = updateData.priority;
      }
      
      // Staff ID should be sent as string (staffId like "STF001")
      if (updateData.assignedToId && updateData.assignedToId !== '') {
        updates.assignedToId = updateData.assignedToId; // Keep as string
      }
      
      if (updateData.resolution && updateData.resolution.trim() !== '') {
        updates.resolution = updateData.resolution.trim();
      }
      
      if (updateData.internalNotes && updateData.internalNotes.trim() !== '') {
        updates.internalNotes = updateData.internalNotes.trim();
      }

      // Check if there are any updates to send
      if (Object.keys(updates).length === 0) {
        setError('Please select at least one field to update.');
        return;
      }

      // Validate status transitions based on current state
      const currentComplaint = complaints.find(c => getComplaintNumericId(c) === complaintId);
      if (currentComplaint && updates.status) {
        // If moving to RESOLVED or CLOSED, ensure there's a resolution
        if ((updates.status === 'RESOLVED' || updates.status === 'CLOSED') && 
            !updates.resolution && !currentComplaint.resolution) {
          setError('Please provide a resolution before marking as Resolved or Closed.');
          return;
        }
      }

  console.log('Updating complaint', complaintId, 'with updates:', updates);

  // Try to forward guestId if present on the complaint (some backends require it for updates)
  const guestIdForApi = currentComplaint?.guestId || currentComplaint?.guestID || currentComplaint?.guest_id;
  await complaintsAPI.updateComplaint(complaintId, updates, guestIdForApi);
      
      // Show success message
      setSuccessMessage('Complaint updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      setSelectedComplaint(null);
      setUpdateData({
        status: '',
        priority: '',
        assignedToId: '',
        resolution: '',
        internalNotes: '',
      });

      // If complaint is acknowledged AND assigned, auto-move to SUBMITTED, then to IN_PROGRESS after 10 minutes
      const shouldAutoProgress =
        updates.status === 'ACKNOWLEDGED' && !!updates.assignedToId;

      if (shouldAutoProgress) {
        try {
          await complaintsAPI.updateComplaint(complaintId, { status: 'SUBMITTED' }, guestIdForApi);
          fetchComplaints();

          if (scheduledTimersRef.current[complaintId]) {
            clearTimeout(scheduledTimersRef.current[complaintId]);
            delete scheduledTimersRef.current[complaintId];
          }

          const timerId = setTimeout(async () => {
            try {
              await complaintsAPI.updateComplaint(complaintId, { status: 'IN_PROGRESS' }, guestIdForApi);
            } catch (e) {
              console.error('Auto transition to IN_PROGRESS failed:', e);
            } finally {
              if (filter === 'assigned') {
                fetchComplaints();
              }
              delete scheduledTimersRef.current[complaintId];
            }
          }, 10 * 60 * 1000);

          scheduledTimersRef.current[complaintId] = timerId;
        } catch (e) {
          console.error('Error during auto progression:', e);
        }
      } else {
        fetchComplaints();
      }
    } catch (err) {
      console.error('Error updating complaint:', err);
      let errorMessage = 'Failed to update complaint';
      if (err.message) {
        try {
          const errorObj = JSON.parse(err.message);
          errorMessage = `Error ${errorObj.status}: Please check your input and try again`;
        } catch {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(scheduledTimersRef.current).forEach((timerId) => {
        clearTimeout(timerId);
      });
      scheduledTimersRef.current = {};
    };
  }, []);

  const getPriorityClass = (priority) => {
    const priorityMap = {
      LOW: 'priority-low',
      MEDIUM: 'priority-medium',
      HIGH: 'priority-high',
      URGENT: 'priority-urgent',
    };
    return priorityMap[priority] || '';
  };

  const getStatusClass = (status) => {
    const statusMap = {
      SUBMITTED: 'submitted',
      ACKNOWLEDGED: 'acknowledged',
      IN_PROGRESS: 'in-progress',
      RESOLVED: 'resolved',
      CLOSED: 'closed',
      REJECTED: 'rejected',
    };
    return statusMap[status] || '';
  };

  const fetchStaff = async () => {
    setStaffLoading(true);
    setStaffError(null);
    try {
      const data = await staffAPI.getAllStaff();
      setStaff(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching staff:', e);
      setStaffError(e.message || 'Failed to load staff');
      setStaff([]);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleManageClick = async (complaintId) => {
    setError(null);
    setSuccessMessage(null);
    await fetchStaff();
    setSelectedComplaint(complaintId);
  };

  return (
    <div className="complaints-container">
      <div className="complaints-wrapper">
        
        <div className="complaints-header">
          <h1 className="complaints-title">Complaints Management</h1>
          <p className="complaints-subtitle">Track and resolve guest complaints</p>
        </div>

        <div className="complaints-filters">
          <button
            onClick={() => setFilter('pending')}
            className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('assigned')}
            className={`filter-button ${filter === 'assigned' ? 'active' : ''}`}
          >
            Assigned to Staff
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`filter-button ${filter === 'resolved' ? 'active' : ''}`}
          >
            Resolved
          </button>
        </div>

        {error && (
          <div className="error-message-container">
            <p className="error-message-text">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="success-message-container" style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0 }}>{successMessage}</p>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <p className="loading-text">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-container">
              <p className="empty-state-text">No complaints found</p>
            </div>
          </div>
        ) : (
          <div className="complaints-list">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className={`complaint-card ${getPriorityClass(complaint.priority)}`}
              >
                <div className="complaint-header">
                  <div className="complaint-info">
                    <div className="complaint-title-row">
                      <h3 className="complaint-title">{complaint.subject}</h3>
                      <span className={`badge badge-status ${getStatusClass(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className="badge badge-priority">
                        {complaint.priority}
                      </span>
                    </div>
                    <p className="complaint-description">{complaint.description}</p>
                    <div className="complaint-meta">
                      <span>Guest: {complaint.guestName}</span>
                      <span>Category: {complaint.category}</span>
                      {complaint.reservationId && (
                        <span>Reservation: #{complaint.reservationId}</span>
                      )}
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {(complaint.assignedToName || complaint.resolution) && (
                  <div className="complaint-details">
                    {complaint.assignedToName && (
                      <p className="assigned-info">
                        <span className="assigned-label">Assigned to:</span>{' '}
                        {complaint.assignedToName}
                      </p>
                    )}
                    {complaint.resolution && (
                      <div className="resolution-box">
                        <p className="resolution-label">Resolution</p>
                        <p className="resolution-text">{complaint.resolution}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedComplaint === complaint.id ? (
                  <div className="update-section">
                    <h4 className="update-title">Update Complaint</h4>
                    <div className="update-grid">
                      <div className="form-field">
                        <label className="form-label">Status</label>
                        <select
                          value={updateData.status}
                          onChange={(e) =>
                            setUpdateData({ ...updateData, status: e.target.value })
                          }
                          className="form-select"
                        >
                          <option value="">Select Status</option>
                          <option value="ACKNOWLEDGED">Acknowledged</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">Priority</label>
                        <select
                          value={updateData.priority}
                          onChange={(e) =>
                            setUpdateData({ ...updateData, priority: e.target.value })
                          }
                          className="form-select"
                        >
                          <option value="">Select Priority</option>
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Assign to Staff</label>
                      <select
                        value={updateData.assignedToId}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, assignedToId: e.target.value })
                        }
                        className="form-select"
                      >
                        <option value="">{staffLoading ? 'Loading staff…' : 'Select staff'}</option>
                        {staffError && <option disabled value="">{`Error: ${staffError}`}</option>}
                        {!staffLoading && staff && staff.length > 0 && staff.map((s) => (
                          <option key={s.staffId || s.id} value={s.staffId || s.id}>
                            {s.name || 'Unknown'} - {s.role || 'No role'} ({s.staffId || s.id})
                          </option>
                        ))}
                        {!staffLoading && (!staff || staff.length === 0) && (
                          <option disabled value="">No staff found</option>
                        )}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Resolution</label>
                      <textarea
                        value={updateData.resolution}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, resolution: e.target.value })
                        }
                        className="form-textarea"
                        rows="3"
                        placeholder="Enter resolution details"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Internal Notes</label>
                      <textarea
                        value={updateData.internalNotes}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, internalNotes: e.target.value })
                        }
                        className="form-textarea"
                        rows="2"
                        placeholder="Internal notes (not visible to guest)"
                      />
                    </div>
                    <div className="complaint-actions">
                      <button
                        onClick={() => handleUpdateComplaint(getComplaintNumericId(complaint))}
                        className="btn-update"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setSelectedComplaint(null)}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="complaint-actions">
                    <button
                      onClick={() => handleManageClick(complaint.id)}
                      className="btn-manage"
                    >
                      Manage
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;