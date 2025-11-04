import express from 'express';
import contractRoutes from './contractRoutes.js';
import signatureRoutes from './signatureRoutes.js';
import partyRoutes from './partyRoutes.js';
import documentRoutes from './documentRoutes.js';
import amendmentRoutes from './amendmentRoutes.js';
import templateRoutes from './templateRoutes.js';

const router = express.Router();

// Mount all route modules
router.use('/', contractRoutes);
router.use('/signatures', signatureRoutes);
router.use('/parties', partyRoutes);
router.use('/documents', documentRoutes);
router.use('/amendments', amendmentRoutes);

// ✅ Templates route là module riêng
router.use('/templates', templateRoutes);

export default router;