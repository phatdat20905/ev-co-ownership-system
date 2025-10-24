import express from 'express';
import bookingController from '../controllers/bookingController.js';
import { authenticate, validate } from '@ev-coownership/shared';
import { bookingValidators } from '../validators/bookingValidators.js';
import bookingPermissions from '../middleware/bookingPermissions.js';

const router = express.Router();

router.use(authenticate);

// Booking Management
router.post('/', 
  validate(bookingValidators.createBooking), 
  bookingController.createBooking
);

router.get('/', 
  validate(bookingValidators.getBookings), 
  bookingController.getUserBookings
);

router.get('/stats', 
  bookingController.getBookingStats
);

router.get('/history', 
  validate(bookingValidators.getBookingHistory), 
  bookingController.getBookingHistory
);

router.get('/:bookingId', 
  validate(bookingValidators.getBooking), 
  bookingPermissions.canViewBooking,
  bookingController.getBooking
);

router.put('/:bookingId', 
  validate(bookingValidators.updateBooking), 
  bookingPermissions.canModifyBooking,
  bookingController.updateBooking
);

router.delete('/:bookingId', 
  validate(bookingValidators.cancelBooking), 
  bookingPermissions.canModifyBooking,
  bookingController.cancelBooking
);

export default router;