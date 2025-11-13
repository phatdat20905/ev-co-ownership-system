import db from '../models/index.js';
import { 
  logger, 
  AppError
} from '@ev-coownership/shared';
import eventService from './eventService.js';

export class GroupService {
  async createGroup(groupData) {
    const transaction = await db.sequelize.transaction();

    try {
      const group = await db.CoOwnershipGroup.create({
        groupName: groupData.groupName,
        description: groupData.description,
        createdBy: groupData.createdBy
      }, { transaction });

      await db.GroupMember.create({
        groupId: group.id,
        userId: groupData.createdBy,
        ownershipPercentage: 100,
        role: 'admin'
      }, { transaction });

      await transaction.commit();

      eventService.publishGroupCreated({
        groupId: group.id,
        createdBy: groupData.createdBy,
        groupName: group.groupName
      }).catch(error => logger.error('Failed to publish group created event', { error: error.message, groupId: group.id }));

      logger.info('Group created successfully', { 
        groupId: group.id, 
        createdBy: groupData.createdBy 
      });

      return group;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to create group', { error: error.message, createdBy: groupData.createdBy });
      throw error;
    }
  }

  async getUserGroups(userId) {
    try {
      const groups = await db.CoOwnershipGroup.findAll({
        include: [{
          model: db.GroupMember,
          as: 'members',
          where: { 
            userId,
            isActive: true 
          },
          attributes: ['role', 'ownershipPercentage', 'joinedAt']
        }],
        where: { isActive: true }
      });

      logger.debug('User groups retrieved', { userId, count: groups.length });

      return groups;
    } catch (error) {
      logger.error('Failed to get user groups', { error: error.message, userId });
      throw error;
    }
  }

  async getGroupById(groupId, userId) {
    try {
      const userMembership = await db.GroupMember.findOne({
        where: { 
          groupId, 
          userId,
          isActive: true 
        }
      });

      if (!userMembership) {
        throw new AppError('You are not a member of this group', 403, 'ACCESS_DENIED');
      }

      const group = await db.CoOwnershipGroup.findByPk(groupId, {
        include: [{
          model: db.GroupMember,
          as: 'members',
          where: { isActive: true },
          include: [{
            model: db.UserProfile,
            as: 'userProfile',
            attributes: ['id', 'fullName', 'avatarUrl']
          }]
        }]
      });

      if (!group) {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }

      logger.debug('Group retrieved by ID', { groupId, userId });

      return group;
    } catch (error) {
      logger.error('Failed to get group by ID', { error: error.message, groupId, userId });
      throw error;
    }
  }

