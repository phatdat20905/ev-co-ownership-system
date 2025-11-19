// src/controllers/analyticsController.js
import analyticsService from '../services/analyticsService.js';
import { successResponse, logger, AppError } from '@ev-coownership/shared';

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

  async getVehicleAnalytics(req, res, next) {
    try {
      const bookingBase = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';

      // Normalize query params to booking-service expectations
      const incomingQuery = { ...(req.query || {}) };
      // Map common period synonyms to booking-service allowed values
      const periodMap = {
        'week': '7d',
        '7d': '7d',
        '30d': '30d',
        'month': '30d',
        '30days': '30d',
        '90d': '90d',
        'quarter': '90d',
        '1y': '1y',
        'year': '1y'
      };

      if (incomingQuery.period) {
        const p = String(incomingQuery.period).toLowerCase();
        if (periodMap[p]) {
          incomingQuery.period = periodMap[p];
        }
      }

      const qs = new URLSearchParams(incomingQuery).toString();
      const path = `/api/v1/bookings/admin/analytics/vehicle-utilization${qs ? `?${qs}` : ''}`;

      // Helper to attempt fetch with a timeout
      const doFetch = async (baseUrl, timeoutMs = 5000) => {
        const url = `${baseUrl.replace(/\/$/, '')}${path}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          // Forward caller Authorization if present
          const forwardAuth = req.get('Authorization');
          const headers = { Accept: 'application/json', ...(forwardAuth ? { Authorization: forwardAuth } : {}) };
          // Include internal token for trusted intra-service calls in dev/test environments
          if (process.env.INTERNAL_API_TOKEN) headers['x-internal-token'] = process.env.INTERNAL_API_TOKEN;

          const resp = await fetch(url, { method: 'GET', headers, signal: controller.signal });
          clearTimeout(timer);
          if (!resp.ok) {
            // Try to parse JSON body for structured upstream error details
            let parsed;
            const text = await resp.text().catch(() => resp.statusText);
            try {
              parsed = JSON.parse(text);
            } catch (e) {
              parsed = text;
            }

            // If upstream returned 5xx treat as Bad Gateway and include upstream details
            if (resp.status >= 500) {
              // Treat upstream 5xx as a bad gateway; parsed may contain useful message for debugging
              throw new AppError('Upstream booking-service error', 502, 'UPSTREAM_ERROR', { upstreamStatus: resp.status });
            }

            // For 4xx, pass through a lightweight error to up-level handlers
            const passThrough = new Error(`Upstream booking-service responded ${resp.status}: ${String(parsed || resp.statusText)}`);
            passThrough.status = resp.status;
            throw passThrough;
          }

          const json = await resp.json();
          return json.data || json;
        } catch (err) {
          clearTimeout(timer);
          // rethrow so caller can decide to fallback
          throw err;
        }
      };

      // First attempt: configured BOOKING_SERVICE_URL
      let data;
      try {
        data = await doFetch(bookingBase, 5000);
      } catch (firstErr) {
        logger.warn('First attempt to fetch vehicle analytics failed, trying localhost fallback', {
          error: firstErr.message,
          bookingBase
        });
        // Try fallback to localhost:3003 if host name resolution failed or container network isn't available
        const fallback = bookingBase.includes('localhost') ? bookingBase : 'http://localhost:3003';
        try {
          data = await doFetch(fallback, 5000);
        } catch (secondErr) {
          logger.error('Failed to get vehicle analytics after fallback', {
            error: secondErr.message,
            bookingBase,
            fallback
          });
          throw secondErr;
        }
      }

      // Ensure returned shape is friendly for frontend: prefer { utilization: [...] } or array
      let normalized = data;
      if (data && data.utilization) normalized = data.utilization;

      logger.info('Vehicle analytics retrieved via booking-service', {
        bookingBase,
        query: req.query,
        requestedBy: req.staff?.id || null
      });

      return successResponse(res, 'Vehicle analytics retrieved successfully', normalized);
    } catch (error) {
      logger.error('Failed to get vehicle analytics', {
        error: error.message,
        query: req.query
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