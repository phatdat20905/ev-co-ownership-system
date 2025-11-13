// src/services/kycService.js (tiếp theo)
import kycRepository from '../repositories/kycRepository.js';
import staffService from './staffService.js';
import { logger, AppError } from '@ev-coownership/shared';
import eventService from './eventService.js';

export class KYCService {
  async createKYCSubmission(kycData) {
    try {
      // Check if user already has a KYC submission
      const existingKYC = await kycRepository.findByUserId(kycData.userId);
      if (existingKYC) {
        throw new AppError('KYC submission already exists for this user', 400, 'DUPLICATE_KYC_SUBMISSION');
      }

      const kyc = await kycRepository.create(kycData);

      logger.info('KYC submission created successfully', {
        kycId: kyc.id,
        userId: kyc.userId,
        status: kyc.verificationStatus
      });

      await eventService.publishKYCSubmitted({
        kycId: kyc.id,
        userId: kyc.userId,
        submittedAt: kyc.submittedAt
      });

      return kyc;
    } catch (error) {
      logger.error('Failed to create KYC submission', {
        error: error.message,
        userId: kycData.userId
      });
      throw error;
    }
  }

  async getKYCById(kycId) {
    try {
      const kyc = await kycRepository.findById(kycId, {
        include: [
          {
            model: (await import('../models/index.js')).default.StaffProfile,
            as: 'verifiedByStaff',
            attributes: ['id', 'employeeId', 'position']
          }
        ]
      });
      if (!kyc) {
        throw new AppError('KYC submission not found', 404, 'KYC_NOT_FOUND');
      }
      return kyc;
    } catch (error) {
      logger.error('Failed to get KYC by ID', {
        error: error.message,
        kycId
      });
      throw error;
    }
  }

  async getKYCByUserId(userId) {
    try {
      const kyc = await kycRepository.findByUserId(userId);
      if (!kyc) {
        throw new AppError('KYC submission not found for user', 404, 'KYC_NOT_FOUND');
      }
      return kyc;
    } catch (error) {
      logger.error('Failed to get KYC by user ID', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  async listKYCS(filters = {}) {
    try {
      const {
        status,
        page = 1,
        limit = 20
      } = filters;

      const where = {};
      if (status) where.verificationStatus = status;

      const include = [
        {
          model: (await import('../models/index.js')).default.StaffProfile,
          as: 'verifiedByStaff',
          attributes: ['id', 'employeeId', 'position']
        }
      ];

      const result = await kycRepository.paginate({
        where,
        include,
        page,
        limit,
        order: [['submittedAt', 'ASC']]
      });

      logger.debug('KYC list retrieved successfully', {
        total: result.pagination.total,
        page,
        limit
      });

      return result;
    } catch (error) {
      logger.error('Failed to list KYC submissions', {
        error: error.message,
        filters
      });
      throw error;
    }
  }

  async approveKYC(kycId, staffId) {
    try {
      // Validate staff permissions
      await staffService.validateStaffPermissions(staffId, 'kyc_approval');

      const kyc = await kycRepository.approveKYC(kycId, staffId);
      if (!kyc) {
        throw new AppError('KYC submission not found', 404, 'KYC_NOT_FOUND');
      }

      logger.info('KYC approved successfully', {
        kycId,
        approvedBy: staffId
      });

      await eventService.publishKYCApproved({
        kycId: kyc.id,
        userId: kyc.userId,
        approvedBy: staffId,
        approvedAt: kyc.verifiedAt
      });

      return kyc;
    } catch (error) {
      logger.error('Failed to approve KYC', {
        error: error.message,
        kycId,
        staffId
      });
      throw error;
    }
  }

  async rejectKYC(kycId, staffId, rejectionReason) {
    try {
      // Validate staff permissions
      await staffService.validateStaffPermissions(staffId, 'kyc_approval');

      if (!rejectionReason || rejectionReason.trim().length === 0) {
        throw new AppError('Rejection reason is required', 400, 'REJECTION_REASON_REQUIRED');
      }

      const kyc = await kycRepository.rejectKYC(kycId, staffId, rejectionReason);
      if (!kyc) {
        throw new AppError('KYC submission not found', 404, 'KYC_NOT_FOUND');
      }

      logger.info('KYC rejected successfully', {
        kycId,
        rejectedBy: staffId,
        reason: rejectionReason
      });

      await eventService.publishKYCRejected({
        kycId: kyc.id,
        userId: kyc.userId,
        rejectedBy: staffId,
        rejectionReason,
        rejectedAt: kyc.verifiedAt
      });

      return kyc;
    } catch (error) {
      logger.error('Failed to reject KYC', {
        error: error.message,
        kycId,
        staffId
      });
      throw error;
    }
  }

  async getKYCStats(period = '30') {
    try {
      const stats = await kycRepository.getKYCStats(period);
      const avgProcessingTime = await kycRepository.getAverageProcessingTime(period);

      const summary = {
        total: stats.reduce((sum, item) => sum + parseInt(item.count), 0),
        byStatus: {},
        averageProcessingTime: Math.round(avgProcessingTime * 100) / 100
      };

      stats.forEach(item => {
        summary.byStatus[item.verificationStatus] = parseInt(item.count);
      });

      logger.debug('KYC stats retrieved successfully', { period });

      return summary;
    } catch (error) {
      logger.error('Failed to get KYC stats', {
        error: error.message,
        period
      });
      throw error;
    }
  }
}

export default new KYCService();