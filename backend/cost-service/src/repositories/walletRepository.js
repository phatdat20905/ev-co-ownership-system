// src/repositories/walletRepository.js
import db from '../models/index.js';
import { AppError, logger } from '@ev-coownership/shared';

export class WalletRepository {
  async findByUserId(userId) {
    try {
      let wallet = await db.UserWallet.findOne({
        where: { userId },
        include: [{
          model: db.WalletTransaction,
          as: 'transactions',
          order: [['createdAt', 'DESC']],
          limit: 10
        }]
      });

      // Create wallet if not exists
      if (!wallet) {
        wallet = await db.UserWallet.create({ userId });
      }

      return wallet;
    } catch (error) {
      logger.error('WalletRepository.findByUserId - Error:', error);
      throw new AppError('Failed to fetch user wallet', 500, 'WALLET_FETCH_ERROR');
    }
  }

  async updateBalance(walletId, amount, transaction = null) {
    try {
      const wallet = await db.UserWallet.findByPk(walletId, { transaction });
      
      if (!wallet) {
        throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');
      }

      const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
      
      if (newBalance < 0) {
        throw new AppError('Insufficient wallet balance', 400, 'INSUFFICIENT_BALANCE');
      }

      await wallet.update({ balance: newBalance }, { transaction });
      return wallet;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('WalletRepository.updateBalance - Error:', error);
      throw new AppError('Failed to update wallet balance', 500, 'WALLET_UPDATE_ERROR');
    }
  }

  async createTransaction(transactionData) {
    try {
      return await db.WalletTransaction.create(transactionData);
    } catch (error) {
      logger.error('WalletRepository.createTransaction - Error:', error);
      throw new AppError('Failed to create wallet transaction', 500, 'TRANSACTION_CREATE_ERROR');
    }
  }

  async getTransactions(walletId, filters = {}) {
    try {
      const { page = 1, limit = 20, type } = filters;
      const offset = (page - 1) * limit;

      const where = { walletId };
      if (type) where.type = type;

      const { count, rows } = await db.WalletTransaction.findAndCountAll({
        where,
        include: [{
          model: db.Payment,
          as: 'relatedPayment',
          attributes: ['id', 'paymentMethod', 'transactionId']
        }],
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
      logger.error('WalletRepository.getTransactions - Error:', error);
      throw new AppError('Failed to fetch wallet transactions', 500, 'TRANSACTIONS_FETCH_ERROR');
    }
  }
}

export default new WalletRepository();