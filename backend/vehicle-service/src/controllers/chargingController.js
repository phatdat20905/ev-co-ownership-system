// src/controllers/chargingController.js
import chargingService from '../services/chargingService.js';
import { 
  successResponse, 
  logger 
} from '@ev-coownership/shared';

export class ChargingController {
  async createChargingSession(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const sessionData = { ...req.body, vehicleId };
      const userId = req.user.id;

      const session = await chargingService.createChargingSession(sessionData, userId);

      logger.info('Charging session created successfully', { 
        sessionId: session.id, 
        vehicleId,
        userId 
      });

      return successResponse(res, 'Charging session created successfully', session, 201);
    } catch (error) {
      logger.error('Failed to create charging session', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getChargingSessions(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { startDate, endDate, page = 1, limit = 20 } = req.query;
      const userId = req.user.id;

      const result = await chargingService.getChargingSessions(vehicleId, startDate, endDate, parseInt(page), parseInt(limit), userId);

      logger.debug('Charging sessions retrieved successfully', { 
        vehicleId, 
        count: result.sessions.length,
        userId 
      });

      return successResponse(res, 'Charging sessions retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get charging sessions', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getChargingSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = await chargingService.getChargingSession(sessionId, userId);

      logger.debug('Charging session retrieved successfully', { sessionId, userId });

      return successResponse(res, 'Charging session retrieved successfully', session);
    } catch (error) {
      logger.error('Failed to get charging session', { 
        error: error.message, 
        sessionId: req.params.sessionId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getChargingStats(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { period = 'monthly' } = req.query;
      const userId = req.user.id;

      const stats = await chargingService.getChargingStats(vehicleId, period, userId);

      logger.debug('Charging stats retrieved successfully', { vehicleId, userId });

      return successResponse(res, 'Charging stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get charging stats', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getChargingCosts(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { year = new Date().getFullYear() } = req.query;
      const userId = req.user.id;

      const costs = await chargingService.getChargingCosts(vehicleId, parseInt(year), userId);

      logger.debug('Charging costs retrieved successfully', { vehicleId, year, userId });

      return successResponse(res, 'Charging costs retrieved successfully', costs);
    } catch (error) {
      logger.error('Failed to get charging costs', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }
}

export default new ChargingController();