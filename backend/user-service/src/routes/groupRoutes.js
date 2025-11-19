// src/routes/groupRoutes.js
import express from 'express';
import groupController from '../controllers/groupController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { groupValidators } from '../validators/groupValidators.js';
import { groupAccess } from '../middleware/groupAccess.js';

const router = express.Router();

router.use(authenticate);

// Group management routes
router.post('/', validate(groupValidators.createGroup), groupController.createGroup);
router.get('/', groupController.getUserGroups);
router.get('/active', groupController.getActiveGroup);
router.get('/:groupId', groupAccess, groupController.getGroupById);
router.get('/:groupId/count', groupController.getGroupMemberCount);
router.put('/:groupId', groupAccess, validate(groupValidators.updateGroup), groupController.updateGroup);
router.delete('/:groupId', groupAccess, groupController.deleteGroup);

// Group members routes
router.post('/:groupId/members', groupAccess, validate(groupValidators.addMember), groupController.addMember);
router.get('/:groupId/members', groupAccess, groupController.getGroupMembers);
router.delete('/:groupId/members/:userId', groupAccess, groupController.removeMember);
router.put('/:groupId/members/:userId/ownership', groupAccess, validate(groupValidators.updateOwnership), groupController.updateOwnership);
router.put('/:groupId/members/:userId/role', groupAccess, validate(groupValidators.updateRole), groupController.updateMemberRole);

// Group rules route
router.put('/:groupId/rules', groupAccess, validate(groupValidators.updateRules), groupController.updateGroupRules);

export default router;