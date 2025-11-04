import express from 'express';
import bookingRoutes from './bookingRoutes.js';
import calendarRoutes from './calendarRoutes.js';
import checkInOutRoutes from './checkInOutRoutes.js';
import conflictRoutes from './conflictRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// ✅ Không thêm prefix “/bookings” ở đây nữa
router.use('/', bookingRoutes);
router.use('/calendar', calendarRoutes);
router.use('/check-in-out', checkInOutRoutes);
router.use('/conflicts', conflictRoutes);

// ✅ Admin route tách riêng cho quản trị viên
router.use('/admin', adminRoutes);

export default router;