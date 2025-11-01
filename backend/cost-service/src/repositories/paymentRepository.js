// src/repositories/paymentRepository.js
import db from '../models/index.js';
import { AppError, logger } from '@ev-coownership/shared';

export class PaymentRepository {
  async create(paymentData) {
    try {
      const payment = await db.Payment.create(paymentData);
      return await this.findById(payment.id);
    } catch (error) {
      logger.error('PaymentRepository.create - Error:', error);
      throw new AppError('Failed to create payment', 500, 'PAYMENT_CREATE_ERROR');
    }
  }

  async findById(id) {
    try {
      const payment = await db.Payment.findByPk(id, {
        include: [
          {
            model: db.CostSplit,
            as: 'costSplit',
            include: [{
              model: db.Cost,
              as: 'cost',
              include: [{ model: db.CostCategory, as: 'category' }]
            }]
          }
        ]
      });

      if (!payment) {
        throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
      }

      return payment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('PaymentRepository.findById - Error:', error);
      throw new AppError('Failed to find payment', 500, 'PAYMENT_FIND_ERROR');
    }
  }

  async findByUserId(userId, filters = {}) {
    try {
      const { page = 1, limit = 20, status, method } = filters;
      const offset = (page - 1) * limit;

      const where = { userId };
      if (status) where.paymentStatus = status;
      if (method) where.paymentMethod = method;

      const { count, rows } = await db.Payment.findAndCountAll({
        where,
        include: [{
          model: db.CostSplit,
          as: 'costSplit',
          include: [{
            model: db.Cost,
            as: 'cost',
            include: [{ model: db.CostCategory, as: 'category' }]
          }]
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      return {
        payments: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('PaymentRepository.findByUserId - Error:', error);
      throw new AppError('Failed to fetch user payments', 500, 'PAYMENTS_FETCH_ERROR');
    }
  }

  async updateStatus(id, status, gatewayResponse = null) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const payment = await db.Payment.findByPk(id, { transaction });
      
      if (!payment) {
        throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
      }

      const updateData = { paymentStatus: status };
      if (status === 'completed') {
        updateData.paymentDate = new Date();
        updateData.verified = true;
      }
      
      if (gatewayResponse) {
        updateData.gatewayResponse = gatewayResponse;
      }

      await payment.update(updateData, { transaction });
      await transaction.commit();

      return await this.findById(id);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) throw error;
      logger.error('PaymentRepository.updateStatus - Error:', error);
      throw new AppError('Failed to update payment status', 500, 'PAYMENT_UPDATE_ERROR');
    }
  }

  async findByTransactionId(transactionId) {
    try {
      return await db.Payment.findOne({
        where: { transactionId },
        include: [{
          model: db.CostSplit,
          as: 'costSplit'
        }]
      });
    } catch (error) {
      logger.error('PaymentRepository.findByTransactionId - Error:', error);
      throw new AppError('Failed to find payment by transaction ID', 500, 'PAYMENT_FIND_ERROR');
    }
  }

  async getPaymentSummary(groupId, period = 'month') {
    try {
      const where = {};
      const include = [{
        model: db.CostSplit,
        as: 'costSplit',
        include: [{
          model: db.Cost,
          as: 'cost',
          where: { groupId }
        }]
      }];

      // Add date filter based on period
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      where.createdAt = { [db.Sequelize.Op.gte]: startDate };

      const summary = await db.Payment.findAll({
        where,
        include,
        attributes: [
          'paymentMethod',
          'paymentStatus',
          [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'totalAmount'],
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'paymentCount']
        ],
        group: ['paymentMethod', 'paymentStatus'],
        raw: true
      });

      return summary;
    } catch (error) {
      logger.error('PaymentRepository.getPaymentSummary - Error:', error);
      throw new AppError('Failed to get payment summary', 500, 'PAYMENT_SUMMARY_ERROR');
    }
  }
}

export default new PaymentRepository();