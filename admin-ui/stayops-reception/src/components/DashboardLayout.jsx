import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Dashboard as LayoutDashboard, 
  People as Users, 
  Hotel as Bed, 
  CalendarMonth as Calendar, 
  Receipt, 
  Settings, 
  Logout as LogOut,
  Menu,
  Close as X
} from '@mui/icons-material';

const sidebarItems = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/overview' },
  { text: 'Check-In & Check-Out', icon: Users, path: '/dashboard/check-in-out' },
  { text: 'Reservations', icon: Calendar, path: '/dashboard/reservations' },
  { text: 'Guest Registration', icon: Users, path: '/dashboard/guest-registration' },
  { text: 'Guests', icon: Users, path: '/dashboard/guests' },
  { text: 'Rooms', icon: Bed, path: '/dashboard/rooms' },
  { text: 'Billing', icon: Receipt, path: '/dashboard/billing' },
  { text: 'Guest Requests', icon: Users, path: '/dashboard/guest-requests' },
  { text: 'Communication', icon: Users, path: '/dashboard/communication' },
  { text: 'Reporting', icon: Users, path: '/dashboard/reporting' },
  { text: 'Security', icon: Users, path: '/dashboard/security' },
  { text: 'Settings', icon: Settings, path: '/dashboard/settings' },
  { text: 'QR Scanner', icon: Users, path: '/dashboard/qr-scanner'}
];

export default function DashboardLayout({ onLogout }) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (path) => {
    navigate(path);
  };

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      if (onLogout) {
        onLogout();
      }
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: '24px',
          left: isOpen ? '240px' : '24px',
          zIndex: 1000,
          backgroundColor: 'white',
          border: '1px solid black',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'left 0.3s ease',
        }}
      >
        {isOpen ? <X style={{ fontSize: 18 }} /> : <Menu style={{ fontSize: 18 }} />}
      </button>

      {/* Sidebar */}
      <div
        style={{
          width: isOpen ? '280px' : '0',
          backgroundColor: 'white',
          borderRight: '1px solid black',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px 12px 24px',
            borderBottom: '1px solid black',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <h1
            style={{
              fontSize: '20px',
              fontWeight: '300',
              color: 'black',
              letterSpacing: '0.5px',
              margin: '0 0 2px 0',
            }}
          >
            StayOps
          </h1>
          <p
            style={{
              fontSize: '11px',
              color: '#666',
              fontWeight: '300',
              letterSpacing: '0.2px',
              margin: 0,
            }}
          >
            Receptionist Dashboard
          </p>
        </div>

        {/* Navigation Items */}
        <div style={{ 
          flex: 1, 
          paddingTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <nav style={{ 
            padding: '0 12px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly'
          }}>
            {sidebarItems.map((item, index) => {
              const IconComponent = item.icon;
              const isSelected = location.pathname === item.path;
              
              return (
                <div key={item.text} style={{ marginBottom: '1px' }}>
                  <button
                    onClick={() => handleItemClick(item.path)}
                    style={{
                      width: '100%',
                      padding: '6px 16px',
                      minHeight: '32px',
                      backgroundColor: isSelected ? 'black' : 'transparent',
                      color: isSelected ? 'white' : 'black',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      fontSize: '13px',
                      fontWeight: isSelected ? '400' : '300',
                      letterSpacing: '0.2px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = '#f9f9f9';
                        e.target.style.border = '1px solid #e0e0e0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.border = 'none';
                      }
                    }}
                  >
                    <IconComponent
                      style={{
                        fontSize: 14,
                        marginRight: '10px',
                        color: isSelected ? 'white' : 'black',
                      }}
                    />
                    {item.text}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div
          style={{
            borderTop: '1px solid black',
            padding: '8px 12px 12px 12px',
            flexShrink: 0,
          }}
        >
          {/* User Info */}
          <div
            style={{
              padding: '8px 12px',
              marginBottom: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#6c757d',
                marginBottom: '2px',
              }}
            >
              Logged in as:
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#212529',
                wordBreak: 'break-word',
              }}
            >
              {localStorage.getItem('userEmail') || 'reception@gmail.com'}
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '6px 16px',
              minHeight: '32px',
              backgroundColor: 'transparent',
              color: 'black',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              fontSize: '13px',
              fontWeight: '300',
              letterSpacing: '0.2px',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9f9f9';
              e.target.style.border = '1px solid #e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.border = 'none';
            }}
          >
            <LogOut
              style={{
                fontSize: 14,
                marginRight: '10px',
                color: 'black',
              }}
            />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#fafafa',
          transition: 'margin-left 0.3s ease',
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}