// src/routes/internalRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import { logger } from '@ev-coownership/shared';

const router = express.Router();

// Internal membership check
// Accepts either a static INTERNAL_SERVICE_TOKEN or a service JWT (signed with JWT_SECRET)
router.get('/groups/:groupId/members/:userId', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Internal token required' } });
    }

    const token = authHeader.split(' ')[1];
    let valid = false;

    // Accept explicit static token
    if (token === process.env.INTERNAL_SERVICE_TOKEN) {
      valid = true;
    } else {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.service) valid = true;
      } catch (err) {
        valid = false;
      }
    }

    if (!valid) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid internal token' } });
    }

    const { groupId, userId } = req.params;

    const member = await db.GroupMember.findOne({ where: { groupId, userId, isActive: true } });
    if (member) {
      return res.json({ success: true, data: { isMember: true } });
    }

    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Member not found' } });
  } catch (error) {
    logger.error('Internal membership check failed', { error: error.message });
    next(error);
  }
});

export default router;
