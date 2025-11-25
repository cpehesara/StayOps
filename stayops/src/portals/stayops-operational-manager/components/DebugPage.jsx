import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DebugPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    // Check authentication status
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const userData = sessionStorage.getItem('userData');
    
    setAuthData({
      isAuthenticated,
      userData: userData ? JSON.parse(userData) : null,
      currentPath: location.pathname,
      sessionKeys: Object.keys(sessionStorage)
    });
  }, [location]);

  const handleLogin = () => {
    // Simulate receptionist login
    const userData = {
      id: 2,
      name: "Reception User",
      email: "reception@gmail.com",
      role: "RECEPTIONIST"
    };
    
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userData', JSON.stringify(userData));
    
    navigate('/receptionist/dashboard');
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>🔍 StayOps Debug Page</h1>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Authentication Status</h3>
        <pre style={{ 
          background: 'white', 
          padding: '10px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {JSON.stringify(authData, null, 2)}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={handleLogin}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Simulate Receptionist Login
        </button>
        
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ 
        background: '#e7f3ff', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Test Navigation</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {[
            '/receptionist/dashboard',
            '/receptionist/reservations',
            '/receptionist/guests',
            '/receptionist/rooms',
            '/receptionist/automation',
            '/login'
          ].map(path => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                padding: '8px 12px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Go to {path}
            </button>
          ))}
        </div>
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px'
      }}>
        <h3>Browser Information</h3>
        <ul>
          <li><strong>Current URL:</strong> {window.location.href}</li>
          <li><strong>User Agent:</strong> {navigator.userAgent}</li>
          <li><strong>Cookies Enabled:</strong> {navigator.cookieEnabled ? 'Yes' : 'No'}</li>
          <li><strong>Local Storage Available:</strong> {typeof(Storage) !== "undefined" ? 'Yes' : 'No'}</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugPage;