import { KYCVerification, User } from '../models/index.js';
import logger from '../utils/logger.js';

class KYCService {
  async submitKYC(userId, kycData) {
    const {
      idCardNumber,
      idCardFrontUrl,
      idCardBackUrl,
      driverLicenseNumber,
      driverLicenseUrl
    } = kycData;

    // Check if KYC already exists
    const existingKYC = await KYCVerification.findOne({
      where: { userId }
    });

    if (existingKYC) {
      throw new Error('KYC_ALREADY_SUBMITTED');
    }

    // Create KYC record
    const kyc = await KYCVerification.create({
      userId,
      idCardNumber,
      idCardFrontUrl,
      idCardBackUrl,
      driverLicenseNumber,
      driverLicenseUrl,
      verificationStatus: 'pending'
    });

    logger.info(`KYC submitted for user: ${userId}`);

    return kyc;
  }

  async getKYCStatus(userId) {
    const kyc = await KYCVerification.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'email']
        }
      ]
    });

    if (!kyc) {
      throw new Error('KYC_NOT_FOUND');
    }

    return kyc;
  }

  async verifyKYC(kycId, adminId, status, rejectionReason = null) {
    const kyc = await KYCVerification.findByPk(kycId);
    
    if (!kyc) {
      throw new Error('KYC_NOT_FOUND');
    }

    if (kyc.verificationStatus !== 'pending') {
      throw new Error('KYC_ALREADY_PROCESSED');
    }

    await kyc.update({
      verificationStatus: status,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      rejectionReason: status === 'rejected' ? rejectionReason : null
    });

    // If approved, mark user as verified
    if (status === 'approved') {
      await User.update(
        { isVerified: true },
        { where: { id: kyc.userId } }
      );
    }

    logger.info(`KYC ${status} for user: ${kyc.userId} by admin: ${adminId}`);

    return kyc;
  }

  async getPendingKYC() {
    return await KYCVerification.findAll({
      where: { verificationStatus: 'pending' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'phone', 'role']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  }
}

export default new KYCService();