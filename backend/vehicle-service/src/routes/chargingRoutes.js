// src/routes/chargingRoutes.js
import express from 'express';
import chargingController from '../controllers/chargingController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { chargingValidators } from '../validators/chargingValidators.js';

const router = express.Router();

router.use(authenticate);

router.post('/vehicles/:vehicleId/sessions', validate(chargingValidators.createSession), chargingController.createChargingSession);
router.get('/vehicles/:vehicleId/sessions', validate(chargingValidators.listSessions), chargingController.getChargingSessions);
router.get('/sessions/:sessionId', validate(chargingValidators.getSession), chargingController.getChargingSession);
router.get('/vehicles/:vehicleId/stats', validate(chargingValidators.getStats), chargingController.getChargingStats);
router.get('/vehicles/:vehicleId/costs', validate(chargingValidators.getCosts), chargingController.getChargingCosts);

export default router;