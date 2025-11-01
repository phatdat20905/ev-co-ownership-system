// src/repositories/groupWalletRepository.js
import db from '../models/index.js';
import { AppError, logger } from '@ev-coownership/shared';

export class GroupWalletRepository {
  async findByGroupId(groupId) {
    try {
      let wallet = await db.GroupWallet.findOne({
        where: { groupId },
        include: [{
          model: db.GroupWalletTransaction,
          as: 'transactions',
          order: [['createdAt', 'DESC']],
          limit: 10
        }]
      });

      // Create wallet if not exists
      if (!wallet) {
        wallet = await db.GroupWallet.create({ groupId });
      }

      return wallet;
    } catch (error) {
      logger.error('GroupWalletRepository.findByGroupId - Error:', error);
      throw new AppError('Failed to fetch group wallet', 500, 'GROUP_WALLET_FETCH_ERROR');
    }
  }

  async updateBalance(walletId, amount, transaction = null) {
    try {
      const wallet = await db.GroupWallet.findByPk(walletId, { transaction });
      
      if (!wallet) {
        throw new AppError('Group wallet not found', 404, 'GROUP_WALLET_NOT_FOUND');
      }

      const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
      
      if (newBalance < 0) {
        throw new AppError('Insufficient group wallet balance', 400, 'INSUFFICIENT_GROUP_BALANCE');
      }

      await wallet.update({ balance: newBalance }, { transaction });
      return wallet;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('GroupWalletRepository.updateBalance - Error:', error);
      throw new AppError('Failed to update group wallet balance', 500, 'GROUP_WALLET_UPDATE_ERROR');
    }
  }

  async createTransaction(transactionData) {
    try {
      return await db.GroupWalletTransaction.create(transactionData);
    } catch (error) {
      logger.error('GroupWalletRepository.createTransaction - Error:', error);
      throw new AppError('Failed to create group wallet transaction', 500, 'GROUP_TRANSACTION_CREATE_ERROR');
    }
  }

  async getTransactions(walletId, filters = {}) {
    try {
      const { page = 1, limit = 20, type } = filters;
      const offset = (page - 1) * limit;

      const where = { walletId };
      if (type) where.type = type;

      const { count, rows } = await db.GroupWalletTransaction.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        transactions: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('GroupWalletRepository.getTransactions - Error:', error);
      throw new AppError('Failed to fetch group wallet transactions', 500, 'GROUP_TRANSACTIONS_FETCH_ERROR');
    }
  }
}

export default new GroupWalletRepository();