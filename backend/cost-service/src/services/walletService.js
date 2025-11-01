// src/services/walletService.js
import { 
  walletRepository,
  eventService 
} from '../repositories/index.js';
import { AppError, logger } from '@ev-coownership/shared';

export class WalletService {
  async getUserWallet(userId) {
    try {
      const wallet = await walletRepository.findByUserId(userId);
      
      // Publish event for analytics
      await eventService.publishWalletBalanceUpdated({
        walletId: wallet.id,
        userId,
        balance: wallet.balance,
        currency: wallet.currency
      });

      return wallet;
    } catch (error) {
      logger.error('WalletService.getUserWallet - Error:', error);
      throw error;
    }
  }

  async depositToWallet(userId, amount, description = 'Wallet deposit') {
    const transaction = await db.sequelize.transaction();
    
    try {
      const wallet = await walletRepository.findByUserId(userId);
      
      // Update balance
      const updatedWallet = await walletRepository.updateBalance(
        wallet.id, 
        amount, 
        transaction
      );

      // Create transaction record
      const walletTransaction = await walletRepository.createTransaction({
        walletId: wallet.id,
        type: 'deposit',
        amount,
        description
      }, transaction);

      await transaction.commit();

      // Publish events
      await eventService.publishWalletDeposit({
        walletId: wallet.id,
        userId,
        amount,
        transactionId: walletTransaction.id,
        newBalance: updatedWallet.balance
      });

      await eventService.publishWalletBalanceUpdated({
        walletId: wallet.id,
        userId,
        balance: updatedWallet.balance,
        currency: updatedWallet.currency
      });

      logger.info('Wallet deposit successful', { userId, amount, walletId: wallet.id });
      return {
        wallet: updatedWallet,
        transaction: walletTransaction
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('WalletService.depositToWallet - Error:', error);
      throw error;
    }
  }

  async withdrawFromWallet(userId, amount, description = 'Wallet withdrawal') {
    const transaction = await db.sequelize.transaction();
    
    try {
      const wallet = await walletRepository.findByUserId(userId);
      
      // Update balance (negative amount for withdrawal)
      const updatedWallet = await walletRepository.updateBalance(
        wallet.id, 
        -amount, 
        transaction
      );

      // Create transaction record
      const walletTransaction = await walletRepository.createTransaction({
        walletId: wallet.id,
        type: 'withdraw',
        amount,
        description
      }, transaction);

      await transaction.commit();

      // Publish events
      await eventService.publishWalletWithdrawal({
        walletId: wallet.id,
        userId,
        amount,
        transactionId: walletTransaction.id,
        newBalance: updatedWallet.balance
      });

      await eventService.publishWalletBalanceUpdated({
        walletId: wallet.id,
        userId,
        balance: updatedWallet.balance,
        currency: updatedWallet.currency
      });

      logger.info('Wallet withdrawal successful', { userId, amount, walletId: wallet.id });
      return {
        wallet: updatedWallet,
        transaction: walletTransaction
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('WalletService.withdrawFromWallet - Error:', error);
      throw error;
    }
  }

  async getWalletTransactions(userId, filters) {
    try {
      const wallet = await walletRepository.findByUserId(userId);
      return await walletRepository.getTransactions(wallet.id, filters);
    } catch (error) {
      logger.error('WalletService.getWalletTransactions - Error:', error);
      throw error;
    }
  }

  async transferToGroupWallet(userId, groupId, amount, description) {
    // This would involve both user wallet and group wallet operations
    // Implementation depends on business requirements
    throw new AppError('Not implemented yet', 501, 'NOT_IMPLEMENTED');
  }
}

export default new WalletService();