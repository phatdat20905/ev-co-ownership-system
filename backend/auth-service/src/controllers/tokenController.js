import tokenService from '../services/tokenService.js';
import { successResponse } from '../utils/responseFormatter.js';
import logger from '../utils/logger.js';

export class TokenController {
  async revokeAllTokens(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await tokenService.revokeAllUserTokens(userId);

      logger.info('All tokens revoked', { userId });

      return successResponse(res, 'All tokens revoked successfully', result);
    } catch (error) {
      logger.error('Token revocation failed', { 
        error: error.message, 
        userId: req.user.id 
      });
      next(error);
    }
  }

  async getActiveSessions(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await tokenService.getActiveSessions(userId);

      return successResponse(res, 'Active sessions retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async cleanupTokens(req, res, next) {
    try {
      const result = await tokenService.cleanupExpiredTokens();

      logger.info('Expired tokens cleaned up', { deletedCount: result.deletedCount });

      return successResponse(res, 'Expired tokens cleaned up successfully', result);
    } catch (error) {
      logger.error('Token cleanup failed', { error: error.message });
      next(error);
    }
  }
}

export default new TokenController();