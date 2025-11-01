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
}

export default new SplitRepository();