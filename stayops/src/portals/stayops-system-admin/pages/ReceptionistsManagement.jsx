import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  UserPlus, Search, Filter, MoreVertical, Edit2, Trash2, 
  Mail, Phone, Calendar, CheckCircle, XCircle, AlertCircle,
  Download, Upload, RefreshCw, X, Eye, Lock, Unlock
} from 'lucide-react';
import '../styles/receptionists-management.css';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config/api';

// API helpers
const API_ROOT = `${API_BASE_URL}${API_ENDPOINTS.USERS}`; // http://localhost:8080 + /api/users
const API_RECEPTIONISTS = `${API_BASE_URL}${API_ENDPOINTS.RECEPTIONISTS}`; // http://localhost:8080 + /api/receptionists (may not exist)

const getAuthHeaders = () => {
  let token = null;
  try {
    const userData = sessionStorage.getItem('userData');
    token = userData ? (JSON.parse(userData)?.token || sessionStorage.getItem('token')) : sessionStorage.getItem('token');
  } catch {
    token = sessionStorage.getItem('token');
  }
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handle = async (resp, fallbackMsg) => {
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    const msg = txt || fallbackMsg || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  try {
    return await resp.json();
  } catch {
    return null;
  }
};

const api = {
  getAllReceptionists: async () => {
    // 1) Preferred: load all users and filter by role
    try {
      const respAll = await fetch(`${API_ROOT}/all`, { headers: getAuthHeaders() });
      const allUsers = await handle(respAll, 'Failed to fetch users');
      const filtered = Array.isArray(allUsers)
        ? allUsers.filter(u => u?.role === 'RECEPTIONIST' || (Array.isArray(u?.roles) && u.roles.includes('RECEPTIONIST')))
        : [];
      return filtered;
    } catch (errAll) {
      console.error('Primary receptionist fetch failed (/api/users/all):', errAll);
      // 2) Try old query param endpoint
      try {
        const url = `${API_ROOT}?role=RECEPTIONIST`;
        const response = await fetch(url, { headers: getAuthHeaders() });
        return handle(response, 'Failed to fetch receptionists');
      } catch (errQuery) {
        console.error('Secondary receptionist fetch failed (/api/users?role=):', errQuery);
        // 3) Last resort: dedicated role endpoint if backend provides it
        const resp = await fetch(API_RECEPTIONISTS, { headers: getAuthHeaders() });
        return handle(resp, 'Failed to fetch receptionists');
      }
    }
  },
  
  createReceptionist: async (data) => {
    const response = await fetch(API_ROOT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...data, role: 'RECEPTIONIST' })
    });
    return handle(response, 'Failed to create receptionist');
  },
  
  updateReceptionist: async (id, data) => {
    const response = await fetch(`${API_ROOT}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handle(response, 'Failed to update receptionist');
  },
  
  deleteReceptionist: async (id) => {
    const response = await fetch(`${API_ROOT}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handle(response, 'Failed to delete receptionist');
  },
  
  toggleStatus: async (id, status) => {
    const response = await fetch(`${API_ROOT}/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handle(response, 'Failed to update status');
  }
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, color: '#6b8e23' },
    error: { icon: XCircle, color: '#dc2626' },
    info: { icon: AlertCircle, color: '#3b82f6' }
  };

  const { icon: Icon } = config[type];

  return (
    <div className="toast" data-type={type}>
      <Icon size={20} />
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">
        <X size={16} />
      </button>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content modal-${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Receptionist Form Component
const ReceptionistForm = ({ receptionist, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    status: 'active',
    ...receptionist
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!receptionist && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="receptionist-form">
      <div className="form-grid">
        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={errors.firstName ? 'error' : ''}
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label>Username *</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            className={errors.username ? 'error' : ''}
          />
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label>{receptionist ? 'Password (leave blank to keep current)' : 'Password *'}</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <RefreshCw size={16} className="spinning" />
              {receptionist ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            receptionist ? 'Update Receptionist' : 'Create Receptionist'
          )}
        </button>
      </div>
    </form>
  );
};

// Main Component
export default function ReceptionistsManagement() {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReceptionist, setSelectedReceptionist] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  const loadReceptionists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAllReceptionists();
      setReceptionists(data || []);
    } catch (e) {
      console.error('Failed to load receptionists:', e);
      showToast(e?.message || 'Failed to load receptionists', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    loadReceptionists();
  }, [loadReceptionists]);

  // loadReceptionists defined above with useCallback

  const handleCreate = () => {
    setSelectedReceptionist(null);
    setShowModal(true);
  };

  const handleEdit = (receptionist) => {
    setSelectedReceptionist(receptionist);
    setShowModal(true);
    setActiveDropdown(null);
  };

  const handleDelete = (receptionist) => {
    setSelectedReceptionist(receptionist);
    setShowDeleteConfirm(true);
    setActiveDropdown(null);
  };

  const confirmDelete = async () => {
    setActionLoading('delete');
    try {
      await api.deleteReceptionist(selectedReceptionist.id);
      setReceptionists(prev => prev.filter(r => r.id !== selectedReceptionist.id));
      showToast('Receptionist deleted successfully', 'success');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete receptionist failed:', error);
      showToast(error?.message || 'Failed to delete receptionist', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (receptionist) => {
    const newStatus = receptionist.status === 'active' ? 'inactive' : 'active';
    setActionLoading(receptionist.id);
    try {
      await api.toggleStatus(receptionist.id, newStatus);
      setReceptionists(prev => prev.map(r => 
        r.id === receptionist.id ? { ...r, status: newStatus } : r
      ));
      showToast(`Receptionist ${newStatus === 'active' ? 'activated' : 'deactivated'}`, 'success');
    } catch (error) {
      console.error('Update status failed:', error);
      showToast(error?.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(null);
      setActiveDropdown(null);
    }
  };

  const handleSubmit = async (formData) => {
    setActionLoading('submit');
    try {
      if (selectedReceptionist) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        const updated = await api.updateReceptionist(selectedReceptionist.id, payload);
        setReceptionists(prev => prev.map(r => r.id === selectedReceptionist.id ? updated : r));
        showToast('Receptionist updated successfully', 'success');
      } else {
        const created = await api.createReceptionist(formData);
        setReceptionists(prev => [...prev, created]);
        showToast('Receptionist created successfully', 'success');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Save receptionist failed:', error);
      showToast(error?.message || `Failed to ${selectedReceptionist ? 'update' : 'create'} receptionist`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // showToast defined above with useCallback

  const filteredReceptionists = useMemo(() => {
    return receptionists.filter(r => {
      const matchesSearch = searchTerm === '' || 
        r.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.username?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [receptionists, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: receptionists.length,
    active: receptionists.filter(r => r.status === 'active').length,
    inactive: receptionists.filter(r => r.status === 'inactive').length,
    suspended: receptionists.filter(r => r.status === 'suspended').length
  }), [receptionists]);

  return (
    <div className="receptionists-management">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning { animation: spin 1s linear infinite; }
      `}</style>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Receptionists Management</h1>
          <p>User Management / Receptionists</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadReceptionists}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn-primary" onClick={handleCreate}>
            <UserPlus size={16} />
            Add Receptionist
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0ede8' }}>
            <UserPlus size={24} style={{ color: '#2c2c2e' }} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Receptionists</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0f9f0' }}>
            <CheckCircle size={24} style={{ color: '#6b8e23' }} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active</span>
            <span className="stat-value">{stats.active}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2' }}>
            <XCircle size={24} style={{ color: '#dc2626' }} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Inactive</span>
            <span className="stat-value">{stats.inactive}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fffbeb' }}>
            <AlertCircle size={24} style={{ color: '#d97706' }} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Suspended</span>
            <span className="stat-value">{stats.suspended}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="results-count">
          Showing {filteredReceptionists.length} of {receptionists.length}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <RefreshCw size={32} className="spinning" />
            <p>Loading receptionists...</p>
          </div>
        ) : filteredReceptionists.length === 0 ? (
          <div className="empty-state">
            <UserPlus size={48} />
            <h3>No receptionists found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first receptionist'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button className="btn-primary" onClick={handleCreate}>
                <UserPlus size={16} />
                Add Receptionist
              </button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceptionists.map(receptionist => (
                <tr key={receptionist.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {receptionist.firstName?.[0]}{receptionist.lastName?.[0]}
                      </div>
                      <span>{receptionist.firstName} {receptionist.lastName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <Mail size={14} />
                      {receptionist.email}
                    </div>
                  </td>
                  <td>{receptionist.username}</td>
                  <td>
                    {receptionist.phone ? (
                      <div className="cell-with-icon">
                        <Phone size={14} />
                        {receptionist.phone}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${receptionist.status || 'inactive'}`}>
                      {receptionist.status || 'inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <Calendar size={14} />
                      {receptionist.createdAt ? new Date(receptionist.createdAt).toLocaleDateString() : '—'}
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-button"
                        onClick={() => setActiveDropdown(
                          activeDropdown === receptionist.id ? null : receptionist.id
                        )}
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {activeDropdown === receptionist.id && (
                        <div className="dropdown-menu">
                          <button onClick={() => handleEdit(receptionist)}>
                            <Edit2 size={14} />
                            Edit
                          </button>
                          <button onClick={() => handleToggleStatus(receptionist)}>
                            {receptionist.status === 'active' ? (
                              <>
                                <Lock size={14} />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Unlock size={14} />
                                Activate
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => handleDelete(receptionist)}
                            className="danger"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedReceptionist ? 'Edit Receptionist' : 'Add New Receptionist'}
        size="large"
      >
        <ReceptionistForm
          receptionist={selectedReceptionist}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          loading={actionLoading === 'submit'}
        />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Receptionist"
        size="small"
      >
        <div className="confirm-dialog">
          <div className="confirm-icon">
            <AlertCircle size={48} />
          </div>
          <p>
            Are you sure you want to delete <strong>{selectedReceptionist?.firstName} {selectedReceptionist?.lastName}</strong>? 
            This action cannot be undone.
          </p>
          <div className="confirm-actions">
            <button 
              className="btn-secondary" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </button>
            <button 
              className="btn-danger" 
              onClick={confirmDelete}
              disabled={actionLoading === 'delete'}
            >
              {actionLoading === 'delete' ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}