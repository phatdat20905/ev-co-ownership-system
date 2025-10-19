import db from '../models/index.js';
import logger from '../utils/logger.js';

export class KYCService {
  async submitKYC(userId, kycData) {
    try {
      // Check if user already has a KYC submission
      const existingKYC = await db.KYCVerification.findOne({
        where: { userId }
      });

      if (existingKYC) {
        throw {
          code: 'KYC_ALREADY_SUBMITTED',
          message: 'KYC verification already submitted',
          statusCode: 409
        };
      }

      const kyc = await db.KYCVerification.create({
        userId,
        ...kycData
      });

      logger.info('KYC submitted successfully', { userId, kycId: kyc.id });

      return kyc;
    } catch (error) {
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
        throw {
          code: 'KYC_NOT_FOUND',
          message: 'KYC verification not found',
          statusCode: 404
        };
      }

      return kyc;
    } catch (error) {
      throw error;
    }
  }

  async verifyKYC(kycId, adminId, verificationData) {
    const transaction = await db.sequelize.transaction();

    try {
      const kyc = await db.KYCVerification.findByPk(kycId, { transaction });

      if (!kyc) {
        throw {
          code: 'KYC_NOT_FOUND',
          message: 'KYC verification not found',
          statusCode: 404
        };
      }

      if (kyc.verificationStatus !== 'pending') {
        throw {
          code: 'KYC_ALREADY_PROCESSED',
          message: 'KYC verification already processed',
          statusCode: 409
        };
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

      logger.info('KYC verification processed', { 
        kycId, 
        adminId, 
        status: verificationData.verificationStatus 
      });

      return kyc;
    } catch (error) {
      await transaction.rollback();
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
      throw error;
    }
  }
}

export default new KYCService();