import db from '../models/index.js';
import { 
  logger, 
  AppError
} from '@ev-coownership/shared';
import eventService from './eventService.js';

export class FundService {
  async deposit(groupId, userId, amount, description) {
    const transaction = await db.sequelize.transaction();

    try {
      const membership = await db.GroupMember.findOne({
        where: {
          groupId,
          userId,
          isActive: true
        },
        transaction
      });

      if (!membership) {
        throw new AppError('You are not a member of this group', 403, 'ACCESS_DENIED');
      }

      const group = await db.CoOwnershipGroup.findByPk(groupId, { transaction });
      if (!group) {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }

      if (amount <= 0) {
        throw new AppError('Deposit amount must be greater than 0', 400, 'INVALID_AMOUNT');
      }

      const fundTransaction = await db.GroupFundTransaction.create({
        groupId,
        transactionType: 'deposit',
        amount,
        description: description || `Deposit by user ${userId}`,
        createdBy: userId
      }, { transaction });

      await group.increment('groupFundBalance', { by: amount, transaction });

      await transaction.commit();

      eventService.publishFundDeposit({
        groupId,
        userId,
        amount,
        transactionId: fundTransaction.id,
        newBalance: parseFloat(group.groupFundBalance) + parseFloat(amount),
        description: fundTransaction.description
      }).catch(error => logger.error('Failed to publish fund deposit event', { error: error.message, groupId, userId }));

      logger.info('Fund deposited successfully', { 
        groupId, 
        userId, 
        amount,
        transactionId: fundTransaction.id 
      });

      return fundTransaction;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to deposit fund', { error: error.message, groupId, userId });
      throw error;
    }
  }

  async withdraw(groupId, userId, amount, description) {
    const transaction = await db.sequelize.transaction();

    try {
      const membership = await db.GroupMember.findOne({
        where: {
          groupId,
          userId,
          role: 'admin',
          isActive: true
        },
        transaction
      });

      if (!membership) {
        throw new AppError('Only group admin can withdraw funds', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      const group = await db.CoOwnershipGroup.findByPk(groupId, { transaction });
      if (!group) {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }

      if (amount <= 0) {
        throw new AppError('Withdrawal amount must be greater than 0', 400, 'INVALID_AMOUNT');
      }

      if (parseFloat(group.groupFundBalance) < amount) {
        throw new AppError('Insufficient funds', 400, 'INSUFFICIENT_FUNDS');
      }

      const fundTransaction = await db.GroupFundTransaction.create({
        groupId,
        transactionType: 'withdrawal',
        amount,
        description: description || `Withdrawal by admin ${userId}`,
        createdBy: userId
      }, { transaction });

      await group.decrement('groupFundBalance', { by: amount, transaction });

      await transaction.commit();

      eventService.publishFundWithdrawal({
        groupId,
        userId,
        amount,
        transactionId: fundTransaction.id,
        newBalance: parseFloat(group.groupFundBalance) - parseFloat(amount),
        description: fundTransaction.description
      }).catch(error => logger.error('Failed to publish fund withdrawal event', { error: error.message, groupId, userId }));

      logger.info('Fund withdrawn successfully', { 
        groupId, 
        userId, 
        amount,
        transactionId: fundTransaction.id 
      });

      return fundTransaction;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to withdraw fund', { error: error.message, groupId, userId });
      throw error;
    }
  }

  async getBalance(groupId, userId) {
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

      const group = await db.CoOwnershipGroup.findByPk(groupId, {
        attributes: ['id', 'groupFundBalance', 'groupName']
      });

      if (!group) {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }

      logger.debug('Fund balance retrieved', { groupId, userId, balance: group.groupFundBalance });

      return {
        groupId,
        groupName: group.groupName,
        balance: group.groupFundBalance,
        currency: 'VND'
      };
    } catch (error) {
      logger.error('Failed to get fund balance', { error: error.message, groupId, userId });
      throw error;
    }
  }

  async getTransactions(groupId, userId) {
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

      const transactions = await db.GroupFundTransaction.findAll({
        where: { groupId },
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      logger.debug('Fund transactions retrieved', { groupId, userId, count: transactions.length });

      return transactions;
    } catch (error) {
      logger.error('Failed to get fund transactions', { error: error.message, groupId, userId });
      throw error;
    }
  }

  async getSummary(groupId, userId) {
    try {
      const membership = await db.GroupMember.findOne({
        where: { groupId, userId, isActive: true }
      });

      if (!membership) {
        throw new AppError('You are not a member of this group', 403, 'ACCESS_DENIED');
      }

      const group = await db.CoOwnershipGroup.findByPk(groupId);
      if (!group) {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }

      // Get all transactions
      const transactions = await db.GroupFundTransaction.findAll({
        where: { groupId },
        order: [['createdAt', 'DESC']]
      });

      // Calculate totals
      const totalContributions = transactions
        .filter(t => t.transactionType === 'deposit')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalExpenses = transactions
        .filter(t => t.transactionType === 'withdrawal')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      // Get members with their contributions
      const members = await db.GroupMember.findAll({
        where: { groupId, isActive: true },
        attributes: ['userId', 'ownershipPercentage']
      });

      const memberContributions = await Promise.all(
        members.map(async (member) => {
          const memberTransactions = await db.GroupFundTransaction.findAll({
            where: { 
              groupId, 
              createdBy: member.userId,
              transactionType: 'deposit'
            }
          });

          const contribution = memberTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

          return {
            userId: member.userId,
            ownershipPercentage: member.ownershipPercentage,
            contribution,
            status: contribution > 0 ? 'paid' : 'pending'
          };
        })
      );

      return {
        balance: parseFloat(group.groupFundBalance),
        totalContributions,
        totalExpenses,
        monthlyContribution: totalContributions / Math.max(1, transactions.filter(t => t.transactionType === 'deposit').length),
        transactions: transactions.slice(0, 10),
        members: memberContributions
      };
    } catch (error) {
      logger.error('Failed to get fund summary', { error: error.message, groupId, userId });
      throw error;
    }
  }
}

export default new FundService();