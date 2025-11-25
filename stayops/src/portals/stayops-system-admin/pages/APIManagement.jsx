import React, { useState, useEffect } from 'react';
import { 
  Globe, Key, Activity, Settings, Plus, RefreshCw, 
  Eye, Edit, Trash2, Copy, Download, Upload,
  CheckCircle, XCircle, AlertTriangle, Clock, Zap,
  Server, Database, Users, Shield, TrendingUp,
  Search, Filter, Calendar, FileText, Lock
} from 'lucide-react';
import '../styles/api-management.css';

const APIManagement = () => {
  const [apiData, setApiData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAPI, setSelectedAPI] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock API data
  const mockApiData = {
    overview: {
      totalEndpoints: 45,
      activeEndpoints: 42,
      inactiveEndpoints: 3,
      totalRequests: 1256789,
      successRate: 98.5,
      avgResponseTime: 120,
      lastUpdated: '2024-01-15T10:30:00Z'
    },
    systemMetrics: {
      rateLimit: 1000,
      currentRequests: 245,
      activeConnections: 89,
      errorRate: 1.5,
      uptime: 99.9,
      lastHealthCheck: '2024-01-15T10:00:00Z'
    },
    endpoints: [
      {
        id: 1,
        name: 'User Authentication',
        path: '/api/auth/login',
        method: 'POST',
        status: 'active',
        rateLimit: 100,
        requests: 15420,
        successRate: 99.2,
        avgResponseTime: 85,
        lastUsed: '2024-01-15T10:25:00Z',
        description: 'User login and authentication endpoint',
        version: 'v1',
        requiresAuth: true,
        permissions: ['public']
      },
      {
        id: 2,
        name: 'Get Users',
        path: '/api/users',
        method: 'GET',
        status: 'active',
        rateLimit: 500,
        requests: 8945,
        successRate: 98.8,
        avgResponseTime: 120,
        lastUsed: '2024-01-15T10:20:00Z',
        description: 'Retrieve list of users with pagination',
        version: 'v1',
        requiresAuth: true,
        permissions: ['admin', 'manager']
      },
      {
        id: 3,
        name: 'Create Hotel',
        path: '/api/hotels',
        method: 'POST',
        status: 'active',
        rateLimit: 50,
        requests: 234,
        successRate: 97.5,
        avgResponseTime: 250,
        lastUsed: '2024-01-15T09:45:00Z',
        description: 'Create a new hotel property',
        version: 'v1',
        requiresAuth: true,
        permissions: ['admin']
      },
      {
        id: 4,
        name: 'Get Reservations',
        path: '/api/reservations',
        method: 'GET',
        status: 'maintenance',
        rateLimit: 200,
        requests: 0,
        successRate: 0,
        avgResponseTime: 0,
        lastUsed: '2024-01-14T18:30:00Z',
        description: 'Retrieve reservation data',
        version: 'v1',
        requiresAuth: true,
        permissions: ['admin', 'manager', 'receptionist']
      },
      {
        id: 5,
        name: 'System Health',
        path: '/api/health',
        method: 'GET',
        status: 'active',
        rateLimit: 1000,
        requests: 45678,
        successRate: 100,
        avgResponseTime: 15,
        lastUsed: '2024-01-15T10:30:00Z',
        description: 'System health check endpoint',
        version: 'v1',
        requiresAuth: false,
        permissions: ['public']
      }
    ],
    apiKeys: [
      {
        id: 1,
        name: 'Production API Key',
        key: 'sk-prod-1234567890abcdef',
        status: 'active',
        permissions: ['read', 'write'],
        rateLimit: 1000,
        requests: 45678,
        lastUsed: '2024-01-15T10:25:00Z',
        expiresAt: '2024-12-31T23:59:59Z',
        createdBy: 'System Admin'
      },
      {
        id: 2,
        name: 'Development API Key',
        key: 'sk-dev-abcdef1234567890',
        status: 'active',
        permissions: ['read'],
        rateLimit: 100,
        requests: 1234,
        lastUsed: '2024-01-15T09:30:00Z',
        expiresAt: '2024-06-30T23:59:59Z',
        createdBy: 'Developer'
      },
      {
        id: 3,
        name: 'Testing API Key',
        key: 'sk-test-9876543210fedcba',
        status: 'inactive',
        permissions: ['read', 'write'],
        rateLimit: 50,
        requests: 0,
        lastUsed: '2024-01-10T15:20:00Z',
        expiresAt: '2024-03-31T23:59:59Z',
        createdBy: 'QA Team'
      }
    ],
    usageStats: [
      { endpoint: '/api/auth/login', requests: 15420, success: 15296, errors: 124 },
      { endpoint: '/api/users', requests: 8945, success: 8838, errors: 107 },
      { endpoint: '/api/hotels', requests: 234, success: 228, errors: 6 },
      { endpoint: '/api/reservations', requests: 0, success: 0, errors: 0 },
      { endpoint: '/api/health', requests: 45678, success: 45678, errors: 0 }
    ]
  };

  useEffect(() => {
    loadApiData();
  }, []);

  const loadApiData = async () => {
    setLoading(true);
    try {
      // In a real app, you would call the API
      setTimeout(() => {
        setApiData(mockApiData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading API data:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'success', icon: CheckCircle, text: 'Active' },
      inactive: { color: 'error', icon: XCircle, text: 'Inactive' },
      maintenance: { color: 'warning', icon: AlertTriangle, text: 'Maintenance' },
      deprecated: { color: 'error', icon: XCircle, text: 'Deprecated' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    const IconComponent = config.icon;
    
    return (
      <span className={`status-badge ${config.color}`}>
        <IconComponent size={12} />
        {config.text}
      </span>
    );
  };

  const getMethodBadge = (method) => {
    const methodColors = {
      GET: 'success',
      POST: 'info',
      PUT: 'warning',
      DELETE: 'error',
      PATCH: 'secondary'
    };
    
    return (
      <span className={`method-badge ${methodColors[method] || 'secondary'}`}>
        {method}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'endpoints', label: 'Endpoints', icon: Server },
    { id: 'keys', label: 'API Keys', icon: Key },
    { id: 'usage', label: 'Usage Stats', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="api-management">
        <div className="loading-state">
          <RefreshCw size={24} className="spinning" />
          <p>Loading API information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="api-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>API Management</h1>
          <p>Manage API endpoints, keys, and monitor usage across the StayOps platform</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={16} />
            Export API Docs
          </button>
          <button className="btn-secondary" onClick={loadApiData}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Add Endpoint
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="api-overview">
        <div className="overview-card primary">
          <div className="card-icon">
            <Server size={24} />
          </div>
          <div className="card-content">
            <h3>Total Endpoints</h3>
            <div className="card-value">{apiData.overview?.totalEndpoints || 0}</div>
            <div className="card-description">
              {apiData.overview?.activeEndpoints || 0} active, {apiData.overview?.inactiveEndpoints || 0} inactive
            </div>
          </div>
        </div>

        <div className="overview-card success">
          <div className="card-icon">
            <Activity size={24} />
          </div>
          <div className="card-content">
            <h3>Total Requests</h3>
            <div className="card-value">{formatNumber(apiData.overview?.totalRequests || 0)}</div>
            <div className="card-description">Last 30 days</div>
          </div>
        </div>

        <div className="overview-card info">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <h3>Success Rate</h3>
            <div className="card-value">{apiData.overview?.successRate || 0}%</div>
            <div className="card-description">API reliability</div>
          </div>
        </div>

        <div className="overview-card warning">
          <div className="card-icon">
            <Zap size={24} />
          </div>
          <div className="card-content">
            <h3>Avg Response Time</h3>
            <div className="card-value">{apiData.overview?.avgResponseTime || 0}ms</div>
            <div className="card-description">Performance metric</div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="system-metrics">
        <h3>System Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-label">Rate Limit</div>
            <div className="metric-value">{formatNumber(apiData.systemMetrics?.rateLimit || 0)}/hour</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-label">Current Requests</div>
            <div className="metric-value">{apiData.systemMetrics?.currentRequests || 0}</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-label">Active Connections</div>
            <div className="metric-value">{apiData.systemMetrics?.activeConnections || 0}</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-label">Error Rate</div>
            <div className="metric-value">{apiData.systemMetrics?.errorRate || 0}%</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-label">Uptime</div>
            <div className="metric-value">{apiData.systemMetrics?.uptime || 0}%</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-label">Last Health Check</div>
            <div className="metric-value">{formatDate(apiData.systemMetrics?.lastHealthCheck)}</div>
          </div>
        </div>
      </div>

      {/* API Tabs */}
      <div className="api-tabs-container">
        <div className="api-tabs">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="recent-activity">
                <h4>Recent API Activity</h4>
                <div className="activity-list">
                  {apiData.endpoints?.slice(0, 5).map(endpoint => (
                    <div key={endpoint.id} className="activity-item">
                      <div className="activity-header">
                        <div className="activity-method">
                          {getMethodBadge(endpoint.method)}
                        </div>
                        <div className="activity-path">{endpoint.path}</div>
                        {getStatusBadge(endpoint.status)}
                      </div>
                      <div className="activity-details">
                        <div className="activity-stats">
                          <span>{formatNumber(endpoint.requests)} requests</span>
                          <span>{endpoint.successRate}% success</span>
                          <span>{endpoint.avgResponseTime}ms avg</span>
                        </div>
                        <div className="activity-time">
                          Last used: {formatDate(endpoint.lastUsed)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="api-health">
                <h4>API Health Status</h4>
                <div className="health-metrics">
                  <div className="health-item">
                    <div className="health-label">Overall Health</div>
                    <div className="health-value">
                      <CheckCircle size={16} className="health-icon success" />
                      Healthy
                    </div>
                  </div>
                  
                  <div className="health-item">
                    <div className="health-label">Response Time</div>
                    <div className="health-value">
                      <Zap size={16} className="health-icon info" />
                      {apiData.overview?.avgResponseTime}ms
                    </div>
                  </div>
                  
                  <div className="health-item">
                    <div className="health-label">Error Rate</div>
                    <div className="health-value">
                      <AlertTriangle size={16} className="health-icon warning" />
                      {apiData.systemMetrics?.errorRate}%
                    </div>
                  </div>
                  
                  <div className="health-item">
                    <div className="health-label">Uptime</div>
                    <div className="health-value">
                      <Server size={16} className="health-icon success" />
                      {apiData.systemMetrics?.uptime}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Endpoints Tab */}
          {activeTab === 'endpoints' && (
            <div className="endpoints-tab">
              <div className="tab-filters">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search endpoints..."
                  />
                </div>
                
                <div className="filter-group">
                  <Filter size={16} />
                  <select>
                    <option value="">All Methods</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <select>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                </div>
              </div>

              <div className="endpoints-table">
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">Endpoint</div>
                    <div className="table-cell">Method</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Requests</div>
                    <div className="table-cell">Success Rate</div>
                    <div className="table-cell">Response Time</div>
                    <div className="table-cell">Actions</div>
                  </div>
                </div>
                
                <div className="table-body">
                  {apiData.endpoints?.map(endpoint => (
                    <div key={endpoint.id} className="table-row">
                      <div className="table-cell">
                        <div className="endpoint-info">
                          <div className="endpoint-path">{endpoint.path}</div>
                          <div className="endpoint-description">{endpoint.description}</div>
                          <div className="endpoint-meta">
                            v{endpoint.version} • {endpoint.requiresAuth ? 'Auth Required' : 'Public'}
                          </div>
                        </div>
                      </div>
                      <div className="table-cell">
                        {getMethodBadge(endpoint.method)}
                      </div>
                      <div className="table-cell">
                        {getStatusBadge(endpoint.status)}
                      </div>
                      <div className="table-cell">
                        {formatNumber(endpoint.requests)}
                      </div>
                      <div className="table-cell">
                        <div className="success-rate">
                          {endpoint.successRate}%
                        </div>
                      </div>
                      <div className="table-cell">
                        {endpoint.avgResponseTime}ms
                      </div>
                      <div className="table-cell">
                        <div className="action-buttons">
                          <button className="action-btn" title="View Details">
                            <Eye size={14} />
                          </button>
                          <button className="action-btn" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button className="action-btn" title="Test">
                            <Activity size={14} />
                          </button>
                          <button className="action-btn danger" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'keys' && (
            <div className="keys-tab">
              <div className="keys-header">
                <h4>API Keys</h4>
                <button className="btn-primary">
                  <Plus size={16} />
                  Generate New Key
                </button>
              </div>
              
              <div className="keys-list">
                {apiData.apiKeys?.map(apiKey => (
                  <div key={apiKey.id} className="key-card">
                    <div className="key-header">
                      <div className="key-info">
                        <div className="key-name">{apiKey.name}</div>
                        <div className="key-value">
                          {apiKey.key}
                          <button className="copy-btn" title="Copy Key">
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                      {getStatusBadge(apiKey.status)}
                    </div>
                    <div className="key-details">
                      <div className="key-item">
                        <Shield size={14} />
                        <span>Permissions: {apiKey.permissions.join(', ')}</span>
                      </div>
                      <div className="key-item">
                        <Activity size={14} />
                        <span>Rate Limit: {apiKey.rateLimit}/hour</span>
                      </div>
                      <div className="key-item">
                        <Users size={14} />
                        <span>Created by: {apiKey.createdBy}</span>
                      </div>
                      <div className="key-item">
                        <Clock size={14} />
                        <span>Expires: {formatDate(apiKey.expiresAt)}</span>
                      </div>
                    </div>
                    <div className="key-stats">
                      <div className="stat-item">
                        <span className="stat-label">Requests</span>
                        <span className="stat-value">{formatNumber(apiKey.requests)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Last Used</span>
                        <span className="stat-value">{formatDate(apiKey.lastUsed)}</span>
                      </div>
                    </div>
                    <div className="key-actions">
                      <button className="btn-secondary">Edit</button>
                      <button className="btn-secondary">Regenerate</button>
                      <button className="btn-danger">Revoke</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Stats Tab */}
          {activeTab === 'usage' && (
            <div className="usage-tab">
              <div className="usage-charts">
                <div className="chart-container">
                  <h4>Request Volume (Last 30 Days)</h4>
                  <div className="chart-placeholder">
                    <Activity size={48} />
                    <p>Request volume chart would be displayed here</p>
                  </div>
                </div>
                
                <div className="chart-container">
                  <h4>Response Time Trends</h4>
                  <div className="chart-placeholder">
                    <TrendingUp size={48} />
                    <p>Response time chart would be displayed here</p>
                  </div>
                </div>
              </div>

              <div className="usage-table">
                <h4>Endpoint Usage Statistics</h4>
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">Endpoint</div>
                    <div className="table-cell">Total Requests</div>
                    <div className="table-cell">Successful</div>
                    <div className="table-cell">Errors</div>
                    <div className="table-cell">Success Rate</div>
                  </div>
                </div>
                
                <div className="table-body">
                  {apiData.usageStats?.map((stat, index) => (
                    <div key={index} className="table-row">
                      <div className="table-cell">
                        <div className="endpoint-path">{stat.endpoint}</div>
                      </div>
                      <div className="table-cell">
                        {formatNumber(stat.requests)}
                      </div>
                      <div className="table-cell">
                        {formatNumber(stat.success)}
                      </div>
                      <div className="table-cell">
                        {formatNumber(stat.errors)}
                      </div>
                      <div className="table-cell">
                        <div className="success-rate">
                          {stat.requests > 0 ? Math.round((stat.success / stat.requests) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="settings-tab">
              <div className="settings-sections">
                <div className="settings-section">
                  <h4>Rate Limiting</h4>
                  <div className="settings-grid">
                    <div className="setting-item">
                      <label>Global Rate Limit</label>
                      <input type="number" defaultValue="1000" />
                    </div>
                    
                    <div className="setting-item">
                      <label>Per-User Rate Limit</label>
                      <input type="number" defaultValue="100" />
                    </div>
                    
                    <div className="setting-item">
                      <label>Burst Limit</label>
                      <input type="number" defaultValue="200" />
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h4>Security</h4>
                  <div className="settings-grid">
                    <div className="setting-item toggle-item">
                      <label>Require API Key</label>
                      <div className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    
                    <div className="setting-item toggle-item">
                      <label>Enable CORS</label>
                      <div className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    
                    <div className="setting-item toggle-item">
                      <label>Log All Requests</label>
                      <div className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h4>Monitoring</h4>
                  <div className="settings-grid">
                    <div className="setting-item">
                      <label>Health Check Interval</label>
                      <select defaultValue="60">
                        <option value="30">30 seconds</option>
                        <option value="60">1 minute</option>
                        <option value="300">5 minutes</option>
                        <option value="600">10 minutes</option>
                      </select>
                    </div>
                    
                    <div className="setting-item">
                      <label>Alert Threshold (Response Time)</label>
                      <input type="number" defaultValue="1000" />
                    </div>
                    
                    <div className="setting-item">
                      <label>Alert Threshold (Error Rate)</label>
                      <input type="number" defaultValue="5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Endpoint Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New API Endpoint</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-content">
              <p>API endpoint creation form would go here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIManagement;
