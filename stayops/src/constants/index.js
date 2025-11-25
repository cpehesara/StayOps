// src/constants/index.js

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  GUESTS: {
    GET_ALL: '/api/v1/guests/getAll',
    GET_BY_ID: (id) => `/api/v1/guests/${id}`,
    CREATE: '/api/v1/guests/create',
    UPDATE: (id) => `/api/v1/guests/update/${id}`,
    DELETE: (id) => `/api/v1/guests/delete/${id}`,
  },
  ROOMS: {
    GET_ALL: '/api/rooms/getAll',
    GET_BY_ID: (id) => `/api/rooms/${id}`,
    CREATE: '/api/rooms/create',
    UPDATE: (id) => `/api/rooms/update/${id}`,
    DELETE: (id) => `/api/rooms/delete/${id}`,
    GET_AVAILABLE: '/api/rooms/available',
  },
  RESERVATIONS: {
    GET_ALL: '/api/v1/reservations/getAll',
    GET_BY_ID: (id) => `/api/v1/reservations/${id}`,
    CREATE: '/api/v1/reservations/create',
    UPDATE: (id) => `/api/v1/reservations/update/${id}`,
    DELETE: (id) => `/api/v1/reservations/delete/${id}`,
    CHECK_IN: (id) => `/api/v1/reservations/check-in/${id}`,
    CHECK_OUT: (id) => `/api/v1/reservations/check-out/${id}`,
  },
};

// User roles
export const USER_ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
  OPERATIONAL_MANAGER: 'OPERATIONAL_MANAGER',
  SERVICE_MANAGER: 'SERVICE_MANAGER',
};

// Room statuses
export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  CLEANING: 'cleaning',
  OUT_OF_ORDER: 'out_of_order',
};

// Reservation statuses
export const RESERVATION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
};

// Room types
export const ROOM_TYPES = {
  SINGLE: 'Single',
  DOUBLE: 'Double',
  TWIN: 'Twin',
  SUITE: 'Suite',
  DELUXE: 'Deluxe',
  FAMILY: 'Family',
  PRESIDENTIAL: 'Presidential',
};

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

// Complaint categories
export const COMPLAINT_CATEGORIES = {
  ROOM_CLEANLINESS: 'Room Cleanliness',
  NOISE: 'Noise',
  STAFF_BEHAVIOR: 'Staff Behavior',
  AMENITIES: 'Amenities',
  BILLING: 'Billing',
  FOOD_SERVICE: 'Food Service',
  MAINTENANCE: 'Maintenance',
  OTHER: 'Other',
};

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  DIGITAL_WALLET: 'DIGITAL_WALLET',
};

// ID types
export const ID_TYPES = {
  PASSPORT: 'Passport',
  DRIVERS_LICENSE: 'Driver\'s License',
  NATIONAL_ID: 'National ID',
  MILITARY_ID: 'Military ID',
  OTHER: 'Other',
};

// Notification types
export const NOTIFICATION_TYPES = {
  RESERVATION: 'RESERVATION',
  PAYMENT: 'PAYMENT',
  MAINTENANCE: 'MAINTENANCE',
  GUEST_REQUEST: 'GUEST_REQUEST',
  SYSTEM: 'SYSTEM',
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'yyyy-MM-dd HH:mm',
  TIME: 'HH:mm',
};

// Currencies
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  INR: 'INR',
};

// Countries (sample list)
export const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'Australia',
  'India',
  'China',
  'Brazil',
  // Add more as needed
];

// Default pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
};

// Chart colors
export const CHART_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16',
];

// Breakpoints (for responsive design)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};