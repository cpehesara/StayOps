import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <div style={{
      width: '100%',
      background: 'rgba(44, 44, 46, 0.8)',
      backdropFilter: 'blur(10px)',
      padding: '12px 0',
      borderTop: '1px solid rgba(139, 134, 128, 0.2)'
    }}>
      <div style={{
        textAlign: 'center',
        color: '#8b8680',
        fontSize: '10px',
        fontWeight: '400',
        letterSpacing: '0.5px'
      }}>
        © {year} StayOps. All rights reserved. Developed by{' '}
        <span style={{
          color: '#b8956a',
          fontWeight: '500'
        }}>
          IBSEGP - Group 07
        </span>
      </div>
    </div>
  );
};

export default Footer;
