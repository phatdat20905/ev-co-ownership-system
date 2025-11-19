import express from 'express';
import bookingRoutes from './bookingRoutes.js';
import calendarRoutes from './calendarRoutes.js';
import checkInOutRoutes from './checkInOutRoutes.js';
import conflictRoutes from './conflictRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Mount admin routes BEFORE the general /bookings routes so specific
// paths like /bookings/admin are not captured by bookingRoutes (e.g. '/:bookingId').
// Admin route (must be checked first)
router.use('/bookings/admin', adminRoutes);

// Mount general /bookings routes
router.use('/bookings/calendar', calendarRoutes);
router.use('/bookings/check-in-out', checkInOutRoutes);
router.use('/bookings/conflicts', conflictRoutes);

// Mount general /bookings routes last so specific subpaths are matched first
router.use('/bookings', bookingRoutes);

export default router;