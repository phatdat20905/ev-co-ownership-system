// src/services/costService.js
import { 
  costRepository, 
  splitRepository,
  eventService 
} from '../repositories/index.js';
import { AppError, logger } from '@ev-coownership/shared';
import splitCalculator from '../utils/splitCalculator.js';

export class CostService {
  async createCost(costData, userId) {
    try {
      const cost = await costRepository.create({
        ...costData,
        createdBy: userId
      });

      // Calculate splits based on split type
      const splits = await splitCalculator.calculateSplits(cost);
      await splitRepository.createSplits(cost.id, splits);

      // Publish event
      await eventService.publishCostCreated({
        costId: cost.id,
        groupId: cost.groupId,
        vehicleId: cost.vehicleId,
        totalAmount: cost.totalAmount,
        createdBy: userId,
        splitsCount: splits.length
      });

      logger.info('Cost created successfully', { costId: cost.id, groupId: cost.groupId });
      return await costRepository.findById(cost.id);
    } catch (error) {
      logger.error('CostService.createCost - Error:', error);
      throw error;
    }
  }

  async getCostById(id, userId) {
    try {
      const cost = await costRepository.findById(id);
      
      // Check if user has access to this cost (via group membership)
      // This would typically call User Service to verify group membership
      // For now, we'll assume the API Gateway handles authentication
      
      return cost;
    } catch (error) {
      logger.error('CostService.getCostById - Error:', error);
      throw error;
    }
  }

  async getCostsByGroup(groupId, filters, userId) {
    try {
      return await costRepository.findByGroup(groupId, filters);
    } catch (error) {
      logger.error('CostService.getCostsByGroup - Error:', error);
      throw error;
    }
  }

  async updateCost(id, costData, userId) {
    try {
      const cost = await costRepository.update(id, costData);

      // Publish event
      await eventService.publishCostUpdated({
        costId: cost.id,
        groupId: cost.groupId,
        updatedBy: userId,
        updates: costData
      });

      logger.info('Cost updated successfully', { costId: cost.id });
      return cost;
    } catch (error) {
      logger.error('CostService.updateCost - Error:', error);
      throw error;
    }
  }

  async deleteCost(id, userId) {
    try {
      await costRepository.delete(id);

      // Publish event
      await eventService.publishCostDeleted({
        costId: id,
        deletedBy: userId
      });

      logger.info('Cost deleted successfully', { costId: id });
      return { success: true, message: 'Cost deleted successfully' };
    } catch (error) {
      logger.error('CostService.deleteCost - Error:', error);
      throw error;
    }
  }

  async getCostSummary(groupId, period, userId) {
    try {
      return await costRepository.getCostSummary(groupId, period);
    } catch (error) {
      logger.error('CostService.getCostSummary - Error:', error);
      throw error;
    }
  }

  async calculateSplits(costId, userId) {
    try {
      const cost = await costRepository.findById(costId);
      const splits = await splitRepository.findByCostId(costId);
      
      return {
        cost,
        splits,
        totalAmount: cost.totalAmount,
        splitType: cost.splitType
      };
    } catch (error) {
      logger.error('CostService.calculateSplits - Error:', error);
      throw error;
    }
  }
}

export default new CostService();