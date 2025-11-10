import db from '../models/index.js';
import { 
  logger, 
  AppError
} from '@ev-coownership/shared';
import eventService from './eventService.js';

export class UserService {
  /**
   * Get user profile by userId
   * Auto-creates empty profile if not exists
   */
  async getUserProfile(userId) {
    try {
      let profile = await db.UserProfile.findOne({
        where: { userId }
      });

      // Auto-create empty profile if not exists
      if (!profile) {
        logger.info('Profile not found, creating empty profile', { userId });
        profile = await db.UserProfile.create({
          userId,
          fullName: null,
          dateOfBirth: null,
          gender: null,
          phoneNumber: null,
          email: null,
          address: null,
          avatarUrl: null,
          bio: null,
          preferences: {}
        });
        
        // Publish event
        eventService.publishUserProfileCreated({
          userId,
          profile: profile.toJSON()
        }).catch(err => logger.error('Failed to publish event', { error: err.message }));
      }

      logger.debug('User profile retrieved', { userId });
      return profile.toJSON();
    } catch (error) {
      logger.error('Failed to get user profile', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Create or update user profile (upsert pattern)
   * If profile exists, update it. If not, create new.
   */
  async createUserProfile(userId, profileData) {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if profile already exists
      let profile = await db.UserProfile.findOne({
        where: { userId },
        transaction
      });

      const isUpdate = !!profile;

      // Map both snake_case and camelCase
      const profileFields = {
        userId,
        fullName: profileData.fullName || profileData.full_name || null,
        dateOfBirth: profileData.dateOfBirth || profileData.date_of_birth || null,
        gender: profileData.gender || null,
        phoneNumber: profileData.phoneNumber || profileData.phone_number || profileData.phone || null,
        email: profileData.email || null,
        address: profileData.address || null,
        avatarUrl: profileData.avatarUrl || profileData.avatar_url || null,
        bio: profileData.bio || null,
        preferences: profileData.preferences || {}
      };

      if (isUpdate) {
        // Update existing profile
        logger.info('Profile exists, updating', { userId });
        await profile.update(profileFields, { transaction });
      } else {
        // Create new profile
        logger.info('Creating new user profile', { userId });
        profile = await db.UserProfile.create(profileFields, { transaction });
      }

      // Publish event
      const publishMethod = isUpdate ? 'publishUserProfileUpdated' : 'publishUserProfileCreated';
      
      eventService[publishMethod]({
        userId,
        profile: profile.toJSON()
      }).catch(err => logger.error('Failed to publish event', { error: err.message }));

      await transaction.commit();
      logger.info('Profile saved successfully', { userId, profileId: profile.id, action: isUpdate ? 'update' : 'create' });

      return profile.toJSON();
    } catch (error) {
      // Only rollback if transaction hasn't been finished
      if (!transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Failed to save profile', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Update user profile
   * Auto-creates profile if not exists
   */
  async updateUserProfile(userId, updateData) {
    const transaction = await db.sequelize.transaction();

    try {
      let profile = await db.UserProfile.findOne({
        where: { userId },
        transaction
      });

      // Auto-create if not exists
      if (!profile) {
        logger.info('Profile not found during update, creating empty profile first', { userId });
        profile = await db.UserProfile.create({
          userId,
          fullName: null,
          dateOfBirth: null,
          gender: null,
          phoneNumber: null,
          email: null,
          address: null,
          avatarUrl: null,
          bio: null,
          preferences: {}
        }, { transaction });
      }

      // Map fields
      const updateFields = {};
      
      if (updateData.fullName !== undefined || updateData.full_name !== undefined) {
        updateFields.fullName = updateData.fullName || updateData.full_name;
      }
      if (updateData.dateOfBirth !== undefined || updateData.date_of_birth !== undefined) {
        updateFields.dateOfBirth = updateData.dateOfBirth || updateData.date_of_birth;
      }
      if (updateData.gender !== undefined) {
        updateFields.gender = updateData.gender;
      }
      if (updateData.phoneNumber !== undefined || updateData.phone_number !== undefined || updateData.phone !== undefined) {
        updateFields.phoneNumber = updateData.phoneNumber || updateData.phone_number || updateData.phone;
      }
      if (updateData.email !== undefined) {
        updateFields.email = updateData.email;
      }
      if (updateData.address !== undefined) {
        updateFields.address = updateData.address;
      }
      if (updateData.avatarUrl !== undefined || updateData.avatar_url !== undefined) {
        updateFields.avatarUrl = updateData.avatarUrl || updateData.avatar_url;
      }
      if (updateData.bio !== undefined) {
        updateFields.bio = updateData.bio;
      }
      if (updateData.preferences !== undefined) {
        updateFields.preferences = updateData.preferences;
      }

      await profile.update(updateFields, { transaction });

      // Publish event
      eventService.publishUserProfileUpdated({
        userId,
        profile: profile.toJSON()
      }).catch(err => logger.error('Failed to publish event', { error: err.message }));

      await transaction.commit();
      logger.info('Profile updated successfully', { userId, fields: Object.keys(updateFields) });

      return profile.toJSON();
    } catch (error) {
      // Only rollback if transaction hasn't been finished
      if (!transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Failed to update profile', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Update avatar URL
   */
  async updateAvatar(userId, avatarUrl) {
    try {
      const profile = await db.UserProfile.findOne({
        where: { userId }
      });

      if (!profile) {
        throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');
      }

      await profile.update({ avatarUrl });
      logger.info('Avatar updated', { userId });
      
      return profile.toJSON();
    } catch (error) {
      logger.error('Failed to update avatar', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get user by ID (public profile)
   */
  async getUserById(userId) {
    try {
      const profile = await db.UserProfile.findOne({
        where: { userId },
        attributes: ['id', 'userId', 'fullName', 'avatarUrl', 'bio', 'createdAt']
      });

      if (!profile) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      return profile.toJSON();
    } catch (error) {
      logger.error('Failed to get user by ID', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Search users
   */
  async searchUsers(query) {
    try {
      const profiles = await db.UserProfile.findAll({
        where: {
          fullName: { [db.Sequelize.Op.iLike]: `%${query}%` }
        },
        attributes: ['id', 'userId', 'fullName', 'avatarUrl'],
        limit: 20,
        order: [['fullName', 'ASC']]
      });

      return profiles.map(p => p.toJSON());
    } catch (error) {
      logger.error('Failed to search users', { error: error.message, query });
      throw error;
    }
  }
}

export default new UserService();