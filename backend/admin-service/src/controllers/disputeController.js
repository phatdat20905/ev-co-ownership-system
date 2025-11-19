// src/controllers/disputeController.js
import disputeService from '../services/disputeService.js';
import { successResponse, logger, AppError } from '@ev-coownership/shared';

export class DisputeController {
  async createDispute(req, res, next) {
    try {
      const disputeData = {
        ...req.body,
        filedBy: req.staff.userId // Staff filing on behalf of user
      };

      const dispute = await disputeService.createDispute(disputeData);

      logger.info('Dispute created successfully', {
        disputeId: dispute.id,
        createdBy: req.staff.id
      });

      return successResponse(res, 'Dispute created successfully', dispute, 201);
    } catch (error) {
      logger.error('Failed to create dispute', {
        error: error.message,
        createdBy: req.staff?.id
      });
      next(error);
    }
  }

  async getDispute(req, res, next) {
    try {
      const { disputeId } = req.params;
      
      const dispute = await disputeService.getDisputeById(disputeId);

      logger.debug('Dispute retrieved successfully', {
        disputeId,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Dispute retrieved successfully', dispute);
    } catch (error) {
      logger.error('Failed to get dispute', {
        error: error.message,
        disputeId: req.params.disputeId
      });
      next(error);
    }
  }

  async listDisputes(req, res, next) {
    try {
      const {
        status,
        priority,
        type,
        assignedTo,
        page = 1,
        limit = 20
      } = req.query;

      // Normalize frontend filter values to backend enum values to avoid invalid queries
      const statusMap = {
        pending: 'open',
        in_progress: 'investigating',
        resolved: 'resolved',
        cancelled: 'closed',
        open: 'open',
        investigating: 'investigating',
        closed: 'closed'
      };

      const typeMap = {
        schedule: 'booking_conflict',
        payment: 'cost_dispute',
        damage: 'damage_claim',
        other: 'other'
      };

      const normalizedStatus = status ? (statusMap[status] || status) : undefined;
      const normalizedType = type ? (typeMap[type] || type) : undefined;

      const filters = {
        status: normalizedStatus,
        priority,
        type: normalizedType,
        assignedTo,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20
      };

      const result = await disputeService.listDisputes(filters);

      logger.debug('Disputes list retrieved successfully', {
        total: result.pagination.total,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Disputes list retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to list disputes', {
        error: error.message,
        filters: req.query
      });
      next(error);
    }
  }

  async assignDispute(req, res, next) {
    try {
      const { disputeId } = req.params;
      const { staffId } = req.body;

      const dispute = await disputeService.assignDispute(disputeId, staffId, req.staff.id);

      logger.info('Dispute assigned successfully', {
        disputeId,
        assignedTo: staffId,
        assignedBy: req.staff.id
      });

      return successResponse(res, 'Dispute assigned successfully', dispute);
    } catch (error) {
      logger.error('Failed to assign dispute', {
        error: error.message,
        disputeId: req.params.disputeId,
        staffId: req.body.staffId
      });
      next(error);
    }
  }

  async addDisputeMessage(req, res, next) {
    try {
      const { disputeId } = req.params;
      const messageData = {
        ...req.body,
        // Use staff.id when available; fall back to authenticated user id for admin pseudo-staff
        senderId: req.staff?.id || req.user?.id || null,
        isInternal: req.body.isInternal || false
      };

      const message = await disputeService.addDisputeMessage(disputeId, messageData);

      logger.info('Dispute message added successfully', {
        disputeId,
        messageId: message.id,
        senderId: req.staff.id
      });

      return successResponse(res, 'Dispute message added successfully', message, 201);
    } catch (error) {
      logger.error('Failed to add dispute message', {
        error: error.message,
        disputeId: req.params.disputeId
      });
      next(error);
    }
  }

  async resolveDispute(req, res, next) {
    try {
      const { disputeId } = req.params;
      const resolutionData = {
        ...req.body,
        // If the request is from a pseudo-staff/admin with no staff.id, fall back to the authenticated user id
        resolvedBy: req.staff?.id || req.user?.id || null
      };

      const dispute = await disputeService.resolveDispute(disputeId, resolutionData);

      logger.info('Dispute resolved successfully', {
        disputeId,
        resolvedBy: req.staff.id
      });

      return successResponse(res, 'Dispute resolved successfully', dispute);
    } catch (error) {
      logger.error('Failed to resolve dispute', {
        error: error.message,
        disputeId: req.params.disputeId
      });
      next(error);
    }
  }

  async escalateDispute(req, res, next) {
    try {
      const { disputeId } = req.params;
      const { priority } = req.body;

      if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
        throw new AppError('Invalid priority value', 400, 'INVALID_PRIORITY');
      }

      const dispute = await disputeService.escalateDispute(disputeId, priority, req.staff.id);

      logger.info('Dispute escalated successfully', {
        disputeId,
        newPriority: priority,
        escalatedBy: req.staff.id
      });

      return successResponse(res, 'Dispute escalated successfully', dispute);
    } catch (error) {
      logger.error('Failed to escalate dispute', {
        error: error.message,
        disputeId: req.params.disputeId
      });
      next(error);
    }
  }

  async pauseDispute(req, res, next) {
    try {
      const { disputeId } = req.params;

      const dispute = await disputeService.pauseDispute(disputeId, req.staff.id);

      logger.info('Dispute paused successfully', {
        disputeId,
        pausedBy: req.staff.id
      });

      return successResponse(res, 'Dispute paused successfully', dispute);
    } catch (error) {
      logger.error('Failed to pause dispute', {
        error: error.message,
        disputeId: req.params.disputeId
      });
      next(error);
    }
  }

  async exportDisputeSummary(req, res, next) {
    try {
      const period = req.query.period || '30';
      const stats = await disputeService.getDisputeStats(period);

      // Use report generator to make PDF
      const ReportGenerator = (await import('../utils/reportGenerator.js')).default;
      const pdfBuffer = await ReportGenerator.generatePDFReport(stats, { type: 'dispute_summary', title: 'Dispute Summary', period, generatedBy: req.staff.id });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="dispute-summary.pdf"');
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      logger.error('Failed to export dispute summary', { error: error.message });
      next(error);
    }
  }

  async exportDisputeById(req, res, next) {
    try {
      const { disputeId } = req.params;
      const dispute = await disputeService.getDisputeById(disputeId);

      if (!dispute) {
        return res.status(404).json({ message: 'Dispute not found' });
      }

      // Convert Sequelize instance to plain object to avoid circular references
      const plainDispute = typeof dispute.toJSON === 'function' ? dispute.toJSON() : dispute;

      const ReportGenerator = (await import('../utils/reportGenerator.js')).default;
      // For a single-dispute export, pass the plain object and use a type 'dispute_detail'
      const pdfBuffer = await ReportGenerator.generatePDFReport(plainDispute, { type: 'dispute_detail', title: `Dispute ${plainDispute.disputeNumber || plainDispute.id}`, generatedBy: req.staff.id });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="dispute-${plainDispute.disputeNumber || disputeId}.pdf"`);
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      logger.error('Failed to export dispute by id', { error: error.message, disputeId: req.params.disputeId });
      next(error);
    }
  }

  async getDisputeStats(req, res, next) {
    try {
      const { period = '30' } = req.query;

      const stats = await disputeService.getDisputeStats(period);

      logger.debug('Dispute stats retrieved successfully', {
        period,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Dispute stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get dispute stats', {
        error: error.message,
        period: req.query.period
      });
      next(error);
    }
  }
}

export default new DisputeController();