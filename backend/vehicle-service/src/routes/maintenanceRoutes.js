// src/routes/maintenanceRoutes.js
import express from 'express';
import maintenanceController from '../controllers/maintenanceController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { maintenanceValidators } from '../validators/maintenanceValidators.js';
import { groupAccess } from '../middleware/groupAccess.js';

const router = express.Router();

router.use(authenticate);

// Vehicle-specific maintenance routes
router.post('/vehicles/:vehicleId/schedules', groupAccess, validate(maintenanceValidators.createSchedule), maintenanceController.createMaintenanceSchedule);
router.get('/vehicles/:vehicleId/schedules', validate(maintenanceValidators.listSchedules), maintenanceController.getMaintenanceSchedules);
router.get('/schedules/:scheduleId', validate(maintenanceValidators.getSchedule), maintenanceController.getMaintenanceSchedule);
router.put('/schedules/:scheduleId', groupAccess, validate(maintenanceValidators.updateSchedule), maintenanceController.updateMaintenanceSchedule);
router.delete('/schedules/:scheduleId', groupAccess, validate(maintenanceValidators.deleteSchedule), maintenanceController.deleteMaintenanceSchedule);
router.put('/schedules/:scheduleId/complete', groupAccess, validate(maintenanceValidators.completeSchedule), maintenanceController.completeMaintenance);

// Maintenance History
router.post('/vehicles/:vehicleId/history', groupAccess, validate(maintenanceValidators.createHistory), maintenanceController.createMaintenanceHistory);
router.get('/vehicles/:vehicleId/history', validate(maintenanceValidators.listHistory), maintenanceController.getMaintenanceHistory);

export default router;