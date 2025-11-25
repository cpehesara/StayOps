import React from 'react';
import '../styles/sidebar.css';

const ServiceManagerTestPage = ({ title = "Service Manager Test Page", description = "Test page for Service Manager Portal" }) => {
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
          Service Manager Portal Features
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
              Service Operations
            </h3>
            <ul style={{ color: '#5a5550', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Housekeeping Management</li>
              <li>Maintenance Scheduling</li>
              <li>Laundry Services</li>
              <li>Concierge Operations</li>
              <li>Room Service Coordination</li>
            </ul>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f5f2ee',
            borderRadius: '8px',
            border: '1px solid #e8e3dc'
          }}>
            <h3 style={{ color: '#2c2c2e', fontSize: '18px', margin: '0 0 12px 0' }}>
              Amenities Management
            </h3>
            <ul style={{ color: '#5a5550', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Restaurant & Bar Operations</li>
              <li>Spa & Wellness Center</li>
              <li>Fitness Center Management</li>
              <li>Pool & Recreation Areas</li>
              <li>Business Center Services</li>
            </ul>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f5f2ee',
            borderRadius: '8px',
            border: '1px solid #e8e3dc'
          }}>
            <h3 style={{ color: '#2c2c2e', fontSize: '18px', margin: '0 0 12px 0' }}>
              Staff Management
            </h3>
            <ul style={{ color: '#5a5550', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Service Staff Coordination</li>
              <li>Department View</li>
              <li>Task Assignment</li>
              <li>Performance Monitoring</li>
              <li>Training Programs</li>
            </ul>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f5f2ee',
            borderRadius: '8px',
            border: '1px solid #e8e3dc'
          }}>
            <h3 style={{ color: '#2c2c2e', fontSize: '18px', margin: '0 0 12px 0' }}>
              Quality & Standards
            </h3>
            <ul style={{ color: '#5a5550', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Service Quality Monitoring</li>
              <li>Inspection Reports</li>
              <li>Standards Compliance</li>
              <li>Guest Feedback Analysis</li>
              <li>Continuous Improvement</li>
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
            Welcome to StayOps Service Manager Portal
          </h3>
          <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
            Manage all service operations and ensure exceptional guest experiences
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceManagerTestPage;