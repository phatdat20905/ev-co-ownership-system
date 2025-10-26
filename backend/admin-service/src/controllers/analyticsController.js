// src/controllers/analyticsController.js
import analyticsService from '../services/analyticsService.js';
import { successResponse, logger } from '@ev-coownership/shared';

export class AnalyticsController {
  async getUserAnalytics(req, res, next) {
    try {
      const { period = '30d', groupBy = 'role', metrics = 'growth,activity' } = req.query;

      const analytics = await analyticsService.getUserAnalytics(period, groupBy, metrics.split(','));

      logger.info('User analytics retrieved successfully', {
        period,
        groupBy,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'User analytics retrieved successfully', analytics);
    } catch (error) {
      logger.error('Failed to get user analytics', {
        error: error.message,
        period: req.query.period
      });
      next(error);
    }
  }

  async getRevenueAnalytics(req, res, next) {
    try {
      const { period = 'monthly', breakdown = 'service', groupBy = 'week' } = req.query;

      const analytics = await analyticsService.getRevenueAnalytics(period, breakdown, groupBy);

      logger.info('Revenue analytics retrieved successfully', {
        period,
        breakdown,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Revenue analytics retrieved successfully', analytics);
    } catch (error) {
      logger.error('Failed to get revenue analytics', {
        error: error.message,
        period: req.query.period
      });
      next(error);
    }
  }

  async getUsageAnalytics(req, res, next) {
    try {
      const { period = 'weekly', metric = 'active_users', dimension = 'time_of_day' } = req.query;

      const analytics = await analyticsService.getUsageAnalytics(period, metric, dimension);

      logger.info('Usage analytics retrieved successfully', {
        period,
        metric,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Usage analytics retrieved successfully', analytics);
    } catch (error) {
      logger.error('Failed to get usage analytics', {
        error: error.message,
        period: req.query.period
      });
      next(error);
    }
  }

  async getSystemLogs(req, res, next) {
    try {
      const {
        level,
        service,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = req.query;

      const filters = {
        level,
        service,
        startDate,
        endDate,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await analyticsService.getSystemLogs(filters);

      logger.debug('System logs retrieved successfully', {
        total: result.pagination.total,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'System logs retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get system logs', {
        error: error.message,
        filters: req.query
      });
      next(error);
    }
  }

  async getServicePerformance(req, res, next) {
    try {
      const { services = 'auth,booking', period = '24h' } = req.query;

      const serviceList = services.split(',');
      const performance = await analyticsService.getServicePerformance(serviceList, period);

      logger.info('Service performance retrieved successfully', {
        services: serviceList,
        period,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Service performance retrieved successfully', performance);
    } catch (error) {
      logger.error('Failed to get service performance', {
        error: error.message,
        services: req.query.services
      });
      next(error);
    }
  }

  async getBusinessInsights(req, res, next) {
    try {
      const { period = 'quarterly', type = 'trends' } = req.query;

      const insights = await analyticsService.getBusinessInsights(period, type);

      logger.info('Business insights retrieved successfully', {
        period,
        type,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Business insights retrieved successfully', insights);
    } catch (error) {
      logger.error('Failed to get business insights', {
        error: error.message,
        period: req.query.period
      });
      next(error);
    }
  }

  async exportAnalytics(req, res, next) {
    try {
      const { type, format = 'json', period = '30d' } = req.query;

      let data;
      switch (type) {
        case 'users':
          data = await analyticsService.getUserAnalytics(period);
          break;
        case 'revenue':
          data = await analyticsService.getRevenueAnalytics(period);
          break;
        case 'usage':
          data = await analyticsService.getUsageAnalytics(period);
          break;
        default:
          data = await analyticsService.getUserAnalytics(period);
      }

      // Set response headers for download
      const filename = `analytics_${type}_${period}_${new Date().toISOString().split('T')[0]}.${format}`;
      
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');

      if (format === 'csv') {
        // Convert to CSV (simplified)
        const csv = this.convertToCSV(data);
        return res.send(csv);
      }

      logger.info('Analytics exported successfully', {
        type,
        format,
        period,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Analytics exported successfully', data);
    } catch (error) {
      logger.error('Failed to export analytics', {
        error: error.message,
        type: req.query.type
      });
      next(error);
    }
  }

  // Helper method to convert data to CSV
  convertToCSV(data) {
    if (!data || typeof data !== 'object') return '';
    
    const flattenObject = (obj, prefix = '') => {
      return Object.keys(obj).reduce((acc, key) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(acc, flattenObject(obj[key], pre + key));
        } else {
          acc[pre + key] = obj[key];
        }
        return acc;
      }, {});
    };

    const flattened = flattenObject(data);
    const headers = Object.keys(flattened).join(',');
    const values = Object.values(flattened).map(val => 
      typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    ).join(',');

    return `${headers}\n${values}`;
  }
}

export default new AnalyticsController();