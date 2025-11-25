import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Dashboard as LayoutDashboard,
  RoomService,
  CleaningServices,
  Build,
  Assignment,
  People as Users,
  Schedule,
  Settings,
  Logout as LogOut,
  Menu,
  Close as X,
  Notifications as NotificationIcon,
  Engineering,
  LocalLaundryService,
  Restaurant,
  Spa,
  FitnessCenter,
  Pool,
  Stars as StarIcon,
  Report as ReportIcon,
  Assessment,
  TrendingUp,
  Business
} from '@mui/icons-material';

// Updated sidebar items for Service Manager Portal
const sidebarItems = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/services/dashboard' },
  
  // Service Operations Section
  { 
    text: 'Service Operations', 
    icon: RoomService, 
    path: '/services/operations',
    children: [
      { text: 'Housekeeping', icon: CleaningServices, path: '/services/operations/housekeeping' },
      { text: 'Maintenance', icon: Build, path: '/services/operations/maintenance' },
      { text: 'Laundry Services', icon: LocalLaundryService, path: '/services/operations/laundry' },
      { text: 'Concierge Services', icon: Assignment, path: '/services/operations/concierge' },
      { text: 'Room Service', icon: RoomService, path: '/services/operations/room-service' },
    ]
  },
  
  // Amenities Management Section
  {
    text: 'Amenities Management',
    icon: Spa,
    children: [
      { text: 'Restaurant & Bar', icon: Restaurant, path: '/services/amenities/restaurant' },
      { text: 'Spa & Wellness', icon: Spa, path: '/services/amenities/spa' },
      { text: 'Fitness Center', icon: FitnessCenter, path: '/services/amenities/fitness' },
      { text: 'Pool & Recreation', icon: Pool, path: '/services/amenities/pool' },
      { text: 'Business Center', icon: Engineering, path: '/services/amenities/business' },
    ]
  },
  
  // Staff Management Section
  {
    text: 'Staff Management',
    icon: Users,
    children: [
      { text: 'Service Staff', icon: Users, path: '/services/staff/service-staff' },
      { text: 'Department View', icon: Business, path: '/services/staff/department-view' },
      { text: 'Task Assignment', icon: Assignment, path: '/services/staff/tasks' },
      { text: 'Performance', icon: Assessment, path: '/services/staff/performance' },
    ]
  },
  
  // Quality & Standards Section
  {
    text: 'Quality & Standards',
    icon: StarIcon,
    children: [
      { text: 'Service Quality', icon: StarIcon, path: '/services/quality/service' },
      { text: 'Inspection Reports', icon: Assessment, path: '/services/quality/inspections' },
      { text: 'Standards Compliance', icon: Assignment, path: '/services/quality/standards' },
      { text: 'Training Programs', icon: Schedule, path: '/services/quality/training' },
    ]
  },
  
  // Guest Services
  { text: 'Guest Feedback', icon: StarIcon, path: '/services/feedback' },
  { text: 'Service Requests', icon: Assignment, path: '/services/requests' },
  { text: 'Notifications', icon: NotificationIcon, path: '/services/notifications' },
  
  // Settings
  { text: 'Profile', icon: Settings, path: '/services/profile' },
];

