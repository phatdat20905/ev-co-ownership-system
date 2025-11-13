// src/controllers/dashboardController.js
import dashboardService from '../services/dashboardService.js';
import { successResponse, logger } from '@ev-coownership/shared';

export class DashboardController {
  async getOverview(req, res, next) {
    try {
      const { period = '7d' } = req.query;
      
      const overview = await dashboardService.getOverviewStats(period);

      logger.info('Dashboard overview retrieved', {
        staffId: req.staff.id,
        period
      });

      return successResponse(res, 'Dashboard overview retrieved successfully', overview);
    } catch (error) {
      logger.error('Failed to get dashboard overview', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const { period = '7d', metrics = 'users,bookings,revenue' } = req.query;
      
      const stats = await dashboardService.getOverviewStats(period);

      // Filter metrics if specified
      const metricList = metrics.split(',');
      const filteredStats = {};
      
      metricList.forEach(metric => {
        if (stats[metric]) {
          filteredStats[metric] = stats[metric];
        }
      });

      logger.info('Dashboard stats retrieved', {
        staffId: req.staff.id,
        period,
        metrics
      });

      return successResponse(res, 'Dashboard stats retrieved successfully', 
        Object.keys(filteredStats).length > 0 ? filteredStats : stats
      );
    } catch (error) {
      logger.error('Failed to get dashboard stats', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }

  async getLiveMetrics(req, res, next) {
    try {
      const metrics = await dashboardService.getLiveMetrics();

      logger.debug('Live metrics retrieved', {
        staffId: req.staff.id
      });

      return successResponse(res, 'Live metrics retrieved successfully', metrics);
    } catch (error) {
      logger.error('Failed to get live metrics', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }

  async getSystemHealth(req, res, next) {
    try {
      const health = await dashboardService.getSystemHealth();

      logger.info('System health checked', {
        staffId: req.staff.id,
        status: health.status
      });

      return successResponse(res, 'System health retrieved successfully', health);
    } catch (error) {
      logger.error('Failed to get system health', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }

  async getGrowthAnalytics(req, res, next) {
    try {
      const { metric = 'users', period = 'monthly' } = req.query;
      
      let growthData;
      switch (metric) {
        case 'users':
          growthData = await dashboardService.getUserAnalytics(period);
          break;
        case 'revenue':
          growthData = await dashboardService.getRevenueAnalytics(period);
          break;
        case 'bookings':
          growthData = await dashboardService.getBookingStats(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
          break;
        default:
          growthData = await dashboardService.getUserAnalytics(period);
      }

      logger.info('Growth analytics retrieved', {
        staffId: req.staff.id,
        metric,
        period
      });

      return successResponse(res, 'Growth analytics retrieved successfully', growthData);
    } catch (error) {
      logger.error('Failed to get growth analytics', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }
}

export default new DashboardController();