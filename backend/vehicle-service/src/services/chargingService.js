// src/services/chargingService.js
import db from '../models/index.js';
import { 
  logger, 
  AppError,
  redisClient
} from '@ev-coownership/shared';
import eventService from './eventService.js';

export class ChargingService {
  async createChargingSession(sessionData, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const vehicle = await db.Vehicle.findByPk(sessionData.vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      // Validate battery levels
      if (sessionData.startBatteryLevel && sessionData.endBatteryLevel) {
        if (sessionData.startBatteryLevel >= sessionData.endBatteryLevel) {
          throw new AppError('End battery level must be greater than start level', 400, 'INVALID_BATTERY_LEVELS');
        }
      }

      const session = await db.ChargingSession.create({
        ...sessionData,
        userId
      }, { transaction });

      await transaction.commit();

      // Publish events
      await eventService.publishChargingSessionStarted({
        sessionId: session.id,
        vehicleId: session.vehicleId,
        groupId: vehicle.groupId,
        userId: session.userId,
        startTime: session.startTime,
        startBatteryLevel: session.startBatteryLevel
      });

      // If session is completed, publish completion event
      if (session.endTime) {
        await eventService.publishChargingSessionCompleted({
          sessionId: session.id,
          vehicleId: session.vehicleId,
          groupId: vehicle.groupId,
          userId: session.userId,
          endTime: session.endTime,
          endBatteryLevel: session.endBatteryLevel,
          energyConsumedKwh: session.energyConsumedKwh,
          cost: session.cost
        });

        // Publish cost event for Cost Service
        if (session.cost && session.cost > 0) {
          await eventService.publishChargingCostRecorded({
            sessionId: session.id,
            vehicleId: session.vehicleId,
            groupId: vehicle.groupId,
            userId: session.userId,
            amount: session.cost,
            energyConsumedKwh: session.energyConsumedKwh,
            date: new Date(session.endTime).toISOString().split('T')[0],
            chargingStation: session.chargingStationLocation
          });
        }
      }

      // Clear cache
      await this.clearChargingCache(session.vehicleId);

      return session;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to create charging session', { error: error.message, userId, vehicleId: sessionData.vehicleId });
      throw error;
    }
  }

  async getChargingSessions(vehicleId, startDate, endDate, page, limit, userId) {
    try {
      const cacheKey = `charging:${vehicleId}:${startDate}:${endDate}:${page}:${limit}`;
      
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

      const whereClause = { vehicleId };

      if (startDate && endDate) {
        whereClause.startTime = {
          [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const offset = (page - 1) * limit;

      const { count, rows: sessions } = await db.ChargingSession.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['startTime', 'DESC']],
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate']
          }
        ]
      });

      const result = {
        sessions,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };

      // Cache for 2 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), 120);

