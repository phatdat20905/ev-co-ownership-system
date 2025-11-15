// src/controllers/userManagementController.js
import { successResponse, logger, AppError } from '@ev-coownership/shared';
import analyticsRepository from '../repositories/analyticsRepository.js';

export class UserManagementController {
  async listUsers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        status,
        search
      } = req.query;

      // In real implementation, this would call User Service
      // For now, return mock data from analytics
      const userEvents = await analyticsRepository.getAnalyticsEvents({
        event_type: 'user.registered'
      }, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { timestamp: -1 }
      });

      // Transform analytics data to user-like structure
      const users = userEvents.data.map(event => ({
        id: event.user_id || `user_${event._id}`,
        email: event.metadata?.email || `user${Math.random().toString(36).substring(7)}@example.com`,
        role: event.user_role || 'co_owner',
        status: 'active',
        createdAt: event.timestamp,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }));

      const result = {
        data: users,
        pagination: userEvents.pagination
      };

      logger.info('Users list retrieved successfully', {
        staffId: req.staff.id,
        total: result.pagination.total
      });

      return successResponse(res, 'Users list retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to list users', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }

  async getUser(req, res, next) {
    try {
      const { userId } = req.params;

      // In real implementation, this would call User Service
      // Mock user data
      const user = {
        id: userId,
        email: `user${userId.substring(0, 8)}@example.com`,
        role: 'co_owner',
        status: 'active',
        profile: {
          fullName: 'Nguyễn Văn A',
          phone: '+84123456789',
          address: 'Hà Nội, Việt Nam'
        },
        groups: [
          { id: 'group1', name: 'EV Group 1', role: 'admin' },
          { id: 'group2', name: 'EV Group 2', role: 'member' }
        ],
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date()
      };

      logger.debug('User details retrieved successfully', {
        userId,
        staffId: req.staff.id
      });

      return successResponse(res, 'User details retrieved successfully', user);
    } catch (error) {
      logger.error('Failed to get user', {
        error: error.message,
        userId: req.params.userId
      });
      next(error);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!['active', 'suspended', 'banned'].includes(status)) {
        throw new AppError('Invalid status value', 400, 'INVALID_STATUS');
      }

      // In real implementation, this would call User Service
      // Mock update
      const updatedUser = {
        id: userId,
        status,
        updatedAt: new Date(),
        updatedBy: req.staff.id
      };

      logger.info('User status updated successfully', {
        userId,
        status,
        updatedBy: req.staff.id
      });

      return successResponse(res, 'User status updated successfully', updatedUser);
    } catch (error) {
      logger.error('Failed to update user status', {
        error: error.message,
        userId: req.params.userId
      });
      next(error);
    }
  }

  async getUserActivity(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Get user activity from analytics
      const activity = await analyticsRepository.getAnalyticsEvents({
        user_id: userId
      }, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { timestamp: -1 }
      });

      logger.debug('User activity retrieved successfully', {
        userId,
        staffId: req.staff.id,
        total: activity.pagination.total
      });

      return successResponse(res, 'User activity retrieved successfully', activity);
    } catch (error) {
      logger.error('Failed to get user activity', {
        error: error.message,
        userId: req.params.userId
      });
      next(error);
    }
  }

  async getUserAnalytics(req, res, next) {
    try {
      const { userId } = req.params;
      const { period = '30d' } = req.query;

      // Get user-specific analytics
      const userEvents = await analyticsRepository.getAnalyticsEvents({
        user_id: userId
      });

      const analytics = {
        userId,
        period,
        totalActivities: userEvents.pagination.total,
        activityTypes: this.groupActivitiesByType(userEvents.data),
        recentActivity: userEvents.data.slice(0, 10),
        usagePatterns: this.analyzeUsagePatterns(userEvents.data)
      };

      logger.debug('User analytics retrieved successfully', {
        userId,
        staffId: req.staff.id
      });

      return successResponse(res, 'User analytics retrieved successfully', analytics);
    } catch (error) {
      logger.error('Failed to get user analytics', {
        error: error.message,
        userId: req.params.userId
      });
      next(error);
    }
  }

  // Helper methods
  groupActivitiesByType(activities) {
    const types = {};
    activities.forEach(activity => {
      const type = activity.event_type || 'unknown';
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }

  analyzeUsagePatterns(activities) {
    // Mock analysis
    return {
      mostActiveTime: '14:00-18:00',
      favoriteService: 'booking-service',
      averageSessionsPerWeek: 12,
      lastActive: activities[0]?.timestamp || new Date()
    };
  }
}

export default new UserManagementController();