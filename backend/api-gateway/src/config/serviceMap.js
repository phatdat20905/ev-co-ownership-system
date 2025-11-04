// src/config/serviceMap.js
// Prefer env vars, fallback to defaults (localhost)
export const serviceMap = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  booking: process.env.BOOKING_SERVICE_URL || 'http://localhost:3003',
  cost: process.env.COST_SERVICE_URL || 'http://localhost:3004',
  vehicle: process.env.VEHICLE_SERVICE_URL || 'http://localhost:3005',
  contract: process.env.CONTRACT_SERVICE_URL || 'http://localhost:3006',
  admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3007',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',
  ai: process.env.AI_SERVICE_URL || 'http://localhost:3009',
};
