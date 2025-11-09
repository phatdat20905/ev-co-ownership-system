import express from 'express';
import contractRoutes from './contractRoutes.js';
import signatureRoutes from './signatureRoutes.js';
import partyRoutes from './partyRoutes.js';
import documentRoutes from './documentRoutes.js';
import amendmentRoutes from './amendmentRoutes.js';
import templateRoutes from './templateRoutes.js';

const router = express.Router();

// Mount routes with /contracts prefix
router.use('/contracts', contractRoutes);
router.use('/contracts/signatures', signatureRoutes);
router.use('/contracts/parties', partyRoutes);
router.use('/contracts/documents', documentRoutes);
router.use('/contracts/amendments', amendmentRoutes);

// Templates route là module riêng
router.use('/contracts/templates', templateRoutes);

export default router;