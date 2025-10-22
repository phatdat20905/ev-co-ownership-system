// src/routes/index.js
import express from 'express';
import userRoutes from './userRoutes.js';
import groupRoutes from './groupRoutes.js';
import voteRoutes from './voteRoutes.js';
import fundRoutes from './fundRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/votes', voteRoutes);
router.use('/fund', fundRoutes);

export default router;