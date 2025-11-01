// src/services/groupWalletService.js
import { 
  groupWalletRepository,
  eventService 
} from '../repositories/index.js';
import { AppError, logger } from '@ev-coownership/shared';

export class GroupWalletService {
  async getGroupWallet(groupId) {
    try {
      const wallet = await groupWalletRepository.findByGroupId(groupId);
      
      // Publish event for analytics
      await eventService.publishWalletBalanceUpdated({
        walletId: wallet.id,
        groupId,
        balance: wallet.balance,
        currency: wallet.currency
      });

      return wallet;
    } catch (error) {
      logger.error('GroupWalletService.getGroupWallet - Error:', error);
      throw error;
    }
  }

  async depositToGroupWallet(groupId, amount, description, createdBy) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const wallet = await groupWalletRepository.findByGroupId(groupId);
      
      // Update balance
      const updatedWallet = await groupWalletRepository.updateBalance(
        wallet.id, 
        amount, 
        transaction
      );

      // Create transaction record
      const walletTransaction = await groupWalletRepository.createTransaction({
        walletId: wallet.id,
        type: 'deposit',
        amount,
        description,
        createdBy
      }, transaction);

      await transaction.commit();

      // Publish events
      await eventService.publishFundDeposit({
        groupId,
        createdBy,
        amount,
        transactionId: walletTransaction.id,
        newBalance: updatedWallet.balance,
        description
      });

      logger.info('Group wallet deposit successful', { groupId, amount, walletId: wallet.id });
      return {
        wallet: updatedWallet,
        transaction: walletTransaction
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('GroupWalletService.depositToGroupWallet - Error:', error);
      throw error;
    }
  }

  async withdrawFromGroupWallet(groupId, amount, description, createdBy) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const wallet = await groupWalletRepository.findByGroupId(groupId);
      
      // Update balance (negative amount for withdrawal)
      const updatedWallet = await groupWalletRepository.updateBalance(
        wallet.id, 
        -amount, 
        transaction
      );

      // Create transaction record
      const walletTransaction = await groupWalletRepository.createTransaction({
        walletId: wallet.id,
        type: 'withdraw',
        amount,
        description,
        createdBy
      }, transaction);

      await transaction.commit();

      // Publish events
      await eventService.publishFundWithdrawal({
        groupId,
        createdBy,
        amount,
        transactionId: walletTransaction.id,
        newBalance: updatedWallet.balance,
        description
      });

      logger.info('Group wallet withdrawal successful', { groupId, amount, walletId: wallet.id });
      return {
        wallet: updatedWallet,
        transaction: walletTransaction
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('GroupWalletService.withdrawFromGroupWallet - Error:', error);
      throw error;
    }
  }

  async getGroupWalletTransactions(groupId, filters) {
    try {
      const wallet = await groupWalletRepository.findByGroupId(groupId);
      return await groupWalletRepository.getTransactions(wallet.id, filters);
    } catch (error) {
      logger.error('GroupWalletService.getGroupWalletTransactions - Error:', error);
      throw error;
    }
  }

  async payCostFromGroupWallet(groupId, costId, amount, description, createdBy) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const wallet = await groupWalletRepository.findByGroupId(groupId);
      
      // Update balance (negative amount for expense)
      const updatedWallet = await groupWalletRepository.updateBalance(
        wallet.id, 
        -amount, 
        transaction
      );

      // Create transaction record
      const walletTransaction = await groupWalletRepository.createTransaction({
        walletId: wallet.id,
        type: 'expense',
        amount,
        description: description || `Payment for cost ${costId}`,
        referenceId: costId,
        createdBy
      }, transaction);

      await transaction.commit();

      logger.info('Group wallet expense recorded', { groupId, costId, amount, walletId: wallet.id });
      return {
        wallet: updatedWallet,
        transaction: walletTransaction
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('GroupWalletService.payCostFromGroupWallet - Error:', error);
      throw error;
    }
  }
}

export default new GroupWalletService();