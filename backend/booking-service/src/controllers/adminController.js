import adminService from '../services/adminService.js';
import { successResponse, logger } from '@ev-coownership/shared';

export class AdminController {
  async getAllBookings(req, res, next) {
    try {
      const filters = req.query;
      const userId = req.user.id;

      logger.debug('Admin getting all bookings', { userId, filters });

      const bookings = await adminService.getAllBookings(filters, userId);

      return successResponse(res, 'All bookings retrieved successfully', bookings);
    } catch (error) {
      logger.error('Failed to get all bookings', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      logger.debug('Admin getting booking details', { bookingId, userId });

      const booking = await adminService.getBooking(bookingId, userId);

      return successResponse(res, 'Booking retrieved successfully', booking);
    } catch (error) {
      logger.error('Failed to get booking as admin', { 
        error: error.message, 
        bookingId: req.params.bookingId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async updateBookingStatus(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      const { status, reason } = req.body;

      logger.info('Admin updating booking status', { bookingId, userId, status, reason });

      const booking = await adminService.updateBookingStatus(bookingId, status, reason, userId);

      return successResponse(res, 'Booking status updated successfully', booking);
    } catch (error) {
      logger.error('Failed to update booking status', { 
        error: error.message, 
        bookingId: req.params.bookingId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async deleteBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      const { reason } = req.body;

      logger.info('Admin deleting booking', { bookingId, userId, reason });

      await adminService.deleteBooking(bookingId, reason, userId);

      return successResponse(res, 'Booking deleted successfully');
    } catch (error) {
      logger.error('Failed to delete booking', { 
        error: error.message, 
        bookingId: req.params.bookingId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getBookingAnalytics(req, res, next) {
    try {
      const { period = '30d' } = req.query;
      const userId = req.user.id;

      logger.debug('Getting booking analytics', { userId, period });

      const analytics = await adminService.getBookingAnalytics(period, userId);

      return successResponse(res, 'Booking analytics retrieved successfully', analytics);
    } catch (error) {
      logger.error('Failed to get booking analytics', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getVehicleUtilization(req, res, next) {
    try {
      const { period = '30d', vehicleId } = req.query;
      const userId = req.user.id;

      logger.debug('Getting vehicle utilization', { userId, period, vehicleId });

      const utilization = await adminService.getVehicleUtilization(period, vehicleId, userId);

      return successResponse(res, 'Vehicle utilization retrieved successfully', utilization);
    } catch (error) {
      logger.error('Failed to get vehicle utilization', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getGroupTrends(req, res, next) {
    try {
      const { groupId } = req.params;
      const { period = '30d' } = req.query;
      const userId = req.user.id;

      logger.debug('Getting group trends', { userId, groupId, period });

      const trends = await adminService.getGroupTrends(groupId, period, userId);

      return successResponse(res, 'Group trends retrieved successfully', trends);
    } catch (error) {
      logger.error('Failed to get group trends', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async generateBookingReport(req, res, next) {
    try {
      const { startDate, endDate, reportType } = req.query;
      const userId = req.user.id;

      logger.info('Generating booking report', { userId, startDate, endDate, reportType });

      const report = await adminService.generateBookingReport(startDate, endDate, reportType, userId);

      return successResponse(res, 'Booking report generated successfully', report);
    } catch (error) {
      logger.error('Failed to generate booking report', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getPendingConflicts(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user.id;

      logger.debug('Getting pending conflicts', { userId });

      const conflicts = await adminService.getPendingConflicts(parseInt(page), parseInt(limit), userId);

      return successResponse(res, 'Pending conflicts retrieved successfully', conflicts);
    } catch (error) {
      logger.error('Failed to get pending conflicts', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new AdminController();