import express from 'express';
import partyController from '../controllers/partyController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { partyValidators } from '../validators/partyValidators.js';
import { contractAccess } from '../middleware/contractAccessMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Party management operations
router.post('/:contractId/parties', 
  contractAccess,
  validate(partyValidators.addParty), 
  partyController.addParty
);

router.get('/:contractId/parties', 
  contractAccess,
  partyController.getParties
);

router.put('/:contractId/parties/:partyId', 
  contractAccess,
  validate(partyValidators.updateParty), 
  partyController.updateParty
);

router.delete('/:contractId/parties/:partyId', 
  contractAccess,
  partyController.removeParty
);

export default router;