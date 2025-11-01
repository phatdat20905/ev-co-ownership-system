// src/repositories/costRepository.js
import db from '../models/index.js';
import { AppError, logger } from '@ev-coownership/shared';

export class CostRepository {
  async create(costData) {
    try {
      const cost = await db.Cost.create(costData);
      return await this.findById(cost.id); // Return with associations
    } catch (error) {
      logger.error('CostRepository.create - Error:', error);
      throw new AppError('Failed to create cost', 500, 'COST_CREATE_ERROR');
    }
  }

  async findById(id, options = {}) {
    try {
      const include = [
        { model: db.CostCategory, as: 'category' },
        { model: db.CostSplit, as: 'splits' }
      ];

      const cost = await db.Cost.findByPk(id, {
        include,
        ...options
      });

      if (!cost) {
        throw new AppError('Cost not found', 404, 'COST_NOT_FOUND');
      }

      return cost;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('CostRepository.findById - Error:', error);
      throw new AppError('Failed to find cost', 500, 'COST_FIND_ERROR');
    }
  }

  async findByGroup(groupId, filters = {}) {
    try {
      const { page = 1, limit = 20, categoryId, startDate, endDate } = filters;
      const offset = (page - 1) * limit;

      const where = { groupId };
      if (categoryId) where.categoryId = categoryId;
      if (startDate && endDate) {
        where.costDate = { [db.Sequelize.Op.between]: [startDate, endDate] };
      }

      const { count, rows } = await db.Cost.findAndCountAll({
        where,
        include: [
          { model: db.CostCategory, as: 'category' },
          { 
            model: db.CostSplit, 
            as: 'splits',
            attributes: ['id', 'userId', 'splitAmount', 'paidAmount', 'paymentStatus']
          }
        ],
        order: [['costDate', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      return {
        costs: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('CostRepository.findByGroup - Error:', error);
      throw new AppError('Failed to fetch costs', 500, 'COST_FETCH_ERROR');
    }
  }

  async update(id, costData) {
    try {
      const cost = await this.findById(id);
      await cost.update(costData);
      return await this.findById(id); // Return updated with associations
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('CostRepository.update - Error:', error);
      throw new AppError('Failed to update cost', 500, 'COST_UPDATE_ERROR');
    }
  }

  async delete(id) {
    try {
      const cost = await this.findById(id);
      await cost.destroy();
      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('CostRepository.delete - Error:', error);
      throw new AppError('Failed to delete cost', 500, 'COST_DELETE_ERROR');
    }
  }

  async getCostSummary(groupId, period = 'month') {
    try {
      const where = { groupId };
      
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

      where.costDate = { [db.Sequelize.Op.gte]: startDate };

      const summary = await db.Cost.findAll({
        where,
        attributes: [
          'categoryId',
          [db.Sequelize.fn('SUM', db.Sequelize.col('total_amount')), 'totalAmount'],
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'costCount']
        ],
        include: [
          { model: db.CostCategory, as: 'category', attributes: ['id', 'categoryName'] }
        ],
        group: ['categoryId', 'category.id'],
        raw: true
      });

      return summary;
    } catch (error) {
      logger.error('CostRepository.getCostSummary - Error:', error);
      throw new AppError('Failed to get cost summary', 500, 'COST_SUMMARY_ERROR');
    }
  }
}

export default new CostRepository();