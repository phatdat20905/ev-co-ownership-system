import express from 'express';
import contractController from '../controllers/contractController.js';
import { 
  authenticate, 
  validate,
  authorize 
} from '@ev-coownership/shared';
import { contractValidators } from '../validators/contractValidators.js';
import { contractAccess } from '../middleware/contractAccessMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Contract CRUD operations
router.post('/', 
  validate(contractValidators.createContract), 
  contractController.createContract
);

router.get('/user/me', 
  contractController.getUserContracts
);

router.get('/group/:groupId', 
  validate(contractValidators.getContracts), 
  contractController.getContractsByGroup
);

router.get('/:contractId', 
  contractAccess, 
  contractController.getContract
);

router.put('/:contractId', 
  contractAccess,
  validate(contractValidators.updateContract), 
  contractController.updateContract
);

router.delete('/:contractId', 
  contractAccess,
  contractController.deleteContract
);

// Contract workflow operations
router.post('/:contractId/send-for-signature', 
  contractAccess,
  contractController.sendForSignature
);

router.get('/:contractId/download', 
  contractAccess,
  contractController.downloadContractPDF
);

export default router;