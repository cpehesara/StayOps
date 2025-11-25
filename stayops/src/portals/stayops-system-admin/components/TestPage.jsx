import React from 'react';
import '../styles/sidebar.css';

const SystemAdminTestPage = ({ title = "System Admin Test Page", description = "Test page for System Administrator Portal" }) => {
  return (
    <div style={{ 
      padding: '32px',
      backgroundColor: '#faf8f5',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #e8e3dc'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#2c2c2e',
          margin: '0 0 8px 0',
          letterSpacing: '-0.5px'
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#8b8680',
          margin: '0',
          lineHeight: '1.5'
        }}>
          {description}
        </p>
      </div>

      {/* Content Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '32px',
        border: '1px solid #e8e3dc'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '500',
          color: '#2c2c2e',
          margin: '0 0 16px 0'
        }}>
          System Administrator Portal Features
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '24px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f5f2ee',
            borderRadius: '8px',
            border: '1px solid #e8e3dc'
          }}>
            <h3 style={{ color: '#2c2c2e', fontSize: '18px', margin: '0 0 12px 0' }}>
              System Management
            </h3>
            <ul style={{ color: '#5a5550', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>System Monitoring & Health</li>
              <li>Performance Metrics</li>
              <li>Error Tracking & Logs</li>
              <li>System Updates</li>
              <li>Infrastructure Management</li>
            </ul>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f5f2ee',
            borderRadius: '8px',
            border: '1px solid #e8e3dc'
          }}>
            <h3 style={{ color: '#2c2c2e', fontSize: '18px', margin: '0 0 12px 0' }}>
              User Management
            </h3>
            <ul style={{ color: '#5a5550', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>User Account Administration</li>
              <li>Role & Permission Management</li>
              <li>Access Control</li>
              <li>User Analytics</li>
              <li>Security Compliance</li>
            </ul>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f5f2ee',
            borderRadius: '8px',
            border: '1px solid #e8e3dc'
          }}>
            <h3 style={{ color: '#2c2c2e', fontSize: '18px', margin: '0 0 12px 0' }}>
              Hotel Management
            </h3>
            <ul style={{ color: '#5a5550', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Property Configuration</li>
              <li>Room Management</li>
              <li>Amenity Settings</li>
              <li>Service Configuration</li>
              <li>Multi-property Support</li>
            </ul>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f5f2ee',
            borderRadius: '8px',
            border: '1px solid #e8e3dc'
          }}>
            <h3 style={{ color: '#2c2c2e', fontSize: '18px', margin: '0 0 12px 0' }}>
              Infrastructure
            </h3>
            <ul style={{ color: '#5a5550', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Database Management</li>
              <li>Cloud Services</li>
              <li>Backup & Recovery</li>
              <li>Security Center</li>
              <li>API Management</li>
            </ul>
          </div>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '20px',
          backgroundColor: '#b8956a',
          color: '#ffffff',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
            Welcome to StayOps System Administrator Portal
          </h3>
          <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
            Manage the entire platform infrastructure and ensure optimal system performance
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemAdminTestPage;