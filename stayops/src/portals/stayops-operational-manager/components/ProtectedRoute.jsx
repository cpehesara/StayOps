import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Shield, AlertCircle, LogOut } from 'lucide-react';

const ProtectedRoute = ({ children, isAuthenticated, userRole, allowedRoles }) => {
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div style={{ 
        padding: '20px', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #faf8f5 0%, #f5f2ee 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '48px 40px',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          maxWidth: '540px',
          width: '100%',
          border: '1px solid #e8e3dc'
        }}>
          {/* Icon Header */}
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #c17767 0%, #d4a574 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Shield size={32} color="white" strokeWidth={2} />
          </div>

          {/* Title */}
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '600',
            marginBottom: '12px', 
            color: '#2c2c2e',
            textAlign: 'center',
            letterSpacing: '-0.3px'
          }}>
            Access Denied
          </h1>

          {/* Message */}
          <p style={{ 
            color: '#8b8680', 
            marginBottom: '32px',
            textAlign: 'center',
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            You don't have the necessary permissions to access this portal. Please contact your administrator if you believe this is an error.
          </p>

          {/* Role Information Card */}
          <div style={{
            background: '#faf8f5',
            border: '1px solid #e8e3dc',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={18} color="#b8956a" />
              <span style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#6b5d4f',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Permission Details
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #f5f2ee'
              }}>
                <span style={{ fontSize: '13px', color: '#8b8680' }}>Your Role:</span>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#2c2c2e',
                  padding: '4px 12px',
                  background: '#f5f2ee',
                  borderRadius: '6px'
                }}>
                  {userRole || 'Unknown'}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #f5f2ee'
              }}>
                <span style={{ fontSize: '13px', color: '#8b8680' }}>Required Role:</span>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#c17767',
                  padding: '4px 12px',
                  background: '#fbe9e7',
                  borderRadius: '6px'
                }}>
                  {allowedRoles.join(' or ')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexDirection: 'column'
          }}>
            <button 
              onClick={() => {
                // Clear session and redirect to login
                sessionStorage.clear();
                window.location.href = '/login';
              }}
              style={{
                padding: '12px 24px',
                background: '#2c2c2e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#b8956a';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#2c2c2e';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <LogOut size={18} />
              Return to Login
            </button>

            <button 
              onClick={() => window.history.back()}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#8b8680',
                border: '1px solid #e8e3dc',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#b8956a';
                e.target.style.color = '#b8956a';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e8e3dc';
                e.target.style.color = '#8b8680';
              }}
            >
              Go Back
            </button>
          </div>

          {/* Help Text */}
          <p style={{
            marginTop: '24px',
            fontSize: '12px',
            color: '#c4bbb0',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            Need help? Contact your system administrator or IT support team.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;