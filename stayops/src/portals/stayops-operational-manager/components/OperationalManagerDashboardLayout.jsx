import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Dashboard as LayoutDashboard,
  People as Users,
  Hotel as Bed,
  CalendarMonth as Calendar,
  Settings,
  Logout as LogOut,
  Menu,
  Close as X,
  Business,
  Report as ReportIcon,
  Message as MessageIcon
} from '@mui/icons-material';

// Updated sidebar items for Operational Manager Portal
const sidebarItems = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/operations/dashboard' },

  // Operations Section
  {
    text: 'Operations',
    icon: Business,
    children: [
      { text: 'Staff Management', icon: Users, path: '/operations/staff-management' },
      { text: 'Department View', icon: Business, path: '/operations/department-view' },
      { text: 'Reservations', icon: Calendar, path: '/operations/reservations' },
      { text: 'Rooms Overview', icon: Bed, path: '/operations/rooms' },
      { text: 'Guest Management', icon: Users, path: '/operations/guests' },
      { text: 'Service Request Management', icon: MessageIcon, path: '/operations/service-requests' },
    ]
  },

  // Quality & Guest Services
  { text: 'Community Messages', icon: MessageIcon, path: '/operations/messages' },
  { text: 'Complaint Management', icon: ReportIcon, path: '/operations/complaints' },

  // Settings
  //{ text: 'Settings', icon: Settings, path: '/operations/settings' },
];

export default function OperationalManagerDashboardLayout({ onLogout, user }) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState({
    'Operations': false,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (path) => {
    navigate(path);
  };

  const toggleExpanded = (itemText) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemText]: !prev[itemText]
    }));
  };

  const isChildActive = (children) => {
    return children?.some(child => location.pathname === child.path);
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
          transition: 'left 0.3s ease',
        }}
      >
        {isOpen ? <X style={{ fontSize: 18 }} /> : <Menu style={{ fontSize: 18 }} />}
      </button>

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
            Operational Manager Portal
          </p>
        </div>

        <div style={{ 
          flex: 1, 
          paddingTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto'
        }}>
          <nav style={{ 
            padding: '0 12px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isSelected = location.pathname === item.path;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems[item.text];
              const isParentActive = hasChildren && isChildActive(item.children);
              
              return (
                <div key={item.text} style={{ marginBottom: '1px' }}>
                  <button
                    onClick={() => hasChildren ? toggleExpanded(item.text) : handleItemClick(item.path)}
                    style={{
                      width: '100%',
                      padding: '6px 16px',
                      minHeight: '32px',
                      backgroundColor: (isSelected || isParentActive) ? 'black' : 'transparent',
                      color: (isSelected || isParentActive) ? 'white' : 'black',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      fontSize: '13px',
                      fontWeight: (isSelected || isParentActive) ? '400' : '300',
                      letterSpacing: '0.2px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isParentActive) {
                        e.target.style.backgroundColor = '#f9f9f9';
                        e.target.style.border = '1px solid #e0e0e0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !isParentActive) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.border = 'none';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <IconComponent
                        style={{
                          fontSize: 14,
                          marginRight: '10px',
                          color: (isSelected || isParentActive) ? 'white' : 'black',
                        }}
                      />
                      {item.text}
                    </div>
                    {hasChildren && (
                      <span style={{ 
                        fontSize: 10, 
                        color: (isSelected || isParentActive) ? 'white' : 'black',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease-in-out'
                      }}>
                        ▶
                      </span>
                    )}
                  </button>
                  
                  {hasChildren && isExpanded && (
                    <div style={{ marginLeft: '20px', marginTop: '2px' }}>
                      {item.children.map((child) => {
                        const ChildIconComponent = child.icon;
                        const isChildSelected = location.pathname === child.path;
                        
                        return (
                          <button
                            key={child.text}
                            onClick={() => handleItemClick(child.path)}
                            style={{
                              width: '100%',
                              padding: '4px 12px',
                              minHeight: '28px',
                              backgroundColor: isChildSelected ? '#333' : 'transparent',
                              color: isChildSelected ? 'white' : '#666',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              fontSize: '12px',
                              fontWeight: isChildSelected ? '400' : '300',
                              letterSpacing: '0.2px',
                              marginBottom: '1px',
                            }}
                            onMouseEnter={(e) => {
                              if (!isChildSelected) {
                                e.target.style.backgroundColor = '#f5f5f5';
                                e.target.style.color = '#333';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isChildSelected) {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#666';
                              }
                            }}
                          >
                            <ChildIconComponent
                              style={{
                                fontSize: 12,
                                marginRight: '8px',
                                color: isChildSelected ? 'white' : '#666',
                              }}
                            />
                            {child.text}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div
          style={{
            borderTop: '1px solid black',
            padding: '8px 12px 12px 12px',
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
              {user?.email || sessionStorage.getItem('userEmail') || 'opmanager@stayops.com'}
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