export default function ServiceManagerDashboardLayout({ onLogout, user }) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState({
    'Service Operations': true,
    'Amenities Management': false,
    'Staff Management': false,
    'Quality & Standards': false,
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
          left: isOpen ? '280px' : '24px',
          zIndex: 1000,
          backgroundColor: 'white',
          border: '1px solid #e8e3dc',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'left 0.3s ease',
          borderRadius: '8px',
        }}
      >
        {isOpen ? <X style={{ fontSize: 18 }} /> : <Menu style={{ fontSize: 18 }} />}
      </button>

      <div
        style={{
          width: isOpen ? '300px' : '0',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e8e3dc',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e8e3dc',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '500',
              color: '#2c2c2e',
              letterSpacing: '0.5px',
              margin: '0 0 4px 0',
            }}
          >
            StayOps
          </h1>
          <p
            style={{
              fontSize: '11px',
              color: '#b8956a',
              fontWeight: '400',
              letterSpacing: '0.3px',
              margin: 0,
            }}
          >
            Service Manager Portal
          </p>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <nav style={{ flex: 1, padding: '0 12px' }}>
            {sidebarItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isSelected = location.pathname === item.path;
              const isParentActive = hasChildren && isChildActive(item.children);
              const isExpanded = expandedItems[item.text];
              const IconComponent = item.icon;

              return (
                <div key={item.text} style={{ marginBottom: '4px' }}>
                  <button
                    onClick={() => hasChildren ? toggleExpanded(item.text) : handleItemClick(item.path)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      minHeight: '40px',
                      backgroundColor: (isSelected || isParentActive) ? '#b8956a' : 'transparent',
                      color: (isSelected || isParentActive) ? '#ffffff' : '#2c2c2e',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      fontSize: '13px',
                      fontWeight: (isSelected || isParentActive) ? '500' : '400',
                      letterSpacing: '0.2px',
                      borderRadius: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isParentActive) {
                        e.target.style.backgroundColor = '#f5f2ee';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !isParentActive) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <IconComponent
                        style={{
                          fontSize: 18,
                          color: (isSelected || isParentActive) ? '#ffffff' : '#2c2c2e',
                        }}
                      />
                      {item.text}
                    </div>
                    {hasChildren && (
                      <span style={{ 
                        fontSize: 10, 
                        color: (isSelected || isParentActive) ? '#ffffff' : '#2c2c2e',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease-in-out'
                      }}>
                        ▶
                      </span>
                    )}
                  </button>
                  
                  {hasChildren && isExpanded && (
                    <div style={{ marginTop: '4px', marginLeft: '16px' }}>
                      {item.children.map((child) => {
                        const isChildSelected = location.pathname === child.path;
                        const ChildIconComponent = child.icon;
                        
                        return (
                          <button
                            key={child.text}
                            onClick={() => handleItemClick(child.path)}
                            style={{
                              width: '100%',
                              padding: '8px 16px',
                              minHeight: '36px',
                              backgroundColor: isChildSelected ? '#d4c4a8' : 'transparent',
                              color: isChildSelected ? '#2c2c2e' : '#5a5550',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              fontSize: '12px',
                              fontWeight: isChildSelected ? '500' : '400',
                              letterSpacing: '0.2px',
                              marginBottom: '2px',
                              borderRadius: '6px',
                            }}
                            onMouseEnter={(e) => {
                              if (!isChildSelected) {
                                e.target.style.backgroundColor = '#f5f2ee';
                                e.target.style.color = '#2c2c2e';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isChildSelected) {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#5a5550';
                              }
                            }}
                          >
                            <ChildIconComponent
                              style={{
                                fontSize: 16,
                                color: isChildSelected ? '#2c2c2e' : '#8b8680',
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

          <div style={{ padding: '12px' }}>
            <div
              style={{
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e8e3dc',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#8b8680',
                  marginBottom: '4px',
                }}
              >
                Logged in as:
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#2c2c2e',
                  wordBreak: 'break-word',
                }}
              >
                {user?.email || sessionStorage.getItem('userEmail') || 'svcmanager@stayops.com'}
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '10px 16px',
                minHeight: '40px',
                backgroundColor: 'transparent',
                color: '#2c2c2e',
                border: '1px solid #e8e3dc',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                fontSize: '13px',
                fontWeight: '400',
                letterSpacing: '0.2px',
                borderRadius: '8px',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f5f2ee';
                e.target.style.borderColor = '#b8956a';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#e8e3dc';
              }}
            >
              <LogOut
                style={{
                  fontSize: 18,
                  color: '#b8956a',
                }}
              />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: '#faf8f5',
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