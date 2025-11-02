// src/routes/insuranceRoutes.js
import express from 'express';
import insuranceController from '../controllers/insuranceController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { insuranceValidators } from '../validators/insuranceValidators.js';
import { groupAccess } from '../middleware/groupAccess.js';

const router = express.Router();

router.use(authenticate);

router.post('/vehicles/:vehicleId/insurance', groupAccess, validate(insuranceValidators.create), insuranceController.createInsurance);
router.get('/vehicles/:vehicleId/insurance', validate(insuranceValidators.list), insuranceController.getInsurancePolicies);
router.get('/vehicles/:vehicleId/insurance/current', validate(insuranceValidators.getCurrent), insuranceController.getCurrentInsurance);
router.put('/insurance/:insuranceId', groupAccess, validate(insuranceValidators.update), insuranceController.updateInsurance);
router.put('/insurance/:insuranceId/status', groupAccess, validate(insuranceValidators.updateStatus), insuranceController.updateInsuranceStatus);

export default router;