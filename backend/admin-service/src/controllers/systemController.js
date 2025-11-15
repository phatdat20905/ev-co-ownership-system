// src/controllers/systemController.js
import systemSettingsService from '../services/systemSettingsService.js';
import healthMonitorService from '../services/healthMonitorService.js';
import { successResponse, logger, AppError } from '@ev-coownership/shared';

export class SystemController {
  async getSettings(req, res, next) {
    try {
      const { category } = req.query;

      const settings = await systemSettingsService.getSettings(category);

      logger.debug('System settings retrieved successfully', {
        category,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'System settings retrieved successfully', settings);
    } catch (error) {
      logger.error('Failed to get system settings', {
        error: error.message,
        category: req.query.category
      });
      next(error);
    }
  }

  async updateSetting(req, res, next) {
    try {
      const { key } = req.params;
      const { value } = req.body;

      const setting = await systemSettingsService.updateSetting(key, value, req.staff.id);

      logger.info('System setting updated successfully', {
        key,
        updatedBy: req.staff.id
      });

      return successResponse(res, 'System setting updated successfully', setting);
    } catch (error) {
      logger.error('Failed to update system setting', {
        error: error.message,
        key: req.params.key
      });
      next(error);
    }
  }

  async updateMultipleSettings(req, res, next) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        throw new AppError('Updates array is required', 400, 'INVALID_UPDATES');
      }

      const results = await systemSettingsService.updateMultipleSettings(updates, req.staff.id);

      logger.info('Multiple system settings updated successfully', {
        count: results.length,
        updatedBy: req.staff.id
      });

      return successResponse(res, 'System settings updated successfully', results);
    } catch (error) {
      logger.error('Failed to update multiple system settings', {
        error: error.message,
        updatedBy: req.staff?.id
      });
      next(error);
    }
  }

  async createSetting(req, res, next) {
    try {
      const settingData = {
        ...req.body,
        updatedBy: req.staff.id
      };

      const setting = await systemSettingsService.createSetting(settingData);

      logger.info('System setting created successfully', {
        key: setting.settingKey,
        createdBy: req.staff.id
      });

      return successResponse(res, 'System setting created successfully', setting, 201);
    } catch (error) {
      logger.error('Failed to create system setting', {
        error: error.message,
        createdBy: req.staff?.id
      });
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const {
        action,
        entityType,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = req.query;

      const AuditLog = (await import('../models/index.js')).default.AuditLog;
      
      const where = {};
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.$gte = new Date(startDate);
        if (endDate) where.createdAt.$lte = new Date(endDate);
      }

      const result = await AuditLog.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      const response = {
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.count,
          totalPages: Math.ceil(result.count / limit)
        }
      };

      logger.debug('Audit logs retrieved successfully', {
        total: result.count,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Audit logs retrieved successfully', response);
    } catch (error) {
      logger.error('Failed to get audit logs', {
        error: error.message,
        filters: req.query
      });
      next(error);
    }
  }

  async getSystemMetrics(req, res, next) {
    try {
      const { type = 'performance', period = 'hourly' } = req.query;

      const analyticsRepository = (await import('../repositories/analyticsRepository.js')).default;
      const metrics = await analyticsRepository.getAdminMetrics(type, 
        new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        new Date()
      );

      logger.debug('System metrics retrieved successfully', {
        type,
        period,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'System metrics retrieved successfully', metrics);
    } catch (error) {
      logger.error('Failed to get system metrics', {
        error: error.message,
        type: req.query.type
      });
      next(error);
    }
  }

  async getHealthStatus(req, res, next) {
    try {
      const { hours = 24 } = req.query;

      const healthHistory = healthMonitorService.getHealthHistory(parseInt(hours));
      const uptimeStats = healthMonitorService.getUptimeStats(parseInt(hours));
      const dependencies = await healthMonitorService.getServiceDependencies();

      const healthStatus = {
        current: await healthMonitorService.performHealthChecks(),
        history: healthHistory,
        uptime: uptimeStats,
        dependencies
      };

      logger.debug('Health status retrieved successfully', {
        hours,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Health status retrieved successfully', healthStatus);
    } catch (error) {
      logger.error('Failed to get health status', {
        error: error.message,
        hours: req.query.hours
      });
      next(error);
    }
  }
}

export default new SystemController();