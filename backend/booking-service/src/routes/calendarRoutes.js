import express from 'express';
import calendarController from '../controllers/calendarController.js';
import { authenticate, validate } from '@ev-coownership/shared';
import { calendarValidators } from '../validators/calendarValidators.js';

const router = express.Router();

router.use(authenticate);

// Calendar & Availability
router.get('/vehicles/:vehicleId', 
  validate(calendarValidators.getVehicleCalendar), 
  calendarController.getVehicleCalendar
);

router.get('/groups/:groupId', 
  validate(calendarValidators.getGroupCalendar), 
  calendarController.getGroupCalendar
);

router.post('/availability/check', 
  validate(calendarValidators.checkAvailability), 
  calendarController.checkAvailability
);

router.get('/vehicles/available', 
  validate(calendarValidators.getAvailableVehicles), 
  calendarController.getAvailableVehicles
);

router.get('/personal', 
  validate(calendarValidators.getPersonalCalendar), 
  calendarController.getPersonalCalendar
);

// Real-time calendar updates
router.get('/updates/subscribe', 
  calendarController.subscribeToCalendarUpdates
);

export default router;