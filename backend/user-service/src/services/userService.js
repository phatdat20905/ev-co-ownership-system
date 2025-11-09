import db from '../models/index.js';
import { 
  logger, 
  AppError
} from '@ev-coownership/shared';
import eventService from './eventService.js';

export class UserService {
  async getUserProfile(userId) {
    try {
      let profile = await db.UserProfile.findOne({
        where: { userId }
      });

      if (!profile) {
        // Auto-create profile if it doesn't exist (fallback)
        logger.warn('User profile not found, auto-creating', { userId });
        profile = await this.ensureProfileExists(userId);
      }

      logger.debug('User profile retrieved', { userId });

      return profile.getPublicProfile ? profile.getPublicProfile() : profile;
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

  async searchUsers(query) {
    try {
      const profiles = await db.UserProfile.findAll({
        where: {
          [db.Sequelize.Op.or]: [
            { fullName: { [db.Sequelize.Op.iLike]: `%${query}%` } },
            { userId: { [db.Sequelize.Op.iLike]: `%${query}%` } }
          ]
        },
        attributes: ['id', 'userId', 'fullName', 'avatarUrl'],
        limit: 10
      });

      logger.debug('User search completed', { query, results: profiles.length });

      return profiles;
    } catch (error) {
      logger.error('Failed to search users', { error: error.message, query });
      throw error;
    }
  }

  async ensureProfileExists(userId, email = null, phone = null) {
    try {
      // Check if profile exists
      let profile = await db.UserProfile.findOne({ where: { userId } });

      if (!profile) {
        // Create profile if it doesn't exist
        profile = await db.UserProfile.create({
          userId,
          email,
          phone,
          fullName: '',
          dateOfBirth: null,
          gender: null,
          address: null,
          avatarUrl: null,
          isProfileComplete: false
        });

        logger.info('Profile created via ensureProfileExists', { userId });
      }

      return profile;
    } catch (error) {
      logger.error('Failed to ensure profile exists', { error: error.message, userId });
      throw error;
    }
  }
}

export default new UserService();