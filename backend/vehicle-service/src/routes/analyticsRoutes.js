// src/routes/analyticsRoutes.js
import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { analyticsValidators } from '../validators/analyticsValidators.js';

const router = express.Router();

router.use(authenticate);

// Vehicle Analytics
router.get('/vehicles/:vehicleId/utilization', validate(analyticsValidators.utilization), analyticsController.getUtilization);
router.get('/vehicles/:vehicleId/maintenance-costs', validate(analyticsValidators.maintenanceCosts), analyticsController.getMaintenanceCosts);
router.get('/vehicles/:vehicleId/battery-health', validate(analyticsValidators.batteryHealth), analyticsController.getBatteryHealth);
router.get('/vehicles/:vehicleId/operating-costs', validate(analyticsValidators.operatingCosts), analyticsController.getOperatingCosts);

// Group Analytics
router.get('/groups/:groupId/summary', validate(analyticsValidators.groupSummary), analyticsController.getGroupSummary);

export default router;