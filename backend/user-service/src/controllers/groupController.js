import groupService from '../services/groupService.js';
import { 
  successResponse, 
  logger 
} from '@ev-coownership/shared';

export class GroupController {
  async createGroup(req, res, next) {
    try {
      const createdBy = req.user.id;
      const groupData = { ...req.body, createdBy };

      const group = await groupService.createGroup(groupData);

      logger.info('Group created successfully', { 
        groupId: group.id, 
        createdBy 
      });

      return successResponse(res, 'Group created successfully', group, 201);
    } catch (error) {
      logger.error('Failed to create group', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getUserGroups(req, res, next) {
    try {
      const userId = req.user.id;
      const groups = await groupService.getUserGroups(userId);

      logger.info('User groups retrieved successfully', { userId });

      return successResponse(res, 'Groups retrieved successfully', groups);
    } catch (error) {
      logger.error('Failed to get user groups', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getGroupById(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const group = await groupService.getGroupById(groupId, userId);

      logger.info('Group retrieved successfully', { groupId, userId });

      return successResponse(res, 'Group retrieved successfully', group);
    } catch (error) {
      logger.error('Failed to get group by ID', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async updateGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const group = await groupService.updateGroup(groupId, userId, updateData);

      logger.info('Group updated successfully', { groupId, userId });

      return successResponse(res, 'Group updated successfully', group);
    } catch (error) {
      logger.error('Failed to update group', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async deleteGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      await groupService.deleteGroup(groupId, userId);

      logger.info('Group deleted successfully', { groupId, userId });

      return successResponse(res, 'Group deleted successfully');
    } catch (error) {
      logger.error('Failed to delete group', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async addMember(req, res, next) {
    try {
      const { groupId } = req.params;
      const adminId = req.user.id;
      const memberData = req.body;

      const member = await groupService.addMember(groupId, adminId, memberData);

      logger.info('Member added to group successfully', { 
        groupId, 
        adminId, 
        memberId: memberData.userId 
      });

      return successResponse(res, 'Member added successfully', member, 201);
    } catch (error) {
      logger.error('Failed to add member to group', { 
        error: error.message, 
        groupId: req.params.groupId,
        adminId: req.user?.id 
      });
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      const { groupId, userId: targetUserId } = req.params;
      const adminId = req.user.id;

      await groupService.removeMember(groupId, targetUserId, adminId);

      logger.info('Member removed from group successfully', { 
        groupId, 
        adminId, 
        targetUserId 
      });

      return successResponse(res, 'Member removed successfully');
    } catch (error) {
      logger.error('Failed to remove member from group', { 
        error: error.message, 
        groupId: req.params.groupId,
        targetUserId: req.params.userId,
        adminId: req.user?.id 
      });
      next(error);
    }
  }

  async updateOwnership(req, res, next) {
    try {
      const { groupId, userId: targetUserId } = req.params;
      const adminId = req.user.id;
      const { ownershipPercentage } = req.body;

      const member = await groupService.updateOwnership(groupId, targetUserId, adminId, ownershipPercentage);

      logger.info('Ownership percentage updated successfully', { 
        groupId, 
        adminId, 
        targetUserId,
        ownershipPercentage 
      });

      return successResponse(res, 'Ownership percentage updated successfully', member);
    } catch (error) {
      logger.error('Failed to update ownership percentage', { 
        error: error.message, 
        groupId: req.params.groupId,
        targetUserId: req.params.userId,
        adminId: req.user?.id 
      });
      next(error);
    }
  }

  async getGroupMembers(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const members = await groupService.getGroupMembers(groupId, userId);

      logger.info('Group members retrieved successfully', { groupId, userId });

      return successResponse(res, 'Members retrieved successfully', members);
    } catch (error) {
      logger.error('Failed to get group members', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new GroupController();