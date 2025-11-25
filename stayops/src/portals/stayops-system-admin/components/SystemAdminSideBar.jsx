import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Building2, Settings, Shield, BarChart, Database, 
  Server, LogOut, ChevronDown, ChevronRight, Activity, FileText, 
  Key, Globe, HardDrive, AlertTriangle, CheckCircle, Clock, 
  TrendingUp, UserCheck, Building, Lock, Monitor, Bell
} from 'lucide-react';
import '../styles/sidebar.css';

const SideBar = ({ onLogout, user }) => {
  const location = useLocation();
  const [systemExpanded, setSystemExpanded] = useState(true);
  const [userExpanded, setUserExpanded] = useState(false);
  const [hotelExpanded, setHotelExpanded] = useState(false);
  const [securityExpanded, setSecurityExpanded] = useState(false);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const isActive = (path) => location.pathname === path;
  const isSystemActive = () => location.pathname.startsWith('/admin/system');
  const isUserActive = () => location.pathname.startsWith('/admin/users');
  const isHotelActive = () => location.pathname.startsWith('/admin/hotels');
  const isSecurityActive = () => location.pathname.startsWith('/admin/security');
  const isAnalyticsActive = () => location.pathname.startsWith('/admin/reports');

  const menuItems = [
    { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  ];

  const systemItems = [
    { path: '/admin/system/settings', icon: Settings, label: 'System Settings' },
    { path: '/admin/system/server-status', icon: Monitor, label: 'Server Status' },
    { path: '/admin/system/database', icon: Database, label: 'Database Management' },
    { path: '/admin/system/api', icon: Globe, label: 'API Management' },
    { path: '/admin/system/backup', icon: HardDrive, label: 'Backup & Recovery' },
  ];

  const userItems = [
    { path: '/admin/users', icon: Users, label: 'All Users' },
    { path: '/admin/users/roles', icon: UserCheck, label: 'User Roles' },
    { path: '/admin/users/permissions', icon: Key, label: 'Permissions' },
    { path: '/admin/users/activity', icon: Activity, label: 'Activity Logs' },
    { path: '/admin/users/sessions', icon: Clock, label: 'Session Management' },
  ];

  const hotelItems = [
    { path: '/admin/hotels', icon: Building, label: 'Hotel Properties' },
    { path: '/admin/hotels/settings', icon: Settings, label: 'Property Settings' },
    { path: '/admin/hotels/rooms', icon: Building2, label: 'Room Management' },
    { path: '/admin/hotels/amenities', icon: CheckCircle, label: 'Amenities' },
  ];

  const securityItems = [
    { path: '/admin/security', icon: Shield, label: 'Security Center' },
    { path: '/admin/security/access', icon: Lock, label: 'Access Control' },
    { path: '/admin/security/audit', icon: FileText, label: 'Audit Trail' },
    { path: '/admin/security/threats', icon: AlertTriangle, label: 'Threat Detection' },
  ];

  const analyticsItems = [
    { path: '/admin/reports', icon: BarChart, label: 'System Reports' },
    { path: '/admin/reports/performance', icon: TrendingUp, label: 'Performance Metrics' },
    { path: '/admin/reports/usage', icon: Activity, label: 'Usage Statistics' },
    { path: '/admin/reports/custom', icon: FileText, label: 'Custom Reports' },
  ];

  const bottomMenuItems = [
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <div className="sidebar">
      {/* Logo/Header */}
      <div className="sidebar-header">
        <h1 className="sidebar-logo">StayOps</h1>
        <p className="sidebar-subtitle">System Administrator</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {/* Dashboard */}
          {menuItems.map((item) => {
            const itemKey = `menu-${item.path}`;
            const active = isActive(item.path);
            const isHovered = hoveredItem === itemKey;
            
            return (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${active ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredItem(itemKey)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onFocus={() => setHoveredItem(itemKey)}
                  onBlur={() => setHoveredItem(null)}
                >
                  <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}

          {/* System Management Section
          <li className="nav-item section-group">
            <button
              type="button"
              onClick={() => setSystemExpanded(!systemExpanded)}
              className={`nav-button ${isSystemActive() ? 'active' : ''} ${hoveredItem === 'system-toggle' ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredItem('system-toggle')}
              onMouseLeave={() => setHoveredItem(null)}
              onFocus={() => setHoveredItem('system-toggle')}
              onBlur={() => setHoveredItem(null)}
            >
              <div className="nav-button-content">
                <Server size={18} strokeWidth={isSystemActive() ? 2.5 : 2} />
                <span>System Management</span>
              </div>
              {systemExpanded ? 
                <ChevronDown size={16} strokeWidth={2} /> : 
                <ChevronRight size={16} strokeWidth={2} />
              }
            </button>
            
            {systemExpanded && (
              <ul className="sub-nav-list">
                {systemItems.map((item) => {
                  const itemKey = `system-${item.path}`;
                  const active = isActive(item.path);
                  const isHovered = hoveredItem === itemKey;
                  
                  return (
                    <li key={item.path} className="sub-nav-item">
                      <Link
                        to={item.path}
                        className={`sub-nav-link ${active ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredItem(itemKey)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onFocus={() => setHoveredItem(itemKey)}
                        onBlur={() => setHoveredItem(null)}
                      >
                        <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li> */}

          {/* User Management Section */}
          <li className="nav-item section-group">
            <button
              type="button"
              onClick={() => setUserExpanded(!userExpanded)}
              className={`nav-button ${isUserActive() ? 'active' : ''} ${hoveredItem === 'user-toggle' ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredItem('user-toggle')}
              onMouseLeave={() => setHoveredItem(null)}
              onFocus={() => setHoveredItem('user-toggle')}
              onBlur={() => setHoveredItem(null)}
            >
              <div className="nav-button-content">
                <Users size={18} strokeWidth={isUserActive() ? 2.5 : 2} />
                <span>User Management</span>
              </div>
              {userExpanded ? 
                <ChevronDown size={16} strokeWidth={2} /> : 
                <ChevronRight size={16} strokeWidth={2} />
              }
            </button>
            
            {userExpanded && (
              <ul className="sub-nav-list">
                {userItems.map((item) => {
                  const itemKey = `user-${item.path}`;
                  const active = isActive(item.path);
                  const isHovered = hoveredItem === itemKey;
                  
                  return (
                    <li key={item.path} className="sub-nav-item">
                      <Link
                        to={item.path}
                        className={`sub-nav-link ${active ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredItem(itemKey)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onFocus={() => setHoveredItem(itemKey)}
                        onBlur={() => setHoveredItem(null)}
                      >
                        <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Hotel Management Section
          <li className="nav-item section-group">
            <button
              type="button"
              onClick={() => setHotelExpanded(!hotelExpanded)}
              className={`nav-button ${isHotelActive() ? 'active' : ''} ${hoveredItem === 'hotel-toggle' ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredItem('hotel-toggle')}
              onMouseLeave={() => setHoveredItem(null)}
              onFocus={() => setHoveredItem('hotel-toggle')}
              onBlur={() => setHoveredItem(null)}
            >
              <div className="nav-button-content">
                <Building2 size={18} strokeWidth={isHotelActive() ? 2.5 : 2} />
                <span>Hotel Management</span>
              </div>
              {hotelExpanded ? 
                <ChevronDown size={16} strokeWidth={2} /> : 
                <ChevronRight size={16} strokeWidth={2} />
              }
            </button>
            
            {hotelExpanded && (
              <ul className="sub-nav-list">
                {hotelItems.map((item) => {
                  const itemKey = `hotel-${item.path}`;
                  const active = isActive(item.path);
                  const isHovered = hoveredItem === itemKey;
                  
                  return (
                    <li key={item.path} className="sub-nav-item">
                      <Link
                        to={item.path}
                        className={`sub-nav-link ${active ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredItem(itemKey)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onFocus={() => setHoveredItem(itemKey)}
                        onBlur={() => setHoveredItem(null)}
                      >
                        <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li> */}

          {/* Security Section
          <li className="nav-item section-group">
            <button
              type="button"
              onClick={() => setSecurityExpanded(!securityExpanded)}
              className={`nav-button ${isSecurityActive() ? 'active' : ''} ${hoveredItem === 'security-toggle' ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredItem('security-toggle')}
              onMouseLeave={() => setHoveredItem(null)}
              onFocus={() => setHoveredItem('security-toggle')}
              onBlur={() => setHoveredItem(null)}
            >
              <div className="nav-button-content">
                <Shield size={18} strokeWidth={isSecurityActive() ? 2.5 : 2} />
                <span>Security & Compliance</span>
              </div>
              {securityExpanded ? 
                <ChevronDown size={16} strokeWidth={2} /> : 
                <ChevronRight size={16} strokeWidth={2} />
              }
            </button>
            
            {securityExpanded && (
              <ul className="sub-nav-list">
                {securityItems.map((item) => {
                  const itemKey = `security-${item.path}`;
                  const active = isActive(item.path);
                  const isHovered = hoveredItem === itemKey;
                  
                  return (
                    <li key={item.path} className="sub-nav-item">
                      <Link
                        to={item.path}
                        className={`sub-nav-link ${active ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredItem(itemKey)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onFocus={() => setHoveredItem(itemKey)}
                        onBlur={() => setHoveredItem(null)}
                      >
                        <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li> */}

          {/* Analytics Section
          <li className="nav-item section-group">
            <button
              type="button"
              onClick={() => setAnalyticsExpanded(!analyticsExpanded)}
              className={`nav-button ${isAnalyticsActive() ? 'active' : ''} ${hoveredItem === 'analytics-toggle' ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredItem('analytics-toggle')}
              onMouseLeave={() => setHoveredItem(null)}
              onFocus={() => setHoveredItem('analytics-toggle')}
              onBlur={() => setHoveredItem(null)}
            >
              <div className="nav-button-content">
                <BarChart size={18} strokeWidth={isAnalyticsActive() ? 2.5 : 2} />
                <span>Analytics & Reports</span>
              </div>
              {analyticsExpanded ? 
                <ChevronDown size={16} strokeWidth={2} /> : 
                <ChevronRight size={16} strokeWidth={2} />
              }
            </button>
            
            {analyticsExpanded && (
              <ul className="sub-nav-list">
                {analyticsItems.map((item) => {
                  const itemKey = `analytics-${item.path}`;
                  const active = isActive(item.path);
                  const isHovered = hoveredItem === itemKey;
                  
                  return (
                    <li key={item.path} className="sub-nav-item">
                      <Link
                        to={item.path}
                        className={`sub-nav-link ${active ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredItem(itemKey)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onFocus={() => setHoveredItem(itemKey)}
                        onBlur={() => setHoveredItem(null)}
                      >
                        <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li> */}

          {/* Divider before bottom menu items */}
          <li className="nav-item nav-divider-wrapper">
            <div className="nav-divider"></div>
          </li>

          {/* Bottom Menu Items */}
          {bottomMenuItems.map((item) => {
            const itemKey = `bottom-${item.path}`;
            const active = isActive(item.path);
            const isHovered = hoveredItem === itemKey;
            
            return (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${active ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredItem(itemKey)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onFocus={() => setHoveredItem(itemKey)}
                  onBlur={() => setHoveredItem(null)}
                >
                  <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button
          type="button"
          onClick={onLogout}
          className={`logout-button ${hoveredItem === 'logout' ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredItem('logout')}
          onMouseLeave={() => setHoveredItem(null)}
          onFocus={() => setHoveredItem('logout')}
          onBlur={() => setHoveredItem(null)}
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SideBar;