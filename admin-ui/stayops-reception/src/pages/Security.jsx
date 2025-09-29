import React, { useState } from 'react';
import {
  Security as SecurityIcon,
  Lock,
  Key,
  Warning,
  Shield,
  Visibility,
  AccountCircle
} from '@mui/icons-material';

const Security = () => {
  const [activeTab, setActiveTab] = useState('access');

  const mockSecurityLogs = [
    {
      id: 'SEC001',
      type: 'access',
      user: 'John Smith',
      action: 'Room Entry',
      location: 'Room 101',
      timestamp: '2024-01-15 14:30:00',
      status: 'success'
    },
    {
      id: 'SEC002',
      type: 'alert',
      user: 'System',
      action: 'Unauthorized Access Attempt',
      location: 'Staff Area',
      timestamp: '2024-01-15 15:45:00',
      status: 'blocked'
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '300', color: '#333', margin: '0 0 8px 0' }}>
          Security Management
        </h1>
        <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
          Monitor access control and security systems
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
          <Shield style={{ fontSize: '32px', color: '#4caf50', marginBottom: '8px' }} />
          <h3 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '600' }}>Secure</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>System Status</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
          <Key style={{ fontSize: '32px', color: '#2196f3', marginBottom: '8px' }} />
          <h3 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '600' }}>15</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Active Key Cards</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
          <Warning style={{ fontSize: '32px', color: '#ff9800', marginBottom: '8px' }} />
          <h3 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '600' }}>2</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Security Alerts</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>Security Logs</h2>
        </div>
        
        <div style={{ padding: '16px' }}>
          {mockSecurityLogs.map((log) => (
            <div key={log.id} style={{
              padding: '16px',
              marginBottom: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '500' }}>
                    {log.action}
                  </h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                    User: {log.user} | Location: {log.location}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                    {log.timestamp}
                  </p>
                </div>
                <span style={{
                  backgroundColor: log.status === 'success' ? '#4caf50' : '#f44336',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Security;
