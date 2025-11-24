// src/controllers/costController.js
import costService from '../services/costService.js';
import { successResponse, logger, AppError, notificationHelper, NOTIFICATION_TYPES } from '@ev-coownership/shared';
import db from '../models/index.js';

export class CostController {
  async createCost(req, res, next) {
    try {
      const costData = req.body;
      const userId = req.user.id;

      const cost = await costService.createCost(costData, userId);

      logger.info('Cost created successfully', { 
        costId: cost.id, 
        groupId: cost.groupId,
        userId 
      });

      // Send notification to all group members
      try {
        // Get group members
        const group = await db.Group.findByPk(cost.groupId, {
          include: [{
            model: db.GroupMember,
            attributes: ['userId']
          }]
        });

        if (group && group.GroupMembers) {
          const userIds = group.GroupMembers.map(m => m.userId);
          
          await notificationHelper.sendCostNotification(
            NOTIFICATION_TYPES.COST_ADDED,
            {
              id: cost.id,
              amount: cost.amount,
              category: cost.category,
              description: cost.description,
              groupName: group.name
            },
            userIds
          );
          logger.info('Cost notification sent to group members', { 
            costId: cost.id, 
            groupId: cost.groupId,
            memberCount: userIds.length 
          });
        }
      } catch (notifError) {
        logger.error('Failed to send cost notification', { error: notifError.message });
      }

      return successResponse(res, 'Cost created successfully', cost, 201);
    } catch (error) {
      logger.error('Failed to create cost', { 
        error: error.message, 
        userId: req.user?.id,
        costData: req.body 
      });
      next(error);
    }
  }

  async getCost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const cost = await costService.getCostById(id, userId);

      logger.info('Cost retrieved successfully', { costId: id, userId });

      return successResponse(res, 'Cost retrieved successfully', cost);
    } catch (error) {
      logger.error('Failed to get cost', { 
        error: error.message, 
        costId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getCostsByGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const filters = req.query;
      const userId = req.user.id;

      const result = await costService.getCostsByGroup(groupId, filters, userId);

      logger.info('Costs retrieved successfully', { groupId, userId, count: result.costs.length });

      return successResponse(res, 'Costs retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get costs by group', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async updateCost(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;

      const cost = await costService.updateCost(id, updateData, userId);

      logger.info('Cost updated successfully', { costId: id, userId });

      return successResponse(res, 'Cost updated successfully', cost);
    } catch (error) {
      logger.error('Failed to update cost', { 
        error: error.message, 
        costId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async deleteCost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await costService.deleteCost(id, userId);

      logger.info('Cost deleted successfully', { costId: id, userId });

      return successResponse(res, 'Cost deleted successfully', result);
    } catch (error) {
      logger.error('Failed to delete cost', { 
        error: error.message, 
        costId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getCostSummary(req, res, next) {
    try {
      const { groupId } = req.params;
      const { period = 'month' } = req.query;
      const userId = req.user.id;

      const summary = await costService.getCostSummary(groupId, period, userId);

      logger.info('Cost summary retrieved successfully', { groupId, period, userId });

      return successResponse(res, 'Cost summary retrieved successfully', summary);
    } catch (error) {
      logger.error('Failed to get cost summary', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getAdminOverview(req, res, next) {
    try {
      const { period = 'month' } = req.query;
      const overview = await costService.getAdminOverview(period);
      return successResponse(res, 'Admin overview retrieved successfully', overview);
    } catch (error) {
      logger.error('Failed to get admin overview', { error: error.message, userId: req.user?.id });
      next(error);
    }
  }

  async getCostBreakdown(req, res, next) {
    try {
      const { groupId } = req.params;
      const { period = 'month' } = req.query;
      const userId = req.user.id;

      const breakdown = await costService.getCostBreakdown(groupId, period, userId);

      logger.info('Cost breakdown retrieved successfully', { groupId, period, userId });

      return successResponse(res, 'Cost breakdown retrieved successfully', breakdown);
    } catch (error) {
      logger.error('Failed to get cost breakdown', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async calculateSplits(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await costService.calculateSplits(id, userId);

      logger.info('Cost splits calculated successfully', { costId: id, userId });

      return successResponse(res, 'Cost splits calculated successfully', result);
    } catch (error) {
      logger.error('Failed to calculate cost splits', { 
        error: error.message, 
        costId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getExpenseTracking(req, res, next) {
    try {
      const { groupId } = req.params;
      const { year } = req.query;
      const userId = req.user.id;

      const expenseData = await costService.getExpenseTracking(groupId, year, userId);

      logger.info('Expense tracking retrieved successfully', { groupId, year, userId });

      return successResponse(res, 'Expense tracking retrieved successfully', expenseData);
    } catch (error) {
      logger.error('Failed to get expense tracking', { 
        error: error.message, 
        groupId: req.params.groupId,
        year: req.query.year,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getPaymentHistory(req, res, next) {
    try {
      const { groupId } = req.params;
      const filters = req.query;
      const userId = req.user.id;

      const paymentData = await costService.getPaymentHistory(groupId, userId, filters);

      logger.info('Payment history retrieved successfully', { groupId, userId });

      return successResponse(res, 'Payment history retrieved successfully', paymentData);
    } catch (error) {
      logger.error('Failed to get payment history', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async exportCostBreakdownPDF(req, res, next) {
    try {
      const { groupId } = req.params;
      const { period = 'month' } = req.query;
      const userId = req.user.id;

      const pdfBuffer = await costService.exportCostBreakdownPDF(groupId, period, userId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=cost-breakdown-${groupId}-${period}.pdf`);
      
      logger.info('Cost breakdown PDF exported', { groupId, period, userId });
      
      return res.send(pdfBuffer);
    } catch (error) {
      logger.error('Failed to export cost breakdown PDF', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async exportExpenseTrackingExcel(req, res, next) {
    try {
      const { groupId } = req.params;
      const { year } = req.query;
      const userId = req.user.id;

      const excelBuffer = await costService.exportExpenseTrackingExcel(groupId, year, userId);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=expense-tracking-${groupId}-${year}.xlsx`);
      
      logger.info('Expense tracking Excel exported', { groupId, year, userId });
      
      return res.send(excelBuffer);
    } catch (error) {
      logger.error('Failed to export expense tracking Excel', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async exportPaymentHistoryPDF(req, res, next) {
    try {
      const { groupId } = req.params;
      const filters = req.query;
      const userId = req.user.id;

      const pdfBuffer = await costService.exportPaymentHistoryPDF(groupId, userId, filters);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payment-history-${groupId}.pdf`);
      
      logger.info('Payment history PDF exported', { groupId, userId });
      
      return res.send(pdfBuffer);
    } catch (error) {
      logger.error('Failed to export payment history PDF', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new CostController();