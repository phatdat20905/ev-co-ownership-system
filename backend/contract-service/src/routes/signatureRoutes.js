import express from 'express';
import signatureController from '../controllers/signatureController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { signatureValidators } from '../validators/signatureValidators.js';
import { contractAccess, signatureValidation } from '../middleware/contractAccessMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Signature operations
router.post('/:contractId/sign', 
  contractAccess,
  signatureValidation,
  validate(signatureValidators.signContract), 
  signatureController.signContract
);

router.get('/:contractId/signature-status', 
  contractAccess,
  signatureController.getSignatureStatus
);

router.get('/:contractId/signature-logs', 
  contractAccess,
  signatureController.getSignatureLogs
);

router.post('/:contractId/remind-signature', 
  contractAccess,
  validate(signatureValidators.remindSignature), 
  signatureController.sendSignatureReminder
);

router.post('/:contractId/verify-signature', 
  validate(signatureValidators.verifySignature), 
  signatureController.verifySignature
);

export default router;