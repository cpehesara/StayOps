import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import StayOpsSidebar from './components/SideBar';
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

function App() {
  return (
    <Routes>
      {/* Route for standalone sidebar demo */}
      <Route path="/sidebar" element={<StayOpsSidebar />} />
      
      {/* Dashboard routes with layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
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
        <Route index element={<Navigate to="overview" replace />} />
      </Route>
      
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;