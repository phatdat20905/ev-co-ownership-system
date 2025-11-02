// src/services/analyticsService.js
import db from '../models/index.js';
import { 
  logger, 
  AppError,
  redisClient
} from '@ev-coownership/shared';
import batteryService from './batteryService.js';
import eventService from './eventService.js';

export class AnalyticsService {
  async getUtilization(vehicleId, period, userId) {
    try {
      const cacheKey = `analytics:utilization:${vehicleId}:${period}`;
      
      // Try to get from cache
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      // Get booking data from Booking Service
      const bookingStats = await this.getBookingUtilization(vehicleId, period);
      
      // Get charging data
      const chargingStats = await db.ChargingSession.findAll({
        where: {
          vehicleId,
          startTime: this.getDateRange(period)
        },
        attributes: [
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'totalChargingSessions'],
          [db.sequelize.fn('SUM', db.sequelize.col('energy_consumed_kwh')), 'totalEnergyConsumed']
        ],
        raw: true
      });

      const utilization = {
        period,
        vehicleInfo: {
          id: vehicle.id,
          vehicleName: vehicle.vehicleName,
          status: vehicle.status
        },
        booking: bookingStats || {
          totalBookings: 0,
          totalHours: 0,
          utilizationRate: 0
        },
        charging: chargingStats[0] || {
          totalChargingSessions: 0,
          totalEnergyConsumed: 0
        },
        calculatedAt: new Date()
      };

      // Cache for 15 minutes
      await redisClient.set(cacheKey, JSON.stringify(utilization), 900);

      // Publish event
      await eventService.publishVehicleUtilizationCalculated({
        vehicleId,
        groupId: vehicle.groupId,
        period,
        utilizationRate: utilization.booking.utilizationRate || 0,
        calculatedAt: utilization.calculatedAt
      });

      return utilization;
    } catch (error) {
      logger.error('Failed to get utilization analytics', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  async getMaintenanceCosts(vehicleId, year, userId) {
    try {
      const cacheKey = `analytics:maintenance:${vehicleId}:${year}`;
      
      // Try to get from cache
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      const monthlyCosts = await db.MaintenanceHistory.findAll({
        where: {
          vehicleId,
          performedDate: {
            [db.Sequelize.Op.between]: [
              new Date(`${year}-01-01`),
              new Date(`${year}-12-31`)
            ]
          }
        },
        attributes: [
          [db.sequelize.fn('EXTRACT', db.sequelize.literal('MONTH FROM performed_date')), 'month'],
          [db.sequelize.fn('SUM', db.sequelize.col('cost')), 'totalCost'],
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'maintenanceCount']
        ],
        group: [db.sequelize.fn('EXTRACT', db.sequelize.literal('MONTH FROM performed_date'))],
        order: [[db.sequelize.fn('EXTRACT', db.sequelize.literal('MONTH FROM performed_date')), 'ASC']],
        raw: true
      });

      // Get maintenance by type
      const maintenanceByType = await db.MaintenanceHistory.findAll({
        where: {
          vehicleId,
          performedDate: {
            [db.Sequelize.Op.between]: [
              new Date(`${year}-01-01`),
              new Date(`${year}-12-31`)
            ]
          }
        },
        attributes: [
          'maintenanceType',
          [db.sequelize.fn('SUM', db.sequelize.col('cost')), 'totalCost'],
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['maintenanceType'],
        order: [[db.sequelize.fn('SUM', db.sequelize.col('cost')), 'DESC']],
        raw: true
      });

      // Fill in missing months
      const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
      const costsByMonth = allMonths.map(month => {
        const monthData = monthlyCosts.find(m => parseInt(m.month) === month);
        return {
          month,
          monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
          totalCost: monthData ? parseFloat(monthData.totalCost) : 0,
          maintenanceCount: monthData ? parseInt(monthData.maintenanceCount) : 0
        };
      });

      const yearlyTotal = monthlyCosts.reduce((sum, month) => sum + parseFloat(month.totalCost || 0), 0);
      const totalMaintenance = monthlyCosts.reduce((sum, month) => sum + parseInt(month.maintenanceCount || 0), 0);

      const result = {
        year,
        monthlyCosts: costsByMonth,
        maintenanceByType: maintenanceByType.map(type => ({
          type: type.maintenanceType,
          totalCost: parseFloat(type.totalCost),
          count: parseInt(type.count)
        })),
        summary: {
          totalCost: yearlyTotal,
          totalMaintenance,
          averageCostPerMaintenance: totalMaintenance > 0 ? yearlyTotal / totalMaintenance : 0,
          mostExpensiveType: maintenanceByType.length > 0 ? maintenanceByType[0].maintenanceType : 'N/A'
        }
      };

      // Cache for 30 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), 1800);

      // Publish event
      await eventService.publishMaintenanceCostAnalyzed({
        vehicleId,
        groupId: vehicle.groupId,
        year,
        totalCost: yearlyTotal,
        maintenanceCount: totalMaintenance,
        analyzedAt: new Date()
      });

      return result;
    } catch (error) {
      logger.error('Failed to get maintenance costs analytics', { error: error.message, vehicleId, year, userId });
      throw error;
    }
  }

  async getBatteryHealth(vehicleId, userId) {
    try {
      const cacheKey = `analytics:battery:${vehicleId}`;
      
      // Try to get from cache
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      const batteryHealth = await batteryService.calculateBatteryHealth(vehicleId);

      // Cache for 1 hour
      await redisClient.set(cacheKey, JSON.stringify(batteryHealth), 3600);

      // Publish event
      await eventService.publishBatteryHealthChecked({
        vehicleId,
        groupId: vehicle.groupId,
        healthStatus: batteryHealth.health,
        efficiency: batteryHealth.efficiency?.avgEfficiency,
        degradationRate: batteryHealth.degradation?.rate,
        checkedAt: new Date()
      });

      return batteryHealth;
    } catch (error) {
      logger.error('Failed to get battery health analytics', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  async getOperatingCosts(vehicleId, period, userId) {
    try {
      const cacheKey = `analytics:operating:${vehicleId}:${period}`;
      
      // Try to get from cache
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      const dateRange = this.getDateRange(period);

      // Get charging costs
      const chargingCosts = await db.ChargingSession.findAll({
        where: {
          vehicleId,
          startTime: dateRange,
          cost: { [db.Sequelize.Op.gt]: 0 }
        },
        attributes: [
          [db.sequelize.fn('SUM', db.sequelize.col('cost')), 'totalChargingCost']
        ],
        raw: true
      });

      // Get maintenance costs
      const maintenanceCosts = await db.MaintenanceHistory.findAll({
        where: {
          vehicleId,
          performedDate: dateRange
        },
        attributes: [
          [db.sequelize.fn('SUM', db.sequelize.col('cost')), 'totalMaintenanceCost']
        ],
        raw: true
      });

      // Get insurance costs (simplified - would need more complex logic)
      const insuranceCosts = await db.VehicleInsurance.findAll({
        where: {
          vehicleId,
          startDate: { [db.Sequelize.Op.lte]: dateRange.end },
          endDate: { [db.Sequelize.Op.gte]: dateRange.start }
        },
        attributes: [
          [db.sequelize.fn('SUM', db.sequelize.col('premium_amount')), 'totalInsuranceCost']
        ],
        raw: true
      });

      const chargingCost = parseFloat(chargingCosts[0]?.totalChargingCost || 0);
      const maintenanceCost = parseFloat(maintenanceCosts[0]?.totalMaintenanceCost || 0);
      const insuranceCost = parseFloat(insuranceCosts[0]?.totalInsuranceCost || 0);
      const totalCost = chargingCost + maintenanceCost + insuranceCost;

      const result = {
        period,
        dateRange,
        costs: {
          charging: chargingCost,
          maintenance: maintenanceCost,
          insurance: insuranceCost,
          total: totalCost
        },
        breakdown: {
          chargingPercentage: totalCost > 0 ? (chargingCost / totalCost) * 100 : 0,
          maintenancePercentage: totalCost > 0 ? (maintenanceCost / totalCost) * 100 : 0,
          insurancePercentage: totalCost > 0 ? (insuranceCost / totalCost) * 100 : 0
        },
        vehicleInfo: {
          id: vehicle.id,
          vehicleName: vehicle.vehicleName,
          currentOdometer: vehicle.currentOdometer
        }
      };

      // Cache for 15 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), 900);

      return result;
    } catch (error) {
      logger.error('Failed to get operating costs analytics', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  async getGroupSummary(groupId, userId) {
    try {
      const cacheKey = `analytics:group:${groupId}:summary`;
      
      // Try to get from cache
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this group', 403, 'ACCESS_DENIED');
      }

      // Get vehicles in group
      const vehicles = await db.Vehicle.findAll({
        where: { groupId },
        include: [
          {
            model: db.MaintenanceSchedule,
            as: 'maintenanceSchedules',
            where: { status: 'scheduled' },
            required: false
          },
          {
            model: db.VehicleInsurance,
            as: 'insurancePolicies',
            where: { isActive: true },
            required: false
          }
        ]
      });

      // Calculate summary statistics
      const totalVehicles = vehicles.length;
      const availableVehicles = vehicles.filter(v => v.status === 'available').length;
      const inUseVehicles = vehicles.filter(v => v.status === 'in_use').length;
      const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;

      // Get upcoming maintenance count
      const upcomingMaintenance = vehicles.reduce((count, vehicle) => 
        count + (vehicle.maintenanceSchedules?.length || 0), 0
      );

      // Get expiring insurance count
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const expiringInsurance = vehicles.filter(vehicle => 
        vehicle.insurancePolicies?.some(insurance => 
          new Date(insurance.endDate) <= thirtyDaysFromNow
        )
      ).length;

      const summary = {
        groupId,
        totalVehicles,
        statusBreakdown: {
          available: availableVehicles,
          inUse: inUseVehicles,
          maintenance: maintenanceVehicles,
          unavailable: totalVehicles - availableVehicles - inUseVehicles - maintenanceVehicles
        },
        alerts: {
          upcomingMaintenance,
          expiringInsurance,
          vehiclesNeedingAttention: maintenanceVehicles + expiringInsurance
        },
        calculatedAt: new Date()
      };

      // Cache for 10 minutes
      await redisClient.set(cacheKey, JSON.stringify(summary), 600);

      return summary;
    } catch (error) {
      logger.error('Failed to get group summary', { error: error.message, groupId, userId });
      throw error;
    }
  }

  // Helper methods
  async getBookingUtilization(vehicleId, period) {
    try {
      // Call Booking Service to get utilization data
      const response = await fetch(
        `${process.env.BOOKING_SERVICE_URL}/api/v1/analytics/vehicles/${vehicleId}/utilization?period=${period}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to get booking utilization', { error: error.message, vehicleId });
      return null;
    }
  }

  getDateRange(period) {
    const now = new Date();
    let start;

    switch (period) {
      case 'weekly':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarterly':
        start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'yearly':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default: // monthly
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    return {
      [db.Sequelize.Op.between]: [start, now]
    };
  }

  async checkGroupAccess(groupId, userId) {
    try {
      const response = await fetch(`${process.env.USER_SERVICE_URL}/api/v1/groups/${groupId}/members/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`
        }
      });

      return response.ok;
    } catch (error) {
      logger.error('Failed to check group access', { error: error.message, groupId, userId });
      return false;
    }
  }
}

export default new AnalyticsService();