// src/services/vehicleService.js
import db from '../models/index.js';
import { 
  logger, 
  AppError,
  redisClient
} from '@ev-coownership/shared';
import { internalFetch } from '../utils/internalAuth.js';
import eventService from './eventService.js';
import analyticsService from './analyticsService.js';

export class VehicleService {
  async createVehicle(vehicleData, userId, userRole) {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if user has access to the group
  const hasAccess = await this.checkGroupAccess(vehicleData.groupId, userId, userRole);
      if (!hasAccess) {
        throw new AppError('You do not have access to this group', 403, 'ACCESS_DENIED');
      }

      // Check if license plate already exists
      const existingVehicle = await db.Vehicle.findOne({
        where: { licensePlate: vehicleData.licensePlate }
      });

      if (existingVehicle) {
        throw new AppError('Vehicle with this license plate already exists', 409, 'VEHICLE_ALREADY_EXISTS');
      }

      // Check vehicles per group limit
      const vehicleCount = await db.Vehicle.count({
        where: { groupId: vehicleData.groupId }
      });

      const maxVehicles = process.env.MAX_VEHICLES_PER_GROUP || 10;
      if (vehicleCount >= maxVehicles) {
        throw new AppError(`Maximum ${maxVehicles} vehicles allowed per group`, 400, 'VEHICLE_LIMIT_EXCEEDED');
      }

      const vehicle = await db.Vehicle.create(vehicleData, { transaction });

      await transaction.commit();

      // Publish event
      await eventService.publishVehicleCreated({
        vehicleId: vehicle.id,
        groupId: vehicle.groupId,
        vehicleName: vehicle.vehicleName,
        licensePlate: vehicle.licensePlate,
        createdBy: userId
      });

      // Clear cache
      await this.clearVehicleCache(vehicle.groupId);

      return vehicle;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to create vehicle', { error: error.message, userId, groupId: vehicleData.groupId });
      throw error;
    }
  }

  async getVehicles(groupId, status, page, limit, userId, userRole) {
    try {
      const cacheKey = `vehicles:${groupId}:${status}:${page}:${limit}`;
      
      // Try to get from cache
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const whereClause = {};
      
      // If groupId is provided, check access and filter by groupId
      if (groupId) {
  const hasAccess = await this.checkGroupAccess(groupId, userId, userRole);
        if (!hasAccess) {
          throw new AppError('You do not have access to this group', 403, 'ACCESS_DENIED');
        }
        whereClause.groupId = groupId;
      } 
      // If no groupId, check if user is admin/staff
      // Admin/staff can see all vehicles, co-owners see only their groups
      else {
        const accessibleGroups = await this.getUserAccessibleGroups(userId);
        
        // If accessibleGroups is empty or user is admin/staff, don't filter by groupId
        // This allows admin/staff to see all vehicles in the system
        if (accessibleGroups.length > 0) {
          whereClause.groupId = accessibleGroups;
        }
        // If empty array and user is NOT admin, they would get 403 from checkGroupAccess
        // So reaching here with empty array means admin/staff → show all vehicles
      }

      if (status) {
        whereClause.status = status;
      }

      const offset = (page - 1) * limit;

      const { count, rows: vehicles } = await db.Vehicle.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.VehicleInsurance,
            as: 'insurancePolicies',
            where: { isActive: true },
            required: false
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

      // Cache for 5 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), 300);

      return result;
    } catch (error) {
      logger.error('Failed to get vehicles', { error: error.message, userId, groupId });
      throw error;
    }
  }

  async getVehicle(vehicleId, userId, userRole) {
    try {
      const cacheKey = `vehicle:${vehicleId}`;
      
      // Try to get from cache
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const vehicle = await db.Vehicle.findByPk(vehicleId, {
        include: [
          {
            model: db.MaintenanceSchedule,
            as: 'maintenanceSchedules',
            where: { status: 'scheduled' },
            required: false,
            limit: 5,
            order: [['scheduledDate', 'ASC']]
          },
          {
            model: db.VehicleInsurance,
            as: 'insurancePolicies',
            where: { isActive: true },
            required: false,
            limit: 1,
            order: [['endDate', 'DESC']]
          },
          {
            model: db.ChargingSession,
            as: 'chargingSessions',
            required: false,
            limit: 10,
            order: [['startTime', 'DESC']]
          }
        ]
      });

      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
  const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId, userRole);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      // Cache for 2 minutes
      await redisClient.set(cacheKey, JSON.stringify(vehicle), 120);

      return vehicle;
    } catch (error) {
      logger.error('Failed to get vehicle', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  async updateVehicle(vehicleId, updateData, userId, userRole) {
    const transaction = await db.sequelize.transaction();

    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
  const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId, userRole);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      // If updating license plate, check for duplicates
      if (updateData.licensePlate && updateData.licensePlate !== vehicle.licensePlate) {
        const existingVehicle = await db.Vehicle.findOne({
          where: { licensePlate: updateData.licensePlate }
        });

        if (existingVehicle) {
          throw new AppError('Vehicle with this license plate already exists', 409, 'VEHICLE_ALREADY_EXISTS');
        }
      }

      await vehicle.update(updateData, { transaction });
      await transaction.commit();

      // Publish event
      await eventService.publishVehicleUpdated({
        vehicleId: vehicle.id,
        groupId: vehicle.groupId,
        updates: updateData,
        updatedBy: userId
      });

      // Clear cache
      await this.clearVehicleCache(vehicle.groupId);
      await redisClient.del(`vehicle:${vehicleId}`);

      return vehicle;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to update vehicle', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  async deleteVehicle(vehicleId, userId, userRole) {
    const transaction = await db.sequelize.transaction();

    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
  const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId, userRole);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      // Check if vehicle has active bookings
      const hasActiveBookings = await this.checkActiveBookings(vehicleId);
      if (hasActiveBookings) {
        throw new AppError('Cannot delete vehicle with active bookings', 400, 'VEHICLE_HAS_ACTIVE_BOOKINGS');
      }

      await vehicle.destroy({ transaction });
      await transaction.commit();

      // Publish event
      await eventService.publishVehicleDeleted({
        vehicleId,
        groupId: vehicle.groupId,
        deletedBy: userId
      });

      // Clear cache
      await this.clearVehicleCache(vehicle.groupId);
      await redisClient.del(`vehicle:${vehicleId}`);

    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to delete vehicle', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  async updateVehicleStatus(vehicleId, status, reason, userId, userRole) {
    const transaction = await db.sequelize.transaction();

    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
  const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId, userRole);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      // Validate status transition
      this.validateStatusTransition(vehicle.status, status);

      const oldStatus = vehicle.status;
      await vehicle.update({ status }, { transaction });
      await transaction.commit();

      // Publish event
      await eventService.publishVehicleStatusChanged({
        vehicleId: vehicle.id,
        groupId: vehicle.groupId,
        oldStatus,
        newStatus: status,
        reason,
        changedBy: userId
      });

      // Clear cache
      await redisClient.del(`vehicle:${vehicleId}`);
      await this.clearVehicleCache(vehicle.groupId);

      return { ...vehicle.toJSON(), previousStatus: oldStatus };
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to update vehicle status', { error: error.message, vehicleId, status, userId });
      throw error;
    }
  }

  async getVehicleStats(vehicleId, userId, userRole) {
    try {
      const cacheKey = `vehicle:stats:${vehicleId}`;
      
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
  const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId, userRole);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      // Get maintenance stats
      const maintenanceStats = await db.MaintenanceHistory.findAll({
        where: { vehicleId },
        attributes: [
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'totalMaintenance'],
          [db.sequelize.fn('SUM', db.sequelize.col('cost')), 'totalMaintenanceCost'],
          [db.sequelize.fn('AVG', db.sequelize.col('cost')), 'averageMaintenanceCost']
        ],
        raw: true
      });

      // Get charging stats
      const chargingStats = await db.ChargingSession.findAll({
        where: { vehicleId },
        attributes: [
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'totalChargingSessions'],
          [db.sequelize.fn('SUM', db.sequelize.col('energy_consumed_kwh')), 'totalEnergyConsumed'],
          [db.sequelize.fn('SUM', db.sequelize.col('cost')), 'totalChargingCost']
        ],
        raw: true
      });

      const stats = {
        vehicleInfo: {
          id: vehicle.id,
          vehicleName: vehicle.vehicleName,
          currentOdometer: vehicle.currentOdometer,
          status: vehicle.status
        },
        maintenance: maintenanceStats[0] || {
          totalMaintenance: 0,
          totalMaintenanceCost: 0,
          averageMaintenanceCost: 0
        },
        charging: chargingStats[0] || {
          totalChargingSessions: 0,
          totalEnergyConsumed: 0,
          totalChargingCost: 0
        },
        lastUpdated: new Date()
      };

      // Try to enrich stats with battery health / efficiency (uses analyticsService which wraps batteryService)
      try {
        const batteryHealth = await analyticsService.getBatteryHealth(vehicleId, userId);
        if (batteryHealth) {
          stats.batteryHealth = batteryHealth;
          stats.efficiency = batteryHealth.efficiency?.avgEfficiency || batteryHealth.efficiency?.average || null;
        }
      } catch (err) {
        logger.warn('Failed to attach battery health to vehicle stats', { error: err.message, vehicleId, userId });
      }
      // Cache for 10 minutes
      await redisClient.set(cacheKey, JSON.stringify(stats), 600);

      return stats;
    } catch (error) {
      logger.error('Failed to get vehicle stats', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  /**
   * Return stats for multiple vehicles in a single call.
   * Result is an object: { [vehicleId]: stats }
   */
  async getVehiclesStatsBulk(vehicleIds = [], userId, userRole) {
    try {
      if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
        return {};
      }

      // Fetch vehicles in one query to validate existence and access
      const vehicles = await db.Vehicle.findAll({ where: { id: vehicleIds } });

      // Build a map of vehicleId -> basic info
      const vehicleMap = vehicles.reduce((acc, v) => {
        acc[v.id] = v;
        return acc;
      }, {});

      // For each requested id, if vehicle exists and user has access, fetch stats (in parallel)
      const promises = vehicleIds.map(async (vid) => {
        const vehicle = vehicleMap[vid];
        if (!vehicle) {
          return [vid, { error: 'VEHICLE_NOT_FOUND' }];
        }

        // Check access per vehicle; if denied, return an error placeholder
  const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId, userRole);
        if (!hasAccess) {
          return [vid, { error: 'ACCESS_DENIED' }];
        }

        try {
          // Reuse existing getVehicleStats for a single vehicle to ensure same enrichment/caching
          const stats = await this.getVehicleStats(vid, userId);
          return [vid, stats];
        } catch (err) {
          logger.warn('Failed to build stats for vehicle in bulk request', { vehicleId: vid, error: err.message });
          return [vid, { error: err.message }];
        }
      });

      const settled = await Promise.all(promises);

      // Convert to object map
      const result = settled.reduce((acc, [id, stats]) => {
        acc[id] = stats;
        return acc;
      }, {});

      return result;
    } catch (error) {
      logger.error('Failed to get vehicles stats bulk', { error: error.message, userId });
      throw error;
    }
  }

  async searchVehicles(query, groupId, userId, userRole) {
    try {
      const whereClause = {
        [db.Sequelize.Op.or]: [
          { vehicleName: { [db.Sequelize.Op.iLike]: `%${query}%` } },
          { brand: { [db.Sequelize.Op.iLike]: `%${query}%` } },
          { model: { [db.Sequelize.Op.iLike]: `%${query}%` } },
          { licensePlate: { [db.Sequelize.Op.iLike]: `%${query}%` } }
        ]
      };

      if (groupId) {
        // Check group access
  const hasAccess = await this.checkGroupAccess(groupId, userId, userRole);
        if (!hasAccess) {
          throw new AppError('You do not have access to this group', 403, 'ACCESS_DENIED');
        }
        whereClause.groupId = groupId;
      } else {
        // Get all groups user has access to
        const accessibleGroups = await this.getUserAccessibleGroups(userId);
        // If empty array (admin/staff), don't filter by groupId
        if (accessibleGroups.length > 0) {
          whereClause.groupId = accessibleGroups;
        }
      }

      const vehicles = await db.Vehicle.findAll({
        where: whereClause,
        limit: 20,
        order: [['vehicleName', 'ASC']]
      });

      return vehicles;
    } catch (error) {
      logger.error('Failed to search vehicles', { error: error.message, query, userId });
      throw error;
    }
  }

  // Helper methods
  validateStatusTransition(oldStatus, newStatus) {
    const allowedTransitions = {
      'available': ['in_use', 'maintenance', 'unavailable'],
      'in_use': ['available', 'maintenance'],
      'maintenance': ['available', 'unavailable'],
      'unavailable': ['available', 'maintenance']
    };

    if (!allowedTransitions[oldStatus]?.includes(newStatus)) {
      throw new AppError(`Invalid status transition: ${oldStatus} -> ${newStatus}`, 400, 'INVALID_STATUS_TRANSITION');
    }
  }

  async checkGroupAccess(groupId, userId, userRole) {
    try {
      // Allow admin/staff to bypass membership check when role provided
      if (userRole === 'admin' || userRole === 'staff') {
        return true;
      }

      const url = `${process.env.USER_SERVICE_URL}/api/v1/internal/groups/${groupId}/members/${userId}`;
      const response = await internalFetch(url, { method: 'GET' });
      return response.ok;
    } catch (error) {
      logger.error('Failed to check group access', { error: error.message, groupId, userId });
      return false;
    }
  }

  async getUserAccessibleGroups(userId) {
    try {
      // Call User Service to get user's groups
      // This is a simplified version
      const response = await fetch(`${process.env.USER_SERVICE_URL}/api/v1/users/${userId}/groups`, {
        headers: {
          'Authorization': `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.groups.map(group => group.id);
      }
      return [];
    } catch (error) {
      logger.error('Failed to get user accessible groups', { error: error.message, userId });
      return [];
    }
  }

  async checkActiveBookings(vehicleId) {
    try {
      // Call Booking Service to check for active bookings
      const response = await fetch(`${process.env.BOOKING_SERVICE_URL}/api/v1/bookings/vehicles/${vehicleId}/active`, {
        headers: {
          'Authorization': `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.hasActiveBookings;
      }
      return false;
    } catch (error) {
      logger.error('Failed to check active bookings', { error: error.message, vehicleId });
      return true; // Assume there are active bookings to be safe
    }
  }

  async clearVehicleCache(groupId) {
    const pattern = `vehicles:${groupId}:*`;
    const keys = await redisClient.keys(pattern);
    
    for (const key of keys) {
      await redisClient.del(key);
    }
  }
}

export default new VehicleService();