  async addMember(groupId, adminId, memberData) {
    const transaction = await db.sequelize.transaction();

    try {
      const adminMember = await db.GroupMember.findOne({
        where: { 
          groupId, 
          userId: adminId, 
          role: 'admin',
          isActive: true 
        },
        transaction
      });

      if (!adminMember) {
        throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      const existingMember = await db.GroupMember.findOne({
        where: { 
          groupId, 
          userId: memberData.userId,
          isActive: true 
        },
        transaction
      });

      if (existingMember) {
        throw new AppError('User is already a member of this group', 400, 'MEMBER_ALREADY_EXISTS');
      }

      const member = await db.GroupMember.create({
        groupId,
        userId: memberData.userId,
        ownershipPercentage: memberData.ownershipPercentage,
        role: memberData.role || 'member'
      }, { transaction });

      await transaction.commit();

      eventService.publishMemberAdded({
        groupId,
        userId: memberData.userId,
        addedBy: adminId,
        role: memberData.role,
        ownershipPercentage: memberData.ownershipPercentage
      }).catch(error => logger.error('Failed to publish member added event', { error: error.message, groupId, userId: memberData.userId }));

      logger.info('Member added to group', { 
        groupId, 
        userId: memberData.userId, 
        addedBy: adminId 
      });

      return member;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to add member to group', { error: error.message, groupId, adminId });
      throw error;
    }
  }

  async updateOwnership(groupId, targetUserId, adminId, newPercentage) {
    const transaction = await db.sequelize.transaction();

    try {
      const adminMember = await db.GroupMember.findOne({
        where: { 
          groupId, 
          userId: adminId, 
          role: 'admin',
          isActive: true 
        },
        transaction
      });

      if (!adminMember) {
        throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      const allMembers = await db.GroupMember.findAll({
        where: { 
          groupId,
          isActive: true 
        },
        transaction
      });

      const currentMember = allMembers.find(m => m.userId === targetUserId);
      if (!currentMember) {
        throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND');
      }

      const currentTotal = allMembers.reduce((sum, member) => {
        if (member.userId === targetUserId) {
          return sum + parseFloat(newPercentage);
        }
        return sum + parseFloat(member.ownershipPercentage);
      }, 0);

      if (Math.abs(currentTotal - 100) > 0.01) {
        throw new AppError(
          `Total ownership percentage must be 100%. Current total: ${currentTotal}%`,
          400,
          'OWNERSHIP_TOTAL_INVALID'
        );
      }

      currentMember.ownershipPercentage = newPercentage;
      await currentMember.save({ transaction });

      await transaction.commit();

      eventService.publishOwnershipUpdated({
        groupId,
        userId: targetUserId,
        newPercentage,
        updatedBy: adminId
      }).catch(error => logger.error('Failed to publish ownership updated event', { error: error.message, groupId, targetUserId }));

      logger.info('Ownership percentage updated', { 
        groupId, 
        targetUserId, 
        newPercentage,
        updatedBy: adminId 
      });

      return currentMember;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to update ownership percentage', { error: error.message, groupId, targetUserId });
      throw error;
    }
  }

  async removeMember(groupId, targetUserId, adminId) {
    const transaction = await db.sequelize.transaction();

    try {
      const adminMember = await db.GroupMember.findOne({
        where: { 
          groupId, 
          userId: adminId, 
          role: 'admin',
          isActive: true 
        },
        transaction
      });

      if (!adminMember) {
        throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      const targetMember = await db.GroupMember.findOne({
        where: { 
          groupId, 
          userId: targetUserId,
          isActive: true 
        },
        transaction
      });

      if (!targetMember) {
        throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND');
      }

      await targetMember.update({
        isActive: false,
        leftAt: new Date()
      }, { transaction });

      await transaction.commit();

      eventService.publishMemberRemoved({
        groupId,
        userId: targetUserId,
        removedBy: adminId
      }).catch(error => logger.error('Failed to publish member removed event', { error: error.message, groupId, targetUserId }));

      logger.info('Member removed from group', { 
        groupId, 
        targetUserId, 
        removedBy: adminId 
      });

      return { success: true };
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to remove member from group', { error: error.message, groupId, targetUserId });
      throw error;
    }
  }

  async getGroupMembers(groupId, userId) {
    try {
      const userMembership = await db.GroupMember.findOne({
        where: { 
          groupId, 
          userId,
          isActive: true 
        }
      });

      if (!userMembership) {
        throw new AppError('You are not a member of this group', 403, 'ACCESS_DENIED');
      }

      const members = await db.GroupMember.findAll({
        where: { 
          groupId,
          isActive: true 
        },
        include: [{
          model: db.UserProfile,
          as: 'userProfile',
          attributes: ['id', 'fullName', 'avatarUrl']
        }],
        order: [['role', 'DESC'], ['joinedAt', 'ASC']]
      });

      logger.debug('Group members retrieved', { groupId, userId, count: members.length });

      return members;
    } catch (error) {
      logger.error('Failed to get group members', { error: error.message, groupId, userId });
      throw error;
    }
  }

  async updateGroup(groupId, userId, updateData) {
    const transaction = await db.sequelize.transaction();

    try {
      const adminMember = await db.GroupMember.findOne({
        where: { 
          groupId, 
          userId, 
          role: 'admin',
          isActive: true 
        },
        transaction
      });

      if (!adminMember) {
        throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      const group = await db.CoOwnershipGroup.findByPk(groupId, { transaction });
      if (!group) {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }

      await group.update(updateData, { transaction });
      await transaction.commit();

      eventService.publishGroupUpdated({
        groupId,
        updatedBy: userId,
        updates: updateData
      }).catch(error => logger.error('Failed to publish group updated event', { error: error.message, groupId }));

      logger.info('Group updated', { groupId, updatedBy: userId });

      return group;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to update group', { error: error.message, groupId, userId });
      throw error;
    }
  }

  async deleteGroup(groupId, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const adminMember = await db.GroupMember.findOne({
        where: { 
          groupId, 
          userId, 
          role: 'admin',
          isActive: true 
        },
        transaction
      });

      if (!adminMember) {
        throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      const group = await db.CoOwnershipGroup.findByPk(groupId, { transaction });
      if (!group) {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }

      await group.update({ isActive: false }, { transaction });
      await db.GroupMember.update(
        { isActive: false, leftAt: new Date() },
        { where: { groupId }, transaction }
      );

      await transaction.commit();

      eventService.publishGroupDeleted({
        groupId,
        deletedBy: userId
      }).catch(error => logger.error('Failed to publish group deleted event', { error: error.message, groupId }));

      logger.info('Group deleted', { groupId, deletedBy: userId });

      return { success: true };
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to delete group', { error: error.message, groupId, userId });
      throw error;
    }
  }
}

export default new GroupService();