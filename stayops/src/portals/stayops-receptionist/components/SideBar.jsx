import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Bed, Calendar, DollarSign, TrendingUp, 
  FileText, LogOut, ChevronDown, ChevronRight,
  BarChart, PieChart, Briefcase, Package, ShoppingCart, Truck,
  Bell, Star, FileWarning, Activity, Building2, User
} from 'lucide-react';
import '../styles/sidebar.css';

const SideBar = ({ onLogout }) => {
  const location = useLocation();
  const [financialExpanded, setFinancialExpanded] = useState(false);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);
  const [operationsExpanded, setOperationsExpanded] = useState(false);
  const [inventoryExpanded, setInventoryExpanded] = useState(false);

  // Auto-expand sections based on current route
  useEffect(() => {
    if (location.pathname.startsWith('/operations/finance')) {
      setFinancialExpanded(true);
    } else if (location.pathname.startsWith('/operations/analytics')) {
      setAnalyticsExpanded(true);
    } else if (
      location.pathname.startsWith('/operations/staff') || 
      location.pathname.startsWith('/operations/department-view') ||
      location.pathname.startsWith('/operations/reservations') ||
      location.pathname.startsWith('/operations/rooms') ||
      location.pathname.startsWith('/operations/guests')
    ) {
      setOperationsExpanded(true);
    } else if (
      location.pathname.startsWith('/operations/inventory') ||
      location.pathname.startsWith('/operations/suppliers') ||
      location.pathname.startsWith('/operations/purchase')
    ) {
      setInventoryExpanded(true);
    }
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  
  const isFinancialActive = () => location.pathname.startsWith('/operations/finance');
  const isAnalyticsActive = () => location.pathname.startsWith('/operations/analytics');
  const isOperationsActive = () => 
    location.pathname.startsWith('/operations/staff') || 
    location.pathname.startsWith('/operations/department-view') ||
    location.pathname.startsWith('/operations/reservations') ||
    location.pathname.startsWith('/operations/rooms') ||
    location.pathname.startsWith('/operations/guests');
  const isInventoryActive = () => 
    location.pathname.startsWith('/operations/inventory') ||
    location.pathname.startsWith('/operations/suppliers') ||
    location.pathname.startsWith('/operations/purchase');

  const menuItems = [
    { path: '/operations/dashboard', icon: Home, label: 'Dashboard' },
  ];

  const financialItems = [
    { path: '/operations/finance/revenue', icon: TrendingUp, label: 'Revenue Dashboard' },
    { path: '/operations/finance/expenses', icon: DollarSign, label: 'Expense Tracking' },
    { path: '/operations/finance/budget', icon: PieChart, label: 'Budget Management' },
    { path: '/operations/finance/profit-loss', icon: BarChart, label: 'P&L Statements' },
    { path: '/operations/finance/reports', icon: FileText, label: 'Financial Reports' },
  ];

  const operationsItems = [
    { path: '/operations/staff-management', icon: Users, label: 'Staff Management' },
    { path: '/operations/department-view', icon: Building2, label: 'Department View' },
    { path: '/operations/reservations', icon: Calendar, label: 'Reservations' },
    { path: '/operations/rooms', icon: Bed, label: 'Rooms Overview' },
    { path: '/operations/guests', icon: Users, label: 'Guest Management' },
  ];

  const analyticsItems = [
    { path: '/operations/analytics/occupancy', icon: Activity, label: 'Occupancy Analytics' },
    { path: '/operations/analytics/revenue', icon: TrendingUp, label: 'Revenue Analytics' },
    { path: '/operations/analytics/kpis', icon: BarChart, label: 'Performance KPIs' },
    { path: '/operations/analytics/custom-reports', icon: FileText, label: 'Custom Reports' },
  ];

  const inventoryItems = [
    { path: '/operations/inventory', icon: Package, label: 'Inventory Management' },
    { path: '/operations/suppliers', icon: Truck, label: 'Supplier Management' },
    { path: '/operations/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
  ];

  const bottomMenuItems = [
    { path: '/operations/ratings', icon: Star, label: 'Ratings & Reviews' },
    { path: '/operations/complaints', icon: FileWarning, label: 'Complaints' },
    { path: '/operations/notifications', icon: Bell, label: 'Notifications' },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

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
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${active ? 'active' : ''}`}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}

          {/* Financial Management Section */}
          <li className="nav-item section-group">
            <button
              type="button"
              onClick={() => setFinancialExpanded(!financialExpanded)}
              className={`nav-button ${isFinancialActive() ? 'active' : ''}`}
              aria-expanded={financialExpanded}
              aria-label="Financial Management"
            >
              <div className="nav-button-content">
                <DollarSign size={18} strokeWidth={isFinancialActive() ? 2.5 : 2} />
                <span>Financial Management</span>
              </div>
              {financialExpanded ? 
                <ChevronDown size={16} strokeWidth={2} className="chevron" /> : 
                <ChevronRight size={16} strokeWidth={2} className="chevron" />
              }
            </button>
            
            {financialExpanded && (
              <ul className="sub-nav-list">
                {financialItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.path} className="sub-nav-item">
                      <Link
                        to={item.path}
                        className={`sub-nav-link ${active ? 'active' : ''}`}
                      >
                        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Operations Section */}
          <li className="nav-item section-group">
            <button
              type="button"
              onClick={() => setOperationsExpanded(!operationsExpanded)}
              className={`nav-button ${isOperationsActive() ? 'active' : ''}`}
              aria-expanded={operationsExpanded}
              aria-label="Operations"
            >
              <div className="nav-button-content">
                <Briefcase size={18} strokeWidth={isOperationsActive() ? 2.5 : 2} />
                <span>Operations</span>
              </div>
              {operationsExpanded ? 
                <ChevronDown size={16} strokeWidth={2} className="chevron" /> : 
                <ChevronRight size={16} strokeWidth={2} className="chevron" />
              }
            </button>
            
            {operationsExpanded && (
              <ul className="sub-nav-list">
                {operationsItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.path} className="sub-nav-item">
                      <Link
                        to={item.path}
                        className={`sub-nav-link ${active ? 'active' : ''}`}
                      >
                        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Analytics Section */}
          <li className="nav-item section-group">
            <button
              type="button"
              onClick={() => setAnalyticsExpanded(!analyticsExpanded)}
              className={`nav-button ${isAnalyticsActive() ? 'active' : ''}`}
              aria-expanded={analyticsExpanded}
              aria-label="Analytics & Reports"
            >
              <div className="nav-button-content">
                <BarChart size={18} strokeWidth={isAnalyticsActive() ? 2.5 : 2} />
                <span>Analytics & Reports</span>
              </div>
              {analyticsExpanded ? 
                <ChevronDown size={16} strokeWidth={2} className="chevron" /> : 
                <ChevronRight size={16} strokeWidth={2} className="chevron" />
              }
            </button>
            
            {analyticsExpanded && (
              <ul className="sub-nav-list">
                {analyticsItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.path} className="sub-nav-item">
                      <Link
                        to={item.path}
                        className={`sub-nav-link ${active ? 'active' : ''}`}
                      >
                        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Inventory Section */}
          <li className="nav-item section-group">
            <button
              type="button"
              onClick={() => setInventoryExpanded(!inventoryExpanded)}
              className={`nav-button ${isInventoryActive() ? 'active' : ''}`}
              aria-expanded={inventoryExpanded}
              aria-label="Inventory & Supplies"
            >
              <div className="nav-button-content">
                <Package size={18} strokeWidth={isInventoryActive() ? 2.5 : 2} />
                <span>Inventory & Supplies</span>
              </div>
              {inventoryExpanded ? 
                <ChevronDown size={16} strokeWidth={2} className="chevron" /> : 
                <ChevronRight size={16} strokeWidth={2} className="chevron" />
              }
            </button>
            
            {inventoryExpanded && (
              <ul className="sub-nav-list">
                {inventoryItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.path} className="sub-nav-item">
                      <Link
                        to={item.path}
                        className={`sub-nav-link ${active ? 'active' : ''}`}
                      >
                        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Divider before bottom menu items */}
          <li className="nav-item nav-divider-wrapper">
            <div className="nav-divider"></div>
          </li>

          {/* Bottom Menu Items */}
          {bottomMenuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${active ? 'active' : ''}`}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}

          {/* Profile */}
          <li className="nav-item settings-section">
            <Link
              to="/operations/profile"
              className={`nav-link ${isActive('/operations/profile') ? 'active' : ''}`}
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
          onClick={handleLogout}
          className="logout-button"
          aria-label="Logout"
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SideBar;