import express from 'express';
import contractRoutes from './contractRoutes.js';
import signatureRoutes from './signatureRoutes.js';
import partyRoutes from './partyRoutes.js';
import documentRoutes from './documentRoutes.js';
import amendmentRoutes from './amendmentRoutes.js';
import templateRoutes from './templateRoutes.js';

const router = express.Router();

// Mount all route modules
router.use('/contracts', contractRoutes);
router.use('/contracts', signatureRoutes);
router.use('/contracts', partyRoutes);
router.use('/contracts', documentRoutes);
router.use('/contracts', amendmentRoutes);
router.use('/templates', templateRoutes);

export default router;