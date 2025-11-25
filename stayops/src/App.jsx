import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth service
import authService from './services/authService';

// Main components
import Login from './components/Login';

// Receptionist components
import ReceptionistDashboardLayout from './portals/stayops-receptionist/components/DashboardLayout';
import ReceptionistProtectedRoute from './portals/stayops-receptionist/components/ProtectedRoute';
import ReceptionistQRScanner from './portals/stayops-receptionist/components/QRScanner';

// Receptionist Pages
import ReceptionistDashboard from './portals/stayops-receptionist/pages/ReceptionistDashboard';
import ReceptionistCheckInOut from './portals/stayops-receptionist/pages/CheckInOut';
import ReceptionistReservations from './portals/stayops-receptionist/pages/Reservations';
import ReceptionistGuestRegistration from './portals/stayops-receptionist/pages/GuestRegistrationForm';
import ReceptionistGuests from './portals/stayops-receptionist/pages/Guests';
import ReceptionistBilling from './portals/stayops-receptionist/pages/ReceptionistBilling';
import ReceptionistReporting from './portals/stayops-receptionist/pages/Reporting';
import ReceptionistSettings from './portals/stayops-receptionist/pages/Settings';
import ReceptionistNotifications from './portals/stayops-receptionist/pages/Notifications';
import ReceptionistCommunityMessages from './portals/stayops-receptionist/pages/CommunityMessages';
import ReceptionistPaymentAutomation from './portals/stayops-receptionist/pages/PaymentAutomation';


// Operational Manager components
import OperationalDashboardLayout from './portals/stayops-operational-manager/components/OperationalManagerDashboardLayout';
import OperationalProtectedRoute from './portals/stayops-operational-manager/components/ProtectedRoute';
import OperationalQRScanner from './portals/stayops-operational-manager/components/QRScanner';
import OperationalTestPage from './portals/stayops-operational-manager/components/TestPage';
import OperationalDebugPage from './portals/stayops-operational-manager/components/DebugPage';

// Operational Manager Pages
import OperationalDashboard from './portals/stayops-operational-manager/pages/OperationalManagerDashboard';
import OperationalCheckInOut from './portals/stayops-operational-manager/pages/StaffManagement';
import OperationalReservations from './portals/stayops-operational-manager/pages/Reservations';
import OperationalGuestRegistration from './portals/stayops-operational-manager/pages/GuestRegistrationForm';
import OperationalGuests from './portals/stayops-operational-manager/pages/Guests';
import OperationalRoomView from './portals/stayops-operational-manager/pages/RoomView';
import OperationalBilling from './portals/stayops-operational-manager/pages/Billing';
import OperationalGuestRequests from './portals/stayops-operational-manager/pages/GuestRequests';
import OperationalCommunication from './portals/stayops-operational-manager/pages/Communication';
import OperationalSecurity from './portals/stayops-operational-manager/pages/Security';
import OperationalProfile from './portals/stayops-operational-manager/pages/Settings';
import OperationalCommunityMessages from './portals/stayops-operational-manager/pages/CommunityMessages';
import OperationalComplaints from './portals/stayops-operational-manager/pages/Complaints';
import OperationalAutomationDashboard from './portals/stayops-operational-manager/pages/AutomationDashboard';
// Analytics pages removed for Operational Manager
import OperationalFraudDetection from './portals/stayops-operational-manager/pages/FraudDetection';
import OperationalHousekeepingTasks from './portals/stayops-operational-manager/pages/HousekeepingTasks';
import OperationalOTAChannelManagement from './portals/stayops-operational-manager/pages/OTAChannelManagement';
import OperationalPaymentAutomation from './portals/stayops-operational-manager/pages/PaymentAutomation';
import OMServiceRequests from './portals/stayops-operational-manager/pages/ServiceRequests';
import StaffManagement from './portals/stayops-operational-manager/pages/StaffManagement';
import DepartmentView from './portals/stayops-operational-manager/pages/DepartmentView';

// Service Manager components
import ServiceManagerDashboardLayout from './portals/stayops-service-manager/components/ServiceManagerDashboardLayout';
import ServiceManagerProtectedRoute from './portals/stayops-service-manager/components/ProtectedRoute';
import ServiceManagerTestPage from './portals/stayops-service-manager/components/TestPage';

