// src/controllers/preferenceController.js
import preferenceService from '../services/preferenceService.js';
import { successResponse, logger } from '@ev-coownership/shared';

class PreferenceController {
  async getPreferences(req, res, next) {
    try {
      const { userId } = req.params;
      
      const preferences = await preferenceService.getUserPreferences(userId);

      return successResponse(res, 'Preferences retrieved successfully', preferences);
    } catch (error) {
      logger.error('Failed to get preferences', {
        error: error.message,
        userId: req.params?.userId,
      });
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const { userId } = req.params;
      
      const preferences = await preferenceService.updateUserPreferences(userId, req.body);

      return successResponse(res, 'Preferences updated successfully', preferences);
    } catch (error) {
      logger.error('Failed to update preferences', {
        error: error.message,
        userId: req.params?.userId,
      });
      next(error);
    }
  }

  async registerDevice(req, res, next) {
    try {
      const { userId } = req.body;
      const { token, platform } = req.body;
      
      if (!userId || !token || !platform) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'User ID, token, and platform are required',
          },
        });
      }

      const deviceToken = await preferenceService.registerDeviceToken(userId, token, platform);

      return successResponse(res, 'Device registered successfully', deviceToken, 201);
    } catch (error) {
      logger.error('Failed to register device', {
        error: error.message,
        userId: req.body?.userId,
        platform: req.body?.platform,
      });
      next(error);
    }
  }

  async unregisterDevice(req, res, next) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'Device token is required',
          },
        });
      }

      const result = await preferenceService.unregisterDeviceToken(token);

      return successResponse(res, 'Device unregistered successfully', result);
    } catch (error) {
      logger.error('Failed to unregister device', {
        error: error.message,
        token: req.body?.token?.substring(0, 10) + '...',
      });
      next(error);
    }
  }

  async getUserDevices(req, res, next) {
    try {
      const { userId } = req.params;
      
      const devices = await preferenceService.getUserDeviceTokens(userId);

      return successResponse(res, 'User devices retrieved successfully', devices);
    } catch (error) {
      logger.error('Failed to get user devices', {
        error: error.message,
        userId: req.params?.userId,
      });
      next(error);
    }
  }

  async bulkUpdatePreferences(req, res, next) {
    try {
      const { userIds, preferences } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'User IDs array is required',
          },
        });
      }

      const result = await preferenceService.bulkUpdatePreferences(userIds, { preferences });

      return successResponse(res, 'Bulk preferences update completed', result);
    } catch (error) {
      logger.error('Failed to bulk update preferences', {
        error: error.message,
        userIdsCount: req.body?.userIds?.length,
      });
      next(error);
    }
  }
}

export default new PreferenceController();