// src/controllers/walletController.js
import walletService from '../services/walletService.js';
import { successResponse, logger } from '@ev-coownership/shared';

export class WalletController {
  async getWallet(req, res, next) {
    try {
      const userId = req.user.id;

      const wallet = await walletService.getUserWallet(userId);

      logger.info('Wallet retrieved successfully', { userId, balance: wallet.balance });

      return successResponse(res, 'Wallet retrieved successfully', wallet);
    } catch (error) {
      logger.error('Failed to get wallet', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async deposit(req, res, next) {
    try {
      const userId = req.user.id;
      const { amount, description } = req.body;

      const result = await walletService.depositToWallet(userId, amount, description);

      logger.info('Wallet deposit successful', { 
        userId, 
        amount,
        newBalance: result.wallet.balance 
      });

      return successResponse(res, 'Deposit successful', result);
    } catch (error) {
      logger.error('Failed to deposit to wallet', { 
        error: error.message, 
        userId: req.user?.id,
        amount: req.body.amount 
      });
      next(error);
    }
  }

  async withdraw(req, res, next) {
    try {
      const userId = req.user.id;
      const { amount, description } = req.body;

      const result = await walletService.withdrawFromWallet(userId, amount, description);

      logger.info('Wallet withdrawal successful', { 
        userId, 
        amount,
        newBalance: result.wallet.balance 
      });

      return successResponse(res, 'Withdrawal successful', result);
    } catch (error) {
      logger.error('Failed to withdraw from wallet', { 
        error: error.message, 
        userId: req.user?.id,
        amount: req.body.amount 
      });
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = req.query;

      const result = await walletService.getWalletTransactions(userId, filters);

      logger.info('Wallet transactions retrieved successfully', { 
        userId, 
        count: result.transactions.length 
      });

      return successResponse(res, 'Transactions retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get wallet transactions', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new WalletController();