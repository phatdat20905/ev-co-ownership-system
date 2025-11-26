// src/routes/index.js
import express from 'express';
import { serviceMap } from '../config/serviceMap.js';
import { createServiceProxy } from '../utils/proxyFactory.js';
import { authenticate, optionalAuth } from '@ev-coownership/shared';

const router = express.Router();

// Public (auth) – không cần auth
router.use('/auth', createServiceProxy('auth', serviceMap.auth));

// Static file serving - proxy uploads to correct services
// Avatar images → user-service
router.use('/uploads/avatars', createServiceProxy('uploads-avatars', serviceMap.user));

// KYC images → auth-service  
router.use('/uploads/kyc', createServiceProxy('uploads-kyc', serviceMap.auth));

// Contract documents → contract-service
router.use('/uploads/documents', authenticate, createServiceProxy('uploads-documents', serviceMap.contract));

// User routes with mixed auth requirements
// Profile creation route must come BEFORE the authenticated routes
router.use('/user', (req, res, next) => {
  // Allow profile creation without auth, require auth for all other routes
  if (req.method === 'POST' && req.path === '/profile/create') {
    return next(); // Skip authentication
  }
  return authenticate(req, res, next); // Require authentication
}, createServiceProxy('user', serviceMap.user));

// Booking – yêu cầu đăng nhập
// Use plural serviceName to match downstream route prefixes (avoid path rewrite mismatch)
router.use('/bookings', authenticate, createServiceProxy('bookings', serviceMap.booking));

// Cost, Vehicle, Contract, Notification, AI – đều yêu cầu đăng nhập
// Ensure serviceName passed to proxy matches the mounted path so pathRewrite preserves expected downstream route prefixes
router.use('/costs', authenticate, createServiceProxy('costs', serviceMap.cost));
router.use('/vehicles', authenticate, createServiceProxy('vehicles', serviceMap.vehicle));
router.use('/contracts', authenticate, createServiceProxy('contracts', serviceMap.contract));
router.use('/notifications', authenticate, createServiceProxy('notifications', serviceMap.notification));
router.use('/ai', authenticate, createServiceProxy('ai', serviceMap.ai));

// Admin – yêu cầu admin role (phân quyền ở service level)
router.use('/admin', authenticate, createServiceProxy('admin', serviceMap.admin));

export default router;
