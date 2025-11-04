// src/routes/index.js
import express from 'express';
import { serviceMap } from '../config/serviceMap.js';
import { createServiceProxy } from '../utils/proxyFactory.js';
import { authenticate, optionalAuth } from '@ev-coownership/shared';

const router = express.Router();

// Public (auth) – không cần auth
router.use('/auth', createServiceProxy('auth', serviceMap.auth));

// User – yêu cầu đăng nhập
router.use('/user', authenticate, createServiceProxy('user', serviceMap.user));

// Booking – yêu cầu đăng nhập
router.use('/bookings', authenticate, createServiceProxy('booking', serviceMap.booking));

// Cost, Vehicle, Contract, Notification, AI – đều yêu cầu đăng nhập
router.use('/costs', authenticate, createServiceProxy('cost', serviceMap.cost));
router.use('/vehicles', authenticate, createServiceProxy('vehicle', serviceMap.vehicle));
router.use('/contracts', authenticate, createServiceProxy('contract', serviceMap.contract));
router.use('/notifications', authenticate, createServiceProxy('notification', serviceMap.notification));
router.use('/ai', authenticate, createServiceProxy('ai', serviceMap.ai));

// Admin – yêu cầu admin role (phân quyền ở service level)
router.use('/admin', authenticate, createServiceProxy('admin', serviceMap.admin));

export default router;
