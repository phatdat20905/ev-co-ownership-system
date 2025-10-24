import express from 'express';
import checkInOutController from '../controllers/checkInOutController.js';
import { authenticate, validate } from '@ev-coownership/shared';
import { checkInOutValidators } from '../validators/checkInOutValidators.js';
import bookingPermissions from '../middleware/bookingPermissions.js';

const router = express.Router();

router.use(authenticate);

// Check-in/Check-out
router.post('/:bookingId/check-in', 
  validate(checkInOutValidators.checkIn), 
  bookingPermissions.canCheckInOut,
  checkInOutController.checkIn
);

router.post('/:bookingId/check-out', 
  validate(checkInOutValidators.checkOut), 
  bookingPermissions.canCheckInOut,
  checkInOutController.checkOut
);

router.get('/:bookingId/logs', 
  validate(checkInOutValidators.getCheckLogs), 
  bookingPermissions.canViewBooking,
  checkInOutController.getCheckLogs
);

// QR Code
router.get('/:bookingId/qr-code', 
  validate(checkInOutValidators.getQRCode), 
  bookingPermissions.canViewBooking,
  checkInOutController.generateQRCode
);

router.post('/validate-qr', 
  validate(checkInOutValidators.validateQR), 
  checkInOutController.validateQRCode
);

export default router;