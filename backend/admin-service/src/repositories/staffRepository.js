// src/repositories/staffRepository.js
import { BaseRepository } from './baseRepository.js';
import db from '../models/index.js';

export class StaffRepository extends BaseRepository {
  constructor() {
    super(db.StaffProfile);
  }

  async findByUserId(userId) {
    return await this.findOne({ userId });
  }

  async findByEmployeeId(employeeId) {
    return await this.findOne({ employeeId });
  }

  async findActiveStaffByDepartment(department) {
    return await this.findAll({
      where: { 
        department,
        isActive: true 
      },
      order: [['createdAt', 'DESC']]
    });
  }

  async updatePermissions(staffId, permissions) {
    return await this.update(staffId, { permissions });
  }

  async deactivateStaff(staffId) {
    return await this.update(staffId, { isActive: false });
  }

  async getStaffWithPerformance(period = 'monthly') {
    // Map friendly period names to Postgres interval units.
    const unitMap = {
      daily: 'day',
      weekly: 'week',
      monthly: 'month',
      yearly: 'year',
      year: 'year',
      month: 'month',
      week: 'week',
      day: 'day'
    };

    const unit = unitMap[period] || unitMap[period?.toLowerCase()] || 'month';

    const query = `
      SELECT 
        sp.id,
        sp.employee_id,
        sp.position,
        sp.department,
        COUNT(DISTINCT d.id) as total_disputes,
        COUNT(DISTINCT k.id) as total_kyc_reviews,
        AVG(CASE WHEN d.status = 'resolved' THEN 1 ELSE 0 END) as resolution_rate
      FROM staff_profiles sp
      LEFT JOIN disputes d ON d.assigned_to = sp.id 
        AND d.created_at >= NOW() - INTERVAL '1 ${unit}'
      LEFT JOIN kyc_verifications k ON k.verified_by = sp.id 
        AND k.verified_at >= NOW() - INTERVAL '1 ${unit}'
      WHERE sp.is_active = true
      GROUP BY sp.id, sp.employee_id, sp.position, sp.department
      ORDER BY total_disputes DESC, resolution_rate DESC
    `;

    const [results] = await db.sequelize.query(query);
    return results;
  }
}

export default new StaffRepository();