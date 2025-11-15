// src/controllers/kycController.js
import kycService from '../services/kycService.js';
import { successResponse, logger, AppError } from '@ev-coownership/shared';

export class KYCController {
  async getKYC(req, res, next) {
    try {
      const { kycId } = req.params;
      
      const kyc = await kycService.getKYCById(kycId);

      logger.debug('KYC retrieved successfully', {
        kycId,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'KYC retrieved successfully', kyc);
    } catch (error) {
      logger.error('Failed to get KYC', {
        error: error.message,
        kycId: req.params.kycId
      });
      next(error);
    }
  }

  async listKYCs(req, res, next) {
    try {
      const {
        status = 'pending',
        page = 1,
        limit = 20
      } = req.query;

      const filters = {
        status,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await kycService.listKYCS(filters);

      logger.debug('KYC list retrieved successfully', {
        total: result.pagination.total,
        status,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'KYC list retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to list KYC submissions', {
        error: error.message,
        filters: req.query
      });
      next(error);
    }
  }

  async approveKYC(req, res, next) {
    try {
      const { kycId } = req.params;

      const kyc = await kycService.approveKYC(kycId, req.staff.id);

      logger.info('KYC approved successfully', {
        kycId,
        approvedBy: req.staff.id
      });

      return successResponse(res, 'KYC approved successfully', kyc);
    } catch (error) {
      logger.error('Failed to approve KYC', {
        error: error.message,
        kycId: req.params.kycId
      });
      next(error);
    }
  }

  async rejectKYC(req, res, next) {
    try {
      const { kycId } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason || rejectionReason.trim().length === 0) {
        throw new AppError('Rejection reason is required', 400, 'REJECTION_REASON_REQUIRED');
      }

      const kyc = await kycService.rejectKYC(kycId, req.staff.id, rejectionReason);

      logger.info('KYC rejected successfully', {
        kycId,
        rejectedBy: req.staff.id,
        reason: rejectionReason
      });

      return successResponse(res, 'KYC rejected successfully', kyc);
    } catch (error) {
      logger.error('Failed to reject KYC', {
        error: error.message,
        kycId: req.params.kycId
      });
      next(error);
    }
  }

  async getKYCByUser(req, res, next) {
    try {
      const { userId } = req.params;

      const kyc = await kycService.getKYCByUserId(userId);

      logger.debug('KYC by user retrieved successfully', {
        userId,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'KYC by user retrieved successfully', kyc);
    } catch (error) {
      logger.error('Failed to get KYC by user', {
        error: error.message,
        userId: req.params.userId
      });
      next(error);
    }
  }

  async getKYCStats(req, res, next) {
    try {
      const { period = '30' } = req.query;

      const stats = await kycService.getKYCStats(period);

      logger.debug('KYC stats retrieved successfully', {
        period,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'KYC stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get KYC stats', {
        error: error.message,
        period: req.query.period
      });
      next(error);
    }
  }

  async getKYCHistory(req, res, next) {
    try {
      const { userId } = req.query;
      const { page = 1, limit = 20 } = req.query;

      if (!userId) {
        throw new AppError('User ID is required', 400, 'USER_ID_REQUIRED');
      }

      // Get all KYC submissions for user
      const kyc = await kycService.getKYCByUserId(userId);
      
      const history = {
        userId,
        current: kyc,
        submissions: [kyc] // In real implementation, this would include historical submissions
      };

      logger.debug('KYC history retrieved successfully', {
        userId,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'KYC history retrieved successfully', history);
    } catch (error) {
      logger.error('Failed to get KYC history', {
        error: error.message,
        userId: req.query.userId
      });
      next(error);
    }
  }
}

export default new KYCController();