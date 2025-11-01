// src/routes/walletRoutes.js
import express from 'express';
import walletController from '../controllers/walletController.js';
import { authenticate, validate } from '@ev-coownership/shared';
import { walletValidators } from '../validators/walletValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', walletController.getWallet);
router.post('/deposit', validate(walletValidators.deposit), walletController.deposit);
router.post('/withdraw', validate(walletValidators.withdraw), walletController.withdraw);
router.get('/transactions', walletController.getTransactions);

export default router;