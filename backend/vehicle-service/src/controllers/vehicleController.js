// src/controllers/vehicleController.js
import vehicleService from '../services/vehicleService.js';
import { 
  successResponse, 
  logger,
  AppError 
} from '@ev-coownership/shared';

export class VehicleController {
  async createVehicle(req, res, next) {
    try {
      const vehicleData = req.body;
      const userId = req.user.id;

  const vehicle = await vehicleService.createVehicle(vehicleData, userId, req.user.role);

      logger.info('Vehicle created successfully', { 
        vehicleId: vehicle.id, 
        groupId: vehicle.groupId,
        userId 
      });

      return successResponse(res, 'Vehicle created successfully', vehicle, 201);
    } catch (error) {
      logger.error('Failed to create vehicle', { 
        error: error.message, 
        userId: req.user?.id,
        groupId: req.body?.groupId 
      });
      next(error);
    }
  }

  async getVehicles(req, res, next) {
    try {
      const { groupId, status, page = 1, limit = 20 } = req.query;
      const userId = req.user.id;

  const result = await vehicleService.getVehicles(groupId, status, parseInt(page), parseInt(limit), userId, req.user.role);

      logger.debug('Vehicles retrieved successfully', { 
        groupId, 
        count: result.vehicles.length,
        userId 
      });

      return successResponse(res, 'Vehicles retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get vehicles', { 
        error: error.message, 
        userId: req.user?.id,
        groupId: req.query?.groupId 
      });
      next(error);
    }
  }

  async getVehicle(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const userId = req.user.id;

  const vehicle = await vehicleService.getVehicle(vehicleId, userId, req.user.role);

      logger.debug('Vehicle retrieved successfully', { vehicleId, userId });

      return successResponse(res, 'Vehicle retrieved successfully', vehicle);
    } catch (error) {
      logger.error('Failed to get vehicle', { 
        error: error.message, 
        vehicleId: req.params.vehicleId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async updateVehicle(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const updateData = req.body;
      const userId = req.user.id;

  const vehicle = await vehicleService.updateVehicle(vehicleId, updateData, userId, req.user.role);

      logger.info('Vehicle updated successfully', { vehicleId, userId });

      return successResponse(res, 'Vehicle updated successfully', vehicle);
    } catch (error) {
      logger.error('Failed to update vehicle', { 
        error: error.message, 
        vehicleId: req.params.vehicleId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async deleteVehicle(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const userId = req.user.id;

  await vehicleService.deleteVehicle(vehicleId, userId, req.user.role);

      logger.info('Vehicle deleted successfully', { vehicleId, userId });

      return successResponse(res, 'Vehicle deleted successfully');
    } catch (error) {
      logger.error('Failed to delete vehicle', { 
        error: error.message, 
        vehicleId: req.params.vehicleId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async updateVehicleStatus(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { status, reason } = req.body;
      const userId = req.user.id;

  const vehicle = await vehicleService.updateVehicleStatus(vehicleId, status, reason, userId, req.user.role);

      logger.info('Vehicle status updated successfully', { 
        vehicleId, 
        oldStatus: vehicle.previousStatus, 
        newStatus: status,
        userId 
      });

      return successResponse(res, 'Vehicle status updated successfully', vehicle);
    } catch (error) {
      logger.error('Failed to update vehicle status', { 
        error: error.message, 
        vehicleId: req.params.vehicleId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getVehicleStats(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const userId = req.user.id;

  const stats = await vehicleService.getVehicleStats(vehicleId, userId, req.user.role);

      logger.debug('Vehicle stats retrieved successfully', { vehicleId, userId });

      return successResponse(res, 'Vehicle stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get vehicle stats', { 
        error: error.message, 
        vehicleId: req.params.vehicleId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getVehicleStatsBulk(req, res, next) {
    try {
      const { ids } = req.body;
      const userId = req.user.id;

  const statsMap = await vehicleService.getVehiclesStatsBulk(ids, userId, req.user.role);

      logger.debug('Bulk vehicle stats retrieved', { count: Object.keys(statsMap).length, userId });

      return successResponse(res, 'Bulk vehicle stats retrieved successfully', statsMap);
    } catch (error) {
      logger.error('Failed to get bulk vehicle stats', { error: error.message, userId: req.user?.id });
      next(error);
    }
  }

  async searchVehicles(req, res, next) {
    try {
      const { query, groupId } = req.query;
      const userId = req.user.id;

  const vehicles = await vehicleService.searchVehicles(query, groupId, userId, req.user.role);

      logger.debug('Vehicles search completed', { 
        query, 
        groupId,
        count: vehicles.length,
        userId 
      });

      return successResponse(res, 'Vehicles search completed', vehicles);
    } catch (error) {
      logger.error('Failed to search vehicles', { 
        error: error.message, 
        query: req.query?.query,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new VehicleController();