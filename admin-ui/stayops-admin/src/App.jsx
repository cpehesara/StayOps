import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import StayOpsSidebar from './components/SideBar';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRegistration from './pages/GuestRegistrationForm.jsx';
import RoomView from './pages/RoomView.jsx';
import ReceptionistDashboard from './pages/ReceptionistDashboard.jsx';
import CheckInOut from './pages/CheckInOut.jsx';
import Reservations from './pages/Reservations.jsx';
import Guests from './pages/Guests.jsx';
import Billing from './pages/Billing.jsx';
import GuestRequests from './pages/GuestRequests.jsx';
import Communication from './pages/Communication.jsx';
import Reporting from './pages/Reporting.jsx';
import Security from './pages/Security.jsx';
import Settings from './pages/Settings.jsx';
import QRScanner from './components/QRScanner.jsx';

// Automation Pages
import AutomationDashboard from './pages/AutomationDashboard.jsx';
import DynamicPricing from './pages/DynamicPricing.jsx';
import FraudDetection from './pages/FraudDetection.jsx';
import HousekeepingTasks from './pages/HousekeepingTasks.jsx';
import OTAChannelManagement from './pages/OTAChannelManagement.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('loginTime');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login Route */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLogin={handleLogin} />
        } 
      />
      
      {/* Route for standalone sidebar demo */}
      <Route path="/sidebar" element={<StayOpsSidebar />} />
      
      {/* Protected Dashboard routes with layout */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        {/* Core Receptionist Pages */}
        <Route path="overview" element={<ReceptionistDashboard />} />
        <Route path="check-in-out" element={<CheckInOut />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="guest-registration" element={<GuestRegistration />} />
        <Route path="guests" element={<Guests />} />
        <Route path="rooms" element={<RoomView />} />
        <Route path="billing" element={<Billing />} />
        <Route path="guest-requests" element={<GuestRequests />} />
        <Route path="communication" element={<Communication />} />
        <Route path="reporting" element={<Reporting />} />
        <Route path="security" element={<Security />} />
        <Route path="qr-scanner" element={<QRScanner />} />
        <Route path="settings" element={<Settings />} />
        
        {/* Automation Pages */}
        <Route path="automation" element={<AutomationDashboard />} />
        <Route path="automation/pricing" element={<DynamicPricing />} />
        <Route path="automation/fraud" element={<FraudDetection />} />
        <Route path="automation/housekeeping" element={<HousekeepingTasks />} />
        <Route path="automation/ota" element={<OTAChannelManagement />} />
        
        {/* Default redirect */}
        <Route index element={<Navigate to="overview" replace />} />
      </Route>
      
      {/* Root redirect */}
      <Route 
        path="/" 
        element={
          <Navigate 
            to={isAuthenticated ? "/dashboard" : "/login"} 
            replace 
          />
        } 
      />
      
      {/* Catch all route */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={isAuthenticated ? "/dashboard" : "/login"} 
            replace 
          />
        } 
      />
    </Routes>
  );
}

export default App;
