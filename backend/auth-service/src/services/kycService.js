import db from '../models/index.js';
import { 
  logger, 
  AppError 
} from '@ev-coownership/shared';
import eventService from './eventService.js';

export class KYCService {
  async submitKYC(userId, kycData) {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if user already has a KYC submission
      const existingKYC = await db.KYCVerification.findOne({
        where: { userId },
        transaction
      });

      if (existingKYC) {
        throw new AppError('KYC verification already submitted', 409, 'KYC_ALREADY_SUBMITTED');
      }

      const kyc = await db.KYCVerification.create({
        userId,
        ...kycData
      }, { transaction });

      await transaction.commit();

      // Publish KYC submitted event (non-blocking)
      eventService.publishKYCSubmitted(kyc)
        .catch(error => logger.error('Failed to publish KYC submitted event', { 
          error: error.message,
          kycId: kyc.id 
        }));

      logger.info('KYC submitted successfully', { 
        userId, 
        kycId: kyc.id 
      });

      return kyc;
    } catch (error) {
      await transaction.rollback();
      logger.error('KYC submission failed', { 
        error: error.message, 
        userId 
      });
      throw error;
    }
  }

  async getKYCStatus(userId) {
    try {
      const kyc = await db.KYCVerification.findOne({
        where: { userId },
        include: [{
          model: db.User,
          as: 'user',
          attributes: ['id', 'email', 'role']
        }]
      });

      if (!kyc) {
        // Return null instead of throwing error - user hasn't submitted KYC yet
        logger.debug('KYC verification not found, returning null', { userId });
        return null;
      }

      logger.debug('KYC status retrieved', { 
        userId, 
        status: kyc.verificationStatus 
      });

      return kyc;
    } catch (error) {
      logger.error('Failed to get KYC status', { 
        error: error.message, 
        userId 
      });
      throw error;
    }
  }

  async verifyKYC(kycId, adminId, verificationData) {
    const transaction = await db.sequelize.transaction();

    try {
      const kyc = await db.KYCVerification.findByPk(kycId, { transaction });

      if (!kyc) {
        throw new AppError('KYC verification not found', 404, 'KYC_NOT_FOUND');
      }

      if (kyc.verificationStatus !== 'pending') {
        throw new AppError('KYC verification already processed', 409, 'KYC_ALREADY_PROCESSED');
      }

      // Update KYC status
      await kyc.update({
        verificationStatus: verificationData.verificationStatus,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        rejectionReason: verificationData.rejectionReason
      }, { transaction });

      // If approved, verify the user
      if (verificationData.verificationStatus === 'approved') {
        await db.User.update(
          { isVerified: true },
          { where: { id: kyc.userId }, transaction }
        );
      }

      await transaction.commit();

      // Publish KYC verified event (non-blocking)
      eventService.publishKYCVerified(kyc)
        .catch(error => logger.error('Failed to publish KYC verified event', { 
          error: error.message,
          kycId: kyc.id 
        }));

      logger.info('KYC verification processed', { 
        kycId, 
        adminId, 
        status: verificationData.verificationStatus 
      });

      return kyc;
    } catch (error) {
      await transaction.rollback();
      logger.error('KYC verification failed', { 
        error: error.message, 
        kycId 
      });
      throw error;
    }
  }

  async getPendingKYCs(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await db.KYCVerification.findAndCountAll({
        where: { verificationStatus: 'pending' },
        include: [{
          model: db.User,
          as: 'user',
          attributes: ['id', 'email', 'phone', 'role']
        }],
        limit,
        offset,
        order: [['createdAt', 'ASC']]
      });

      logger.debug('Pending KYCs retrieved', { 
        count, 
        page, 
        limit 
      });

      return {
        kycs: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get pending KYCs', { 
        error: error.message 
      });
      throw error;
    }
  }
}

export default new KYCService();