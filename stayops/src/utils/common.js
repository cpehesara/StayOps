// src/utils/common.js
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';
import { format, parseISO, isValid } from 'date-fns';
import _ from 'lodash';

/**
 * Generate a unique ID
 */
export const generateId = () => uuidv4();

/**
 * Utility for conditional class names
 */
export const cn = (...classes) => clsx(classes);

/**
 * Format date safely
 */
export const formatDate = (date, formatString = 'yyyy-MM-dd') => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsedDate) ? format(parsedDate, formatString) : 'Invalid Date';
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Debounced search function
 */
export const createDebouncedSearch = (callback, delay = 300) => {
  return _.debounce(callback, delay);
};

/**
 * Deep clone an object
 */
export const deepClone = (obj) => _.cloneDeep(obj);

/**
 * Safely get nested object properties
 */
export const safeGet = (obj, path, defaultValue = null) => _.get(obj, path, defaultValue);

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate random color for charts
 */
export const generateRandomColor = () => {
  return `#${Math.floor(Math.random()*16777215).toString(16)}`;
};

/**
 * Get status color based on status type
 */
export const getStatusColor = (status) => {
  const statusColors = {
    'available': '#10b981',
    'occupied': '#ef4444',
    'maintenance': '#f59e0b',
    'cleaning': '#3b82f6',
    'confirmed': '#10b981',
    'pending': '#f59e0b',
    'cancelled': '#ef4444',
    'completed': '#10b981',
    'active': '#10b981',
    'inactive': '#6b7280'
  };
  
  return statusColors[status?.toLowerCase()] || '#6b7280';
};