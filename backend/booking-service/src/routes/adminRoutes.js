import express from 'express';
import adminController from '../controllers/adminController.js';
import { authenticate, authorize, validate } from '@ev-coownership/shared';
import { adminValidators } from '../validators/adminValidators.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('staff', 'admin'));

// Admin Booking Management
router.get('/', 
  validate(adminValidators.getBookings), 
  adminController.getAllBookings
);

router.get('/:bookingId', 
  validate(adminValidators.getBooking), 
  adminController.getBooking
);

router.put('/:bookingId/status', 
  validate(adminValidators.updateBookingStatus), 
  adminController.updateBookingStatus
);

router.delete('/:bookingId', 
  validate(adminValidators.deleteBooking), 
  adminController.deleteBooking
);

// Analytics & Reports
router.get('/analytics/overview', 
  adminController.getBookingAnalytics
);

router.get('/analytics/vehicle-utilization', 
  validate(adminValidators.getVehicleUtilization), 
  adminController.getVehicleUtilization
);

router.get('/analytics/group-trends/:groupId', 
  validate(adminValidators.getGroupTrends), 
  adminController.getGroupTrends
);

router.get('/reports/bookings', 
  validate(adminValidators.generateBookingReport), 
  adminController.generateBookingReport
);

// Conflict Management
router.get('/conflicts/pending', 
  adminController.getPendingConflicts
);

export default router;