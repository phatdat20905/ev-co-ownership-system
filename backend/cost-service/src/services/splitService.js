// src/services/splitService.js
import { 
  splitRepository, 
  costRepository,
} from '../repositories/index.js';
import { AppError, logger } from '@ev-coownership/shared';
import eventService from './eventService.js';

export class SplitService {
  async getUserSplits(userId, filters) {
    try {
      return await splitRepository.findByUserId(userId, filters);
    } catch (error) {
      logger.error('SplitService.getUserSplits - Error:', error);
      throw error;
    }
  }

  async getCostSplits(costId, userId) {
    try {
      const cost = await costRepository.findById(costId);
      return await splitRepository.findByCostId(costId);
    } catch (error) {
      logger.error('SplitService.getCostSplits - Error:', error);
      throw error;
    }
  }

  async updateSplitStatus(splitId, status, paidAmount, userId) {
    try {
      const split = await splitRepository.updateSplitStatus(splitId, status, paidAmount);

      // Publish event
      if (status === 'paid') {
        await eventService.publishCostSplitUpdated({
          splitId: split.id,
          costId: split.costId,
          userId: split.userId,
          amount: split.splitAmount,
          status: 'paid'
        });
      }

      logger.info('Split status updated successfully', { splitId, status });
      return split;
    } catch (error) {
      logger.error('SplitService.updateSplitStatus - Error:', error);
      throw error;
    }
  }

  async getOverdueSplits() {
    try {
      return await splitRepository.getOverdueSplits();
    } catch (error) {
      logger.error('SplitService.getOverdueSplits - Error:', error);
      throw error;
    }
  }

  async getUserSplitSummary(userId, period = 'month') {
    try {
      const splits = await splitRepository.findByUserId(userId, { limit: 1000 });
      
      const summary = {
        totalOwed: 0,
        totalPaid: 0,
        pendingCount: 0,
        paidCount: 0,
        overdueCount: 0,
        byCategory: {}
      };

      splits.splits.forEach(split => {
        const amount = parseFloat(split.splitAmount);
        const paid = parseFloat(split.paidAmount);
        const category = split.cost?.category?.categoryName || 'Unknown';

        summary.totalOwed += amount;
        summary.totalPaid += paid;

        if (split.paymentStatus === 'pending') summary.pendingCount++;
        if (split.paymentStatus === 'paid') summary.paidCount++;
        if (split.paymentStatus === 'overdue') summary.overdueCount++;

        if (!summary.byCategory[category]) {
          summary.byCategory[category] = { total: 0, count: 0 };
        }
        summary.byCategory[category].total += amount;
        summary.byCategory[category].count++;
      });

      return summary;
    } catch (error) {
      logger.error('SplitService.getUserSplitSummary - Error:', error);
      throw error;
    }
  }
}

export default new SplitService();