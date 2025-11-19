// src/routes/adminRoutes.js
import express from 'express';
import adminController from '../controllers/adminController.js';
import { 
  authenticate, 
  authorize,
  validate 
} from '@ev-coownership/shared';
import { adminValidators } from '../validators/adminValidators.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin', 'staff'));

// Admin endpoints
router.get('/vehicles', validate(adminValidators.listVehicles), adminController.getAllVehicles);
router.get('/vehicles/maintenance-due', adminController.getMaintenanceDueVehicles);
router.get('/vehicles/insurance-expiring', adminController.getInsuranceExpiringVehicles);
router.get('/analytics/overview', adminController.getSystemOverview);

export default router;