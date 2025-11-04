// src/services/preferenceService.js
import db from '../models/index.js';
import { AppError, logger } from '@ev-coownership/shared';
import { validatePreference } from '../utils/notificationValidator.js';
import { DEFAULT_PREFERENCES } from '../utils/constants.js';

class PreferenceService {
  async getUserPreferences(userId) {
    let preferences = await db.UserPreference.findOne({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences if not exists
      preferences = await db.UserPreference.create({
        userId,
        preferences: DEFAULT_PREFERENCES,
      });
      
      logger.info('Default preferences created for user', { userId });
    }

    return preferences;
  }

  async updateUserPreferences(userId, preferenceData) {
    const validatedData = validatePreference(preferenceData);

    let preferences = await db.UserPreference.findOne({
      where: { userId },
    });

    if (preferences) {
      await preferences.update({
        preferences: validatedData.preferences,
      });
    } else {
      preferences = await db.UserPreference.create({
        userId,
        preferences: validatedData.preferences,
      });
    }

    logger.info('User preferences updated', { userId });

    return preferences;
  }

  async registerDeviceToken(userId, deviceToken, platform) {
    if (!['ios', 'android', 'web'].includes(platform)) {
      throw new AppError('Invalid platform. Must be: ios, android, or web', 400, 'INVALID_PLATFORM');
    }

    // Check if token already exists
    const existingToken = await db.DeviceToken.findOne({
      where: { token: deviceToken },
    });

    if (existingToken) {
      // Update existing token
      await existingToken.update({
        userId,
        platform,
        isActive: true,
      });

      logger.info('Device token updated', {
        userId,
        platform,
        token: deviceToken.substring(0, 10) + '...',
      });

      return existingToken;
    }

    // Create new token
    const token = await db.DeviceToken.create({
      userId,
      token: deviceToken,
      platform,
    });

    logger.info('Device token registered', {
      userId,
      platform,
      token: deviceToken.substring(0, 10) + '...',
    });

    return token;
  }

  async unregisterDeviceToken(deviceToken) {
    const token = await db.DeviceToken.findOne({
      where: { token: deviceToken },
    });

    if (!token) {
      throw new AppError('Device token not found', 404, 'TOKEN_NOT_FOUND');
    }

    await token.update({ isActive: false });

    logger.info('Device token unregistered', {
      userId: token.userId,
      token: deviceToken.substring(0, 10) + '...',
    });

    return { success: true };
  }

  async getUserDeviceTokens(userId) {
    const tokens = await db.DeviceToken.findAll({
      where: {
        userId,
        isActive: true,
      },
      attributes: ['id', 'token', 'platform', 'createdAt'],
    });

    return tokens;
  }

  async bulkUpdatePreferences(userIds, preferenceData) {
    const validatedData = validatePreference(preferenceData);

    const results = {
      updated: 0,
      created: 0,
      errors: [],
    };

    for (const userId of userIds) {
      try {
        let preferences = await db.UserPreference.findOne({
          where: { userId },
        });

        if (preferences) {
          await preferences.update({
            preferences: validatedData.preferences,
          });
          results.updated++;
        } else {
          await db.UserPreference.create({
            userId,
            preferences: validatedData.preferences,
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          userId,
          error: error.message,
        });
      }
    }

    logger.info('Bulk preferences update completed', results);

    return results;
  }
}

export default new PreferenceService();