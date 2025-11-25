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
  Close as X,
  Chat as ChatIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

const sidebarItems = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/receptionist/dashboard' },
  { text: 'Check-In & Check-Out', icon: Users, path: '/receptionist/check-in-out' },
  { text: 'Reservations', icon: Calendar, path: '/receptionist/reservations' },
  { text: 'Guest Registration', icon: Users, path: '/receptionist/guest-registration' },
  { text: 'Guests', icon: Users, path: '/receptionist/guests' },
  { text: 'Billing', icon: Receipt, path: '/receptionist/billing' },
  { text: 'Community Messages', icon: ChatIcon, path: '/receptionist/messages' },
  { text: 'Notifications', icon: NotificationsIcon, path: '/receptionist/notifications' },
  { text: 'QR Scanner', icon: Bed, path: '/receptionist/qr-scanner'}
];

const bottomItems = [
  { text: 'View Profile', icon: Settings, path: '/receptionist/settings' }
];

export default function DashboardLayout({ onLogout, user }) {
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
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '8px',
        }}
      >
        {isOpen ? <X style={{ fontSize: 18 }} /> : <Menu style={{ fontSize: 18 }} />}
      </button>

      <div
        style={{
          width: isOpen ? '280px' : '0',
          backgroundColor: 'white',
          borderRight: '1px solid black',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
        }}
      >
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
            Receptionist Portal
          </p>
        </div>

        <div style={{ 
          flex: 1, 
          paddingTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          minHeight: 0,
        }}>
          <nav style={{ 
            padding: '0 12px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 0,
          }}>
            <div>
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                const isSelected = location.pathname === item.path;
                
                return (
                  <button
                    key={item.text}
                    onClick={() => handleItemClick(item.path)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      minHeight: '38px',
                      backgroundColor: isSelected ? 'black' : 'transparent',
                      color: isSelected ? 'white' : 'black',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontSize: '13px',
                      fontWeight: isSelected ? '400' : '300',
                      letterSpacing: '0.2px',
                      borderRadius: '6px',
                      marginBottom: '3px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#f9f9f9';
                        e.currentTarget.style.border = '1px solid #e0e0e0';
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.border = 'none';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <IconComponent
                      style={{
                        fontSize: 16,
                        marginRight: '10px',
                        color: isSelected ? 'white' : 'black',
                      }}
                    />
                    {item.text}
                  </button>
                );
              })}
            </div>

            <div style={{ 
              borderTop: '1px solid #e0e0e0', 
              paddingTop: '8px',
              marginTop: '8px',
            }}>
              {bottomItems.map((item) => {
                const IconComponent = item.icon;
                const isSelected = location.pathname === item.path || 
                                  location.pathname === '/receptionist/profile';
                
                return (
                  <button
                    key={item.text}
                    onClick={() => handleItemClick(item.path)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      minHeight: '38px',
                      backgroundColor: isSelected ? 'black' : 'transparent',
                      color: isSelected ? 'white' : 'black',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontSize: '13px',
                      fontWeight: isSelected ? '400' : '300',
                      letterSpacing: '0.2px',
                      borderRadius: '6px',
                      marginBottom: '3px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#f9f9f9';
                        e.currentTarget.style.border = '1px solid #e0e0e0';
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.border = 'none';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <IconComponent
                      style={{
                        fontSize: 16,
                        marginRight: '10px',
                        color: isSelected ? 'white' : 'black',
                      }}
                    />
                    {item.text}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        <div
          style={{
            borderTop: '1px solid black',
            padding: '12px',
            flexShrink: 0,
          }}
        >
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
                fontSize: '11px',
                color: '#6c757d',
                marginBottom: '2px',
              }}
            >
              Logged in as:
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#212529',
                wordBreak: 'break-word',
              }}
            >
              {user?.email || sessionStorage.getItem('userEmail') || 'reception@gmail.com'}
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '8px 16px',
              minHeight: '38px',
              backgroundColor: 'transparent',
              color: 'black',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '13px',
              fontWeight: '300',
              letterSpacing: '0.2px',
              borderRadius: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.border = '1px solid #fecaca';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'black';
              e.currentTarget.style.border = 'none';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <LogOut
              style={{
                fontSize: 16,
                marginRight: '10px',
              }}
            />
            Sign Out
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: '#fafafa',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}