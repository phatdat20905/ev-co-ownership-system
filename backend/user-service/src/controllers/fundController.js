import fundService from '../services/fundService.js';
import { 
  successResponse, 
  logger 
} from '@ev-coownership/shared';

export class FundController {
  async deposit(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;
      const { amount, description } = req.body;

      const transaction = await fundService.deposit(groupId, userId, amount, description);

      logger.info('Fund deposited successfully', { 
        groupId, 
        userId, 
        amount,
        transactionId: transaction.id 
      });

      return successResponse(res, 'Fund deposited successfully', transaction, 201);
    } catch (error) {
      logger.error('Failed to deposit fund', { 
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
      const userId = req.user.id;
      const { amount, description } = req.body;

      const transaction = await fundService.withdraw(groupId, userId, amount, description);

      logger.info('Fund withdrawn successfully', { 
        groupId, 
        userId, 
        amount,
        transactionId: transaction.id 
      });

      return successResponse(res, 'Fund withdrawn successfully', transaction, 201);
    } catch (error) {
      logger.error('Failed to withdraw fund', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id,
        amount: req.body.amount 
      });
      next(error);
    }
  }

  async getBalance(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const balance = await fundService.getBalance(groupId, userId);

      logger.info('Fund balance retrieved successfully', { groupId, userId });

      return successResponse(res, 'Balance retrieved successfully', balance);
    } catch (error) {
      logger.error('Failed to get fund balance', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const transactions = await fundService.getTransactions(groupId, userId);

      logger.info('Fund transactions retrieved successfully', { groupId, userId });

      return successResponse(res, 'Transactions retrieved successfully', transactions);
    } catch (error) {
      logger.error('Failed to get fund transactions', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const summary = await fundService.getSummary(groupId, userId);

      logger.info('Fund summary retrieved successfully', { groupId, userId });

      return successResponse(res, 'Summary retrieved successfully', summary);
    } catch (error) {
      logger.error('Failed to get fund summary', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new FundController();