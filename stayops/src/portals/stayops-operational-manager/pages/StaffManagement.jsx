import React, { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { staffAPI } from '../api/staff';
import '../styles/staff.css';

const StaffManagement = () => {
  const [activeView, setActiveView] = useState('grid');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState({ employeeId: false });
  const [addData, setAddData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    departmentId: '',
    hireDate: '',
    status: 'ACTIVE'
  });

  const formatRole = (role) => {
    const roleMap = {
      'RECEPTIONIST': 'Receptionist',
      'HOUSEKEEPING': 'Housekeeping',
      'CHEF': 'Chef',
      'MANAGER': 'Manager',
      'SECURITY': 'Security',
      'MAINTENANCE': 'Maintenance'
    };
    return roleMap[role] || role;
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await staffAPI.getAllStaff();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      alert('Failed to fetch staff: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (staffId) => {
    if (!staffId) {
      console.error('Staff ID is required');
      alert('Unable to view staff details - missing staff ID');
      return;
    }
    
    setLoading(true);
    try {
      const data = await staffAPI.getStaffById(staffId);
      setSelectedStaff(data);
      
      setEditData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || '',
        departmentId: data.departmentId || '',
        departmentName: data.departmentName || '',
        hireDate: data.hireDate || '',
        status: data.status || 'ACTIVE'
      });
      setActiveView('details');
      setEditMode(false);
    } catch (error) {
      console.error('Error fetching staff details:', error);
      alert('Failed to fetch staff details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!addData.name || !addData.email || !addData.phone || !addData.role || !addData.departmentId) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await staffAPI.createStaff(addData);
      alert('Staff added successfully!');
      setShowAddModal(false);
      setAddData({
        name: '',
        email: '',
        phone: '',
        role: '',
        departmentId: '',
        hireDate: '',
        status: 'ACTIVE'
      });
      await fetchStaff();
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Failed to add staff: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!editData.name || !editData.email || !editData.phone || !editData.role || !editData.departmentId) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const updatePayload = {
        name: editData.name.trim(),
        email: editData.email.trim(),
        phone: editData.phone.trim(),
        role: editData.role,
        departmentId: editData.departmentId,
        hireDate: editData.hireDate || '',
        status: editData.status || 'ACTIVE'
      };
      
      await staffAPI.updateStaff(selectedStaff.staffId, updatePayload);
      alert('Staff updated successfully!');
      
      await handleViewDetails(selectedStaff.staffId);
      await fetchStaff();
      setEditMode(false);
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Failed to update staff: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetEditData = () => {
    setEditData({
      name: selectedStaff.name || '',
      email: selectedStaff.email || '',
      phone: selectedStaff.phone || '',
      role: selectedStaff.role || '',
      departmentId: selectedStaff.departmentId || '',
      departmentName: selectedStaff.departmentName || '',
      hireDate: selectedStaff.hireDate || '',
      status: selectedStaff.status || 'ACTIVE'
    });
  };

  const filteredStaff = (staff || []).filter(member =>
    (member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.staffId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!departmentFilter || member.departmentName === departmentFilter) &&
    (!statusFilter || member.status === statusFilter) &&
    (!roleFilter || member.role === roleFilter)
  );

  const stats = {
    total: (staff || []).length,
    active: (staff || []).filter(s => s.status === 'ACTIVE').length,
    departments: [...new Set((staff || []).map(s => s.departmentName))].length
  };

  return (
    <div className="staff-container">
      <div className="staff-wrapper">
        
        {/* Header */}
        <div className="staff-header">
          <div className="staff-header-info">
            <h1>Staff Management</h1>
            <p className="staff-header-count">Total: {stats.total} • Active: {stats.active} • Departments: {stats.departments}</p>
          </div>
          
          {activeView === 'grid' ? (
            <button onClick={() => setShowAddModal(true)} className="btn-add-staff">
              <Plus size={16} /> Add New Staff
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveView('grid');
                setSelectedStaff(null);
                setEditMode(false);
              }}
              className="btn-back"
            >
              Back to List
            </button>
          )}
        </div>

        {/* Grid View */}
        {activeView === 'grid' && (
          <div>
            <div className="filters-row">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <select 
                value={departmentFilter} 
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Departments</option>
                <option value="Front Desk">Front Desk</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Reservations">Reservations</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="IT Support">IT Support</option>
                <option value="Security">Security</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Events & Banquets">Events & Banquets</option>
              </select>

              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Roles</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="HOUSEKEEPING">Housekeeping</option>
                <option value="CHEF">Chef</option>
                <option value="MANAGER">Manager</option>
                <option value="SECURITY">Security</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>

            {loading ? (
              <div className="loading-state">
                <p>Loading...</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="empty-state">
                <p>{searchTerm || departmentFilter || roleFilter || statusFilter ? 'No staff found matching your filters' : 'No staff found'}</p>
              </div>
            ) : (
              <div className="staff-grid">
                {filteredStaff.map((member, index) => (
                  <div 
                    key={member.staffId || `staff-${index}`} 
                    onClick={() => handleViewDetails(member.staffId)}
                    className="staff-card"
                  >
                    <div className="staff-card-content">
                      <div className="staff-card-header">
                        <div className="staff-avatar">
                          {member.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="staff-card-info">
                          <h3 className="staff-card-name">{member.name}</h3>
                          <p className="staff-card-role">{formatRole(member.role)}</p>
                          <p className="staff-card-id">ID: {member.staffId}</p>
                        </div>
                      </div>
                      
                      <div className="staff-card-details">
                        <div className="staff-card-detail-row">
                          <span className="staff-card-detail-label">Department</span>
                          <span className="staff-card-detail-value">{member.departmentName}</span>
                        </div>
                        <div className="staff-card-detail-row">
                          <span className="staff-card-detail-label">Email</span>
                          <span className="staff-card-detail-value">{member.email}</span>
                        </div>
                        <div className="staff-card-detail-row">
                          <span className="staff-card-detail-label">Phone</span>
                          <span className="staff-card-detail-value">{member.phone}</span>
                        </div>
                        <div className="staff-card-detail-row">
                          <span className="staff-card-detail-label">Status</span>
                          <span className={`status-badge ${
                            member.status === 'ACTIVE' ? 'status-active' : 
                            member.status === 'ON_LEAVE' ? 'status-warning' : 'status-inactive'
                          }`}>
                            {member.status === 'ACTIVE' ? 'Active' : 
                             member.status === 'ON_LEAVE' ? 'On Leave' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(member.staffId);
                        }}
                        className="staff-card-action"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Details View */}
        {activeView === 'details' && selectedStaff && (
          <div>
            <div className="details-header">
              <h2 className="details-title">Staff Details</h2>
              
              {!editMode ? (
                <div className="details-actions">
                  <button onClick={() => setEditMode(true)} className="btn-edit">
                    Edit Information
                  </button>
                </div>
              ) : (
                <div className="details-actions">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      resetEditData();
                    }}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStaff}
                    disabled={loading}
                    className="btn-save"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="details-container">
              <div className="details-content">
                <div className="details-grid">
                  
                  {/* Personal Information */}
                  <div className="details-section">
                    <h3 className="section-title">Personal Information</h3>
                    
                    {editMode ? (
                      <div>
                        <div className="details-form-field">
                          <label className="field-label">FULL NAME *</label>
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                            className="field-input"
                            required
                          />
                        </div>
                        
                        <div className="details-form-field">
                          <label className="field-label">EMAIL *</label>
                          <input
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                            className="field-input"
                            required
                          />
                        </div>

                        <div className="details-form-field">
                          <label className="field-label">PHONE *</label>
                          <input
                            type="tel"
                            value={editData.phone}
                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            className="field-input"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="info-item">
                          <div className="info-label">Full Name</div>
                          <div className="info-value">{selectedStaff.name}</div>
                        </div>
                        <div className="info-item">
                          <div className="info-label">Email</div>
                          <div className="info-value">{selectedStaff.email}</div>
                        </div>
                        <div className="info-item">
                          <div className="info-label">Phone</div>
                          <div className="info-value">{selectedStaff.phone}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Employment Information */}
                  <div className="details-section">
                    <h3 className="section-title">Employment Information</h3>
                    
                    {editMode ? (
                      <div>
                        <div className="details-form-field tooltip-field">
                          <label className="field-label field-label-with-tooltip">
                            EMPLOYEE ID (READ ONLY)
                            <span 
                              className="tooltip-trigger"
                              onMouseEnter={() => setShowTooltip({...showTooltip, employeeId: true})}
                              onMouseLeave={() => setShowTooltip({...showTooltip, employeeId: false})}
                            >
                              i
                            </span>
                          </label>
                          <input
                            type="text"
                            value={selectedStaff.staffId}
                            disabled
                            className="field-input"
                          />
                          {showTooltip.employeeId && (
                            <div className="tooltip-content">
                              <div className="tooltip-content-inner">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="tooltip-icon"
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>Employee ID cannot be changed. Please contact your system administrator to update this field.</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="details-form-field">
                          <label className="field-label">ROLE *</label>
                          <select
                            value={editData.role}
                            onChange={(e) => setEditData({...editData, role: e.target.value})}
                            className="field-select"
                            required
                          >
                            <option value="">Select Role</option>
                            <option value="RECEPTIONIST">Receptionist</option>
                            <option value="HOUSEKEEPING">Housekeeping</option>
                            <option value="CHEF">Chef</option>
                            <option value="MANAGER">Manager</option>
                            <option value="SECURITY">Security</option>
                            <option value="MAINTENANCE">Maintenance</option>
                          </select>
                        </div>
                        
                        <div className="details-form-field">
                          <label className="field-label">DEPARTMENT *</label>
                          <select
                            value={editData.departmentId}
                            onChange={(e) => setEditData({...editData, departmentId: e.target.value})}
                            className="field-select"
                            required
                          >
                            <option value="">Select Department</option>
                            <option value="1">Front Desk</option>
                            <option value="2">Housekeeping</option>
                            <option value="3">Food & Beverage</option>
                            <option value="4">Reservations</option>
                            <option value="5">Finance & Accounts</option>
                            <option value="6">IT Support</option>
                            <option value="7">Security</option>
                            <option value="8">Human Resources</option>
                            <option value="9">Events & Banquets</option>
                          </select>
                        </div>

                        <div className="details-form-field">
                          <label className="field-label">HIRE DATE</label>
                          <input
                            type="date"
                            value={editData.hireDate}
                            onChange={(e) => setEditData({...editData, hireDate: e.target.value})}
                            className="field-input"
                          />
                        </div>

                        <div className="details-form-field">
                          <label className="field-label">STATUS *</label>
                          <select
                            value={editData.status}
                            onChange={(e) => setEditData({...editData, status: e.target.value})}
                            className="field-select"
                            required
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="ON_LEAVE">On Leave</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="info-item">
                          <div className="info-label">Employee ID</div>
                          <div className="info-value">{selectedStaff.staffId}</div>
                        </div>
                        <div className="info-item">
                          <div className="info-label">Role</div>
                          <div className="info-value">{formatRole(selectedStaff.role)}</div>
                        </div>
                        <div className="info-item">
                          <div className="info-label">Department</div>
                          <div className="info-value">{selectedStaff.departmentName}</div>
                        </div>
                        <div className="info-item">
                          <div className="info-label">Hire Date</div>
                          <div className="info-value">{selectedStaff.hireDate || 'Not specified'}</div>
                        </div>
                        <div className="info-item">
                          <div className="info-label">Status</div>
                          <div className="info-value">
                            <span className={`status-badge ${
                              selectedStaff.status === 'ACTIVE' ? 'status-active' : 
                              selectedStaff.status === 'ON_LEAVE' ? 'status-warning' : 'status-inactive'
                            }`}>
                              {selectedStaff.status === 'ACTIVE' ? 'Active' : 
                               selectedStaff.status === 'ON_LEAVE' ? 'On Leave' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Staff Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content modal-large">
              <div className="modal-header-with-close">
                <h3 className="modal-title">Add New Staff Member</h3>
                <button onClick={() => setShowAddModal(false)} className="modal-close-btn">
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="modal-section">
                  <h4 className="modal-section-title">Personal Information</h4>
                  <div className="modal-form-grid">
                    <div className="modal-form-field">
                      <label className="field-label">FULL NAME *</label>
                      <input
                        type="text"
                        value={addData.name}
                        onChange={(e) => setAddData({...addData, name: e.target.value})}
                        className="field-input"
                        required
                      />
                    </div>
                    
                    <div className="modal-form-field">
                      <label className="field-label">EMAIL *</label>
                      <input
                        type="email"
                        value={addData.email}
                        onChange={(e) => setAddData({...addData, email: e.target.value})}
                        className="field-input"
                        required
                      />
                    </div>

                    <div className="modal-form-field">
                      <label className="field-label">PHONE *</label>
                      <input
                        type="tel"
                        value={addData.phone}
                        onChange={(e) => setAddData({...addData, phone: e.target.value})}
                        className="field-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h4 className="modal-section-title">Employment Information</h4>
                  <div className="modal-form-grid">
                    <div className="modal-form-field">
                      <label className="field-label">ROLE *</label>
                      <select
                        value={addData.role}
                        onChange={(e) => setAddData({...addData, role: e.target.value})}
                        className="field-select"
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="RECEPTIONIST">Receptionist</option>
                        <option value="HOUSEKEEPING">Housekeeping</option>
                        <option value="CHEF">Chef</option>
                        <option value="MANAGER">Manager</option>
                        <option value="SECURITY">Security</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                    </div>
                    
                    <div className="modal-form-field">
                      <label className="field-label">DEPARTMENT *</label>
                      <select
                        value={addData.departmentId}
                        onChange={(e) => setAddData({...addData, departmentId: e.target.value})}
                        className="field-select"
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="1">Front Desk</option>
                        <option value="2">Housekeeping</option>
                        <option value="3">Food & Beverage</option>
                        <option value="4">Reservations</option>
                        <option value="5">Finance & Accounts</option>
                        <option value="6">IT Support</option>
                        <option value="7">Security</option>
                        <option value="8">Human Resources</option>
                        <option value="9">Events & Banquets</option>
                      </select>
                    </div>

                    <div className="modal-form-field">
                      <label className="field-label">HIRE DATE</label>
                      <input
                        type="date"
                        value={addData.hireDate}
                        onChange={(e) => setAddData({...addData, hireDate: e.target.value})}
                        className="field-input"
                      />
                    </div>

                    <div className="modal-form-field">
                      <label className="field-label">STATUS *</label>
                      <select
                        value={addData.status}
                        onChange={(e) => setAddData({...addData, status: e.target.value})}
                        className="field-select"
                        required
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="ON_LEAVE">On Leave</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setAddData({
                      name: '',
                      email: '',
                      phone: '',
                      role: '',
                      departmentId: '',
                      hireDate: '',
                      status: 'ACTIVE'
                    });
                  }} 
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStaff}
                  disabled={loading}
                  className="btn-save"
                >
                  {loading ? 'Adding...' : 'Add Staff'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;