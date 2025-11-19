// src/repositories/disputeRepository.js
import { BaseRepository } from './baseRepository.js';
import db from '../models/index.js';
import { Op } from 'sequelize';

export class DisputeRepository extends BaseRepository {
  constructor() {
    super(db.Dispute);
  }

  async findByStatus(status, options = {}) {
    return await this.paginate({
      where: { status },
      include: options.include || [
        {
          model: db.StaffProfile,
          as: 'assignedStaff',
          attributes: ['id', 'employeeId', 'position', 'department']
        }
      ],
      order: [['createdAt', 'DESC']],
      ...options
    });
  }

  async findByPriority(priority, options = {}) {
    return await this.paginate({
      where: { priority },
      include: options.include || [
        {
          model: db.StaffProfile,
          as: 'assignedStaff',
          attributes: ['id', 'employeeId', 'position', 'department']
        }
      ],
      order: [['createdAt', 'DESC']],
      ...options
    });
  }

  async findByType(disputeType, options = {}) {
    return await this.paginate({
      where: { disputeType },
      include: options.include || [
        {
          model: db.StaffProfile,
          as: 'assignedStaff',
          attributes: ['id', 'employeeId', 'position', 'department']
        }
      ],
      order: [['createdAt', 'DESC']],
      ...options
    });
  }

  async getDisputeWithMessages(disputeId) {
    // Use separate:true on messages include so ordering works reliably across DB adapters
    return await this.model.findByPk(disputeId, {
      include: [
        {
          model: db.StaffProfile,
          as: 'assignedStaff',
          attributes: ['id', 'employeeId', 'position', 'department']
        },
        {
          model: db.DisputeMessage,
          as: 'messages',
          separate: true,
          order: [['created_at', 'ASC']]
        }
      ]
    });
  }

  async assignDispute(disputeId, staffId) {
    return await this.update(disputeId, { 
      assignedTo: staffId,
      status: 'investigating'
    });
  }

  async resolveDispute(disputeId, resolution, resolvedBy) {
    return await this.update(disputeId, {
      status: 'resolved',
      resolution,
      resolvedAt: new Date()
    });
  }

  async escalateDispute(disputeId, newPriority) {
    return await this.update(disputeId, {
      priority: newPriority,
      status: 'investigating'
    });
  }

  async getDisputeStats(period = '30') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const disputes = await this.model.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      raw: true
    });

    const byStatus = {};
    const byPriority = {};
    const byType = {};

    disputes.forEach(dispute => {
      byStatus[dispute.status] = (byStatus[dispute.status] || 0) + 1;
      byPriority[dispute.priority] = (byPriority[dispute.priority] || 0) + 1;
      byType[dispute.disputeType] = (byType[dispute.disputeType] || 0) + 1;
    });

    const averageResolutionTime = await this.getAverageResolutionTime(period);

    return {
      total: disputes.length,
      byStatus,
      byPriority,
      byType,
      averageResolutionTime
    };
  }

  async getRecentDisputes(limit = 5) {
    return await this.model.findAll({
      where: {
        status: {
          [Op.in]: ['open', 'investigating']
        }
      },
      order: [['createdAt', 'DESC']],
      limit,
      raw: true
    });
  }

  async getAverageResolutionTime(period = '30 days') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const result = await this.model.findOne({
      where: {
        status: 'resolved',
        resolvedAt: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        [db.sequelize.fn('AVG', 
          db.sequelize.fn('EXTRACT', 
            db.sequelize.literal("EPOCH FROM (resolved_at - created_at) / 3600")
          )
        ), 'avg_hours']
      ],
      raw: true
    });

    return result?.avg_hours || 0;
  }
}

export default new DisputeRepository();