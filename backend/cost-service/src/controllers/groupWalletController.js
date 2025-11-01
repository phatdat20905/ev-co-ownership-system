// src/controllers/groupWalletController.js
import groupWalletService from '../services/groupWalletService.js';
import { successResponse, logger } from '@ev-coownership/shared';

export class GroupWalletController {
  async getGroupWallet(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const wallet = await groupWalletService.getGroupWallet(groupId);

      logger.info('Group wallet retrieved successfully', { 
        groupId, 
        userId,
        balance: wallet.balance 
      });

      return successResponse(res, 'Group wallet retrieved successfully', wallet);
    } catch (error) {
      logger.error('Failed to get group wallet', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async deposit(req, res, next) {
    try {
      const { groupId } = req.params;
      const { amount, description } = req.body;
      const userId = req.user.id;

      const result = await groupWalletService.depositToGroupWallet(
        groupId, 
        amount, 
        description, 
        userId
      );

      logger.info('Group wallet deposit successful', { 
        groupId, 
        userId, 
        amount,
        newBalance: result.wallet.balance 
      });

      return successResponse(res, 'Deposit to group wallet successful', result);
    } catch (error) {
      logger.error('Failed to deposit to group wallet', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id,
        amount: req.body.amount 
      });
      next(error);
    }
  }

  async withdraw(req, res, next) {
    try {
      const { groupId } = req.params;
      const { amount, description } = req.body;
      const userId = req.user.id;

      const result = await groupWalletService.withdrawFromGroupWallet(
        groupId, 
        amount, 
        description, 
        userId
      );

      logger.info('Group wallet withdrawal successful', { 
        groupId, 
        userId, 
        amount,
        newBalance: result.wallet.balance 
      });

      return successResponse(res, 'Withdrawal from group wallet successful', result);
    } catch (error) {
      logger.error('Failed to withdraw from group wallet', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id,
        amount: req.body.amount 
      });
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const { groupId } = req.params;
      const filters = req.query;
      const userId = req.user.id;

      const result = await groupWalletService.getGroupWalletTransactions(groupId, filters);

      logger.info('Group wallet transactions retrieved successfully', { 
        groupId, 
        userId,
        count: result.transactions.length 
      });

      return successResponse(res, 'Group wallet transactions retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get group wallet transactions', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async payCost(req, res, next) {
    try {
      const { groupId } = req.params;
      const { costId, amount, description } = req.body;
      const userId = req.user.id;

      const result = await groupWalletService.payCostFromGroupWallet(
        groupId, 
        costId, 
        amount, 
        description, 
        userId
      );

      logger.info('Cost paid from group wallet successfully', { 
        groupId, 
        costId, 
        userId, 
        amount 
      });

      return successResponse(res, 'Cost paid from group wallet successfully', result);
    } catch (error) {
      logger.error('Failed to pay cost from group wallet', { 
        error: error.message, 
        groupId: req.params.groupId,
        costId: req.body.costId,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new GroupWalletController();