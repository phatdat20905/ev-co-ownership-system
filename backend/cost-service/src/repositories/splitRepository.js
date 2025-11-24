// src/repositories/splitRepository.js
import db from '../models/index.js';
import { AppError, logger } from '@ev-coownership/shared';

export class SplitRepository {
  async createSplits(costId, splitsData) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const splits = await db.CostSplit.bulkCreate(
        splitsData.map(split => ({
          ...split,
          costId
        })),
        { transaction }
      );

      await transaction.commit();
      return splits;
    } catch (error) {
      await transaction.rollback();
      logger.error('SplitRepository.createSplits - Error:', error);
      throw new AppError('Failed to create cost splits', 500, 'SPLIT_CREATE_ERROR');
    }
  }

  async findById(splitId) {
    try {
      const split = await db.CostSplit.findByPk(splitId, {
        include: [
          {
            model: db.Cost,
            as: 'cost',
            include: [{ model: db.CostCategory, as: 'category' }]
          }
        ]
      });
      
      if (!split) {
        throw new AppError('Cost split not found', 404, 'SPLIT_NOT_FOUND');
      }
      
      return split;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('SplitRepository.findById - Error:', error);
      throw new AppError('Failed to fetch cost split', 500, 'SPLIT_FETCH_ERROR');
    }
  }

  async findByCostId(costId) {
    try {
      return await db.CostSplit.findAll({
        where: { costId },
        include: [
          {
            model: db.Cost,
            as: 'cost',
            include: [{ model: db.CostCategory, as: 'category' }]
          }
        ],
        order: [['createdAt', 'ASC']]
      });
    } catch (error) {
      logger.error('SplitRepository.findByCostId - Error:', error);
      throw new AppError('Failed to fetch cost splits', 500, 'SPLIT_FETCH_ERROR');
    }
  }

  async findByUserId(userId, filters = {}) {
    try {
      const { page = 1, limit = 20, status, groupId } = filters;
      const offset = (page - 1) * limit;

      const where = { userId };
      if (status) where.paymentStatus = status;

      const include = [{
        model: db.Cost,
        as: 'cost',
        where: groupId ? { groupId } : {},
        include: [{ model: db.CostCategory, as: 'category' }]
      }];

      const { count, rows } = await db.CostSplit.findAndCountAll({
        where,
        include,
        order: [['dueDate', 'ASC']],
        limit,
        offset,
        distinct: true
      });

      return {
        splits: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('SplitRepository.findByUserId - Error:', error);
      throw new AppError('Failed to fetch user splits', 500, 'USER_SPLITS_FETCH_ERROR');
    }
  }

  async updateSplitStatus(id, status, paidAmount = 0) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const split = await db.CostSplit.findByPk(id, { transaction });
      
      if (!split) {
        throw new AppError('Cost split not found', 404, 'SPLIT_NOT_FOUND');
      }

      const updateData = { paymentStatus: status };
      if (status === 'paid') {
        updateData.paidAmount = paidAmount;
        updateData.paidAt = new Date();
      }

      await split.update(updateData, { transaction });
      await transaction.commit();

      return await db.CostSplit.findByPk(id, {
        include: [{
          model: db.Cost,
          as: 'cost',
          include: [{ model: db.CostCategory, as: 'category' }]
        }]
      });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) throw error;
      logger.error('SplitRepository.updateSplitStatus - Error:', error);
      throw new AppError('Failed to update split status', 500, 'SPLIT_UPDATE_ERROR');
    }
  }

  async getOverdueSplits() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      return await db.CostSplit.findAll({
        where: {
          paymentStatus: 'pending',
          dueDate: { [db.Sequelize.Op.lt]: today }
        },
        include: [{
          model: db.Cost,
          as: 'cost',
          include: [{ model: db.CostCategory, as: 'category' }]
        }]
      });
    } catch (error) {
      logger.error('SplitRepository.getOverdueSplits - Error:', error);
      throw new AppError('Failed to fetch overdue splits', 500, 'OVERDUE_SPLITS_ERROR');
    }
  }

  async getOwnershipBreakdown(groupId, period = 'month') {
    try {
      // Calculate date range
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
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const breakdown = await db.CostSplit.findAll({
        attributes: [
          'userId',
          [db.Sequelize.fn('SUM', db.Sequelize.col('split_amount')), 'totalAmount'],
          [db.Sequelize.fn('SUM', db.Sequelize.col('paid_amount')), 'paidAmount'],
          [db.Sequelize.fn('COUNT', db.Sequelize.literal("CASE WHEN payment_status = 'paid' THEN 1 END")), 'paidCount'],
          [db.Sequelize.fn('COUNT', '*'), 'totalCount']
        ],
        include: [{
          model: db.Cost,
          as: 'cost',
          where: {
            groupId,
            costDate: { [db.Sequelize.Op.gte]: startDate }
          },
          attributes: []
        }],
        group: ['userId'],
        raw: true
      });

      return breakdown.map(item => ({
        userId: item.userId,
        amount: parseFloat(item.totalAmount || 0),
        paidAmount: parseFloat(item.paidAmount || 0),
        paid: parseInt(item.paidCount || 0) === parseInt(item.totalCount || 0),
        splitCount: parseInt(item.totalCount || 0)
      }));
    } catch (error) {
      logger.error('SplitRepository.getOwnershipBreakdown - Error:', error);
      throw new AppError('Failed to get ownership breakdown', 500, 'OWNERSHIP_BREAKDOWN_ERROR');
    }
  }

  async getPaymentHistory(userId, groupId, filters = {}) {
    try {
      const { status, startDate, endDate, page = 1, limit = 20 } = filters;
      const offset = (page - 1) * limit;

      const where = { userId };
      if (status && status !== 'all') {
        where.paymentStatus = status === 'completed' ? 'paid' : status;
      }

      const costWhere = { groupId };
      if (startDate && endDate) {
        costWhere.costDate = { 
          [db.Sequelize.Op.between]: [startDate, endDate] 
        };
      }

      const { count, rows } = await db.CostSplit.findAndCountAll({
        where,
        include: [{
          model: db.Cost,
          as: 'cost',
          where: costWhere,
          include: [
            { 
              model: db.CostCategory, 
              as: 'category',
              attributes: ['id', 'categoryName'] 
            }
          ]
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      // Fetch latest payment for each split in bulk to avoid N+1 queries
      const splitIds = rows.map(r => r.id);
      let paymentsForSplits = [];
      if (splitIds.length > 0) {
        const paymentRows = await db.Payment.findAll({
          where: { costSplitId: splitIds },
          order: [['createdAt', 'DESC']]
        });
        // Map latest payment per split
        const paymentMap = new Map();
        for (const p of paymentRows) {
          if (!paymentMap.has(p.costSplitId)) {
            paymentMap.set(p.costSplitId, p);
          }
        }
        paymentsForSplits = paymentMap; // Map of costSplitId -> payment row
      }

      const payments = rows.map(split => {
        const latestPayment = paymentsForSplits.get(split.id);
        return {
          id: latestPayment ? latestPayment.id : split.id, // prefer latest payment id, else split id
          paymentId: latestPayment ? latestPayment.id : null,
          splitId: split.id,
          costSplitId: split.id, // Add costSplitId for frontend payment creation
          description: split.cost?.costName || 'Chi phí',
          amount: parseFloat(split.splitAmount),
          paidAmount: parseFloat(split.paidAmount),
          date: new Date(split.cost?.costDate || split.createdAt).toLocaleDateString('vi-VN'),
          status: split.paymentStatus === 'paid' ? 'completed' : split.paymentStatus,
          type: split.cost?.category?.categoryName || 'other',
          method: latestPayment ? (latestPayment.paymentMethod || 'VNPay') : 'VNPay',
          invoice: `INV-${split.costId?.slice(0, 8)}`,
          dueDate: split.dueDate ? new Date(split.dueDate).toLocaleDateString('vi-VN') : null,
          paidAt: split.paidAt ? new Date(split.paidAt).toLocaleDateString('vi-VN') : null
        };
      });

      return {
        rows: payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('SplitRepository.getPaymentHistory - Error:', error);
      throw new AppError('Failed to get payment history', 500, 'PAYMENT_HISTORY_ERROR');
    }
  }

  async getPaymentStats(userId, groupId, startDate, endDate) {
    try {
      const where = { userId };
      const costWhere = { groupId };
      
      if (startDate && endDate) {
        costWhere.costDate = { 
          [db.Sequelize.Op.between]: [startDate, endDate] 
        };
      }

      const stats = await db.CostSplit.findAll({
        attributes: [
          'paymentStatus',
          [db.Sequelize.fn('SUM', db.Sequelize.col('split_amount')), 'totalAmount'],
          [db.Sequelize.fn('COUNT', '*'), 'count']
        ],
        where,
        include: [{
          model: db.Cost,
          as: 'cost',
          where: costWhere,
          attributes: []
        }],
        group: ['paymentStatus'],
        raw: true
      });

      const result = {
        totalPaid: 0,
        pendingAmount: 0,
        completedPayments: 0,
        failedPayments: 0
      };

      stats.forEach(stat => {
        const amount = parseFloat(stat.totalAmount || 0);
        const count = parseInt(stat.count || 0);
        
        switch (stat.paymentStatus) {
          case 'paid':
            result.totalPaid = amount;
            result.completedPayments = count;
            break;
          case 'pending':
            result.pendingAmount += amount;
            break;
          case 'overdue':
            result.pendingAmount += amount;
            result.failedPayments = count;
            break;
        }
      });

      return result;
    } catch (error) {
      logger.error('SplitRepository.getPaymentStats - Error:', error);
      throw new AppError('Failed to get payment stats', 500, 'PAYMENT_STATS_ERROR');
    }
  }
}

export default new SplitRepository();