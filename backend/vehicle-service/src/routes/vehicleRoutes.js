// src/routes/vehicleRoutes.js
import express from 'express';
import vehicleController from '../controllers/vehicleController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { vehicleValidators } from '../validators/vehicleValidators.js';
import { groupAccess } from '../middleware/groupAccess.js';

const router = express.Router();

router.use(authenticate);

// Vehicle Management
router.post('/', validate(vehicleValidators.create), vehicleController.createVehicle);
router.get('/', validate(vehicleValidators.list), vehicleController.getVehicles);
router.get('/search', validate(vehicleValidators.search), vehicleController.searchVehicles);
router.get('/:vehicleId', validate(vehicleValidators.getById), vehicleController.getVehicle);
router.put('/:vehicleId', groupAccess, validate(vehicleValidators.update), vehicleController.updateVehicle);
router.delete('/:vehicleId', groupAccess, validate(vehicleValidators.delete), vehicleController.deleteVehicle);
router.put('/:vehicleId/status', groupAccess, validate(vehicleValidators.updateStatus), vehicleController.updateVehicleStatus);
router.get('/:vehicleId/stats', validate(vehicleValidators.getById), vehicleController.getVehicleStats);
// Bulk stats for many vehicles (expects JSON body: { ids: ["uuid", ...] })
router.post('/stats/bulk', validate(vehicleValidators.bulkStats), vehicleController.getVehicleStatsBulk);

export default router;