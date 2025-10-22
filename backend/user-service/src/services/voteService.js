import db from '../models/index.js';
import { 
  logger, 
  AppError
} from '@ev-coownership/shared';
import eventService from './eventService.js';

export class VoteService {
  async createVote(voteData) {
    const transaction = await db.sequelize.transaction();

    try {
      const membership = await db.GroupMember.findOne({
        where: {
          groupId: voteData.groupId,
          userId: voteData.createdBy,
          isActive: true
        },
        transaction
      });

      if (!membership) {
        throw new AppError('You are not a member of this group', 403, 'ACCESS_DENIED');
      }

      const vote = await db.GroupVote.create({
        groupId: voteData.groupId,
        title: voteData.title,
        description: voteData.description,
        voteType: voteData.voteType,
        deadline: voteData.deadline,
        createdBy: voteData.createdBy
      }, { transaction });

      for (const optionText of voteData.options) {
        await db.VoteOption.create({
          voteId: vote.id,
          optionText
        }, { transaction });
      }

      await transaction.commit();

      eventService.publishVoteCreated({
        voteId: vote.id,
        groupId: voteData.groupId,
        createdBy: voteData.createdBy,
        voteType: voteData.voteType,
        title: voteData.title,
        deadline: voteData.deadline
      }).catch(error => logger.error('Failed to publish vote created event', { error: error.message, voteId: vote.id }));

      logger.info('Vote created successfully', { 
        voteId: vote.id, 
        groupId: voteData.groupId,
        createdBy: voteData.createdBy 
      });

      return vote;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to create vote', { error: error.message, createdBy: voteData.createdBy });
      throw error;
    }
  }

  async getGroupVotes(groupId, userId) {
    try {
      const membership = await db.GroupMember.findOne({
        where: {
          groupId,
          userId,
          isActive: true
        }
      });

      if (!membership) {
        throw new AppError('You are not a member of this group', 403, 'ACCESS_DENIED');
      }

      const votes = await db.GroupVote.findAll({
        where: { groupId },
        include: [{
          model: db.VoteOption,
          as: 'options',
          attributes: ['id', 'optionText', 'voteCount']
        }],
        order: [['createdAt', 'DESC']]
      });

      logger.debug('Group votes retrieved', { groupId, userId, count: votes.length });

      return votes;
    } catch (error) {
      logger.error('Failed to get group votes', { error: error.message, groupId, userId });
      throw error;
    }
  }

  async getVoteById(voteId, userId) {
    try {
      const vote = await db.GroupVote.findByPk(voteId, {
        include: [
          {
            model: db.VoteOption,
            as: 'options',
            attributes: ['id', 'optionText', 'voteCount']
          },
          {
            model: db.CoOwnershipGroup,
            as: 'group',
            attributes: ['id', 'groupName']
          }
        ]
      });

      if (!vote) {
        throw new AppError('Vote not found', 404, 'VOTE_NOT_FOUND');
      }

      const membership = await db.GroupMember.findOne({
        where: {
          groupId: vote.groupId,
          userId,
          isActive: true
        }
      });

      if (!membership) {
        throw new AppError('You are not a member of this group', 403, 'ACCESS_DENIED');
      }

      logger.debug('Vote retrieved by ID', { voteId, userId });

      return vote;
    } catch (error) {
      logger.error('Failed to get vote by ID', { error: error.message, voteId, userId });
      throw error;
    }
  }

  async castVote(voteId, userId, optionId) {
    const transaction = await db.sequelize.transaction();

    try {
      const vote = await db.GroupVote.findByPk(voteId, {
        include: ['options'],
        transaction
      });

      if (!vote) {
        throw new AppError('Vote not found', 404, 'VOTE_NOT_FOUND');
      }

      if (vote.status !== 'open') {
        throw new AppError('Vote is already closed', 400, 'VOTE_ALREADY_CLOSED');
      }

      if (vote.deadline && new Date() > vote.deadline) {
        throw new AppError('Vote deadline has passed', 400, 'VOTE_DEADLINE_PASSED');
      }

      const membership = await db.GroupMember.findOne({
        where: {
          groupId: vote.groupId,
          userId,
          isActive: true
        },
        transaction
      });

      if (!membership) {
        throw new AppError('You are not a member of this group', 403, 'ACCESS_DENIED');
      }

      const existingVote = await db.UserVote.findOne({
        where: { voteId, userId },
        transaction
      });

      if (existingVote) {
        throw new AppError('You have already voted in this poll', 400, 'ALREADY_VOTED');
      }

      const option = vote.options.find(opt => opt.id === optionId);
      if (!option) {
        throw new AppError('Invalid vote option', 400, 'INVALID_OPTION');
      }

      await db.UserVote.create({
        voteId,
        userId,
        optionId
      }, { transaction });

      await db.VoteOption.increment('voteCount', {
        by: 1,
        where: { id: optionId },
        transaction
      });

      await transaction.commit();

      eventService.publishVoteCast({
        voteId,
        userId,
        optionId,
        groupId: vote.groupId,
        voteType: vote.voteType
      }).catch(error => logger.error('Failed to publish vote cast event', { error: error.message, voteId, userId }));

      logger.info('Vote cast successfully', { voteId, userId, optionId });

      return { success: true, message: 'Vote cast successfully' };
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to cast vote', { error: error.message, voteId, userId });
      throw error;
    }
  }

  async closeVote(voteId, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const vote = await db.GroupVote.findByPk(voteId, { transaction });

      if (!vote) {
        throw new AppError('Vote not found', 404, 'VOTE_NOT_FOUND');
      }

      const membership = await db.GroupMember.findOne({
        where: {
          groupId: vote.groupId,
          userId,
          role: 'admin',
          isActive: true
        },
        transaction
      });

      if (!membership) {
        throw new AppError('Only group admin can close votes', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      if (vote.status !== 'open') {
        throw new AppError('Vote is already closed', 400, 'VOTE_ALREADY_CLOSED');
      }

      await vote.update({
        status: 'closed',
        closedAt: new Date()
      }, { transaction });

      await transaction.commit();

      eventService.publishVoteClosed({
        voteId,
        closedBy: userId,
        groupId: vote.groupId,
        voteType: vote.voteType,
        closedAt: new Date().toISOString()
      }).catch(error => logger.error('Failed to publish vote closed event', { error: error.message, voteId }));

      logger.info('Vote closed successfully', { voteId, closedBy: userId });

      return vote;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to close vote', { error: error.message, voteId, userId });
      throw error;
    }
  }
}

export default new VoteService();