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

// Mount routes with /costs prefix
router.use('/costs', costRoutes);
router.use('/costs/payments', paymentRoutes);
router.use('/costs/wallets', walletRoutes);
router.use('/costs/group-wallets', groupWalletRoutes);
router.use('/costs/splits', splitRoutes);
router.use('/costs/invoices', invoiceRoutes);
router.use('/costs/reports', reportRoutes);

export default router;