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
      
      const overview = await dashboardService.getOverviewStats(period);

      // Flatten the structure for frontend compatibility
      const flatStats = {
        totalUsers: overview.users?.total || 0,
        activeUsers: overview.users?.active || 0,
        totalCars: 24, // TODO: Get from vehicle service
        activeContracts: 18, // TODO: Get from contract service
        monthlyRevenue: overview.revenue?.total || 0,
        totalRevenue: overview.revenue?.total || 0,
        utilizationRate: 76, // TODO: Calculate from booking data
        todayBookings: Math.floor(overview.bookings?.total / 30) || 0, // Estimate
        maintenanceDue: 3, // TODO: Get from vehicle service
        activeDisputes: overview.disputes?.open || 0,
        pendingIssues: overview.kyc?.pending || 0,
        staffMembers: 8, // TODO: Get from staff repository
        
        // Additional stats
        totalBookings: overview.bookings?.total || 0,
        completedBookings: overview.bookings?.completed || 0,
        revenueGrowth: overview.revenue?.growth || 0,
        userGrowth: overview.users?.growth || 0,
        
        period: overview.period
      };

      logger.info('Dashboard stats retrieved', {
        staffId: req.staff.id,
        period,
        metrics
      });

      return successResponse(res, 'Dashboard stats retrieved successfully', flatStats);
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

  async getRecentActivities(req, res, next) {
    try {
      const { limit = 10, offset = 0, type } = req.query;
      
      const activities = await dashboardService.getRecentActivities({ 
        limit: parseInt(limit), 
        offset: parseInt(offset),
        type 
      });

      logger.info('Recent activities retrieved', {
        staffId: req.staff.id,
        count: activities.length
      });

      return successResponse(res, 'Recent activities retrieved successfully', activities);
    } catch (error) {
      logger.error('Failed to get recent activities', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }

  async getNotifications(req, res, next) {
    try {
      const { limit = 20, unreadOnly = false } = req.query;
      
      const notifications = await dashboardService.getNotifications({
        staffId: req.staff.id,
        limit: parseInt(limit),
        unreadOnly: unreadOnly === 'true'
      });

      logger.info('Notifications retrieved', {
        staffId: req.staff.id,
        count: notifications.length
      });

      return successResponse(res, 'Notifications retrieved successfully', notifications);
    } catch (error) {
      logger.error('Failed to get notifications', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }
}

export default new DashboardController();