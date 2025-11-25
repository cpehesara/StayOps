import React, { useState } from 'react';
import '../styles/security.css';

const Security = ({ securityLogs = [] }) => {
  const [activeTab, setActiveTab] = useState('access');

  const secureCount = securityLogs.filter(log => log.status === 'success').length;
  const alertCount = securityLogs.filter(log => log.status === 'blocked').length;
  const activeKeyCards = 15; // This could be passed as a prop

  return (
    <div className="security-container">
      <div className="security-wrapper">
        
        {/* Header */}
        <div className="security-header">
          <h1 className="security-title">Security</h1>
          <p className="security-subtitle">
            Monitor access control and security systems
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">System Status</div>
            <div className="stat-value">Secure</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Active Key Cards</div>
            <div className="stat-value">{activeKeyCards}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Security Alerts</div>
            <div className="stat-value">{alertCount}</div>
          </div>
        </div>

        {/* Security Logs */}
        <div className="logs-section">
          <div className="logs-header">
            <h2 className="logs-title">Security Logs</h2>
          </div>
          
          <div className="logs-content">
            {securityLogs.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">No security logs available</p>
              </div>
            ) : (
              <div className="logs-list">
                {securityLogs.map((log) => (
                  <div key={log.id} className="log-card">
                    <div className="log-card-content">
                      <div className="log-card-header">
                        <div className="log-card-info">
                          <h4 className="log-action">{log.action}</h4>
                          <div className="log-details">
                            <div>User: {log.user}</div>
                            <div>Location: {log.location}</div>
                            <div className="log-timestamp">{log.timestamp}</div>
                          </div>
                        </div>
                        <span className={`status-badge ${log.status}`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;