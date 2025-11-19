// src/routes/index.js
import express from 'express';
import userRoutes from './userRoutes.js';
import groupRoutes from './groupRoutes.js';
import voteRoutes from './voteRoutes.js';
import fundRoutes from './fundRoutes.js';
import internalRoutes from './internalRoutes.js';

const router = express.Router();

// Mount internal route first (internal calls that use INTERNAL_SERVICE_TOKEN or service JWT)
router.use('/internal', internalRoutes);

// Mount specific sub-routes next to avoid prefix shadowing
router.use('/user/groups', groupRoutes);
router.use('/user/votes', voteRoutes);
router.use('/user/fund', fundRoutes);
// Mount generic /user routes after specific ones
router.use('/user', userRoutes);

export default router;