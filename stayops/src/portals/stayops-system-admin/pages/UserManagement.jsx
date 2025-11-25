import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Search, Filter, Plus, Edit, Trash2, Eye, 
  UserCheck, UserX, Key, Shield, Clock, Mail, Phone,
  MoreVertical, Download, Upload, RefreshCw, AlertCircle, 
  CheckCircle, XCircle, Calendar, Activity, Lock, Save, X
} from 'lucide-react';
import { 
  fetchAllUsers, 
  deactivateUser, 
  activateUser, 
  deleteUser, 
  updateUser,
  createUser,
  exportUsersToCSV,
  bulkActivateUsers,
  bulkDeactivateUsers,
  bulkDeleteUsers,
  getUserDetails
} from '../api/user-management';
import '../styles/user-management.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'RECEPTIONIST',
    department: '',
    shiftType: 'DAY',
    deskNumber: '',
    specialization: '',
    operationalAreas: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Map backend user to UI format
  const mapBackendUser = (u) => {
    // Extract name parts from fullName if available from roleSpecificData
    let firstName = '';
    let lastName = '';
    
    if (u.fullName) {
      const nameParts = u.fullName.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    } else {
      // Fallback to deriving from email/username
      const nameSeed = (u.email?.split('@')[0]) || u.username || '';
      const parts = nameSeed.split(/[._-]/);
      firstName = parts[0] || (u.username || 'User');
      lastName = parts[1] || '';
    }

    return {
      id: u.id,
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName: lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1) : '',
      email: u.email,
      username: u.username,
      role: u.role,
      status: u.active ? 'active' : 'inactive',
      lastLogin: u.lastLogin || null,
      createdAt: u.createdAt,
      phone: u.phone || '',
      department: u.department || '',
      entityId: u.entityId,
      active: u.active,
      shiftType: u.shiftType || '',
      deskNumber: u.deskNumber || '',
      specialization: u.specialization || '',
      operationalAreas: u.operationalAreas || '',
      fullName: u.fullName || `${firstName} ${lastName}`.trim()
    };
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      const mapped = Array.isArray(data) ? data.map(mapBackendUser) : [];
      setUsers(mapped);
    } catch (error) {
      console.error('Error loading users:', error);
      showNotification(error.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleViewUser = async (user) => {
    try {
      setActionLoading(prev => ({ ...prev, [user.id]: true }));
      const details = await getUserDetails(user.id);
      setViewingUser(details);
      setShowDetailsModal(true);
    } catch (error) {
      showNotification(error.message || 'Failed to load user details', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [user.id]: false }));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'RECEPTIONIST',
      department: user.department || '',
      shiftType: user.shiftType || 'DAY',
      deskNumber: user.deskNumber || '',
      specialization: user.specialization || '',
      operationalAreas: user.operationalAreas || '',
      password: ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleCreateUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'RECEPTIONIST',
      department: '',
      shiftType: 'DAY',
      deskNumber: '',
      specialization: '',
      operationalAreas: '',
      password: ''
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (isCreate = false) => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (isCreate && !formData.password) {
      errors.password = 'Password is required for new users';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }

    // Role-specific validation
    if (formData.role === 'RECEPTIONIST' && isCreate && !formData.deskNumber) {
      errors.deskNumber = 'Desk number is required for receptionists';
    }
    
    return errors;
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(false);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        shiftType: formData.shiftType,
        deskNumber: formData.deskNumber,
        specialization: formData.specialization,
        operationalAreas: formData.operationalAreas,
        active: editingUser.active
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await updateUser(editingUser.id, updateData);
      showNotification('User updated successfully', 'success');
      setShowEditModal(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification(error.message || 'Failed to update user', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(true);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitLoading(true);
    try {
      const createData = {
        username: formData.email.split('@')[0],
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        phone: formData.phone,
        department: formData.department,
        shiftType: formData.shiftType,
        deskNumber: formData.deskNumber,
        specialization: formData.specialization,
        operationalAreas: formData.operationalAreas
      };
      
      await createUser(createData);
      showNotification('User created successfully', 'success');
      setShowCreateModal(false);
      await loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification(error.message || 'Failed to create user', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      if (currentStatus === 'active') {
        await deactivateUser(userId);
        showNotification('User deactivated successfully', 'success');
      } else {
        await activateUser(userId);
        showNotification('User activated successfully', 'success');
      }
      await loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      showNotification(error.message || 'Failed to update user status', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      try {
        await deleteUser(userId);
        showNotification('User deleted successfully', 'success');
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showNotification(error.message || 'Failed to delete user', 'error');
      } finally {
        setActionLoading(prev => ({ ...prev, [userId]: false }));
      }
    }
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      await bulkActivateUsers(selectedUsers);
      showNotification(`${selectedUsers.length} user(s) activated successfully`, 'success');
      setSelectedUsers([]);
      await loadUsers();
    } catch (error) {
      showNotification(error.message || 'Failed to activate users', 'error');
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      await bulkDeactivateUsers(selectedUsers);
      showNotification(`${selectedUsers.length} user(s) deactivated successfully`, 'success');
      setSelectedUsers([]);
      await loadUsers();
    } catch (error) {
      showNotification(error.message || 'Failed to deactivate users', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`)) {
      try {
        await bulkDeleteUsers(selectedUsers);
        showNotification(`${selectedUsers.length} user(s) deleted successfully`, 'success');
        setSelectedUsers([]);
        await loadUsers();
      } catch (error) {
        showNotification(error.message || 'Failed to delete users', 'error');
      }
    }
  };

  const handleExport = async () => {
    try {
      await exportUsersToCSV(filteredUsers);
      showNotification('Users exported successfully', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to export users', 'error');
    }
  };

  const handleExportSelected = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      const selectedUserData = users.filter(u => selectedUsers.includes(u.id));
      await exportUsersToCSV(selectedUserData);
      showNotification(`${selectedUsers.length} user(s) exported successfully`, 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to export users', 'error');
    }
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'SYSTEM_ADMIN': 'System Administrator',
      'OPERATIONAL_MANAGER': 'Operational Manager',
      'SERVICE_MANAGER': 'Service Manager',
      'RECEPTIONIST': 'Receptionist'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      'SYSTEM_ADMIN': 'role-admin',
      'OPERATIONAL_MANAGER': 'role-manager',
      'SERVICE_MANAGER': 'role-service',
      'RECEPTIONIST': 'role-reception'
    };
    return colorMap[role] || 'role-default';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'success', icon: CheckCircle, text: 'Active' },
      inactive: { color: 'error', icon: XCircle, text: 'Inactive' },
      pending: { color: 'warning', icon: Clock, text: 'Pending' },
      suspended: { color: 'error', icon: AlertCircle, text: 'Suspended' }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    const IconComponent = config.icon;
    
    return (
      <span className={`status-badge ${config.color}`}>
        <IconComponent size={12} />
        {config.text}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserStats = () => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    const pending = 0; // Not used in current backend
    return { total, active, inactive, pending };
  };

  const stats = getUserStats();

  return (
    <div className="user-management">
      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <XCircle size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title-row">
            <Users size={28} className="header-icon" />
            <h1>User Management</h1>
          </div>
          <p>Manage user accounts, roles, and permissions across the StayOps platform</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={16} />
            Export
          </button>
          <button className="btn-primary" onClick={handleCreateUser}>
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Users size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active">
            <UserCheck size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon inactive">
            <UserX size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inactive}</div>
            <div className="stat-label">Inactive Users</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <Shield size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{users.filter(u => u.role === 'SYSTEM_ADMIN').length}</div>
            <div className="stat-label">Admins</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email, username..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="filter-group">
            <Filter size={16} />
            <select value={roleFilter} onChange={handleRoleFilter}>
              <option value="">All Roles</option>
              <option value="SYSTEM_ADMIN">System Administrator</option>
              <option value="OPERATIONAL_MANAGER">Operational Manager</option>
              <option value="SERVICE_MANAGER">Service Manager</option>
              <option value="RECEPTIONIST">Receptionist</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select value={statusFilter} onChange={handleStatusFilter}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <button className="btn-refresh" onClick={loadUsers} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
        </div>
        
        <div className="filter-info">
          <span className="results-count">
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
          </span>
          {selectedUsers.length > 0 && (
            <button className="btn-clear-selection" onClick={() => setSelectedUsers([])}>
              Clear Selection ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-selection">
            <CheckCircle size={16} />
            <span><strong>{selectedUsers.length}</strong> user(s) selected</span>
          </div>
          <div className="bulk-buttons">
            <button className="btn-secondary" onClick={handleBulkActivate}>
              <UserCheck size={14} />
              Activate Selected
            </button>
            <button className="btn-secondary" onClick={handleBulkDeactivate}>
              <UserX size={14} />
              Deactivate Selected
            </button>
            <button className="btn-secondary" onClick={handleExportSelected}>
              <Download size={14} />
              Export Selected
            </button>
            <button className="btn-danger" onClick={handleBulkDelete}>
              <Trash2 size={14} />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Users Cards Grid */}
      <div className="users-cards-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">
              <RefreshCw size={32} className="spinning" />
            </div>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No users found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="users-grid">
            {filteredUsers.map((user) => (
              <div key={user.id} className={`user-card ${selectedUsers.includes(user.id) ? 'selected' : ''}`}>
                {/* Card Header */}
                <div className="user-card-header">
                  <div className="user-card-select">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </div>
                  <div className="user-card-status">
                    {getStatusBadge(user.status)}
                  </div>
                </div>

                {/* User Avatar and Info */}
                <div className="user-card-main">
                  <div className="user-card-avatar">
                    <div className="avatar-placeholder">
                      {user.firstName[0]}{user.lastName ? user.lastName[0] : ''}
                    </div>
                  </div>
                  
                  <div className="user-card-info">
                    <h3 className="user-card-name">
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="user-card-email">
                      <Mail size={12} />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="user-card-phone">
                        <Phone size={12} />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Role Badge */}
                <div className="user-card-role">
                  <span className={`role-badge ${getRoleColor(user.role)}`}>
                    <Shield size={10} />
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>

                {/* Additional Info */}
                <div className="user-card-details">
                  <div className="user-card-detail-item">
                    <Clock size={12} />
                    <span className="detail-label">Last Login:</span>
                    <span className="detail-value">{formatDate(user.lastLogin)}</span>
                  </div>
                  <div className="user-card-detail-item">
                    <Calendar size={12} />
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">{formatDate(user.createdAt)}</span>
                  </div>
                  {user.department && (
                    <div className="user-card-detail-item">
                      <Shield size={12} />
                      <span className="detail-label">Department:</span>
                      <span className="detail-value">{user.department}</span>
                    </div>
                  )}
                  {user.role === 'RECEPTIONIST' && user.deskNumber && (
                    <div className="user-card-detail-item">
                      <Activity size={12} />
                      <span className="detail-label">Desk:</span>
                      <span className="detail-value">{user.deskNumber}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="user-card-actions">
                  <button
                    className="action-btn view"
                    onClick={() => handleViewUser(user)}
                    title="View Details"
                    disabled={actionLoading[user.id]}
                  >
                    <Eye size={14} />
                    View
                  </button>
                  
                  <button
                    className="action-btn primary"
                    onClick={() => handleEditUser(user)}
                    title="Edit User"
                    disabled={actionLoading[user.id]}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  
                  <button
                    className="action-btn secondary"
                    onClick={() => handleToggleUserStatus(user.id, user.status)}
                    title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                    disabled={actionLoading[user.id]}
                  >
                    {actionLoading[user.id] ? (
                      <RefreshCw size={14} className="spinning" />
                    ) : user.status === 'active' ? (
                      <>
                        <UserX size={14} />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck size={14} />
                        Activate
                      </>
                    )}
                  </button>
                  
                  <button
                    className="action-btn danger"
                    onClick={() => handleDeleteUser(user.id)}
                    title="Delete User"
                    disabled={actionLoading[user.id]}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View User Details Modal */}
      {showDetailsModal && viewingUser && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details: {viewingUser.username}</h2>
              <button onClick={() => setShowDetailsModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="user-details-grid">
                <div className="detail-section">
                  <h3>Basic Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">{viewingUser.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">{viewingUser.username}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{viewingUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">{getRoleDisplayName(viewingUser.role)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">{getStatusBadge(viewingUser.active ? 'active' : 'inactive')}</span>
                  </div>
                </div>

                {viewingUser.roleSpecificData && (
                  <div className="detail-section">
                    <h3>Role-Specific Information</h3>
                    <div className="detail-row">
                      <span className="detail-label">Full Name:</span>
                      <span className="detail-value">{viewingUser.roleSpecificData.fullName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{viewingUser.roleSpecificData.phone || 'N/A'}</span>
                    </div>
                    {viewingUser.roleSpecificData.department && (
                      <div className="detail-row">
                        <span className="detail-label">Department:</span>
                        <span className="detail-value">{viewingUser.roleSpecificData.department}</span>
                      </div>
                    )}
                    {viewingUser.roleSpecificData.shiftType && (
                      <div className="detail-row">
                        <span className="detail-label">Shift Type:</span>
                        <span className="detail-value">{viewingUser.roleSpecificData.shiftType}</span>
                      </div>
                    )}
                    {viewingUser.roleSpecificData.deskNumber && (
                      <div className="detail-row">
                        <span className="detail-label">Desk Number:</span>
                        <span className="detail-value">{viewingUser.roleSpecificData.deskNumber}</span>
                      </div>
                    )}
                    {viewingUser.roleSpecificData.specialization && (
                      <div className="detail-row">
                        <span className="detail-label">Specialization:</span>
                        <span className="detail-value">{viewingUser.roleSpecificData.specialization}</span>
                      </div>
                    )}
                    {viewingUser.roleSpecificData.operationalAreas && (
                      <div className="detail-row">
                        <span className="detail-label">Operational Areas:</span>
                        <span className="detail-value">{viewingUser.roleSpecificData.operationalAreas}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="detail-section">
                  <h3>Account Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Created At:</span>
                    <span className="detail-value">{formatDate(viewingUser.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Entity ID:</span>
                    <span className="detail-value">{viewingUser.entityId || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowCreateModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              margin: 'auto'
            }}
          >
            <div 
              className="modal-header"
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Create New User</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px'
                }}
              >
                <XCircle size={20} />
              </button>
            </div>
            <div 
              className="modal-content"
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1
              }}
            >
              <form onSubmit={handleSubmitCreate} className="user-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      className={formErrors.firstName ? 'error' : ''}
                    />
                    {formErrors.firstName && (
                      <span className="error-message">{formErrors.firstName}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && (
                    <span className="error-message">{formErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    className={formErrors.password ? 'error' : ''}
                    placeholder="Minimum 6 characters"
                  />
                  {formErrors.password && (
                    <span className="error-message">{formErrors.password}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="role">
                      Role <span className="required">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleFormChange}
                      className={formErrors.role ? 'error' : ''}
                    >
                      <option value="RECEPTIONIST">Receptionist</option>
                      <option value="SERVICE_MANAGER">Service Manager</option>
                      <option value="OPERATIONAL_MANAGER">Operational Manager</option>
                      <option value="SYSTEM_ADMIN">System Administrator</option>
                    </select>
                    {formErrors.role && (
                      <span className="error-message">{formErrors.role}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Role-specific fields */}
                {formData.role === 'RECEPTIONIST' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="shiftType">Shift Type</label>
                      <select
                        id="shiftType"
                        name="shiftType"
                        value={formData.shiftType}
                        onChange={handleFormChange}
                      >
                        <option value="DAY">Day</option>
                        <option value="EVENING">Evening</option>
                        <option value="NIGHT">Night</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="deskNumber">
                        Desk Number <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="deskNumber"
                        name="deskNumber"
                        value={formData.deskNumber}
                        onChange={handleFormChange}
                        className={formErrors.deskNumber ? 'error' : ''}
                      />
                      {formErrors.deskNumber && (
                        <span className="error-message">{formErrors.deskNumber}</span>
                      )}
                    </div>
                  </div>
                )}

                {formData.role === 'SERVICE_MANAGER' && (
                  <div className="form-group">
                    <label htmlFor="specialization">Specialization</label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleFormChange}
                      placeholder="e.g., Housekeeping, Maintenance"
                    />
                  </div>
                )}

                {formData.role === 'OPERATIONAL_MANAGER' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="operationalAreas">Operational Areas</label>
                      <input
                        type="text"
                        id="operationalAreas"
                        name="operationalAreas"
                        value={formData.operationalAreas}
                        onChange={handleFormChange}
                        placeholder="e.g., Front Desk, Housekeeping"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="shiftType">Shift Type</label>
                      <select
                        id="shiftType"
                        name="shiftType"
                        value={formData.shiftType}
                        onChange={handleFormChange}
                      >
                        <option value="DAY">Day</option>
                        <option value="EVENING">Evening</option>
                        <option value="NIGHT">Night</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                    disabled={submitLoading}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      border: 'none',
                      background: '#f3f4f6',
                      color: '#374151'
                    }}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitLoading}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      border: 'none',
                      background: '#3b82f6',
                      color: 'white'
                    }}
                  >
                    {submitLoading ? (
                      <>
                        <RefreshCw size={16} className="spinning" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowEditModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              margin: 'auto'
            }}
          >
            <div 
              className="modal-header"
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                Edit User: {editingUser.firstName} {editingUser.lastName}
              </h2>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px'
                }}
              >
                <XCircle size={20} />
              </button>
            </div>
            <div 
              className="modal-content"
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1
              }}
            >
              <form onSubmit={handleSubmitEdit} className="user-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-firstName">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      className={formErrors.firstName ? 'error' : ''}
                    />
                    {formErrors.firstName && (
                      <span className="error-message">{formErrors.firstName}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-lastName">Last Name</label>
                    <input
                      type="text"
                      id="edit-lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && (
                    <span className="error-message">{formErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-password">
                    Password
                    <span className="helper-text"> (Leave blank to keep current password)</span>
                  </label>
                  <input
                    type="password"
                    id="edit-password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    className={formErrors.password ? 'error' : ''}
                    placeholder="Enter new password or leave blank"
                  />
                  {formErrors.password && (
                    <span className="error-message">{formErrors.password}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-phone">Phone</label>
                    <input
                      type="tel"
                      id="edit-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-department">Department</label>
                    <input
                      type="text"
                      id="edit-department"
                      name="department"
                      value={formData.department}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                {/* Role-specific fields for editing */}
                {editingUser.role === 'RECEPTIONIST' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit-shiftType">Shift Type</label>
                      <select
                        id="edit-shiftType"
                        name="shiftType"
                        value={formData.shiftType}
                        onChange={handleFormChange}
                      >
                        <option value="DAY">Day</option>
                        <option value="EVENING">Evening</option>
                        <option value="NIGHT">Night</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-deskNumber">Desk Number</label>
                      <input
                        type="text"
                        id="edit-deskNumber"
                        name="deskNumber"
                        value={formData.deskNumber}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                )}

                {editingUser.role === 'SERVICE_MANAGER' && (
                  <div className="form-group">
                    <label htmlFor="edit-specialization">Specialization</label>
                    <input
                      type="text"
                      id="edit-specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleFormChange}
                      placeholder="e.g., Housekeeping, Maintenance"
                    />
                  </div>
                )}

                {editingUser.role === 'OPERATIONAL_MANAGER' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit-operationalAreas">Operational Areas</label>
                      <input
                        type="text"
                        id="edit-operationalAreas"
                        name="operationalAreas"
                        value={formData.operationalAreas}
                        onChange={handleFormChange}
                        placeholder="e.g., Front Desk, Housekeeping"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-shiftType">Shift Type</label>
                      <select
                        id="edit-shiftType"
                        name="shiftType"
                        value={formData.shiftType}
                        onChange={handleFormChange}
                      >
                        <option value="DAY">Day</option>
                        <option value="EVENING">Evening</option>
                        <option value="NIGHT">Night</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowEditModal(false)}
                    disabled={submitLoading}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      border: 'none',
                      background: '#f3f4f6',
                      color: '#374151'
                    }}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitLoading}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      border: 'none',
                      background: '#3b82f6',
                      color: 'white'
                    }}
                  >
                    {submitLoading ? (
                      <>
                        <RefreshCw size={16} className="spinning" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;