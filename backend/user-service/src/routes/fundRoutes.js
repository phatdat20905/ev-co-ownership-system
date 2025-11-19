// src/routes/fundRoutes.js
import express from 'express';
import fundController from '../controllers/fundController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { fundValidators } from '../validators/fundValidators.js';
import { groupAccess } from '../middleware/groupAccess.js';

const router = express.Router();

router.use(authenticate);

router.post('/:groupId/deposit', groupAccess, validate(fundValidators.deposit), fundController.deposit);
router.post('/:groupId/withdraw', groupAccess, validate(fundValidators.withdraw), fundController.withdraw);
router.get('/:groupId/balance', groupAccess, fundController.getBalance);
router.get('/:groupId/transactions', groupAccess, fundController.getTransactions);
router.get('/:groupId/summary', groupAccess, fundController.getSummary);

export default router;