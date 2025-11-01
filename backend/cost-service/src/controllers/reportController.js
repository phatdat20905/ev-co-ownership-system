// src/controllers/reportController.js
import reportService from '../services/reportService.js';
import { successResponse, logger } from '@ev-coownership/shared';

export class ReportController {
  async getSummary(req, res, next) {
    try {
      const { groupId } = req.query;
      const { period = 'month' } = req.query;
      const userId = req.user.id;

      if (!groupId) {
        return successResponse(res, 'Group ID is required', null, 400);
      }

      const report = await reportService.getCostSummary(groupId, period, userId);

      logger.info('Cost summary report generated', { groupId, period, userId });

      return successResponse(res, 'Cost summary report generated successfully', report);
    } catch (error) {
      logger.error('Failed to generate cost summary report', { 
        error: error.message, 
        groupId: req.query.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getUserUsage(req, res, next) {
    try {
      const { period = 'month', userId: targetUserId } = req.query;
      const userId = req.user.id;

      const report = await reportService.getUserUsageReport(userId, period, targetUserId);

      logger.info('User usage report generated', { 
        targetUserId: targetUserId || userId, 
        period,
        requestedBy: userId 
      });

      return successResponse(res, 'User usage report generated successfully', report);
    } catch (error) {
      logger.error('Failed to generate user usage report', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getCostAnalysis(req, res, next) {
    try {
      const { groupId, startDate, endDate } = req.query;
      const userId = req.user.id;

      if (!groupId || !startDate || !endDate) {
        return successResponse(res, 'Group ID, start date, and end date are required', null, 400);
      }

      const report = await reportService.getCostAnalysis(groupId, startDate, endDate, userId);

      logger.info('Cost analysis report generated', { 
        groupId, 
        startDate, 
        endDate, 
        userId 
      });

      return successResponse(res, 'Cost analysis report generated successfully', report);
    } catch (error) {
      logger.error('Failed to generate cost analysis report', { 
        error: error.message, 
        groupId: req.query.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getPaymentAnalysis(req, res, next) {
    try {
      const { groupId } = req.query;
      const { period = 'month' } = req.query;
      const userId = req.user.id;

      if (!groupId) {
        return successResponse(res, 'Group ID is required', null, 400);
      }

      const report = await reportService.getPaymentAnalysis(groupId, period, userId);

      logger.info('Payment analysis report generated', { groupId, period, userId });

      return successResponse(res, 'Payment analysis report generated successfully', report);
    } catch (error) {
      logger.error('Failed to generate payment analysis report', { 
        error: error.message, 
        groupId: req.query.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new ReportController();