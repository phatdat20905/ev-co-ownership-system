// src/routes/groupWalletRoutes.js
import express from 'express';
import groupWalletController from '../controllers/groupWalletController.js';
import { authenticate, validate } from '@ev-coownership/shared';
import { groupWalletValidators } from '../validators/walletValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/:groupId', validate(groupWalletValidators.getGroupWallet), groupWalletController.getGroupWallet);
router.post('/:groupId/deposit', validate(groupWalletValidators.deposit), groupWalletController.deposit);
router.post('/:groupId/withdraw', validate(groupWalletValidators.withdraw), groupWalletController.withdraw);
router.post('/:groupId/pay-cost', validate(groupWalletValidators.payCost), groupWalletController.payCost);
router.get('/:groupId/transactions', validate(groupWalletValidators.getTransactions), groupWalletController.getTransactions);

export default router;