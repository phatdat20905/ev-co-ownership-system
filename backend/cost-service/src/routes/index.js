// src/routes/index.js
import express from 'express';
import costRoutes from './costRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import walletRoutes from './walletRoutes.js';
import groupWalletRoutes from './groupWalletRoutes.js';
import splitRoutes from './splitRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = express.Router();

router.use('/costs', costRoutes);
router.use('/payments', paymentRoutes);
router.use('/wallets', walletRoutes);
router.use('/group-wallets', groupWalletRoutes);
router.use('/splits', splitRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/reports', reportRoutes);

export default router;