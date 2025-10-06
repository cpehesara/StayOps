import React, { useState, useEffect } from 'react';
import { complaintsAPI } from '../api/complaints';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('active');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    priority: '',
    assignedToId: '',
    resolution: '',
    internalNotes: '',
  });

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let data;
      if (filter === 'active') {
        data = await complaintsAPI.getActiveComplaints();
      } else {
        data = await complaintsAPI.getComplaintsByStatus(filter);
      }
      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComplaint = async (complaintId) => {
    try {
      const updates = {};
      if (updateData.status) updates.status = updateData.status;
      if (updateData.priority) updates.priority = updateData.priority;
      if (updateData.assignedToId) updates.assignedToId = updateData.assignedToId;
      if (updateData.resolution) updates.resolution = updateData.resolution;
      if (updateData.internalNotes) updates.internalNotes = updateData.internalNotes;

      await complaintsAPI.updateComplaint(complaintId, updates);
      setSelectedComplaint(null);
      setUpdateData({
        status: '',
        priority: '',
        assignedToId: '',
        resolution: '',
        internalNotes: '',
      });
      fetchComplaints();
    } catch (err) {
      setError(err.message);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'bg-green-50 border-green-200',
      MEDIUM: 'bg-yellow-50 border-yellow-200',
      HIGH: 'bg-orange-50 border-orange-200',
      URGENT: 'bg-red-50 border-red-200',
    };
    return colors[priority] || 'bg-gray-50 border-gray-200';
  };

  const getStatusBadge = (status) => {
    const styles = {
      SUBMITTED: 'bg-blue-100 text-blue-800',
      ACKNOWLEDGED: 'bg-purple-100 text-purple-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Complaints Management
          </h1>
          <p className="text-sm text-gray-500">
            Track and resolve guest complaints
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 border text-sm transition-colors ${
              filter === 'active'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('SUBMITTED')}
            className={`px-4 py-2 border text-sm transition-colors ${
              filter === 'SUBMITTED'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            Submitted
          </button>
          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-4 py-2 border text-sm transition-colors ${
              filter === 'IN_PROGRESS'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`px-4 py-2 border text-sm transition-colors ${
              filter === 'RESOLVED'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilter('CLOSED')}
            className={`px-4 py-2 border text-sm transition-colors ${
              filter === 'CLOSED'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            Closed
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border border-red-300 bg-red-50">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Complaints List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 border border-gray-200">
            <p className="text-gray-500">No complaints found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className={`border p-6 ${getPriorityColor(complaint.priority)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium">{complaint.subject}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded ${getStatusBadge(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>
                      <span className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">
                        {complaint.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{complaint.description}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Guest: {complaint.guestName}</span>
                      <span>Category: {complaint.category}</span>
                      {complaint.reservationId && (
                        <span>Reservation: #{complaint.reservationId}</span>
                      )}
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Assignment & Resolution */}
                {(complaint.assignedToName || complaint.resolution) && (
                  <div className="mb-4 pt-4 border-t border-gray-300">
                    {complaint.assignedToName && (
                      <p className="text-sm mb-2">
                        <span className="text-gray-500">Assigned to:</span>{' '}
                        {complaint.assignedToName}
                      </p>
                    )}
                    {complaint.resolution && (
                      <div className="bg-white border border-gray-300 p-3 rounded">
                        <p className="text-xs text-gray-500 mb-1">Resolution</p>
                        <p className="text-sm">{complaint.resolution}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Update Section */}
                {selectedComplaint === complaint.id ? (
                  <div className="mt-4 p-4 bg-white border border-gray-300">
                    <h4 className="font-medium mb-3">Update Complaint</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Status</label>
                        <select
                          value={updateData.status}
                          onChange={(e) =>
                            setUpdateData({ ...updateData, status: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-black"
                        >
                          <option value="">Select Status</option>
                          <option value="ACKNOWLEDGED">Acknowledged</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Priority</label>
                        <select
                          value={updateData.priority}
                          onChange={(e) =>
                            setUpdateData({ ...updateData, priority: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-black"
                        >
                          <option value="">Select Priority</option>
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs text-gray-500 mb-1">
                        Assign to Staff ID
                      </label>
                      <input
                        type="text"
                        value={updateData.assignedToId}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, assignedToId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-black"
                        placeholder="Enter staff ID"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs text-gray-500 mb-1">Resolution</label>
                      <textarea
                        value={updateData.resolution}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, resolution: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-black"
                        rows="3"
                        placeholder="Enter resolution details"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs text-gray-500 mb-1">
                        Internal Notes
                      </label>
                      <textarea
                        value={updateData.internalNotes}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, internalNotes: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-black"
                        rows="2"
                        placeholder="Internal notes (not visible to guest)"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateComplaint(complaint.id)}
                        className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setSelectedComplaint(null)}
                        className="px-4 py-2 border border-gray-200 text-sm hover:border-black transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedComplaint(complaint.id)}
                      className="px-4 py-2 border border-gray-200 text-sm hover:border-black transition-colors"
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