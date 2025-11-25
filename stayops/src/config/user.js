// src/config/users.js

export const USERS = [
  {
    id: 1,
    email: 'admin@stayops.com',
    password: 'admin@123',
    role: 'system-admin',
    name: 'System Administrator',
    portal: '/admin'
  },
  {
    id: 2,
    email: 'reception@stayops.com',
    password: 'reception@123',
    role: 'receptionist',
    name: 'Receptionist',
    portal: '/receptionist'
  },
  {
    id: 3,
    email: 'operations@stayops.com',
    password: 'operations@123',
    role: 'operational-manager',
    name: 'Operational Manager',
    portal: '/operations'
  },
  {
    id: 4,
    email: 'service@stayops.com',
    password: 'service@123',
    role: 'service-manager',
    name: 'Service Manager',
    portal: '/service'
  }
];

export const authenticateUser = (email, password) => {
  return USERS.find(
    user => user.email === email && user.password === password
  );
};