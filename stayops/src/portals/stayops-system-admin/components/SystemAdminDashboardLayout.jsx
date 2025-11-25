import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Shield,
  BarChart,
  Database,
  Server,
  LogOut,
  Menu,
  X,
  Bell,
  Activity,
  FileText,
  Key,
  Globe,
  HardDrive,
  AlertTriangle,
  UserCheck,
  Building,
  Lock,
  Monitor,
  Clock,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import '../styles/admin-dashboard.css';

const sidebarItems = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  
  // { 
  //   text: 'System Management', 
  //   icon: Server, 
  //   path: '/admin/system',
  //   children: [
  //     { text: 'System Settings', icon: Settings, path: '/admin/system/settings' },
  //     { text: 'Server Status', icon: Monitor, path: '/admin/system/server-status' },
  //     { text: 'Database Management', icon: Database, path: '/admin/system/database' },
  //     { text: 'API Management', icon: Globe, path: '/admin/system/api' },
  //     { text: 'Backup & Recovery', icon: HardDrive, path: '/admin/system/backup' },
  //   ]
  // },
  
  {
    text: 'User Management',
    icon: Users,
    children: [
      { text: 'All Users', icon: Users, path: '/admin/users' },
      //{ text: 'Receptionists', icon: Users, path: '/admin/users/receptionists' },
      //{ text: 'System Admins', icon: UserCheck, path: '/admin/users/system-admins' },
      //{ text: 'Service Managers', icon: Users, path: '/admin/users/service-managers' },
      //{ text: 'Operational Managers', icon: Users, path: '/admin/users/operational-managers' },
      //{ text: 'User Roles', icon: UserCheck, path: '/admin/users/roles' },
      //{ text: 'Permissions', icon: Key, path: '/admin/users/permissions' },
      //{ text: 'Activity Logs', icon: Activity, path: '/admin/users/activity' },
      //{ text: 'Session Management', icon: Clock, path: '/admin/users/sessions' },
    ]
  },
  
  // {
  //   text: 'Hotel Management',
  //   icon: Building2,
  //   children: [
  //     { text: 'Hotel Properties', icon: Building, path: '/admin/hotels' },
  //     { text: 'Property Settings', icon: Settings, path: '/admin/hotels/settings' },
  //     { text: 'Room Management', icon: Building2, path: '/admin/hotels/rooms' },
  //   ]
  // },
  
  // {
  //   text: 'Security & Compliance',
  //   icon: Shield,
  //   children: [
  //     { text: 'Security Center', icon: Shield, path: '/admin/security' },
  //     { text: 'Access Control', icon: Lock, path: '/admin/security/access' },
  //     { text: 'Audit Trail', icon: FileText, path: '/admin/security/audit' },
  //     { text: 'Threat Detection', icon: AlertTriangle, path: '/admin/security/threats' },
  //   ]
  // },
  
  // {
  //   text: 'Analytics & Reports',
  //   icon: BarChart,
  //   children: [
  //     { text: 'System Reports', icon: BarChart, path: '/admin/reports' },
  //     { text: 'Performance Metrics', icon: TrendingUp, path: '/admin/reports/performance' },
  //     { text: 'Usage Statistics', icon: Activity, path: '/admin/reports/usage' },
  //     { text: 'Custom Reports', icon: FileText, path: '/admin/reports/custom' },
  //   ]
  // },
  
  //{ text: 'Notifications', icon: Bell, path: '/admin/notifications' },
];

export default function SystemAdminDashboardLayout({ onLogout, user }) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState({
    'System Management': true,
    'User Management': false,
    'Hotel Management': false,
    'Security & Compliance': false,
    'Analytics & Reports': false,
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
    <div className="admin-layout">
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`sidebar-toggle ${isOpen ? 'open' : 'closed'}`}
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <div className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <h1 className="logo-title">StayOps</h1>
          <p className="logo-subtitle">System Administrator</p>
        </div>

        {/* Navigation */}
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isSelected = location.pathname === item.path;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems[item.text];
              const isParentActive = hasChildren && isChildActive(item.children);
              
              return (
                <div key={item.text} className="nav-item-wrapper">
                  <button
                    onClick={() => hasChildren ? toggleExpanded(item.text) : handleItemClick(item.path)}
                    className={`nav-item ${(isSelected || isParentActive) ? 'active' : ''}`}
                  >
                    <div className="nav-item-content">
                      <IconComponent size={16} />
                      <span>{item.text}</span>
                    </div>
                    {hasChildren && (
                      <ChevronDown
                        size={14}
                        className={`nav-chevron ${isExpanded ? 'expanded' : ''}`}
                      />
                    )}
                  </button>
                  
                  {hasChildren && isExpanded && (
                    <div className="nav-children">
                      {item.children.map((child) => {
                        const ChildIconComponent = child.icon;
                        const isChildSelected = location.pathname === child.path;
                        
                        return (
                          <button
                            key={child.text}
                            onClick={() => handleItemClick(child.path)}
                            className={`nav-child-item ${isChildSelected ? 'active' : ''}`}
                          >
                            <ChildIconComponent size={14} />
                            <span>{child.text}</span>
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

        {/* User Info & Logout */}
        <div className="sidebar-footer">
          <div className="user-info-card">
            <div className="user-info-label">Logged in as:</div>
            <div className="user-info-email">
              {user?.email || sessionStorage.getItem('userEmail') || 'admin@stayops.com'}
            </div>
          </div>
          
          <button onClick={handleSignOut} className="logout-button">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`admin-main-content ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </div>
    </div>
  );
}