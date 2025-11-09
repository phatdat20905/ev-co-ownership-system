import express from 'express';
import bookingRoutes from './bookingRoutes.js';
import calendarRoutes from './calendarRoutes.js';
import checkInOutRoutes from './checkInOutRoutes.js';
import conflictRoutes from './conflictRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Mount routes with /bookings prefix
router.use('/bookings', bookingRoutes);
router.use('/bookings/calendar', calendarRoutes);
router.use('/bookings/check-in-out', checkInOutRoutes);
router.use('/bookings/conflicts', conflictRoutes);

// Admin route tách riêng cho quản trị viên
router.use('/bookings/admin', adminRoutes);

export default router;