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
// These routes are already prefixed with /contracts/parties from index.js
// So /:contractId here becomes /contracts/parties/:contractId
router.post('/:contractId', 
  contractAccess,
  validate(partyValidators.addParty), 
  partyController.addParty
);

router.get('/:contractId', 
  contractAccess,
  partyController.getParties
);

router.put('/:contractId/:partyId', 
  contractAccess,
  validate(partyValidators.updateParty), 
  partyController.updateParty
);

router.delete('/:contractId/:partyId', 
  contractAccess,
  partyController.removeParty
);

export default router;