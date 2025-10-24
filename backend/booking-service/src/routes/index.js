import express from 'express';
import bookingRoutes from './bookingRoutes.js';
import calendarRoutes from './calendarRoutes.js';
import checkInOutRoutes from './checkInOutRoutes.js';
import conflictRoutes from './conflictRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/bookings', bookingRoutes);
router.use('/bookings', calendarRoutes);
router.use('/bookings', checkInOutRoutes);
router.use('/bookings', conflictRoutes);
router.use('/admin/bookings', adminRoutes);

export default router;