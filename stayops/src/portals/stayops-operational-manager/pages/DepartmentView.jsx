import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { departmentAPI } from '../api/department';
import DepartmentForm from '../components/DepartmentForm';
import '../styles/departmentView.css';

const DepartmentView = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [hasFetched, setHasFetched] = useState(false); // Prevent double fetching

  useEffect(() => {
    if (!hasFetched) {
      fetchDepartments();
      setHasFetched(true);
    }
  }, [hasFetched]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching departments...');
      const departmentsData = await departmentAPI.getAllDepartments();
      console.log('Departments fetched successfully:', departmentsData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    setSelectedDepartment(department);
    setShowForm(true);
  };

  // Creation is currently handled via edit modal when needed; explicit create button is not rendered.

  const handleFormSave = async (savedDepartment) => {
    // Refresh the departments list after save
    console.log('✅ Department saved:', savedDepartment);
    await fetchDepartments();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedDepartment(null);
  };

  const filteredDepartments = departments.filter(dept => {
    if (!dept) return false;
    
    const name = dept.name || '';
    const headOfDepartment = dept.headOfDepartment || dept.head || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Convert backend enum to lowercase for comparison
    const deptStatus = dept.status ? dept.status.toLowerCase() : 'active';
    const matchesFilter = filterStatus === 'all' || deptStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    // Convert backend enum to lowercase and handle mapping
    const normalizedStatus = status ? status.toLowerCase() : 'active';
    
    const statusMap = {
      active: { icon: CheckCircle, class: 'status-active', text: 'Active' },
      maintenance: { icon: Clock, class: 'status-maintenance', text: 'Maintenance' }
    };
    
    const statusInfo = statusMap[normalizedStatus] || statusMap.active;
    const IconComponent = statusInfo.icon;
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        <IconComponent size={14} />
        {statusInfo.text}
      </span>
    );
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 95) return '#10B981';
    if (performance >= 85) return '#F59E0B';
    return '#EF4444';
  };

  const stats = {
    total: departments.length,
    active: departments.filter(d => {
      const status = d.status ? d.status.toLowerCase() : 'active';
      return status === 'active';
    }).length
  };

  if (loading) {
    return (
      <div className="department-container">
        <div className="department-wrapper">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading departments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-container">
        <div className="department-wrapper">
          <div className="error-state">
            <AlertCircle size={48} color="#dc2626" />
            <h3>Error Loading Departments</h3>
            <p>{error}</p>
            <button onClick={fetchDepartments} className="btn-retry">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="department-container">
      <div className="department-wrapper">
        
        {/* Header */}
        <div className="department-header">
          <div className="department-header-info">
            <h1>Department Management</h1>
            <p className="department-header-count">
              Total: {stats.total} • Active: {stats.active}
            </p>
          </div>
        </div>

        {/* Filters Row */}
        <div className="filters-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Department Grid */}
        {filteredDepartments.length === 0 ? (
          <div className="empty-state">
            <Building2 size={48} />
            <h3>No departments found</h3>
            <p>{searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter criteria' : 'No departments available'}</p>
          </div>
        ) : (
          <div className="department-grid">
            {filteredDepartments.map(department => (
              <div key={department.id} className="department-card">
                <div className="card-header">
                  <div className="department-info">
                    <h3 className="department-name">{department.name || 'Unknown Department'}</h3>
                    {getStatusBadge(department.status || 'active')}
                  </div>
                  <div className="department-actions">
                    <button 
                      className="action-button edit-button"
                      onClick={() => handleEditDepartment(department.id)}
                      title="Edit Department"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="card-content">
                  <div className="department-details">
                    <div className="detail-item">
                      <Users size={16} />
                      <span className="detail-label">Head:</span>
                      <span className="detail-value">{department.headOfDepartment || department.head || 'Not assigned'}</span>
                    </div>

                    <div className="detail-item">
                      <Mail size={16} />
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{department.email || 'Not provided'}</span>
                    </div>

                    <div className="detail-item">
                      <Phone size={16} />
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{department.phone || 'Not provided'}</span>
                    </div>

                    <div className="detail-item">
                      <MapPin size={16} />
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{department.location || 'Not specified'}</span>
                    </div>

                    <div className="detail-item">
                      <Clock size={16} />
                      <span className="detail-label">Hours:</span>
                      <span className="detail-value">{department.workingHours || department.hours || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="staff-metrics">
                    <div className="metric-item">
                      <span className="metric-label">Total Staff</span>
                      <span className="metric-value">{department.totalStaff || department.staffCount || 0}</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Active</span>
                      <span className="metric-value active">{department.activeStaff || department.activeCount || 0}</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">On Leave</span>
                      <span className="metric-value leave">{department.onLeaveStaff || department.leaveCount || 0}</span>
                    </div>
                  </div>

                  <div className="performance-section">
                    <div className="performance-header">
                      <TrendingUp size={14} />
                      <span>Performance Score</span>
                    </div>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill"
                        style={{ 
                          width: `${department.performance || 0}%`,
                          backgroundColor: getPerformanceColor(department.performance || 0)
                        }}
                      ></div>
                      <span className="performance-text">{department.performance || 0}%</span>
                    </div>
                  </div>

                  {department.description && (
                    <div className="department-description">
                      <p>{department.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Department Form Modal */}
      <DepartmentForm
        isOpen={showForm}
        onClose={handleFormClose}
        department={selectedDepartment}
        onSave={handleFormSave}
      />
    </div>
  );
};

export default DepartmentView;