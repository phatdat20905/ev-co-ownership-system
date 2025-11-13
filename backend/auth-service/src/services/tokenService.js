import db from '../models/index.js';
import { logger } from '@ev-coownership/shared';

export class TokenService {
  async revokeAllUserTokens(userId) {
    try {
      await db.RefreshToken.update(
        { isRevoked: true },
        { where: { userId } }
      );

      return { message: 'All tokens revoked successfully' };
    } catch (error) {
      throw error;
    }
  }

  async cleanupExpiredTokens() {
    try {
      const result = await db.RefreshToken.destroy({
        where: {
          expiresAt: { [db.Sequelize.Op.lt]: new Date() }
        }
      });

      return { deletedCount: result };
    } catch (error) {
      throw error;
    }
  }

  async getActiveSessions(userId) {
    try {
      const sessions = await db.RefreshToken.findAll({
        where: {
          userId,
          isRevoked: false,
          expiresAt: { [db.Sequelize.Op.gt]: new Date() }
        },
        order: [['createdAt', 'DESC']]
      });

      return sessions;
    } catch (error) {
      throw error;
    }
  }
}

export default new TokenService();