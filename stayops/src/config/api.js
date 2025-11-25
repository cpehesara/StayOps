// src/config/api.js

// Base URL for your Spring Boot backend
export const API_BASE_URL = 'http://localhost:8080';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  WEB_LOGIN: '/api/v1/auth/web-login',
  VALIDATE_TOKEN: '/api/v1/auth/validate-web-token',
  LOGOUT: '/api/v1/auth/logout',
  DEBUG_USERS: '/api/v1/auth/debug-users',
  
  // User endpoints
  USERS: '/api/users',
  USER_BY_EMAIL: (email) => `/api/users/email/${email}`,
  
  // Role-specific endpoints
  SYSTEM_ADMINS: '/api/system-admins',
  RECEPTIONISTS: '/api/receptionists',
  OPERATIONAL_MANAGERS: '/api/operational-managers',
  SERVICE_MANAGERS: '/api/service-managers',
  
  // Room Viewer endpoints (NEW)
  ROOM_VIEWER: '/api/room-viewer',
  ROOM_VIEWER_AVAILABLE: '/api/room-viewer/rooms/available',
  ROOM_VIEWER_DETAILS: (roomId) => `/api/room-viewer/rooms/${roomId}/details`,
  ROOM_VIEWER_SELECT: (roomId) => `/api/room-viewer/rooms/${roomId}/select`,
};

// Role mappings from backend to frontend routes
export const ROLE_ROUTES = {
  'SYSTEM_ADMIN': '/admin',
  'RECEPTIONIST': '/reception',
  'OPERATIONAL_MANAGER': '/operations',
  'SERVICE_MANAGER': '/services'
};

// User credentials matching your backend DataInitializer
export const BACKEND_USERS = [
  {
    email: 'admin@stayops.com',
    password: 'admin123',
    role: 'SYSTEM_ADMIN',
    name: 'System Administrator'
  },
  {
    email: 'service@gmail.com',
    password: 'service123',
    role: 'SERVICE_MANAGER',
    name: 'Service Manager'
  },
  {
    email: 'opmanager@stayops.com',
    password: 'opmanager123',
    role: 'OPERATIONAL_MANAGER',
    name: 'Operational Manager'
  },
  {
    email: 'reception@gmail.com',
    password: 'reception@123',
    role: 'RECEPTIONIST',
    name: 'Front Desk Receptionist'
  }
];

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  ROLE_ROUTES,
  BACKEND_USERS
};