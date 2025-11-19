import express from 'express';
import conflictController from '../controllers/conflictController.js';
import { authenticate, validate, authorize } from '@ev-coownership/shared';
import { conflictValidators } from '../validators/conflictValidators.js';

const router = express.Router();

router.use(authenticate);

// User conflict management
router.get('/my-conflicts', 
  conflictController.getUserConflicts
);

router.put('/:conflictId/resolve', 
  validate(conflictValidators.resolveConflict), 
  conflictController.resolveConflict
);

// Admin conflict management
router.get('/admin/all', 
  authorize('staff', 'admin'), 
  validate(conflictValidators.getConflicts), 
  conflictController.getAllConflicts
);

router.get('/admin/:conflictId', 
  authorize('staff', 'admin'), 
  validate(conflictValidators.getConflict), 
  conflictController.getConflict
);

router.put('/admin/:conflictId/resolve', 
  authorize('staff', 'admin'), 
  validate(conflictValidators.adminResolveConflict), 
  conflictController.adminResolveConflict
);

export default router;