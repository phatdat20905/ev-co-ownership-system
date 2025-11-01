// src/services/reportService.js
import { 
  costRepository, 
  paymentRepository,
  splitRepository,
  invoiceRepository 
} from '../repositories/index.js';
import { AppError, logger } from '@ev-coownership/shared';

export class ReportService {
  async getCostSummary(groupId, period, userId) {
    try {
      const costSummary = await costRepository.getCostSummary(groupId, period);
      const paymentSummary = await paymentRepository.getPaymentSummary(groupId, period);

      // Calculate metrics
      const totalCosts = costSummary.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0);
      const totalPayments = paymentSummary
        .filter(item => item.paymentStatus === 'completed')
        .reduce((sum, item) => sum + parseFloat(item.totalAmount), 0);

      const paymentRate = totalCosts > 0 ? (totalPayments / totalCosts) * 100 : 0;

      const report = {
        period,
        groupId,
        summary: {
          totalCosts,
          totalPayments,
          paymentRate: Math.round(paymentRate * 100) / 100,
          outstandingBalance: totalCosts - totalPayments,
          costCount: costSummary.reduce((sum, item) => sum + parseInt(item.costCount), 0),
          paymentCount: paymentSummary.reduce((sum, item) => sum + parseInt(item.paymentCount), 0)
        },
        costBreakdown: costSummary,
        paymentBreakdown: paymentSummary,
        generatedAt: new Date(),
        generatedBy: userId
      };

      logger.info('Cost summary report generated', { groupId, period, userId });
      return report;
    } catch (error) {
      logger.error('ReportService.getCostSummary - Error:', error);
      throw new AppError('Failed to generate cost summary report', 500, 'REPORT_GENERATION_ERROR');
    }
  }

  async getUserUsageReport(userId, period, targetUserId = null) {
    try {
      // If targetUserId is provided (for admins), use it, otherwise use the authenticated user
      const reportUserId = targetUserId || userId;

      const splits = await splitRepository.findByUserId(reportUserId, { limit: 1000 });
      const payments = await paymentRepository.findByUserId(reportUserId, { limit: 1000 });

      // Calculate usage metrics
      const userSplits = splits.splits;
      const totalOwed = userSplits.reduce((sum, split) => sum + parseFloat(split.splitAmount), 0);
      const totalPaid = userSplits.reduce((sum, split) => sum + parseFloat(split.paidAmount), 0);
      const balance = totalOwed - totalPaid;

      // Group by category
      const categoryBreakdown = {};
      userSplits.forEach(split => {
        const category = split.cost?.category?.categoryName || 'Unknown';
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = {
            totalOwed: 0,
            totalPaid: 0,
            count: 0
          };
        }
        categoryBreakdown[category].totalOwed += parseFloat(split.splitAmount);
        categoryBreakdown[category].totalPaid += parseFloat(split.paidAmount);
        categoryBreakdown[category].count++;
      });

      // Payment method breakdown
      const paymentMethodBreakdown = {};
      payments.payments.forEach(payment => {
        const method = payment.paymentMethod;
        if (!paymentMethodBreakdown[method]) {
          paymentMethodBreakdown[method] = {
            totalAmount: 0,
            count: 0
          };
        }
        paymentMethodBreakdown[method].totalAmount += parseFloat(payment.amount);
        paymentMethodBreakdown[method].count++;
      });

      const report = {
        period,
        userId: reportUserId,
        summary: {
          totalOwed,
          totalPaid,
          balance,
          paymentCompletionRate: totalOwed > 0 ? (totalPaid / totalOwed) * 100 : 0,
          totalTransactions: userSplits.length
        },
        categoryBreakdown,
        paymentMethodBreakdown,
        recentSplits: userSplits.slice(0, 10),
        recentPayments: payments.payments.slice(0, 10),
        generatedAt: new Date()
      };

      logger.info('User usage report generated', { userId: reportUserId, period });
      return report;
    } catch (error) {
      logger.error('ReportService.getUserUsageReport - Error:', error);
      throw new AppError('Failed to generate user usage report', 500, 'USER_REPORT_ERROR');
    }
  }

  async getCostAnalysis(groupId, startDate, endDate, userId) {
    try {
      const costs = await costRepository.findByGroup(groupId, {
        startDate,
        endDate,
        limit: 1000
      });

      // Monthly breakdown
      const monthlyBreakdown = {};
      costs.costs.forEach(cost => {
        const month = cost.costDate.substring(0, 7); // YYYY-MM format
        if (!monthlyBreakdown[month]) {
          monthlyBreakdown[month] = {
            totalAmount: 0,
            count: 0,
            categories: {}
          };
        }
        monthlyBreakdown[month].totalAmount += parseFloat(cost.totalAmount);
        monthlyBreakdown[month].count++;

        const category = cost.category?.categoryName || 'Unknown';
        if (!monthlyBreakdown[month].categories[category]) {
          monthlyBreakdown[month].categories[category] = 0;
        }
        monthlyBreakdown[month].categories[category] += parseFloat(cost.totalAmount);
      });

      // Category trends
      const categoryTrends = {};
      costs.costs.forEach(cost => {
        const category = cost.category?.categoryName || 'Unknown';
        const month = cost.costDate.substring(0, 7);
        
        if (!categoryTrends[category]) {
          categoryTrends[category] = {};
        }
        if (!categoryTrends[category][month]) {
          categoryTrends[category][month] = 0;
        }
        categoryTrends[category][month] += parseFloat(cost.totalAmount);
      });

      // Cost statistics
      const costAmounts = costs.costs.map(cost => parseFloat(cost.totalAmount));
      const averageCost = costAmounts.reduce((a, b) => a + b, 0) / costAmounts.length;
      const maxCost = Math.max(...costAmounts);
      const minCost = Math.min(...costAmounts);

      const report = {
        period: { startDate, endDate },
        groupId,
        statistics: {
          totalCosts: costAmounts.reduce((a, b) => a + b, 0),
          averageCost: Math.round(averageCost * 100) / 100,
          maxCost,
          minCost,
          costCount: costs.costs.length
        },
        monthlyBreakdown,
        categoryTrends,
        generatedAt: new Date(),
        generatedBy: userId
      };

      logger.info('Cost analysis report generated', { groupId, startDate, endDate, userId });
      return report;
    } catch (error) {
      logger.error('ReportService.getCostAnalysis - Error:', error);
      throw new AppError('Failed to generate cost analysis report', 500, 'COST_ANALYSIS_ERROR');
    }
  }

  async getPaymentAnalysis(groupId, period, userId) {
    try {
      const paymentSummary = await paymentRepository.getPaymentSummary(groupId, period);
      
      // Payment status breakdown
      const statusBreakdown = {};
      const methodBreakdown = {};
      
      paymentSummary.forEach(item => {
        // Status breakdown
        if (!statusBreakdown[item.paymentStatus]) {
          statusBreakdown[item.paymentStatus] = {
            totalAmount: 0,
            count: 0
          };
        }
        statusBreakdown[item.paymentStatus].totalAmount += parseFloat(item.totalAmount);
        statusBreakdown[item.paymentStatus].count += parseInt(item.paymentCount);

        // Method breakdown
        if (!methodBreakdown[item.paymentMethod]) {
          methodBreakdown[item.paymentMethod] = {
            totalAmount: 0,
            count: 0
          };
        }
        methodBreakdown[item.paymentMethod].totalAmount += parseFloat(item.totalAmount);
        methodBreakdown[item.paymentMethod].count += parseInt(item.paymentCount);
      });

      // Calculate payment success rate
      const completedPayments = statusBreakdown.completed?.totalAmount || 0;
      const totalProcessed = Object.values(statusBreakdown).reduce((sum, item) => sum + item.totalAmount, 0);
      const successRate = totalProcessed > 0 ? (completedPayments / totalProcessed) * 100 : 0;

      const report = {
        period,
        groupId,
        summary: {
          totalProcessed,
          successRate: Math.round(successRate * 100) / 100,
          completedAmount: completedPayments,
          pendingAmount: statusBreakdown.pending?.totalAmount || 0,
          failedAmount: statusBreakdown.failed?.totalAmount || 0
        },
        statusBreakdown,
        methodBreakdown,
        generatedAt: new Date(),
        generatedBy: userId
      };

      logger.info('Payment analysis report generated', { groupId, period, userId });
      return report;
    } catch (error) {
      logger.error('ReportService.getPaymentAnalysis - Error:', error);
      throw new AppError('Failed to generate payment analysis report', 500, 'PAYMENT_ANALYSIS_ERROR');
    }
  }
}

export default new ReportService();