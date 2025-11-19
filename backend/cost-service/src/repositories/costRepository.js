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
      // Calculate a safe startDate based on period (avoid mutating `now`)
      const now = new Date();
      let startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      if (period === 'week') {
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === 'quarter') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      where.costDate = { [db.Sequelize.Op.gte]: startDate };

      // Use a simpler GROUP BY query without joining category to avoid dialect alias issues
      const summary = await db.Cost.findAll({
        where,
        attributes: [
          'categoryId',
          [db.Sequelize.fn('SUM', db.Sequelize.col('total_amount')), 'totalAmount'],
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'costCount']
        ],
        group: ['categoryId'],
        raw: true
      });

      // Fetch category names separately to attach them to the summary rows
      const categoryIds = summary.map(s => s.categoryId).filter(Boolean);
      let categoriesMap = {};
      if (categoryIds.length > 0) {
        const categories = await db.CostCategory.findAll({
          where: { id: categoryIds },
          attributes: ['id', 'categoryName'],
          raw: true
        });
        categoriesMap = categories.reduce((acc, c) => {
          acc[c.id] = c.categoryName;
          return acc;
        }, {});
      }

      const enriched = summary.map(item => ({
        ...item,
        categoryName: categoriesMap[item.categoryId] || 'Khác'
      }));

      return enriched || [];
    } catch (error) {
      logger.error('CostRepository.getCostSummary - Error:', error);
      throw new AppError('Failed to get cost summary', 500, 'COST_SUMMARY_ERROR');
    }
  }

  async getCostsByDateRange(groupId, startDate, endDate) {
    try {
      const where = { 
        groupId,
        costDate: { 
          [db.Sequelize.Op.between]: [startDate, endDate] 
        }
      };

      const costs = await db.Cost.findAll({
        where,
        include: [
          { model: db.CostCategory, as: 'category', attributes: ['id', 'categoryName'] }
        ],
        order: [['costDate', 'DESC']],
        raw: true
      });

      return costs;
    } catch (error) {
      logger.error('CostRepository.getCostsByDateRange - Error:', error);
      throw new AppError('Failed to get costs by date range', 500, 'COST_DATE_RANGE_ERROR');
    }
  }

    // Get total revenue across all groups for a given period
    async getTotalRevenue(period = 'month') {
      try {
        const now = new Date();
        let startDate = new Date(now.getFullYear(), now.getMonth(), 1);

        if (period === 'week') {
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === 'quarter') {
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        } else if (period === 'year') {
          startDate = new Date(now.getFullYear(), 0, 1);
        }

        const result = await db.Cost.findAll({
          where: {
            costDate: { [db.Sequelize.Op.gte]: startDate }
          },
          attributes: [[db.Sequelize.fn('SUM', db.Sequelize.col('total_amount')), 'totalRevenue']],
          raw: true
        });

        const totalRevenue = parseFloat(result?.[0]?.totalRevenue || 0);
        return totalRevenue;
      } catch (error) {
        logger.error('CostRepository.getTotalRevenue - Error:', error);
        throw new AppError('Failed to calculate total revenue', 500, 'COST_REVENUE_ERROR');
      }
    }
}

export default new CostRepository();