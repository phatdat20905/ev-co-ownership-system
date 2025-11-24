// src/routes/internalRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import { logger } from '@ev-coownership/shared';

const router = express.Router();

// Middleware to validate internal token (x-internal-token header or Bearer token)
const validateInternalToken = (req, res, next) => {
  try {
    // Check x-internal-token header first (simpler for service-to-service)
    const internalToken = req.headers['x-internal-token'];
    if (internalToken && internalToken === process.env.INTERNAL_API_TOKEN) {
      return next();
    }

    // Fallback: check Authorization Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Accept explicit static token
      if (token === process.env.INTERNAL_SERVICE_TOKEN || token === process.env.INTERNAL_API_TOKEN) {
        return next();
      }
      
      // Or verify JWT with service claim
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.service) {
          return next();
        }
      } catch (err) {
        // Invalid JWT, continue to reject
      }
    }

    return res.status(401).json({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: 'Internal token required' } 
    });
  } catch (error) {
    logger.error('Internal token validation failed', { error: error.message });
    return res.status(401).json({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: 'Invalid internal token' } 
    });
  }
};

// Internal: Get all members of a group (for AI service fairness analysis)
router.get('/groups/:groupId/members', validateInternalToken, async (req, res, next) => {
  try {
    const { groupId } = req.params;

    logger.info('Internal API: fetching group members', { groupId });

    // Get group details
    const group = await db.CoOwnershipGroup.findOne({ 
      where: { id: groupId, isActive: true },
      attributes: ['id', 'groupName', 'vehicleId', 'isActive']
    });

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Group not found' } 
      });
    }

    // Get all active members
    const members = await db.GroupMember.findAll({
      where: { groupId, isActive: true },
      attributes: ['userId', 'role', 'ownershipPercentage', 'joinedAt']
    });

    // Get user profiles for all members
    const userIds = members.map(m => m.userId);
    const profiles = await db.UserProfile.findAll({
      where: { userId: userIds },
      attributes: ['userId', 'fullName', 'email']
    });

    // Create a map for quick lookup
    const profileMap = new Map(profiles.map(p => [p.userId, p]));

    const formattedMembers = members.map(member => {
      const profile = profileMap.get(member.userId);
      return {
        userId: member.userId,
        email: profile?.email || '',
        fullName: profile?.fullName || profile?.email?.split('@')[0] || 'Unknown User',
        role: member.role,
        ownershipPercentage: parseFloat(member.ownershipPercentage || 0),
        joinedAt: member.joinedAt
      };
    });

    logger.info('Internal API: group members retrieved', { 
      groupId, 
      memberCount: formattedMembers.length 
    });

    return res.json({ 
      success: true, 
      data: {
        groupId: group.id,
        groupName: group.groupName,
        vehicleId: group.vehicleId,
        isActive: group.isActive,
        members: formattedMembers
      }
    });
  } catch (error) {
    logger.error('Internal API: failed to fetch group members', { 
      groupId: req.params.groupId,
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
});

// Internal membership check
// Accepts either a static INTERNAL_SERVICE_TOKEN or a service JWT (signed with JWT_SECRET)
router.get('/groups/:groupId/members/:userId', validateInternalToken, async (req, res, next) => {
  try {
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
