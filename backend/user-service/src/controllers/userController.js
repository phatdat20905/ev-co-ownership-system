import userService from '../services/userService.js';
import { 
  successResponse, 
  logger,
  AppError
} from '@ev-coownership/shared';

export class UserController {
  async createProfile(req, res, next) {
    try {
      // Accept unauthenticated requests (pending profile creation)
      // userId can come from token, request body, or be omitted for pending profile
      const userId = req.user?.id || req.body.userId || null;

      const profileData = req.body;

      const profile = await userService.createUserProfile(userId, profileData);

      logger.info('User profile created successfully', { userId: profile.userId });

      return successResponse(res, 'Profile created successfully', profile, 201);
    } catch (error) {
      logger.error('Failed to create user profile', { 
        error: error.message, 
        userId: req.user?.id || req.body.userId 
      });
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await userService.getUserProfile(userId);

      logger.info('User profile retrieved successfully', { userId });

      return successResponse(res, 'Profile retrieved successfully', profile);
    } catch (error) {
      logger.error('Failed to get user profile', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const updatedProfile = await userService.updateUserProfile(userId, updateData);

      logger.info('User profile updated successfully', { userId });

      return successResponse(res, 'Profile updated successfully', updatedProfile);
    } catch (error) {
      logger.error('Failed to update user profile', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await userService.getUserById(userId);

      logger.info('User retrieved successfully', { userId });

      return successResponse(res, 'User retrieved successfully', user);
    } catch (error) {
      logger.error('Failed to get user by ID', { 
        error: error.message, 
        userId: req.params.userId 
      });
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      const userId = req.user.id;
      
      if (!req.file) {
        throw new AppError('No file uploaded', 400, 'NO_FILE');
      }

      // Generate avatar URL
      // Build absolute URL so it passes Joi "uri" validation in the profile validator.
      // Use request host/protocol to construct a public URL for the uploaded file.
      const host = req.get('host');
      const protocol = req.protocol || 'http';
      const avatarUrl = `${protocol}://${host}/uploads/avatars/${req.file.filename}`;
      
      const updatedProfile = await userService.updateUserProfile(userId, { avatarUrl });

      logger.info('Avatar uploaded successfully', { userId, filename: req.file.filename });

      return successResponse(res, 'Avatar uploaded successfully', updatedProfile);
    } catch (error) {
      logger.error('Failed to upload avatar', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async searchUsers(req, res, next) {
    try {
      // Accept both 'q' (for general search) and 'identifier' (for specific email/phone search)
      const { q, identifier } = req.query;
      const searchQuery = q || identifier;
      
      if (!searchQuery || searchQuery.length < 2) {
        throw new AppError('Search query must be at least 2 characters', 400, 'INVALID_QUERY');
      }

      const users = await userService.searchUsers(searchQuery);

      logger.info('User search completed', { query: searchQuery, results: users.length });

      return successResponse(res, 'Search completed', users);
    } catch (error) {
      logger.error('Failed to search users', { 
        error: error.message, 
        query: req.query.q || req.query.identifier 
      });
      next(error);
    }
  }
}

export default new UserController();