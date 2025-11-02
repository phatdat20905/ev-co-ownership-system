// src/services/vehicleService.js
import db from '../models/index.js';
import { 
  logger, 
  AppError,
  redisClient
} from '@ev-coownership/shared';
import eventService from './eventService.js';

export class VehicleService {
  async createVehicle(vehicleData, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if user has access to the group
      const hasAccess = await this.checkGroupAccess(vehicleData.groupId, userId);
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

  async getVehicles(groupId, status, page, limit, userId) {
    try {
      const cacheKey = `vehicles:${groupId}:${status}:${page}:${limit}`;
      
      // Try to get from cache
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const whereClause = {};
      if (groupId) {
        // Check group access
        const hasAccess = await this.checkGroupAccess(groupId, userId);
        if (!hasAccess) {
          throw new AppError('You do not have access to this group', 403, 'ACCESS_DENIED');
        }
        whereClause.groupId = groupId;
      } else {
        // Get all groups user has access to
        const accessibleGroups = await this.getUserAccessibleGroups(userId);
        whereClause.groupId = accessibleGroups;
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

  async getVehicle(vehicleId, userId) {
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
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
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

  async updateVehicle(vehicleId, updateData, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
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

  async deleteVehicle(vehicleId, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
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

  async updateVehicleStatus(vehicleId, status, reason, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
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

  async getVehicleStats(vehicleId, userId) {
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
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
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

      // Cache for 10 minutes
      await redisClient.set(cacheKey, JSON.stringify(stats), 600);

      return stats;
    } catch (error) {
      logger.error('Failed to get vehicle stats', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  async searchVehicles(query, groupId, userId) {
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
        const hasAccess = await this.checkGroupAccess(groupId, userId);
        if (!hasAccess) {
          throw new AppError('You do not have access to this group', 403, 'ACCESS_DENIED');
        }
        whereClause.groupId = groupId;
      } else {
        // Get all groups user has access to
        const accessibleGroups = await this.getUserAccessibleGroups(userId);
        whereClause.groupId = accessibleGroups;
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

  async checkGroupAccess(groupId, userId) {
    try {
      // Call User Service to check group membership
      // This is a simplified version - in reality, you'd call the User Service API
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