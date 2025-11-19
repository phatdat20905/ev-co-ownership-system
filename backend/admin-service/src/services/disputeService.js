// src/services/disputeService.js
import disputeRepository from '../repositories/disputeRepository.js';
import staffRepository from '../repositories/staffRepository.js';
import { logger, AppError } from '@ev-coownership/shared';
import eventService from './eventService.js';

export class DisputeService {
  async createDispute(disputeData) {
    try {
      const dispute = await disputeRepository.create(disputeData);

      logger.info('Dispute created successfully', {
        disputeId: dispute.id,
        disputeNumber: dispute.disputeNumber,
        type: dispute.disputeType
      });

      await eventService.publishDisputeCreated({
        disputeId: dispute.id,
        disputeNumber: dispute.disputeNumber,
        type: dispute.disputeType,
        filedBy: dispute.filedBy,
        groupId: dispute.groupId
      });

      return dispute;
    } catch (error) {
      logger.error('Failed to create dispute', {
        error: error.message,
        filedBy: disputeData.filedBy,
        groupId: disputeData.groupId
      });
      throw error;
    }
  }

  async getDisputeById(disputeId) {
    try {
      const dispute = await disputeRepository.getDisputeWithMessages(disputeId);
      if (!dispute) {
        throw new AppError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');
      }
      return dispute;
    } catch (error) {
      logger.error('Failed to get dispute by ID', {
        error: error.message,
        disputeId
      });
      throw error;
    }
  }

  async listDisputes(filters = {}) {
    try {
      const {
        status,
        priority,
        type,
        assignedTo,
        page = 1,
        limit = 20
      } = filters;

      const where = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (type) where.disputeType = type;
      if (assignedTo) where.assignedTo = assignedTo;

      const include = [
        {
          model: (await import('../models/index.js')).default.StaffProfile,
          as: 'assignedStaff',
          attributes: ['id', 'employeeId', 'position', 'department']
        }
      ];

      const result = await disputeRepository.paginate({
        where,
        include,
        page,
        limit,
        order: [['createdAt', 'DESC']]
      });

      logger.debug('Disputes list retrieved successfully', {
        total: result.pagination.total,
        page,
        limit
      });

      return result;
    } catch (error) {
      // Add filters to the log for easier debugging of 500s
      logger.error('Failed to list disputes', {
        error: error.message,
        stack: error.stack,
        filters
      });
      throw error;
    }
  }

  async assignDispute(disputeId, staffId, assignedBy) {
    try {
      // Verify staff exists and is active
      const staff = await staffRepository.findById(staffId);
      if (!staff || !staff.isActive) {
        throw new AppError('Staff not found or inactive', 404, 'STAFF_NOT_FOUND');
      }

      const dispute = await disputeRepository.assignDispute(disputeId, staffId);
      if (!dispute) {
        throw new AppError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');
      }

      logger.info('Dispute assigned successfully', {
        disputeId,
        staffId,
        assignedBy
      });

      await eventService.publishDisputeAssigned({
        disputeId: dispute.id,
        disputeNumber: dispute.disputeNumber,
        assignedTo: staffId,
        assignedBy
      });

      return dispute;
    } catch (error) {
      logger.error('Failed to assign dispute', {
        error: error.message,
        disputeId,
        staffId
      });
      throw error;
    }
  }

  async addDisputeMessage(disputeId, messageData) {
    try {
      const dispute = await disputeRepository.findById(disputeId);
      if (!dispute) {
        throw new AppError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');
      }

      const DisputeMessage = (await import('../models/index.js')).default.DisputeMessage;
      const message = await DisputeMessage.create({
        disputeId,
        ...messageData
      });

      logger.info('Dispute message added successfully', {
        disputeId,
        messageId: message.id,
        senderId: messageData.senderId
      });

      await eventService.publishDisputeMessageAdded({
        disputeId,
        messageId: message.id,
        senderId: messageData.senderId,
        messageType: messageData.messageType
      });

      return message;
    } catch (error) {
      logger.error('Failed to add dispute message', {
        error: error.message,
        disputeId
      });
      throw error;
    }
  }

  async resolveDispute(disputeId, resolutionData) {
    try {
      const { resolution, resolvedBy } = resolutionData;

      const dispute = await disputeRepository.resolveDispute(disputeId, resolution, resolvedBy);
      if (!dispute) {
        throw new AppError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');
      }

      logger.info('Dispute resolved successfully', {
        disputeId,
        resolvedBy
      });

      await eventService.publishDisputeResolved({
        disputeId: dispute.id,
        disputeNumber: dispute.disputeNumber,
        resolution,
        resolvedBy
      });

      return dispute;
    } catch (error) {
      logger.error('Failed to resolve dispute', {
        error: error.message,
        disputeId
      });
      throw error;
    }
  }

  async escalateDispute(disputeId, newPriority, escalatedBy) {
    try {
      const dispute = await disputeRepository.escalateDispute(disputeId, newPriority);
      if (!dispute) {
        throw new AppError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');
      }

      logger.info('Dispute escalated successfully', {
        disputeId,
        newPriority,
        escalatedBy
      });

      await eventService.publishDisputeEscalated({
        disputeId: dispute.id,
        disputeNumber: dispute.disputeNumber,
        newPriority,
        escalatedBy
      });

      return dispute;
    } catch (error) {
      logger.error('Failed to escalate dispute', {
        error: error.message,
        disputeId
      });
      throw error;
    }
  }

  async pauseDispute(disputeId, pausedBy) {
    try {
      const dispute = await disputeRepository.update(disputeId, { status: 'on_hold' });
      if (!dispute) {
        throw new AppError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');
      }

      logger.info('Dispute paused', { disputeId, pausedBy });

      await eventService.publishDisputeEscalated({
        disputeId: dispute.id,
        disputeNumber: dispute.disputeNumber,
        newPriority: dispute.priority,
        escalatedBy: pausedBy
      });

      return dispute;
    } catch (error) {
      logger.error('Failed to pause dispute', { error: error.message, disputeId });
      throw error;
    }
  }

  async getDisputeStats(period = '30') {
    try {
      const stats = await disputeRepository.getDisputeStats(period);
      const avgResolutionTime = await disputeRepository.getAverageResolutionTime(period);

      const summary = {
        total: stats.reduce((sum, item) => sum + parseInt(item.count), 0),
        byStatus: {},
        byPriority: {},
        byType: {},
        averageResolutionTime: Math.round(avgResolutionTime * 100) / 100
      };

      stats.forEach(item => {
        summary.byStatus[item.status] = (summary.byStatus[item.status] || 0) + parseInt(item.count);
        summary.byPriority[item.priority] = (summary.byPriority[item.priority] || 0) + parseInt(item.count);
        summary.byType[item.disputeType] = (summary.byType[item.disputeType] || 0) + parseInt(item.count);
      });

      logger.debug('Dispute stats retrieved successfully', { period });

      return summary;
    } catch (error) {
      logger.error('Failed to get dispute stats', {
        error: error.message,
        period
      });
      throw error;
    }
  }
}

export default new DisputeService();