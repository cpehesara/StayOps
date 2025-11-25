import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff,
  Lock, Key, Users, Clock, MapPin, Globe, Server, Database,
  FileText, Download, RefreshCw, Filter, Search, Plus,
  Settings, Bell, Activity, TrendingUp, TrendingDown,
  AlertCircle, Info, Zap, HardDrive, Monitor, Wifi
} from 'lucide-react';
import '../styles/security-center.css';

const SecurityCenter = () => {
  const [securityData, setSecurityData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7d');

  // Mock security data
  const mockSecurityData = {
    overview: {
      totalThreats: 23,
      criticalThreats: 2,
      resolvedThreats: 18,
      pendingThreats: 3,
      securityScore: 85,
      lastScan: '2024-01-15T10:30:00Z',
      nextScan: '2024-01-15T16:30:00Z'
    },
    threats: [
      {
        id: 1,
        type: 'brute_force',
        severity: 'high',
        title: 'Multiple Failed Login Attempts',
        description: 'Detected 15 failed login attempts from IP 192.168.1.100',
        source: '192.168.1.100',
        target: 'admin@stayops.com',
        timestamp: '2024-01-15T10:25:00Z',
        status: 'active',
        resolved: false
      },
      {
        id: 2,
        type: 'suspicious_activity',
        severity: 'medium',
        title: 'Unusual API Usage Pattern',
        description: 'API calls from new geographic location detected',
        source: '203.45.67.89',
        target: 'API Endpoint',
        timestamp: '2024-01-15T09:15:00Z',
        status: 'investigating',
        resolved: false
      },
      {
        id: 3,
        type: 'malware',
        severity: 'critical',
        title: 'Potential Malware Detection',
        description: 'Suspicious file upload detected in user documents',
        source: 'User Upload',
        target: 'File System',
        timestamp: '2024-01-15T08:45:00Z',
        status: 'resolved',
        resolved: true
      }
    ],
    accessLogs: [
      {
        id: 1,
        userId: 'admin@stayops.com',
        action: 'login',
        ip: '192.168.1.50',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, NY, USA',
        timestamp: '2024-01-15T10:30:00Z',
        status: 'success'
      },
      {
        id: 2,
        userId: 'john.doe@stayops.com',
        action: 'failed_login',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: 'Unknown',
        timestamp: '2024-01-15T10:25:00Z',
        status: 'failed'
      },
      {
        id: 3,
        userId: 'sarah.wilson@stayops.com',
        action: 'password_change',
        ip: '192.168.1.75',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        location: 'Los Angeles, CA, USA',
        timestamp: '2024-01-15T09:45:00Z',
        status: 'success'
      }
    ],
    blockedIPs: [
      {
        id: 1,
        ip: '192.168.1.100',
        reason: 'Multiple failed login attempts',
        blockedAt: '2024-01-15T10:25:00Z',
        expiresAt: '2024-01-15T16:25:00Z',
        status: 'active'
      },
      {
        id: 2,
        ip: '203.45.67.89',
        reason: 'Suspicious activity pattern',
        blockedAt: '2024-01-15T09:15:00Z',
        expiresAt: '2024-01-16T09:15:00Z',
        status: 'active'
      }
    ],
    securityMetrics: {
      loginAttempts: 1247,
      failedLogins: 23,
      successfulLogins: 1224,
      blockedIPs: 3,
      securityAlerts: 2,
      twoFactorEnabled: 156,
      passwordChanges: 12,
      accountLockouts: 5
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, [dateRange]);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // In a real app, you would call the API
      setTimeout(() => {
        setSecurityData(mockSecurityData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading security data:', error);
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      low: { color: 'info', icon: Info, text: 'Low' },
      medium: { color: 'warning', icon: AlertTriangle, text: 'Medium' },
      high: { color: 'error', icon: AlertCircle, text: 'High' },
      critical: { color: 'critical', icon: XCircle, text: 'Critical' }
    };
    
    const config = severityConfig[severity] || severityConfig.low;
    const IconComponent = config.icon;
    
    return (
      <span className={`severity-badge ${config.color}`}>
        <IconComponent size={12} />
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'error', icon: AlertCircle, text: 'Active' },
      investigating: { color: 'warning', icon: Eye, text: 'Investigating' },
      resolved: { color: 'success', icon: CheckCircle, text: 'Resolved' },
      false_positive: { color: 'info', icon: Info, text: 'False Positive' }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'threats', label: 'Threats', icon: AlertTriangle },
    { id: 'access', label: 'Access Logs', icon: Users },
    { id: 'blocked', label: 'Blocked IPs', icon: Lock },
    { id: 'settings', label: 'Security Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="security-center">
        <div className="loading-state">
          <RefreshCw size={24} className="spinning" />
          <p>Loading security data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="security-center">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Security Center</h1>
          <p>Monitor and manage security threats, access logs, and system security settings</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={16} />
            Export Report
          </button>
          <button className="btn-secondary" onClick={loadSecurityData}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn-primary">
            <Plus size={16} />
            Add Security Rule
          </button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="security-overview">
        <div className="overview-card primary">
          <div className="card-icon">
            <Shield size={24} />
          </div>
          <div className="card-content">
            <h3>Security Score</h3>
            <div className="score-value">{securityData.overview?.securityScore || 0}%</div>
            <div className="score-description">Overall system security rating</div>
          </div>
        </div>

        <div className="overview-card danger">
          <div className="card-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="card-content">
            <h3>Active Threats</h3>
            <div className="threat-count">{securityData.overview?.totalThreats || 0}</div>
            <div className="threat-breakdown">
              <span className="critical">{securityData.overview?.criticalThreats || 0} Critical</span>
              <span className="pending">{securityData.overview?.pendingThreats || 0} Pending</span>
            </div>
          </div>
        </div>

        <div className="overview-card success">
          <div className="card-icon">
            <CheckCircle size={24} />
          </div>
          <div className="card-content">
            <h3>Resolved Threats</h3>
            <div className="resolved-count">{securityData.overview?.resolvedThreats || 0}</div>
            <div className="resolution-rate">
              {Math.round((securityData.overview?.resolvedThreats / securityData.overview?.totalThreats) * 100) || 0}% Resolution Rate
            </div>
          </div>
        </div>

        <div className="overview-card info">
          <div className="card-icon">
            <Clock size={24} />
          </div>
          <div className="card-content">
            <h3>Last Security Scan</h3>
            <div className="scan-time">{formatDate(securityData.overview?.lastScan)}</div>
            <div className="next-scan">Next: {formatDate(securityData.overview?.nextScan)}</div>
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="security-metrics">
        <h3>Security Metrics (Last 24 Hours)</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-label">Login Attempts</div>
            <div className="metric-value">{securityData.securityMetrics?.loginAttempts || 0}</div>
            <div className="metric-change positive">
              <TrendingUp size={12} />
              +5.2%
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-label">Failed Logins</div>
            <div className="metric-value">{securityData.securityMetrics?.failedLogins || 0}</div>
            <div className="metric-change negative">
              <TrendingDown size={12} />
              -12.3%
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-label">Blocked IPs</div>
            <div className="metric-value">{securityData.securityMetrics?.blockedIPs || 0}</div>
            <div className="metric-change neutral">
              <Activity size={12} />
              0%
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-label">2FA Enabled</div>
            <div className="metric-value">{securityData.securityMetrics?.twoFactorEnabled || 0}</div>
            <div className="metric-change positive">
              <TrendingUp size={12} />
              +2.1%
            </div>
          </div>
        </div>
      </div>

      {/* Security Tabs */}
      <div className="security-tabs-container">
        <div className="security-tabs">
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
              <div className="recent-threats">
                <h3>Recent Security Threats</h3>
                <div className="threats-list">
                  {securityData.threats?.slice(0, 5).map(threat => (
                    <div key={threat.id} className="threat-item">
                      <div className="threat-header">
                        <div className="threat-title">{threat.title}</div>
                        {getSeverityBadge(threat.severity)}
                        {getStatusBadge(threat.status)}
                      </div>
                      <div className="threat-description">{threat.description}</div>
                      <div className="threat-meta">
                        <span>Source: {threat.source}</span>
                        <span>Time: {formatDate(threat.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="security-recommendations">
                <h3>Security Recommendations</h3>
                <div className="recommendations-list">
                  <div className="recommendation-item">
                    <AlertTriangle size={16} className="recommendation-icon warning" />
                    <div className="recommendation-content">
                      <div className="recommendation-title">Enable Two-Factor Authentication</div>
                      <div className="recommendation-description">Only 65% of users have 2FA enabled</div>
                    </div>
                    <button className="btn-primary">Enable</button>
                  </div>
                  
                  <div className="recommendation-item">
                    <Shield size={16} className="recommendation-icon info" />
                    <div className="recommendation-content">
                      <div className="recommendation-title">Update Security Policies</div>
                      <div className="recommendation-description">Password policy hasn't been updated in 6 months</div>
                    </div>
                    <button className="btn-secondary">Update</button>
                  </div>
                  
                  <div className="recommendation-item">
                    <Database size={16} className="recommendation-icon success" />
                    <div className="recommendation-content">
                      <div className="recommendation-title">Schedule Security Audit</div>
                      <div className="recommendation-description">Last security audit was 3 months ago</div>
                    </div>
                    <button className="btn-secondary">Schedule</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Threats Tab */}
          {activeTab === 'threats' && (
            <div className="threats-tab">
              <div className="tab-filters">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search threats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="filter-group">
                  <Filter size={16} />
                  <select>
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <select>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="threats-table">
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">Threat</div>
                    <div className="table-cell">Severity</div>
                    <div className="table-cell">Source</div>
                    <div className="table-cell">Target</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Time</div>
                    <div className="table-cell">Actions</div>
                  </div>
                </div>
                
                <div className="table-body">
                  {securityData.threats?.map(threat => (
                    <div key={threat.id} className="table-row">
                      <div className="table-cell">
                        <div className="threat-info">
                          <div className="threat-title">{threat.title}</div>
                          <div className="threat-description">{threat.description}</div>
                        </div>
                      </div>
                      <div className="table-cell">
                        {getSeverityBadge(threat.severity)}
                      </div>
                      <div className="table-cell">
                        <div className="source-info">
                          <Globe size={12} />
                          {threat.source}
                        </div>
                      </div>
                      <div className="table-cell">
                        {threat.target}
                      </div>
                      <div className="table-cell">
                        {getStatusBadge(threat.status)}
                      </div>
                      <div className="table-cell">
                        {formatDate(threat.timestamp)}
                      </div>
                      <div className="table-cell">
                        <div className="action-buttons">
                          <button className="action-btn" title="View Details">
                            <Eye size={14} />
                          </button>
                          <button className="action-btn" title="Resolve">
                            <CheckCircle size={14} />
                          </button>
                          <button className="action-btn" title="Block Source">
                            <Lock size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Access Logs Tab */}
          {activeTab === 'access' && (
            <div className="access-tab">
              <div className="tab-filters">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search access logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="filter-group">
                  <select>
                    <option value="">All Actions</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="failed_login">Failed Login</option>
                    <option value="password_change">Password Change</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <select>
                    <option value="">All Status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="access-logs-table">
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">User</div>
                    <div className="table-cell">Action</div>
                    <div className="table-cell">IP Address</div>
                    <div className="table-cell">Location</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Time</div>
                    <div className="table-cell">Actions</div>
                  </div>
                </div>
                
                <div className="table-body">
                  {securityData.accessLogs?.map(log => (
                    <div key={log.id} className="table-row">
                      <div className="table-cell">
                        <div className="user-info">
                          <div className="user-email">{log.userId}</div>
                        </div>
                      </div>
                      <div className="table-cell">
                        <span className={`action-badge ${log.action}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="table-cell">
                        <div className="ip-info">
                          <Globe size={12} />
                          {log.ip}
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="location-info">
                          <MapPin size={12} />
                          {log.location}
                        </div>
                      </div>
                      <div className="table-cell">
                        <span className={`status-badge ${log.status}`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="table-cell">
                        {formatDate(log.timestamp)}
                      </div>
                      <div className="table-cell">
                        <div className="action-buttons">
                          <button className="action-btn" title="View Details">
                            <Eye size={14} />
                          </button>
                          <button className="action-btn" title="Block IP">
                            <Lock size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Blocked IPs Tab */}
          {activeTab === 'blocked' && (
            <div className="blocked-tab">
              <div className="tab-filters">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search blocked IPs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="filter-group">
                  <select>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="blocked-ips-table">
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">IP Address</div>
                    <div className="table-cell">Reason</div>
                    <div className="table-cell">Blocked At</div>
                    <div className="table-cell">Expires At</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Actions</div>
                  </div>
                </div>
                
                <div className="table-body">
                  {securityData.blockedIPs?.map(blockedIP => (
                    <div key={blockedIP.id} className="table-row">
                      <div className="table-cell">
                        <div className="ip-info">
                          <Globe size={12} />
                          {blockedIP.ip}
                        </div>
                      </div>
                      <div className="table-cell">
                        {blockedIP.reason}
                      </div>
                      <div className="table-cell">
                        {formatDate(blockedIP.blockedAt)}
                      </div>
                      <div className="table-cell">
                        {formatDate(blockedIP.expiresAt)}
                      </div>
                      <div className="table-cell">
                        <span className={`status-badge ${blockedIP.status}`}>
                          {blockedIP.status}
                        </span>
                      </div>
                      <div className="table-cell">
                        <div className="action-buttons">
                          <button className="action-btn" title="View Details">
                            <Eye size={14} />
                          </button>
                          <button className="action-btn" title="Unblock">
                            <Unlock size={14} />
                          </button>
                          <button className="action-btn" title="Extend Block">
                            <Clock size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === 'settings' && (
            <div className="settings-tab">
              <div className="settings-sections">
                <div className="settings-section">
                  <h3>Threat Detection</h3>
                  <div className="settings-grid">
                    <div className="setting-item toggle-item">
                      <label>Enable Real-time Threat Detection</label>
                      <div className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    
                    <div className="setting-item toggle-item">
                      <label>Enable Brute Force Protection</label>
                      <div className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    
                    <div className="setting-item toggle-item">
                      <label>Enable IP Geolocation Blocking</label>
                      <div className="toggle-switch">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Access Control</h3>
                  <div className="settings-grid">
                    <div className="setting-item">
                      <label>Session Timeout (minutes)</label>
                      <input type="number" defaultValue="30" min="5" max="480" />
                    </div>
                    
                    <div className="setting-item">
                      <label>Max Login Attempts</label>
                      <input type="number" defaultValue="5" min="3" max="10" />
                    </div>
                    
                    <div className="setting-item">
                      <label>Lockout Duration (minutes)</label>
                      <input type="number" defaultValue="15" min="5" max="60" />
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Notifications</h3>
                  <div className="settings-grid">
                    <div className="setting-item toggle-item">
                      <label>Email Security Alerts</label>
                      <div className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    
                    <div className="setting-item toggle-item">
                      <label>SMS Critical Alerts</label>
                      <div className="toggle-switch">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    
                    <div className="setting-item toggle-item">
                      <label>Dashboard Notifications</label>
                      <div className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityCenter;
