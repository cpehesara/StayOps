import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Bed, Calendar, DollarSign, MessageSquare, 
  FileText, Shield, Settings, LogOut, ChevronDown, ChevronRight,
  Zap, TrendingUp, AlertTriangle, Briefcase, Globe, UserCheck,
  Bell, MessageCircle, Star, FileWarning
} from 'lucide-react';

const SideBar = ({ onLogout }) => {
  const location = useLocation();
  const [automationExpanded, setAutomationExpanded] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isAutomationActive = () => location.pathname.startsWith('/dashboard/automation');

  const menuItems = [
    { path: '/dashboard/overview', icon: Home, label: 'Dashboard' },
    { path: '/dashboard/check-in-out', icon: UserCheck, label: 'Check In/Out' },
    { path: '/dashboard/reservations', icon: Calendar, label: 'Reservations' },
    { path: '/dashboard/guests', icon: Users, label: 'Guests' },
    { path: '/dashboard/rooms', icon: Bed, label: 'Rooms' },
    { path: '/dashboard/billing', icon: DollarSign, label: 'Billing' },
    { path: '/dashboard/guest-requests', icon: MessageSquare, label: 'Guest Requests' },
    { path: '/dashboard/communication', icon: MessageSquare, label: 'Communication' },
    { path: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { path: '/dashboard/messages', icon: MessageCircle, label: 'Community Messages' },
    { path: '/dashboard/ratings', icon: Star, label: 'Ratings & Reviews' },
    { path: '/dashboard/complaints', icon: FileWarning, label: 'Complaints' },
    { path: '/dashboard/reporting', icon: FileText, label: 'Reports' },
    { path: '/dashboard/security', icon: Shield, label: 'Security' },
  ];

  const automationItems = [
    { path: '/dashboard/automation', icon: Zap, label: 'Overview' },
    { path: '/dashboard/automation/pricing', icon: TrendingUp, label: 'Dynamic Pricing' },
    { path: '/dashboard/automation/fraud', icon: AlertTriangle, label: 'Fraud Detection' },
    { path: '/dashboard/automation/housekeeping', icon: Briefcase, label: 'Housekeeping' },
    { path: '/dashboard/automation/ota', icon: Globe, label: 'OTA Channels' },
  ];

  return (
    <div className="w-64 bg-black text-white min-h-screen flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-light tracking-tight">StayOps</h1>
        <p className="text-xs text-gray-400 mt-1">Hotel Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                  isActive(item.path)
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm">{item.label}</span>
              </Link>
            </li>
          ))}

          {/* Automation Section */}
          <li className="pt-4">
            <button
              onClick={() => setAutomationExpanded(!automationExpanded)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                isAutomationActive()
                  ? 'bg-white text-black'
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Zap size={18} />
                <span className="text-sm font-medium">Automation</span>
              </div>
              {automationExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {automationExpanded && (
              <ul className="mt-1 ml-6 space-y-1">
                {automationItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                        isActive(item.path)
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                      }`}
                    >
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="pt-4">
            <Link
              to="/dashboard/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                isActive('/dashboard/settings')
                  ? 'bg-white text-black'
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <Settings size={18} />
              <span className="text-sm">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-gray-300 hover:bg-gray-900 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SideBar;