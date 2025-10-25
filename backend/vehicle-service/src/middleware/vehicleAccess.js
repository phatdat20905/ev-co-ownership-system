// src/middleware/vehicleAccess.js
import db from '../models/index.js';
import { 
  AppError,
  logger 
} from '@ev-coownership/shared';

export const vehicleAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { vehicleId } = req.params;

    if (!vehicleId) {
      throw new AppError('Vehicle ID is required', 400, 'VEHICLE_ID_REQUIRED');
    }

    // Get vehicle with group information
    const vehicle = await db.Vehicle.findByPk(vehicleId, {
      attributes: ['id', 'groupId']
    });

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
    }

    // Check if user has access to the vehicle's group
    const hasAccess = await checkGroupAccess(vehicle.groupId, userId);
    
    if (!hasAccess) {
      throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
    }

    // Add vehicle and groupId to request for use in controllers
    req.vehicle = vehicle;
    req.groupId = vehicle.groupId;
    next();
  } catch (error) {
    logger.error('Vehicle access check failed', { 
      error: error.message, 
      userId: req.user?.id,
      vehicleId: req.params.vehicleId 
    });
    next(error);
  }
};

// Helper function to check group access
async function checkGroupAccess(groupId, userId) {
  try {
    const response = await fetch(`${process.env.USER_SERVICE_URL}/api/v1/groups/${groupId}/members/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    logger.error('Failed to check group access', { error: error.message, groupId, userId });
    return false;
  }
}