// Service Manager Pages
import ServiceManagerDashboard from './portals/stayops-service-manager/pages/ServiceManagerDashboard';
import ServiceRequests from './portals/stayops-service-manager/pages/ServiceRequests';

// System Admin components
import SystemAdminDashboardLayout from './portals/stayops-system-admin/components/SystemAdminDashboardLayout';
import SystemAdminTestPage from './portals/stayops-system-admin/components/TestPage';

// System Admin Pages
import SystemAdminDashboard from './portals/stayops-system-admin/pages/SystemAdminDashboard';
import SystemAdminNotifications from './portals/stayops-system-admin/pages/Notifications';
import SystemSettings from './portals/stayops-system-admin/pages/SystemSettings';
import SystemReports from './portals/stayops-system-admin/pages/SystemReports';
import SecurityCenter from './portals/stayops-system-admin/pages/SecurityCenter';
import HotelManagement from './portals/stayops-system-admin/pages/HotelManagement';
import UserManagement from './portals/stayops-system-admin/pages/UserManagement';
import ReceptionistsManagement from './portals/stayops-system-admin/pages/ReceptionistsManagement';
import SystemAdminsManagement from './portals/stayops-system-admin/pages/SystemAdminsManagement';
import ServiceManagersManagement from './portals/stayops-system-admin/pages/ServiceManagersManagement';
import OperationalManagersManagement from './portals/stayops-system-admin/pages/OperationalManagersManagement';
import APIManagement from './portals/stayops-system-admin/pages/APIManagement';
import BackupManagement from './portals/stayops-system-admin/pages/BackupManagement';

