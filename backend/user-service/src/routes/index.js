// src/routes/index.js
import express from 'express';
import userRoutes from './userRoutes.js';
import groupRoutes from './groupRoutes.js';
import voteRoutes from './voteRoutes.js';
import fundRoutes from './fundRoutes.js';

const router = express.Router();

// Mount routes with /user prefix
router.use('/user', userRoutes);
router.use('/user/groups', groupRoutes);
router.use('/user/votes', voteRoutes);
router.use('/user/fund', fundRoutes);

export default router;