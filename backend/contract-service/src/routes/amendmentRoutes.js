import express from 'express';
import amendmentController from '../controllers/amendmentController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { amendmentValidators } from '../validators/amendmentValidators.js';
import { contractAccess } from '../middleware/contractAccessMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Amendment operations
// These routes are already prefixed with /contracts/amendments from index.js
// So /:contractId/amendments here becomes /contracts/amendments/:contractId/amendments
router.post('/:contractId/amendments', 
  contractAccess,
  validate(amendmentValidators.createAmendment), 
  amendmentController.createAmendment
);

router.get('/:contractId/amendments', 
  contractAccess,
  amendmentController.getAmendments
);

router.put('/:contractId/amendments/:amendmentId/approve', 
  contractAccess,
  amendmentController.approveAmendment
);

export default router;