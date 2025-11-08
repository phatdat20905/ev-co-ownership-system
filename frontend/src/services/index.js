// src/services/index.js
/**
 * Centralized export for all API services
 * Import services like: import { authService, userService } from '@/services';
 */

export { default as authService } from './auth.service.js';
export { default as userService } from './user.service.js';
export { default as bookingService } from './booking.service.js';
export { default as costService } from './cost.service.js';
export { default as vehicleService } from './vehicle.service.js';
export { default as contractService } from './contract.service.js';
export { default as adminService } from './admin.service.js';
export { default as aiService } from './ai.service.js';

// Re-export API client for direct usage if needed
export { default as apiClient } from './api/interceptors.js';
