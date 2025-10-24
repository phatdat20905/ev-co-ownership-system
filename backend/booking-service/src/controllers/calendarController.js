import calendarService from '../services/calendarService.js';
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

      // This would typically setup WebSocket connection
      // For now, return subscription info
      const subscription = await calendarService.subscribeToCalendarUpdates(userId, groupId);

      return successResponse(res, 'Subscribed to calendar updates successfully', subscription);
    } catch (error) {
      logger.error('Failed to subscribe to calendar updates', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new CalendarController();