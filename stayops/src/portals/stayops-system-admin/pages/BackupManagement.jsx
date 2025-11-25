import React, { useState, useEffect } from 'react';
import { 
  HardDrive, Download, Upload, RefreshCw, Play, Pause, 
  Settings, Trash2, Eye, Clock, CheckCircle, XCircle,
  AlertTriangle, Database, Server, Globe, FileText,
  Calendar, Plus, Search, Filter, Zap, Shield
} from 'lucide-react';
import '../styles/backup-management.css';

const BackupManagement = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock backup data
  const mockBackups = {
    overview: {
      totalBackups: 156,
      successfulBackups: 148,
      failedBackups: 8,
      totalSize: '2.4 TB',
      lastBackup: '2024-01-15T10:30:00Z',
      nextBackup: '2024-01-15T22:00:00Z',
      retentionDays: 30,
      autoBackupEnabled: true
    },
    systemStatus: {
      backupService: 'running',
      storageAvailable: 85,
      storageUsed: 15,
      compressionRatio: 0.65,
      encryptionEnabled: true,
      lastHealthCheck: '2024-01-15T10:00:00Z'
    },
    backups: [
      {
        id: 1,
        name: 'Full System Backup',
        type: 'full',
        status: 'completed',
        size: '1.2 GB',
        compressedSize: '780 MB',
        createdAt: '2024-01-15T10:30:00Z',
        duration: '45 minutes',
        location: 'AWS S3',
        encryption: true,
        retention: '30 days',
        description: 'Complete system backup including database, files, and configurations'
      },
      {
        id: 2,
        name: 'Database Backup',
        type: 'database',
        status: 'completed',
        size: '850 MB',
        compressedSize: '420 MB',
        createdAt: '2024-01-15T09:00:00Z',
        duration: '15 minutes',
        location: 'Local Storage',
        encryption: true,
        retention: '7 days',
        description: 'MySQL database backup with all tables and data'
      },
      {
        id: 3,
        name: 'Configuration Backup',
        type: 'config',
        status: 'running',
        size: '0 MB',
        compressedSize: '0 MB',
        createdAt: '2024-01-15T11:15:00Z',
        duration: '0 minutes',
        location: 'Google Cloud',
        encryption: true,
        retention: '90 days',
        description: 'System configuration files and settings backup'
      },
      {
        id: 4,
        name: 'User Data Backup',
        type: 'user_data',
        status: 'failed',
        size: '0 MB',
        compressedSize: '0 MB',
        createdAt: '2024-01-15T08:45:00Z',
        duration: '0 minutes',
        location: 'Azure Blob',
        encryption: true,
        retention: '30 days',
        description: 'User profiles, documents, and personal data backup',
        errorMessage: 'Connection timeout to Azure storage'
      },
      {
        id: 5,
        name: 'Application Files Backup',
        type: 'files',
        status: 'completed',
        size: '2.1 GB',
        compressedSize: '1.3 GB',
        createdAt: '2024-01-14T23:00:00Z',
        duration: '1 hour 20 minutes',
        location: 'Local Storage',
        encryption: false,
        retention: '14 days',
        description: 'Application files, uploads, and static assets'
      }
    ],
    schedules: [
      {
        id: 1,
        name: 'Daily Full Backup',
        type: 'full',
        frequency: 'daily',
        time: '22:00',
        enabled: true,
        lastRun: '2024-01-15T22:00:00Z',
        nextRun: '2024-01-16T22:00:00Z',
        retention: '30 days',
        location: 'AWS S3'
      },
      {
        id: 2,
        name: 'Hourly Database Backup',
        type: 'database',
        frequency: 'hourly',
        time: '00:00',
        enabled: true,
        lastRun: '2024-01-15T11:00:00Z',
        nextRun: '2024-01-15T12:00:00Z',
        retention: '7 days',
        location: 'Local Storage'
      },
      {
        id: 3,
        name: 'Weekly Configuration Backup',
        type: 'config',
        frequency: 'weekly',
        time: '02:00',
        enabled: true,
        lastRun: '2024-01-14T02:00:00Z',
        nextRun: '2024-01-21T02:00:00Z',
        retention: '90 days',
        location: 'Google Cloud'
      }
    ],
    storageLocations: [
      {
        id: 1,
        name: 'AWS S3',
        type: 'cloud',
        status: 'active',
        used: '1.2 TB',
        available: '8.8 TB',
        total: '10 TB',
        lastSync: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Local Storage',
        type: 'local',
        status: 'active',
        used: '850 GB',
        available: '1.15 TB',
        total: '2 TB',
        lastSync: '2024-01-15T09:00:00Z'
      },
      {
        id: 3,
        name: 'Google Cloud',
        type: 'cloud',
        status: 'active',
        used: '320 GB',
        available: '4.68 TB',
        total: '5 TB',
        lastSync: '2024-01-15T11:15:00Z'
      },
      {
        id: 4,
        name: 'Azure Blob',
        type: 'cloud',
        status: 'error',
        used: '0 GB',
        available: '5 TB',
        total: '5 TB',
        lastSync: '2024-01-15T08:45:00Z',
        errorMessage: 'Connection failed'
      }
    ]
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      // In a real app, you would call the API
      setTimeout(() => {
        setBackups(mockBackups);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading backups:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'success', icon: CheckCircle, text: 'Completed' },
      running: { color: 'warning', icon: Clock, text: 'Running' },
      failed: { color: 'error', icon: XCircle, text: 'Failed' },
      scheduled: { color: 'info', icon: Calendar, text: 'Scheduled' },
      paused: { color: 'warning', icon: Pause, text: 'Paused' }
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
      full: Database,
      database: Database,
      config: Settings,
      user_data: Users,
      files: FileText
    };
    
    const IconComponent = typeIcons[type] || HardDrive;
    return <IconComponent size={16} />;
  };

  const getLocationIcon = (type) => {
    const locationIcons = {
      cloud: Globe,
      local: Server,
      network: Globe
    };
    
    const IconComponent = locationIcons[type] || HardDrive;
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
    if (size === '0 MB') return 'In Progress...';
    return size;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HardDrive },
    { id: 'backups', label: 'Backups', icon: Database },
    { id: 'schedules', label: 'Schedules', icon: Calendar },
    { id: 'storage', label: 'Storage', icon: Server }
  ];

  if (loading) {
    return (
      <div className="backup-management">
        <div className="loading-state">
          <RefreshCw size={24} className="spinning" />
          <p>Loading backup information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backup-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Backup Management</h1>
          <p>Manage system backups, schedules, and storage locations</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Upload size={16} />
            Restore
          </button>
          <button className="btn-secondary" onClick={loadBackups}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Create Backup
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="backup-overview">
        <div className="overview-card primary">
          <div className="card-icon">
            <HardDrive size={24} />
          </div>
          <div className="card-content">
            <h3>Total Backups</h3>
            <div className="card-value">{backups.overview?.totalBackups || 0}</div>
            <div className="card-description">All time backups</div>
          </div>
        </div>

        <div className="overview-card success">
          <div className="card-icon">
            <CheckCircle size={24} />
          </div>
          <div className="card-content">
            <h3>Successful</h3>
            <div className="card-value">{backups.overview?.successfulBackups || 0}</div>
            <div className="card-description">
              {Math.round((backups.overview?.successfulBackups / backups.overview?.totalBackups) * 100) || 0}% success rate
            </div>
          </div>
        </div>

        <div className="overview-card error">
          <div className="card-icon">
            <XCircle size={24} />
          </div>
          <div className="card-content">
            <h3>Failed</h3>
            <div className="card-value">{backups.overview?.failedBackups || 0}</div>
            <div className="card-description">Requires attention</div>
          </div>
        </div>

        <div className="overview-card info">
          <div className="card-icon">
            <Database size={24} />
          </div>
          <div className="card-content">
            <h3>Total Size</h3>
            <div className="card-value">{backups.overview?.totalSize}</div>
            <div className="card-description">Compressed storage</div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="system-status">
        <h3>Backup System Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <div className="status-label">Backup Service</div>
            <div className="status-value">
              <span className={`status-indicator ${backups.systemStatus?.backupService}`}>
                {backups.systemStatus?.backupService}
              </span>
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Storage Available</div>
            <div className="status-value">{backups.systemStatus?.storageAvailable}%</div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Compression Ratio</div>
            <div className="status-value">{backups.systemStatus?.compressionRatio}</div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Encryption</div>
            <div className="status-value">
              <span className={`status-indicator ${backups.systemStatus?.encryptionEnabled ? 'enabled' : 'disabled'}`}>
                {backups.systemStatus?.encryptionEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Tabs */}
      <div className="backup-tabs-container">
        <div className="backup-tabs">
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
              <div className="recent-backups">
                <h4>Recent Backups</h4>
                <div className="backups-list">
                  {backups.backups?.slice(0, 5).map(backup => (
                    <div key={backup.id} className="backup-item">
                      <div className="backup-header">
                        <div className="backup-icon">
                          {getTypeIcon(backup.type)}
                        </div>
                        <div className="backup-info">
                          <div className="backup-name">{backup.name}</div>
                          <div className="backup-meta">
                            {formatDate(backup.createdAt)} • {backup.duration}
                          </div>
                        </div>
                        {getStatusBadge(backup.status)}
                      </div>
                      <div className="backup-details">
                        <div className="backup-size">
                          {formatFileSize(backup.size)} 
                          {backup.compressedSize !== '0 MB' && (
                            <span className="compressed">({backup.compressedSize} compressed)</span>
                          )}
                        </div>
                        <div className="backup-location">
                          {getLocationIcon('cloud')}
                          {backup.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="backup-settings">
                <h4>Backup Settings</h4>
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-label">Auto Backup</div>
                    <div className="setting-value">
                      <span className={`status-indicator ${backups.overview?.autoBackupEnabled ? 'enabled' : 'disabled'}`}>
                        {backups.overview?.autoBackupEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-label">Retention Period</div>
                    <div className="setting-value">{backups.overview?.retentionDays} days</div>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-label">Last Backup</div>
                    <div className="setting-value">{formatDate(backups.overview?.lastBackup)}</div>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-label">Next Backup</div>
                    <div className="setting-value">{formatDate(backups.overview?.nextBackup)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backups Tab */}
          {activeTab === 'backups' && (
            <div className="backups-tab">
              <div className="tab-filters">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search backups..."
                  />
                </div>
                
                <div className="filter-group">
                  <Filter size={16} />
                  <select>
                    <option value="">All Types</option>
                    <option value="full">Full Backup</option>
                    <option value="database">Database</option>
                    <option value="config">Configuration</option>
                    <option value="user_data">User Data</option>
                    <option value="files">Files</option>
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
              </div>

              <div className="backups-table">
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">Backup</div>
                    <div className="table-cell">Type</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Size</div>
                    <div className="table-cell">Created</div>
                    <div className="table-cell">Location</div>
                    <div className="table-cell">Actions</div>
                  </div>
                </div>
                
                <div className="table-body">
                  {backups.backups?.map(backup => (
                    <div key={backup.id} className="table-row">
                      <div className="table-cell">
                        <div className="backup-info">
                          <div className="backup-name">{backup.name}</div>
                          <div className="backup-description">{backup.description}</div>
                          {backup.errorMessage && (
                            <div className="backup-error">{backup.errorMessage}</div>
                          )}
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="backup-type">
                          {getTypeIcon(backup.type)}
                          <span>{backup.type}</span>
                        </div>
                      </div>
                      <div className="table-cell">
                        {getStatusBadge(backup.status)}
                      </div>
                      <div className="table-cell">
                        <div className="backup-size">
                          {formatFileSize(backup.size)}
                          {backup.compressedSize !== '0 MB' && (
                            <div className="compressed-size">
                              {backup.compressedSize} compressed
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="table-cell">
                        {formatDate(backup.createdAt)}
                      </div>
                      <div className="table-cell">
                        <div className="backup-location">
                          {getLocationIcon('cloud')}
                          {backup.location}
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="action-buttons">
                          <button className="action-btn" title="View Details">
                            <Eye size={14} />
                          </button>
                          <button className="action-btn" title="Download">
                            <Download size={14} />
                          </button>
                          <button className="action-btn" title="Restore">
                            <Upload size={14} />
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

          {/* Schedules Tab */}
          {activeTab === 'schedules' && (
            <div className="schedules-tab">
              <div className="schedules-list">
                {backups.schedules?.map(schedule => (
                  <div key={schedule.id} className="schedule-card">
                    <div className="schedule-header">
                      <div className="schedule-icon">
                        {getTypeIcon(schedule.type)}
                      </div>
                      <div className="schedule-info">
                        <div className="schedule-name">{schedule.name}</div>
                        <div className="schedule-frequency">{schedule.frequency} at {schedule.time}</div>
                      </div>
                      <div className="schedule-status">
                        <span className={`status-indicator ${schedule.enabled ? 'enabled' : 'disabled'}`}>
                          {schedule.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    <div className="schedule-details">
                      <div className="schedule-item">
                        <Clock size={14} />
                        <span>Last: {formatDate(schedule.lastRun)}</span>
                      </div>
                      <div className="schedule-item">
                        <Calendar size={14} />
                        <span>Next: {formatDate(schedule.nextRun)}</span>
                      </div>
                      <div className="schedule-item">
                        <HardDrive size={14} />
                        <span>Retention: {schedule.retention}</span>
                      </div>
                      <div className="schedule-item">
                        <Globe size={14} />
                        <span>Location: {schedule.location}</span>
                      </div>
                    </div>
                    <div className="schedule-actions">
                      <button className="btn-secondary">Edit</button>
                      <button className="btn-primary">Run Now</button>
                      <button className="btn-danger">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Storage Tab */}
          {activeTab === 'storage' && (
            <div className="storage-tab">
              <div className="storage-locations">
                {backups.storageLocations?.map(location => (
                  <div key={location.id} className="storage-card">
                    <div className="storage-header">
                      <div className="storage-icon">
                        {getLocationIcon(location.type)}
                      </div>
                      <div className="storage-info">
                        <div className="storage-name">{location.name}</div>
                        <div className="storage-type">{location.type}</div>
                      </div>
                      <div className="storage-status">
                        <span className={`status-indicator ${location.status}`}>
                          {location.status}
                        </span>
                      </div>
                    </div>
                    <div className="storage-usage">
                      <div className="usage-bar">
                        <div 
                          className="usage-fill"
                          style={{ width: `${(parseFloat(location.used) / parseFloat(location.total)) * 100}%` }}
                        ></div>
                      </div>
                      <div className="usage-text">
                        {location.used} used of {location.total}
                      </div>
                    </div>
                    <div className="storage-details">
                      <div className="storage-item">
                        <span>Available: {location.available}</span>
                      </div>
                      <div className="storage-item">
                        <span>Last Sync: {formatDate(location.lastSync)}</span>
                      </div>
                      {location.errorMessage && (
                        <div className="storage-error">
                          <AlertTriangle size={14} />
                          {location.errorMessage}
                        </div>
                      )}
                    </div>
                    <div className="storage-actions">
                      <button className="btn-secondary">Configure</button>
                      <button className="btn-primary">Test Connection</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Backup</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-content">
              <p>Backup creation form would go here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManagement;
