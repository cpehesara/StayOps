import React, { useState, useEffect } from 'react';
import { 
  BarChart, PieChart, TrendingUp, TrendingDown, Download, 
  Filter, Calendar, RefreshCw, FileText, Users, Building2,
  Server, Database, Globe, Activity, Clock, AlertTriangle,
  CheckCircle, XCircle, Eye, Settings, Plus, Search
} from 'lucide-react';
import '../styles/system-reports.css';

const SystemReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock reports data
  const mockReports = {
    overview: {
      totalReports: 24,
      scheduledReports: 8,
      customReports: 16,
      lastGenerated: '2024-01-15T10:30:00Z',
      nextScheduled: '2024-01-16T08:00:00Z'
    },
    systemMetrics: {
      totalUsers: 1247,
      activeUsers: 892,
      totalHotels: 8,
      activeHotels: 7,
      totalBookings: 15420,
      revenue: 2456789,
      systemUptime: 99.8,
      avgResponseTime: 120
    },
    reports: [
      {
        id: 1,
        name: 'System Performance Report',
        type: 'system',
        category: 'performance',
        status: 'completed',
        lastRun: '2024-01-15T10:30:00Z',
        nextRun: '2024-01-16T08:00:00Z',
        frequency: 'daily',
        size: '2.4 MB',
        format: 'PDF',
        createdBy: 'System Admin',
        description: 'Comprehensive system performance metrics and analysis'
      },
      {
        id: 2,
        name: 'User Activity Report',
        type: 'user',
        category: 'activity',
        status: 'completed',
        lastRun: '2024-01-15T09:15:00Z',
        nextRun: '2024-01-16T09:00:00Z',
        frequency: 'daily',
        size: '1.8 MB',
        format: 'Excel',
        createdBy: 'System Admin',
        description: 'User login patterns, activity logs, and engagement metrics'
      },
      {
        id: 3,
        name: 'Security Audit Report',
        type: 'security',
        category: 'audit',
        status: 'running',
        lastRun: '2024-01-15T11:00:00Z',
        nextRun: '2024-01-22T11:00:00Z',
        frequency: 'weekly',
        size: '0 MB',
        format: 'PDF',
        createdBy: 'Security Admin',
        description: 'Security events, threats, and compliance status'
      },
      {
        id: 4,
        name: 'Hotel Performance Report',
        type: 'hotel',
        category: 'performance',
        status: 'completed',
        lastRun: '2024-01-14T23:59:00Z',
        nextRun: '2024-01-15T23:59:00Z',
        frequency: 'daily',
        size: '3.2 MB',
        format: 'PDF',
        createdBy: 'Operations Manager',
        description: 'Hotel occupancy, revenue, and operational metrics'
      },
      {
        id: 5,
        name: 'Financial Summary Report',
        type: 'financial',
        category: 'summary',
        status: 'completed',
        lastRun: '2024-01-15T00:00:00Z',
        nextRun: '2024-01-16T00:00:00Z',
        frequency: 'daily',
        size: '1.5 MB',
        format: 'Excel',
        createdBy: 'Finance Manager',
        description: 'Daily financial transactions and revenue summary'
      }
    ],
    chartData: {
      userGrowth: [
        { month: 'Jan', users: 1200, growth: 5.2 },
        { month: 'Feb', users: 1250, growth: 4.2 },
        { month: 'Mar', users: 1300, growth: 4.0 },
        { month: 'Apr', users: 1350, growth: 3.8 },
        { month: 'May', users: 1400, growth: 3.7 },
        { month: 'Jun', users: 1450, growth: 3.6 }
      ],
      systemPerformance: [
        { metric: 'CPU Usage', value: 45, status: 'good' },
        { metric: 'Memory Usage', value: 62, status: 'good' },
        { metric: 'Disk Usage', value: 78, status: 'warning' },
        { metric: 'Network Usage', value: 35, status: 'good' },
        { metric: 'Database Performance', value: 98, status: 'excellent' }
      ],
      reportTypes: [
        { type: 'System', count: 8, percentage: 33 },
        { type: 'User', count: 6, percentage: 25 },
        { type: 'Security', count: 4, percentage: 17 },
        { type: 'Hotel', count: 4, percentage: 17 },
        { type: 'Financial', count: 2, percentage: 8 }
      ]
    }
  };

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // In a real app, you would call the API
      setTimeout(() => {
        setReports(mockReports);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading reports:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'success', icon: CheckCircle, text: 'Completed' },
      running: { color: 'warning', icon: Clock, text: 'Running' },
      failed: { color: 'error', icon: XCircle, text: 'Failed' },
      scheduled: { color: 'info', icon: Calendar, text: 'Scheduled' }
    };
    
    const config = statusConfig[status] || statusConfig.completed;
    const IconComponent = config.icon;
    
    return (
      <span className={`status-badge ${config.color}`}>
        <IconComponent size={12} />
        {config.text}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const typeIcons = {
      system: Server,
      user: Users,
      security: AlertTriangle,
      hotel: Building2,
      financial: TrendingUp
    };
    
    const IconComponent = typeIcons[type] || FileText;
    return <IconComponent size={16} />;
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

  const formatFileSize = (size) => {
    if (size === '0 MB') return 'Generating...';
    return size;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'reports', label: 'All Reports', icon: FileText },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar },
    { id: 'custom', label: 'Custom Reports', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="system-reports">
        <div className="loading-state">
          <RefreshCw size={24} className="spinning" />
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-reports">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>System Reports</h1>
          <p>Generate, schedule, and manage system reports and analytics</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={16} />
            Export All
          </button>
          <button className="btn-secondary" onClick={loadReports}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Create Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="reports-overview">
        <div className="overview-card primary">
          <div className="card-icon">
            <FileText size={24} />
          </div>
          <div className="card-content">
            <h3>Total Reports</h3>
            <div className="card-value">{reports.overview?.totalReports || 0}</div>
            <div className="card-description">Generated this month</div>
          </div>
        </div>

        <div className="overview-card success">
          <div className="card-icon">
            <Calendar size={24} />
          </div>
          <div className="card-content">
            <h3>Scheduled Reports</h3>
            <div className="card-value">{reports.overview?.scheduledReports || 0}</div>
            <div className="card-description">Automated reports</div>
          </div>
        </div>

        <div className="overview-card info">
          <div className="card-icon">
            <Settings size={24} />
          </div>
          <div className="card-content">
            <h3>Custom Reports</h3>
            <div className="card-value">{reports.overview?.customReports || 0}</div>
            <div className="card-description">User-created reports</div>
          </div>
        </div>

        <div className="overview-card warning">
          <div className="card-icon">
            <Clock size={24} />
          </div>
          <div className="card-content">
            <h3>Last Generated</h3>
            <div className="card-time">{formatDate(reports.overview?.lastGenerated)}</div>
            <div className="card-description">System Performance Report</div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="system-metrics">
        <h3>System Metrics (Last 30 Days)</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-icon">
              <Users size={20} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Total Users</div>
              <div className="metric-value">{reports.systemMetrics?.totalUsers?.toLocaleString()}</div>
              <div className="metric-change positive">
                <TrendingUp size={12} />
                +5.2%
              </div>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">
              <Building2 size={20} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Active Hotels</div>
              <div className="metric-value">{reports.systemMetrics?.activeHotels}</div>
              <div className="metric-change neutral">
                <Activity size={12} />
                0%
              </div>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">
              <TrendingUp size={20} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Total Bookings</div>
              <div className="metric-value">{reports.systemMetrics?.totalBookings?.toLocaleString()}</div>
              <div className="metric-change positive">
                <TrendingUp size={12} />
                +12.3%
              </div>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">
              <Server size={20} />
            </div>
            <div className="metric-content">
              <div className="metric-label">System Uptime</div>
              <div className="metric-value">{reports.systemMetrics?.systemUptime}%</div>
              <div className="metric-change positive">
                <TrendingUp size={12} />
                +0.1%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Tabs */}
      <div className="reports-tabs-container">
        <div className="reports-tabs">
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
              <div className="charts-section">
                <div className="chart-container">
                  <h4>User Growth Trend</h4>
                  <div className="chart-placeholder">
                    <BarChart size={48} />
                    <p>User growth chart would be displayed here</p>
                  </div>
                </div>
                
                <div className="chart-container">
                  <h4>Report Types Distribution</h4>
                  <div className="chart-placeholder">
                    <PieChart size={48} />
                    <p>Report types pie chart would be displayed here</p>
                  </div>
                </div>
              </div>

              <div className="performance-metrics">
                <h4>System Performance Metrics</h4>
                <div className="performance-list">
                  {reports.chartData?.systemPerformance?.map((metric, index) => (
                    <div key={index} className="performance-item">
                      <div className="performance-label">{metric.metric}</div>
                      <div className="performance-bar">
                        <div 
                          className={`performance-fill ${metric.status}`}
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                      <div className="performance-value">{metric.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All Reports Tab */}
          {activeTab === 'reports' && (
            <div className="reports-tab">
              <div className="tab-filters">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search reports..."
                  />
                </div>
                
                <div className="filter-group">
                  <Filter size={16} />
                  <select>
                    <option value="">All Types</option>
                    <option value="system">System</option>
                    <option value="user">User</option>
                    <option value="security">Security</option>
                    <option value="hotel">Hotel</option>
                    <option value="financial">Financial</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <select>
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="running">Running</option>
                    <option value="failed">Failed</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <Calendar size={16} />
                  <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                </div>
              </div>

              <div className="reports-table">
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">Report</div>
                    <div className="table-cell">Type</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Last Run</div>
                    <div className="table-cell">Next Run</div>
                    <div className="table-cell">Size</div>
                    <div className="table-cell">Actions</div>
                  </div>
                </div>
                
                <div className="table-body">
                  {reports.reports?.map(report => (
                    <div key={report.id} className="table-row">
                      <div className="table-cell">
                        <div className="report-info">
                          <div className="report-name">{report.name}</div>
                          <div className="report-description">{report.description}</div>
                          <div className="report-meta">
                            Created by {report.createdBy} • {report.format}
                          </div>
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="report-type">
                          {getTypeIcon(report.type)}
                          <span>{report.type}</span>
                        </div>
                      </div>
                      <div className="table-cell">
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="table-cell">
                        {formatDate(report.lastRun)}
                      </div>
                      <div className="table-cell">
                        {formatDate(report.nextRun)}
                      </div>
                      <div className="table-cell">
                        {formatFileSize(report.size)}
                      </div>
                      <div className="table-cell">
                        <div className="action-buttons">
                          <button className="action-btn" title="View Report">
                            <Eye size={14} />
                          </button>
                          <button className="action-btn" title="Download">
                            <Download size={14} />
                          </button>
                          <button className="action-btn" title="Schedule">
                            <Calendar size={14} />
                          </button>
                          <button className="action-btn" title="Settings">
                            <Settings size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Reports Tab */}
          {activeTab === 'scheduled' && (
            <div className="scheduled-tab">
              <div className="scheduled-reports">
                {reports.reports?.filter(report => report.frequency !== 'manual').map(report => (
                  <div key={report.id} className="scheduled-report-card">
                    <div className="report-header">
                      <div className="report-icon">
                        {getTypeIcon(report.type)}
                      </div>
                      <div className="report-details">
                        <div className="report-name">{report.name}</div>
                        <div className="report-frequency">{report.frequency}</div>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="report-schedule">
                      <div className="schedule-item">
                        <Clock size={14} />
                        <span>Last: {formatDate(report.lastRun)}</span>
                      </div>
                      <div className="schedule-item">
                        <Calendar size={14} />
                        <span>Next: {formatDate(report.nextRun)}</span>
                      </div>
                    </div>
                    <div className="report-actions">
                      <button className="btn-secondary">Edit Schedule</button>
                      <button className="btn-primary">Run Now</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Reports Tab */}
          {activeTab === 'custom' && (
            <div className="custom-tab">
              <div className="custom-reports">
                {reports.reports?.filter(report => report.createdBy !== 'System Admin').map(report => (
                  <div key={report.id} className="custom-report-card">
                    <div className="report-header">
                      <div className="report-icon">
                        {getTypeIcon(report.type)}
                      </div>
                      <div className="report-details">
                        <div className="report-name">{report.name}</div>
                        <div className="report-creator">by {report.createdBy}</div>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="report-description">
                      {report.description}
                    </div>
                    <div className="report-actions">
                      <button className="btn-secondary">Edit</button>
                      <button className="btn-primary">Run</button>
                      <button className="btn-danger">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Report</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-content">
              <p>Report creation form would go here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemReports;
