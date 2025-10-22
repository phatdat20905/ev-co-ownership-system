import userService from '../services/userService.js';
import { 
  successResponse, 
  logger 
} from '@ev-coownership/shared';

export class UserController {
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
}

export default new UserController();