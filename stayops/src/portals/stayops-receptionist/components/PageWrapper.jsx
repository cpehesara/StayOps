// src/portals/stayops-receptionist/components/PageWrapper.jsx
import React from 'react';

/**
 * PageWrapper - Wraps page content to work within DashboardLayout
 * Use this for all receptionist pages to ensure consistent spacing
 */
const PageWrapper = ({ children, className = '' }) => {
  return (
    <div 
      className={`p-8 ${className}`}
      style={{ 
        backgroundColor: '#faf8f5',
        minHeight: '100%',
        width: '100%'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;