// booking-service/src/controllers/calendarController.js
import calendarService from '../services/calendarService.js';
import socketService from '../services/socketService.js';
import { successResponse, logger } from '@ev-coownership/shared';

export class CalendarController {
  async getVehicleCalendar(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { startDate, endDate } = req.query;
      const userId = req.user.id;

      logger.debug('Getting vehicle calendar', { vehicleId, userId, startDate, endDate });

      const calendar = await calendarService.getVehicleCalendar(vehicleId, startDate, endDate, userId);

      return successResponse(res, 'Vehicle calendar retrieved successfully', calendar);
    } catch (error) {
      logger.error('Failed to get vehicle calendar', { 
        error: error.message, 
        vehicleId: req.params.vehicleId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getGroupCalendar(req, res, next) {
    try {
      const { groupId } = req.params;
      const { startDate, endDate } = req.query;
      const userId = req.user.id;

      logger.debug('Getting group calendar', { groupId, userId, startDate, endDate });

      const calendar = await calendarService.getGroupCalendar(groupId, startDate, endDate, userId);

      return successResponse(res, 'Group calendar retrieved successfully', calendar);
    } catch (error) {
      logger.error('Failed to get group calendar', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async checkAvailability(req, res, next) {
    try {
      const { vehicleId, startTime, endTime } = req.body;
      const userId = req.user.id;

      logger.debug('Checking availability', { vehicleId, userId, startTime, endTime });

      const availability = await calendarService.checkAvailability(vehicleId, startTime, endTime, userId);

      return successResponse(res, 'Availability checked successfully', availability);
    } catch (error) {
      logger.error('Failed to check availability', { 
        error: error.message, 
        vehicleId: req.body.vehicleId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getAvailableVehicles(req, res, next) {
    try {
      const { startTime, endTime, groupId } = req.query;
      const userId = req.user.id;

      logger.debug('Getting available vehicles', { userId, startTime, endTime, groupId });

      const vehicles = await calendarService.getAvailableVehicles(startTime, endTime, groupId, userId);

      return successResponse(res, 'Available vehicles retrieved successfully', vehicles);
    } catch (error) {
      logger.error('Failed to get available vehicles', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getPersonalCalendar(req, res, next) {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      logger.debug('Getting personal calendar', { userId, startDate, endDate });

      const calendar = await calendarService.getPersonalCalendar(userId, startDate, endDate);

      return successResponse(res, 'Personal calendar retrieved successfully', calendar);
    } catch (error) {
      logger.error('Failed to get personal calendar', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async subscribeToCalendarUpdates(req, res, next) {
    try {
      const userId = req.user.id;
      const { groupId } = req.query;

      logger.debug('Subscribing to calendar updates', { userId, groupId });

      // Trả về thông tin WebSocket connection thay vì xử lý subscription trực tiếp
      const subscriptionInfo = {
        subscribed: true,
        userId,
        groupId,
        message: 'Use WebSocket connection for real-time calendar updates',
        websocketEvents: {
          subscribe: 'subscribe:calendar',
          unsubscribe: 'unsubscribe:calendar', 
          updates: 'calendar:updated',
          bookingEvents: ['booking:created', 'booking:updated', 'booking:cancelled']
        },
        instructions: {
          connect: 'Connect to /socket.io/ with authentication token',
          subscribe: `Send event: { event: 'subscribe:calendar', groupId: '${groupId}' }`,
          receive: 'Listen for calendar:updated events'
        }
      };

      return successResponse(res, 'Calendar subscription instructions', subscriptionInfo);
    } catch (error) {
      logger.error('Failed to subscribe to calendar updates', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  // 🔌 NEW: Real-time calendar broadcast endpoint (for admin/system use)
  async broadcastCalendarUpdate(req, res, next) {
    try {
      const { groupId, vehicleId, updateType, data } = req.body;
      const userId = req.user.id;

      logger.info('Broadcasting calendar update', { userId, groupId, vehicleId, updateType });

      // Kiểm tra quyền admin
      if (!['staff', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'Only staff/admin can broadcast calendar updates'
          }
        });
      }

      // Broadcast real-time update via Socket.io
      if (groupId) {
        socketService.publishCalendarUpdate(groupId, vehicleId, updateType, data);
      }

      return successResponse(res, 'Calendar update broadcasted successfully', {
        groupId,
        vehicleId,
        updateType,
        broadcasted: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to broadcast calendar update', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new CalendarController();