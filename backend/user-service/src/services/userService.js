import db from '../models/index.js';
import { 
  logger, 
  AppError
} from '@ev-coownership/shared';
import eventService from './eventService.js';

export class UserService {
  async getUserProfile(userId) {
    try {
      const profile = await db.UserProfile.findOne({
        where: { userId }
      });

      if (!profile) {
        throw new AppError('User profile not found', 404, 'USER_PROFILE_NOT_FOUND');
      }

      logger.debug('User profile retrieved', { userId });

      return profile.getPublicProfile();
    } catch (error) {
      logger.error('Failed to get user profile', { error: error.message, userId });
      throw error;
    }
  }

  async updateUserProfile(userId, updateData) {
    const transaction = await db.sequelize.transaction();

    try {
      let profile = await db.UserProfile.findOne({
        where: { userId },
        transaction
      });

      if (!profile) {
        profile = await db.UserProfile.create({
          userId,
          ...updateData
        }, { transaction });

        eventService.publishUserProfileCreated({
          userId,
          profile: profile.getPublicProfile()
        }).catch(error => logger.error('Failed to publish profile created event', { error: error.message, userId }));

        logger.info('User profile created', { userId });
      } else {
        await profile.update(updateData, { transaction });

        eventService.publishUserProfileUpdated({
          userId,
          profile: profile.getPublicProfile()
        }).catch(error => logger.error('Failed to publish profile updated event', { error: error.message, userId }));

        logger.info('User profile updated', { userId });
      }

      await transaction.commit();
      return profile.getPublicProfile();
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to update user profile', { error: error.message, userId });
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const profile = await db.UserProfile.findOne({
        where: { userId },
        attributes: { exclude: ['preferences'] }
      });

      if (!profile) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      logger.debug('User retrieved by ID', { userId });

      return profile;
    } catch (error) {
      logger.error('Failed to get user by ID', { error: error.message, userId });
      throw error;
    }
  }
}

export default new UserService();