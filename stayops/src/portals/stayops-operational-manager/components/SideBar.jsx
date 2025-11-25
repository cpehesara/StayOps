import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Bed, Calendar, 
  LogOut, 
  Briefcase,
  FileWarning, Building2, MessageSquare, User
} from 'lucide-react';
import '../styles/sidebar.css';

const SideBar = ({ onLogout }) => {
  const location = useLocation();
  const [operationsExpanded, setOperationsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const isActive = (path) => location.pathname === path;
  const isOperationsActive = () => 
    location.pathname.startsWith('/operations/staff') || 
    location.pathname.startsWith('/operations/department-view') ||
    location.pathname.startsWith('/operations/reservations') ||
    location.pathname.startsWith('/operations/rooms') ||
    location.pathname.startsWith('/operations/guests');

  const menuItems = [
    { path: '/operations/dashboard', icon: Home, label: 'Dashboard' },
  ];

  // financial section removed

  const operationsItems = [
    { path: '/operations/staff-management', icon: Users, label: 'Staff Management' },
    { path: '/operations/department-view', icon: Building2, label: 'Department View' },
    { path: '/operations/reservations', icon: Calendar, label: 'Reservations' },
    { path: '/operations/rooms', icon: Bed, label: 'Rooms Overview' },
    { path: '/operations/guests', icon: Users, label: 'Guest Management' },
    { path: '/operations/service-requests', icon: MessageSquare, label: 'Service Request Management' },
  ];

  // analytics section removed

  // inventory section removed

  const bottomMenuItems = [
    { path: '/operations/messages', icon: MessageSquare, label: 'Community Messages' },
    { path: '/operations/complaints', icon: FileWarning, label: 'Complaints' },
  ];

  return (
    <div className="sidebar">
      {/* Logo/Header */}
      <div className="sidebar-header">
        <h1 className="sidebar-logo">StayOps</h1>
        <p className="sidebar-subtitle">Operational Manager</p>
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

          {/* Financial Management Section removed */}

          {/* Operations Section */}
          <li className="nav-item section-group">
            <button
              type="button"
              onClick={() => setOperationsExpanded(!operationsExpanded)}
              className={`nav-button ${isOperationsActive() ? 'active' : ''} ${hoveredItem === 'operations-toggle' ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredItem('operations-toggle')}
              onMouseLeave={() => setHoveredItem(null)}
              onFocus={() => setHoveredItem('operations-toggle')}
              onBlur={() => setHoveredItem(null)}
            >
              <div className="nav-button-content">
                <Briefcase size={18} strokeWidth={isOperationsActive() ? 2.5 : 2} />
                <span>Operations</span>
              </div>
              {operationsExpanded ? 
                <ChevronDown size={16} strokeWidth={2} /> : 
                <ChevronRight size={16} strokeWidth={2} />
              }
            </button>
            
            {operationsExpanded && (
              <ul className="sub-nav-list">
                {operationsItems.map((item) => {
                  const itemKey = `operations-${item.path}`;
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

          {/* Analytics & Reports Section removed */}

          {/* Inventory & Supplies Section removed */}

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

          {/* Profile */}
          <li className="nav-item settings-section">
            <Link
              to="/operations/profile"
              className={`nav-link ${isActive('/operations/profile') ? 'active' : ''} ${hoveredItem === 'profile' ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredItem('profile')}
              onMouseLeave={() => setHoveredItem(null)}
              onFocus={() => setHoveredItem('profile')}
              onBlur={() => setHoveredItem(null)}
            >
              <User size={18} strokeWidth={isActive('/operations/profile') ? 2.5 : 2} />
              <span>Profile</span>
            </Link>
          </li>
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