      return result;
    } catch (error) {
      logger.error('Failed to get charging sessions', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  async getChargingSession(sessionId, userId) {
    try {
      const session = await db.ChargingSession.findByPk(sessionId, {
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'groupId', 'licensePlate']
          }
        ]
      });

      if (!session) {
        throw new AppError('Charging session not found', 404, 'CHARGING_SESSION_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(session.vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this charging session', 403, 'ACCESS_DENIED');
      }

      return session;
    } catch (error) {
      logger.error('Failed to get charging session', { error: error.message, sessionId, userId });
      throw error;
    }
  }

  async getChargingStats(vehicleId, period, userId) {
    try {
      const cacheKey = `charging:stats:${vehicleId}:${period}`;
      
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
      
      const stats = await db.ChargingSession.findAll({
        where: {
          vehicleId,
          startTime: {
            [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
          },
          endTime: { [db.Sequelize.Op.ne]: null } // Only completed sessions
        },
        attributes: [
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'totalSessions'],
          [db.sequelize.fn('SUM', db.sequelize.col('energy_consumed_kwh')), 'totalEnergy'],
          [db.sequelize.fn('SUM', db.sequelize.col('cost')), 'totalCost'],
          [db.sequelize.fn('AVG', db.sequelize.col('energy_consumed_kwh')), 'avgEnergyPerSession'],
          [db.sequelize.fn('AVG', db.sequelize.col('cost')), 'avgCostPerSession']
        ],
        raw: true
      });

      // Get charging frequency by day of week
      const frequencyStats = await db.ChargingSession.findAll({
        where: {
          vehicleId,
          startTime: {
            [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
          }
        },
        attributes: [
          [db.sequelize.fn('DATE', db.sequelize.col('start_time')), 'date'],
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'sessionCount']
        ],
        group: [db.sequelize.fn('DATE', db.sequelize.col('start_time'))],
        order: [[db.sequelize.fn('DATE', db.sequelize.col('start_time')), 'ASC']],
        raw: true
      });

      const result = {
        period,
        dateRange: {
          start: dateRange.start,
          end: dateRange.end
        },
        summary: stats[0] || {
          totalSessions: 0,
          totalEnergy: 0,
          totalCost: 0,
          avgEnergyPerSession: 0,
          avgCostPerSession: 0
        },
        frequency: frequencyStats,
        vehicleInfo: {
          id: vehicle.id,
          vehicleName: vehicle.vehicleName,
          batteryCapacity: vehicle.batteryCapacityKwh
        }
      };

      // Cache for 5 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), 300);

      return result;
    } catch (error) {
      logger.error('Failed to get charging stats', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  async getChargingCosts(vehicleId, year, userId) {
    try {
      const cacheKey = `charging:costs:${vehicleId}:${year}`;
      
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

      const monthlyCosts = await db.ChargingSession.findAll({
        where: {
          vehicleId,
          startTime: {
            [db.Sequelize.Op.between]: [
              new Date(`${year}-01-01`),
              new Date(`${year}-12-31`)
            ]
          },
          cost: { [db.Sequelize.Op.gt]: 0 }
        },
        attributes: [
          [db.sequelize.fn('EXTRACT', db.sequelize.literal('MONTH FROM start_time')), 'month'],
          [db.sequelize.fn('SUM', db.sequelize.col('cost')), 'totalCost'],
          [db.sequelize.fn('SUM', db.sequelize.col('energy_consumed_kwh')), 'totalEnergy'],
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'sessionCount']
        ],
        group: [db.sequelize.fn('EXTRACT', db.sequelize.literal('MONTH FROM start_time'))],
        order: [[db.sequelize.fn('EXTRACT', db.sequelize.literal('MONTH FROM start_time')), 'ASC']],
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
          totalEnergy: monthData ? parseFloat(monthData.totalEnergy) : 0,
          sessionCount: monthData ? parseInt(monthData.sessionCount) : 0
        };
      });

      const yearlyTotal = monthlyCosts.reduce((sum, month) => sum + parseFloat(month.totalCost || 0), 0);
      const yearlyEnergy = monthlyCosts.reduce((sum, month) => sum + parseFloat(month.totalEnergy || 0), 0);
      const totalSessions = monthlyCosts.reduce((sum, month) => sum + parseInt(month.sessionCount || 0), 0);

      const result = {
        year,
        monthlyCosts: costsByMonth,
        summary: {
          totalCost: yearlyTotal,
          totalEnergy: yearlyEnergy,
          totalSessions,
          averageCostPerSession: totalSessions > 0 ? yearlyTotal / totalSessions : 0,
          averageCostPerKwh: yearlyEnergy > 0 ? yearlyTotal / yearlyEnergy : 0
        }
      };

      // Cache for 10 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), 600);

      return result;
    } catch (error) {
      logger.error('Failed to get charging costs', { error: error.message, vehicleId, year, userId });
      throw error;
    }
  }

  // Helper methods
  getDateRange(period) {
    const now = new Date();
    let start, end;

    switch (period) {
      case 'weekly':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        end = new Date(now);
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        end = new Date(now);
        break;
      case 'quarterly':
        start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        end = new Date(now);
        break;
      case 'yearly':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        end = new Date(now);
        break;
      default: // monthly
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        end = new Date(now);
    }

    return { start, end };
  }

  async checkGroupAccess(groupId, userId) {
    try {
      const response = await fetch(`${process.env.USER_SERVICE_URL}/api/v1/user/groups/${groupId}/members/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.VEHICLE_SERVICE_INTERNAL_TOKEN || process.env.INTERNAL_SERVICE_TOKEN}`
        }
      });

      return response.ok;
    } catch (error) {
      logger.error('Failed to check group access', { error: error.message, groupId, userId });
      return false;
    }
  }

  async clearChargingCache(vehicleId) {
    const pattern = `charging:${vehicleId}:*`;
    const keys = await redisClient.keys(pattern);
    
    for (const key of keys) {
      await redisClient.del(key);
    }
  }
}

export default new ChargingService();