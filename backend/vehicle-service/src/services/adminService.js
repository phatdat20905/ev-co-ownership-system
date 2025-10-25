// src/services/adminService.js
import db from '../models/index.js';
import { 
  logger, 
  AppError 
} from '@ev-coownership/shared';

export class AdminService {
  async getAllVehicles(page, limit, status, groupId, userId) {
    try {
      const whereClause = {};
      
      if (status) {
        whereClause.status = status;
      }
      
      if (groupId) {
        whereClause.groupId = groupId;
      }

      const offset = (page - 1) * limit;

      const { count, rows: vehicles } = await db.Vehicle.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.MaintenanceSchedule,
            as: 'maintenanceSchedules',
            where: { status: 'scheduled' },
            required: false,
            limit: 3
          },
          {
            model: db.VehicleInsurance,
            as: 'insurancePolicies',
            where: { isActive: true },
            required: false,
            limit: 1
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const result = {
        vehicles,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };

      return result;
    } catch (error) {
      logger.error('Failed to get all vehicles for admin', { error: error.message, userId });
      throw error;
    }
  }

  async getMaintenanceDueVehicles(userId) {
    try {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const maintenanceDue = await db.MaintenanceSchedule.findAll({
        where: {
          status: 'scheduled',
          scheduledDate: {
            [db.Sequelize.Op.lte]: sevenDaysFromNow
          }
        },
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'groupId', 'licensePlate', 'currentOdometer'],
            include: [
              {
                model: db.VehicleInsurance,
                as: 'insurancePolicies',
                where: { isActive: true },
                required: false,
                limit: 1
              }
            ]
          }
        ],
        order: [['scheduledDate', 'ASC']]
      });

      // Group by vehicle and calculate urgency
      const vehiclesWithMaintenance = maintenanceDue.map(schedule => {
        const daysUntilDue = Math.ceil((new Date(schedule.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        return {
          vehicleId: schedule.vehicle.id,
          vehicleName: schedule.vehicle.vehicleName,
          licensePlate: schedule.vehicle.licensePlate,
          groupId: schedule.vehicle.groupId,
          currentOdometer: schedule.vehicle.currentOdometer,
          maintenance: {
            scheduleId: schedule.id,
            type: schedule.maintenanceType,
            scheduledDate: schedule.scheduledDate,
            daysUntilDue: Math.max(0, daysUntilDue),
            urgency: daysUntilDue <= 1 ? 'high' : daysUntilDue <= 3 ? 'medium' : 'low',
            estimatedCost: schedule.estimatedCost
          }
        };
      });

      return vehiclesWithMaintenance;
    } catch (error) {
      logger.error('Failed to get maintenance due vehicles', { error: error.message, userId });
      throw error;
    }
  }

  async getInsuranceExpiringVehicles(userId) {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringInsurance = await db.VehicleInsurance.findAll({
        where: {
          isActive: true,
          endDate: {
            [db.Sequelize.Op.between]: [new Date(), thirtyDaysFromNow]
          }
        },
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'groupId', 'licensePlate', 'status']
          }
        ],
        order: [['endDate', 'ASC']]
      });

      const vehiclesWithExpiringInsurance = expiringInsurance.map(insurance => {
        const daysUntilExpiry = Math.ceil((new Date(insurance.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        return {
          vehicleId: insurance.vehicle.id,
          vehicleName: insurance.vehicle.vehicleName,
          licensePlate: insurance.vehicle.licensePlate,
          groupId: insurance.vehicle.groupId,
          status: insurance.vehicle.status,
          insurance: {
            insuranceId: insurance.id,
            provider: insurance.insuranceProvider,
            policyNumber: insurance.policyNumber,
            endDate: insurance.endDate,
            daysUntilExpiry: Math.max(0, daysUntilExpiry),
            urgency: daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 14 ? 'medium' : 'low'
          }
        };
      });

      return vehiclesWithExpiringInsurance;
    } catch (error) {
      logger.error('Failed to get insurance expiring vehicles', { error: error.message, userId });
      throw error;
    }
  }

  async getSystemOverview(userId) {
    try {
      // Get total vehicles count
      const totalVehicles = await db.Vehicle.count();

      // Get vehicles by status
      const vehiclesByStatus = await db.Vehicle.findAll({
        attributes: [
          'status',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Get maintenance statistics
      const maintenanceStats = await db.MaintenanceSchedule.findAll({
        attributes: [
          'status',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Get charging statistics (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const chargingStats = await db.ChargingSession.findAll({
        where: {
          startTime: {
            [db.Sequelize.Op.gte]: thirtyDaysAgo
          }
        },
        attributes: [
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'totalSessions'],
          [db.sequelize.fn('SUM', db.sequelize.col('energy_consumed_kwh')), 'totalEnergy'],
          [db.sequelize.fn('SUM', db.sequelize.col('cost')), 'totalCost']
        ],
        raw: true
      });

      // Get insurance statistics
      const insuranceStats = await db.VehicleInsurance.findAll({
        where: {
          isActive: true
        },
        attributes: [
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'activePolicies']
        ],
        raw: true
      });

      // Calculate system health score
      const healthScore = this.calculateSystemHealthScore(
        vehiclesByStatus,
        maintenanceStats,
        chargingStats[0]
      );

      const overview = {
        summary: {
          totalVehicles,
          activePolicies: insuranceStats[0]?.activePolicies || 0,
          systemHealth: healthScore,
          lastUpdated: new Date()
        },
        vehicles: {
          byStatus: this.formatStatusCount(vehiclesByStatus),
          availablePercentage: this.calculatePercentage(vehiclesByStatus, 'available')
        },
        maintenance: {
          byStatus: this.formatStatusCount(maintenanceStats),
          overdueCount: maintenanceStats.find(m => m.status === 'scheduled')?.count || 0
        },
        charging: {
          totalSessions: chargingStats[0]?.totalSessions || 0,
          totalEnergy: parseFloat(chargingStats[0]?.totalEnergy || 0).toFixed(2),
          totalCost: parseFloat(chargingStats[0]?.totalCost || 0).toFixed(2),
          period: '30 days'
        },
        alerts: {
          maintenanceDue: await this.getMaintenanceDueCount(),
          insuranceExpiring: await this.getInsuranceExpiringCount(),
          vehiclesInMaintenance: this.getCountByStatus(vehiclesByStatus, 'maintenance')
        }
      };

      return overview;
    } catch (error) {
      logger.error('Failed to get system overview', { error: error.message, userId });
      throw error;
    }
  }

  // Helper methods
  calculateSystemHealthScore(vehiclesByStatus, maintenanceStats, chargingStats) {
    let score = 100;

    // Deduct for vehicles in maintenance
    const maintenanceCount = this.getCountByStatus(vehiclesByStatus, 'maintenance');
    const totalVehicles = vehiclesByStatus.reduce((sum, item) => sum + parseInt(item.count), 0);
    
    if (totalVehicles > 0) {
      const maintenancePercentage = (maintenanceCount / totalVehicles) * 100;
      score -= Math.min(maintenancePercentage * 2, 30); // Up to 30 points deduction
    }

    // Deduct for overdue maintenance
    const overdueMaintenance = maintenanceStats.find(m => m.status === 'scheduled')?.count || 0;
    score -= Math.min(overdueMaintenance * 5, 20); // Up to 20 points deduction

    // Add for charging activity (healthy system has regular charging)
    const chargingSessions = chargingStats?.totalSessions || 0;
    if (chargingSessions > 10) {
      score += Math.min((chargingSessions - 10) * 0.5, 10); // Up to 10 points bonus
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  formatStatusCount(statusArray) {
    const result = {};
    statusArray.forEach(item => {
      result[item.status] = parseInt(item.count);
    });
    return result;
  }

  calculatePercentage(statusArray, status) {
    const total = statusArray.reduce((sum, item) => sum + parseInt(item.count), 0);
    const count = this.getCountByStatus(statusArray, status);
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  getCountByStatus(statusArray, status) {
    const item = statusArray.find(s => s.status === status);
    return item ? parseInt(item.count) : 0;
  }

  async getMaintenanceDueCount() {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const count = await db.MaintenanceSchedule.count({
      where: {
        status: 'scheduled',
        scheduledDate: {
          [db.Sequelize.Op.lte]: sevenDaysFromNow
        }
      }
    });

    return count;
  }

  async getInsuranceExpiringCount() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const count = await db.VehicleInsurance.count({
      where: {
        isActive: true,
        endDate: {
          [db.Sequelize.Op.between]: [new Date(), thirtyDaysFromNow]
        }
      }
    });

    return count;
  }
}

export default new AdminService();