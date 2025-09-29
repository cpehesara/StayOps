import { Routes, Route, Navigate } from 'react-router-dom';
import ReceptionistRegistration from '../src/pages/ReceptionRegistration';
import StayOpsDashboard from './pages/StayOpsDashboard';
import AdminHotelManagement from './pages/AdminHotelManagement';
import HotelDetailPage from './pages/HotelDetailPage';
import LoginForm from './pages/LoginForm';

function App() {
  return (
    <Routes>
      {/* Default route → redirects to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Hotel Management Routes */}
      <Route path="/hotel-management" element={<AdminHotelManagement />} />
      <Route path="/hotel-management/:id" element={<HotelDetailPage />} />

      {/* Alternative admin routes (if you prefer this structure) */}
      <Route path="/admin/hotels" element={<AdminHotelManagement />} />
      <Route path="/admin/hotels/:id" element={<HotelDetailPage />} />

      {/* Receptionist Registration Page */}
      <Route path="/registration" element={<ReceptionistRegistration />} />

      {/* Login Page */}
      <Route path="/login" element={<LoginForm />} />
      
      {/* StayOps Dashboard Page */}
      <Route path="/dashboard" element={<StayOpsDashboard />} />
    </Routes>
  );
}

export default App;