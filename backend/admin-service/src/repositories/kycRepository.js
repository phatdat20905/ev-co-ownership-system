// src/repositories/kycRepository.js
import { BaseRepository } from './baseRepository.js';
import db from '../models/index.js';
import { Op } from 'sequelize';

export class KYCRepository extends BaseRepository {
  constructor() {
    super(db.KYCVerification);
  }

  async findByStatus(status, options = {}) {
    return await this.paginate({
      where: { verificationStatus: status },
      include: options.include || [
        {
          model: db.StaffProfile,
          as: 'verifiedByStaff',
          attributes: ['id', 'employeeId', 'position']
        }
      ],
      order: [['submittedAt', 'ASC']],
      ...options
    });
  }

  async findByUserId(userId) {
    return await this.findOne({ userId });
  }

  async approveKYC(kycId, staffId) {
    return await this.update(kycId, {
      verificationStatus: 'approved',
      verifiedBy: staffId,
      verifiedAt: new Date()
    });
  }

  async rejectKYC(kycId, staffId, rejectionReason) {
    return await this.update(kycId, {
      verificationStatus: 'rejected',
      verifiedBy: staffId,
      verifiedAt: new Date(),
      rejectionReason
    });
  }

  async getKYCStats(period = '30 days') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const stats = await this.model.findAll({
      where: {
        submittedAt: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'verificationStatus',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['verificationStatus'],
      raw: true
    });

    return stats;
  }

  async getAverageProcessingTime(period = '30 days') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const result = await this.model.findOne({
      where: {
        verificationStatus: ['approved', 'rejected'],
        verifiedAt: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        [db.sequelize.fn('AVG', 
          db.sequelize.fn('EXTRACT', 
            db.sequelize.literal("EPOCH FROM (verified_at - submitted_at) / 3600")
          )
        ), 'avg_hours']
      ],
      raw: true
    });

    return result?.avg_hours || 0;
  }
}

export default new KYCRepository();