// Shared ProtectedRoute component
const ProtectedRoute = ({ isAuthenticated, userRole, allowedRoles, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const authStatus = sessionStorage.getItem('isAuthenticated');
    const userData = sessionStorage.getItem('userData');

    if (authStatus === 'true' && userData) {
      try {
        const user = JSON.parse(userData);
        setIsAuthenticated(true);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        sessionStorage.clear();
      }
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
  };

  const handleLogout = async () => {
    // Call backend logout
    await authService.logout();
    
    // Clear session storage
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userData');
    
    // Update state
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Get the appropriate dashboard route based on user role
  const getDashboardRoute = () => {
    if (!currentUser) return '/login';
    
    switch (currentUser.role) {
      case 'SYSTEM_ADMIN':
        return '/admin/dashboard';
      case 'RECEPTIONIST':
        return '/receptionist/dashboard';
      case 'OPERATIONAL_MANAGER':
        return '/operations/dashboard';
      case 'SERVICE_MANAGER':
        return '/services/dashboard';
      default:
        return '/login';
    }
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
        <div style={{ color: 'white', fontSize: '18px' }}>Loading StayOps...</div>
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
            <Navigate to={getDashboardRoute()} replace /> : 
            <Login onLogin={handleLogin} />
        } 
      />
      
      {/* RECEPTIONIST PORTAL */}
      <Route 
        path="/receptionist/*" 
        element={
          <ProtectedRoute 
            isAuthenticated={isAuthenticated} 
            userRole={currentUser?.role}
            allowedRoles={['RECEPTIONIST']}
          >
            <ReceptionistDashboardLayout onLogout={handleLogout} user={currentUser} />
          </ProtectedRoute>
        }
      >
        {/* Main Dashboard */}
        <Route path="dashboard" element={<ReceptionistDashboard />} />
        
        {/* Core Operations */}
        <Route path="check-in-out" element={<ReceptionistCheckInOut />} />
        <Route path="reservations" element={<ReceptionistReservations />} />
        <Route path="guest-registration" element={<ReceptionistGuestRegistration />} />
        <Route path="guests" element={<ReceptionistGuests />} />
        <Route path="billing" element={<ReceptionistBilling />} />
        
        {/* Communication & Feedback */}
        <Route path="notifications" element={<ReceptionistNotifications />} />
        <Route path="messages" element={<ReceptionistCommunityMessages />} />
        <Route path="automation/payment" element={<ReceptionistPaymentAutomation />} />
        
        {/* Utilities */}
        <Route path="reporting" element={<ReceptionistReporting />} />
        <Route path="qr-scanner" element={<ReceptionistQRScanner />} />
        <Route path="profile" element={<ReceptionistSettings />} />
        <Route path="settings" element={<Navigate to="/receptionist/profile" replace />} />
        
        {/* Default redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* OPERATIONAL MANAGER PORTAL */}
      <Route 
        path="/operations/*" 
        element={
          <ProtectedRoute 
            isAuthenticated={isAuthenticated} 
            userRole={currentUser?.role}
            allowedRoles={['OPERATIONAL_MANAGER']}
          >
            <OperationalDashboardLayout onLogout={handleLogout} user={currentUser} />
          </ProtectedRoute>
        }
      >
        {/* Main Dashboard */}
        <Route path="dashboard" element={<OperationalDashboard />} />
        
        {/* Core Operations */}
        <Route path="staff-management" element={<StaffManagement />} />
        <Route path="department-view" element={<DepartmentView />} />
        <Route path="reservations" element={<OperationalReservations />} />
  <Route path="service-requests" element={<OMServiceRequests />} />
        <Route path="guest-registration" element={<OperationalGuestRegistration />} />
        <Route path="guests" element={<OperationalGuests />} />
        <Route path="rooms" element={<OperationalRoomView />} />
        <Route path="billing" element={<OperationalBilling />} />
        <Route path="guest-requests" element={<OperationalGuestRequests />} />
        
        {/* Communication & Feedback */}
        <Route path="communication" element={<OperationalCommunication />} />
        <Route path="messages" element={<OperationalCommunityMessages />} />
        <Route path="complaints" element={<OperationalComplaints />} />
        
        {/* Automation */}
        <Route path="automation" element={<OperationalAutomationDashboard />} />
  {/** Analytics and pricing pages removed for Operational Manager */}
        <Route path="automation/fraud" element={<OperationalFraudDetection />} />
        <Route path="automation/housekeeping" element={<OperationalHousekeepingTasks />} />
        <Route path="automation/ota" element={<OperationalOTAChannelManagement />} />
        <Route path="automation/payment" element={<OperationalPaymentAutomation />} />
        
  {/* Utilities */}
        <Route path="security" element={<OperationalSecurity />} />
  <Route path="qr-scanner" element={<OperationalQRScanner />} />
  <Route path="profile" element={<OperationalProfile />} />
  <Route path="settings" element={<Navigate to="/operations/profile" replace />} />
        
        {/* Test Page */}
        <Route 
          path="test" 
          element={
            <OperationalTestPage 
              title="Operational Manager Portal Test" 
              description="This is a test page to verify that all routes are working correctly in the StayOps Operational Manager Portal."
            />
          } 
        />
        
        {/* Default redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* SYSTEM ADMIN PORTAL */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute 
            isAuthenticated={isAuthenticated} 
            userRole={currentUser?.role}
            allowedRoles={['SYSTEM_ADMIN']}
          >
            <SystemAdminDashboardLayout onLogout={handleLogout} user={currentUser} />
          </ProtectedRoute>
        }
      >
        {/* Main Dashboard */}
        <Route path="dashboard" element={<SystemAdminDashboard />} />
        
        {/* System Management (align with sidebar) */}
        <Route path="system/settings" element={<SystemSettings />} />
        <Route path="system/server-status" element={<SystemAdminTestPage title="Server Status" description="View and monitor server status across services" />} />
        <Route path="system/database" element={<SystemAdminTestPage title="Database Management" description="Manage database operations and health" />} />
        <Route path="system/api" element={<APIManagement />} />
        <Route path="system/backup" element={<BackupManagement />} />
        {/* Additional system routes retained for testing */}
        <Route path="system/monitoring" element={<SystemAdminTestPage title="System Monitoring" description="Monitor system health and performance" />} />
        <Route path="system/performance" element={<SystemAdminTestPage title="Performance Metrics" description="View system performance analytics" />} />
        <Route path="system/logs" element={<SystemAdminTestPage title="System Logs" description="Access and analyze system logs" />} />
        <Route path="system/errors" element={<SystemAdminTestPage title="Error Tracking" description="Track and resolve system errors" />} />
        <Route path="system/updates" element={<SystemAdminTestPage title="System Updates" description="Manage system updates and patches" />} />
        
        {/* User Management */}
        <Route path="users" element={<UserManagement />} />
  <Route path="users/receptionists" element={<ReceptionistsManagement />} />
  <Route path="users/system-admins" element={<SystemAdminsManagement />} />
  <Route path="users/service-managers" element={<ServiceManagersManagement />} />
  <Route path="users/operational-managers" element={<OperationalManagersManagement />} />
        <Route path="users/accounts" element={<SystemAdminTestPage title="User Accounts" description="Manage user accounts and profiles" />} />
        <Route path="users/roles" element={<SystemAdminTestPage title="Role Management" description="Configure user roles and permissions" />} />
        <Route path="users/permissions" element={<SystemAdminTestPage title="Permissions" description="Define and manage permission sets" />} />
        <Route path="users/activity" element={<SystemAdminTestPage title="Activity Logs" description="Review user activity and audit logs" />} />
        <Route path="users/sessions" element={<SystemAdminTestPage title="Session Management" description="Manage active user sessions" />} />
        <Route path="users/analytics" element={<SystemAdminTestPage title="User Analytics" description="Analyze user behavior and metrics" />} />
        
        {/* Hotel Management */}
        <Route path="hotels" element={<HotelManagement />} />
        <Route path="hotels/settings" element={<SystemAdminTestPage title="Property Settings" description="Configure hotel property settings" />} />
        <Route path="hotels/rooms" element={<SystemAdminTestPage title="Room Management" description="Manage room types and configurations" />} />
        <Route path="hotels/amenities" element={<SystemAdminTestPage title="Amenities" description="Configure hotel amenities and services" />} />
        {/* Back-compat old hotel route paths */}
        <Route path="hotel/properties" element={<HotelManagement />} />
        <Route path="hotel/rooms" element={<SystemAdminTestPage title="Room Management" description="Manage room types and configurations" />} />
        <Route path="hotel/amenities" element={<SystemAdminTestPage title="Amenities" description="Configure hotel amenities and services" />} />
        <Route path="hotel/services" element={<SystemAdminTestPage title="Service Configuration" description="Set up and configure hotel services" />} />
        
        {/* Infrastructure */}
        <Route path="infrastructure/database" element={<SystemAdminTestPage title="Database Management" description="Manage database operations and health" />} />
        <Route path="infrastructure/cloud" element={<SystemAdminTestPage title="Cloud Services" description="Monitor and manage cloud infrastructure" />} />
        <Route path="infrastructure/backup" element={<SystemAdminTestPage title="Backup & Recovery" description="Manage data backup and recovery" />} />
        <Route path="infrastructure/security" element={<SystemAdminTestPage title="Security Center" description="Manage security policies and monitoring" />} />
        
        {/* Additional Pages */}
        <Route path="reports" element={<SystemReports />} />
        <Route path="reports/performance" element={<SystemAdminTestPage title="Performance Metrics" description="View system performance analytics" />} />
        <Route path="reports/usage" element={<SystemAdminTestPage title="Usage Statistics" description="View system usage statistics" />} />
        <Route path="reports/custom" element={<SystemAdminTestPage title="Custom Reports" description="Build and view custom reports" />} />
        <Route path="security" element={<SecurityCenter />} />
        <Route path="security/access" element={<SystemAdminTestPage title="Access Control" description="Manage access control policies" />} />
        <Route path="security/audit" element={<SystemAdminTestPage title="Audit Trail" description="Review system audit logs and compliance" />} />
        <Route path="security/threats" element={<SystemAdminTestPage title="Threat Detection" description="Monitor and triage security threats" />} />
        <Route path="analytics" element={<SystemAdminTestPage title="System Analytics" description="Comprehensive system analytics dashboard" />} />
        <Route path="audit" element={<SystemAdminTestPage title="Audit Logs" description="Review system audit logs and compliance" />} />
        <Route path="notifications" element={<SystemAdminNotifications />} />
        <Route path="settings" element={<SystemSettings />} />
        
        {/* Test Page */}
        <Route 
          path="test" 
          element={
            <SystemAdminTestPage 
              title="System Admin Portal Test" 
              description="This is a test page to verify that all routes are working correctly in the StayOps System Administrator Portal."
            />
          } 
        />
        
        {/* Default redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* SERVICE MANAGER PORTAL */}
      <Route 
        path="/services/*" 
        element={
          <ProtectedRoute 
            isAuthenticated={isAuthenticated} 
            userRole={currentUser?.role}
            allowedRoles={['SERVICE_MANAGER']}
          >
            <ServiceManagerDashboardLayout onLogout={handleLogout} user={currentUser} />
          </ProtectedRoute>
        }
      >
        {/* Main Dashboard */}
        <Route path="dashboard" element={<ServiceManagerDashboard />} />
        
        {/* Service Operations */}
        <Route path="operations/housekeeping" element={<ServiceManagerTestPage title="Housekeeping Management" description="Manage housekeeping operations and staff" />} />
        <Route path="operations/maintenance" element={<ServiceManagerTestPage title="Maintenance Management" description="Coordinate maintenance requests and schedules" />} />
        <Route path="operations/laundry" element={<ServiceManagerTestPage title="Laundry Services" description="Manage laundry operations and scheduling" />} />
        <Route path="operations/concierge" element={<ServiceManagerTestPage title="Concierge Services" description="Coordinate concierge services and guest requests" />} />
        <Route path="operations/room-service" element={<ServiceManagerTestPage title="Room Service" description="Manage room service operations and orders" />} />
        
        {/* Amenities Management */}
        <Route path="amenities/restaurant" element={<ServiceManagerTestPage title="Restaurant & Bar" description="Manage restaurant and bar operations" />} />
        <Route path="amenities/spa" element={<ServiceManagerTestPage title="Spa & Wellness" description="Coordinate spa and wellness services" />} />
        <Route path="amenities/fitness" element={<ServiceManagerTestPage title="Fitness Center" description="Manage fitness center operations" />} />
        <Route path="amenities/pool" element={<ServiceManagerTestPage title="Pool & Recreation" description="Oversee pool and recreation facilities" />} />
        <Route path="amenities/business" element={<ServiceManagerTestPage title="Business Center" description="Manage business center services" />} />
        
        {/* Staff Management */}
        <Route path="staff/service-staff" element={<ServiceManagerTestPage title="Service Staff" description="Manage service staff coordination" />} />
        <Route path="staff/department-view" element={<ServiceManagerTestPage title="Department View" description="View and manage department information" />} />
        <Route path="staff/tasks" element={<ServiceManagerTestPage title="Task Assignment" description="Assign and track staff tasks" />} />
        <Route path="staff/performance" element={<ServiceManagerTestPage title="Performance Monitoring" description="Monitor staff performance metrics" />} />
        
        {/* Quality & Standards */}
        <Route path="quality/service" element={<ServiceManagerTestPage title="Service Quality" description="Monitor and ensure service quality standards" />} />
        <Route path="quality/inspections" element={<ServiceManagerTestPage title="Inspection Reports" description="Manage quality inspection reports" />} />
        <Route path="quality/standards" element={<ServiceManagerTestPage title="Standards Compliance" description="Ensure compliance with service standards" />} />
        <Route path="quality/training" element={<ServiceManagerTestPage title="Training Programs" description="Manage staff training programs" />} />
        
        {/* Additional Pages */}
        <Route path="feedback" element={<ServiceManagerTestPage title="Guest Feedback" description="Review and manage guest feedback" />} />
  <Route path="requests" element={<ServiceRequests />} />
        <Route path="notifications" element={<ServiceManagerTestPage title="Notifications" description="Service manager notifications center" />} />
  <Route path="profile" element={<ReceptionistSettings />} />
  <Route path="settings" element={<Navigate to="/services/profile" replace />} />
        
        {/* Test Page */}
        <Route 
          path="test" 
          element={
            <ServiceManagerTestPage 
              title="Service Manager Portal Test" 
              description="This is a test page to verify that all routes are working correctly in the StayOps Service Manager Portal."
            />
          } 
        />
        
        {/* Default redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
      
      {/* Root Route */}
      <Route 
        path="/" 
        element={
          <Navigate 
            to={isAuthenticated ? getDashboardRoute() : "/login"} 
            replace 
          />
        } 
      />
      
      {/* Catch-all route */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={isAuthenticated ? getDashboardRoute() : "/login"} 
            replace 
          />
        } 
      />
    </Routes>
  );
}

export default App;