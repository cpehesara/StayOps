// src/utils/validationSchemas.js
import * as yup from 'yup';

// Common validation rules
const emailRule = yup.string().email('Invalid email format').required('Email is required');
const passwordRule = yup.string().min(6, 'Password must be at least 6 characters').required('Password is required');
const phoneRule = yup.string().matches(/^\+?[\d\s\-()]+$/, 'Invalid phone number format');
const requiredString = (fieldName) => yup.string().required(`${fieldName} is required`);
const requiredNumber = (fieldName) => yup.number().required(`${fieldName} is required`);

// Login validation schema
export const loginSchema = yup.object({
  email: emailRule,
  password: passwordRule,
});

// Guest registration schema
export const guestRegistrationSchema = yup.object({
  firstName: requiredString('First name'),
  lastName: requiredString('Last name'),
  email: emailRule,
  phone: phoneRule.required('Phone number is required'),
  address: requiredString('Address'),
  city: requiredString('City'),
  country: requiredString('Country'),
  idNumber: requiredString('ID number'),
  idType: requiredString('ID type'),
});

// Reservation schema
export const reservationSchema = yup.object({
  guestId: requiredNumber('Guest'),
  roomId: requiredNumber('Room'),
  checkInDate: yup.date().required('Check-in date is required').min(new Date(), 'Check-in date cannot be in the past'),
  checkOutDate: yup.date().required('Check-out date is required').min(yup.ref('checkInDate'), 'Check-out date must be after check-in date'),
  numberOfGuests: yup.number().min(1, 'At least 1 guest is required').required('Number of guests is required'),
  specialRequests: yup.string().max(500, 'Special requests cannot exceed 500 characters'),
});

// Room schema
export const roomSchema = yup.object({
  roomNumber: requiredString('Room number'),
  type: requiredString('Room type'),
  capacity: requiredNumber('Capacity').min(1, 'Capacity must be at least 1'),
  pricePerNight: requiredNumber('Price per night').min(0, 'Price cannot be negative'),
  floorNumber: requiredNumber('Floor number'),
  description: yup.string().max(1000, 'Description cannot exceed 1000 characters'),
});

// Staff schema
export const staffSchema = yup.object({
  firstName: requiredString('First name'),
  lastName: requiredString('Last name'),
  email: emailRule,
  phone: phoneRule,
  role: requiredString('Role'),
  department: requiredString('Department'),
  salary: yup.number().min(0, 'Salary cannot be negative'),
  hireDate: yup.date().required('Hire date is required'),
});

// Complaint schema
export const complaintSchema = yup.object({
  guestId: requiredNumber('Guest'),
  category: requiredString('Category'),
  subject: requiredString('Subject'),
  description: requiredString('Description').max(1000, 'Description cannot exceed 1000 characters'),
  priority: yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], 'Invalid priority level'),
});

// Settings schema
export const settingsSchema = yup.object({
  hotelName: requiredString('Hotel name'),
  address: requiredString('Address'),
  phone: phoneRule.required('Phone number is required'),
  email: emailRule,
  currency: requiredString('Currency'),
  timezone: requiredString('Timezone'),
  checkInTime: requiredString('Check-in time'),
  checkOutTime: requiredString('Check-out time'),
});