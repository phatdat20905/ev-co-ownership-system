import bookingService from '../services/bookingService.js';
import { successResponse, logger, AppError, notificationHelper, NOTIFICATION_TYPES } from '@ev-coownership/shared';

export class BookingController {
  async createBooking(req, res, next) {
    try {
      const userId = req.user.id;
      const bookingData = req.body;

      logger.info('Creating new booking', { userId, bookingData });

      const booking = await bookingService.createBooking(bookingData, userId);

      // Send notification to user
      try {
        await notificationHelper.sendBookingNotification(
          NOTIFICATION_TYPES.BOOKING_CREATED,
          {
            id: booking.id,
            vehicleName: booking.Vehicle?.name || 'Xe',
            startTime: booking.startTime,
            endTime: booking.endTime,
            location: booking.pickupLocation || 'Vị trí đặt xe'
          },
          userId
        );
        logger.info('Booking notification sent', { bookingId: booking.id });
      } catch (notifError) {
        logger.error('Failed to send booking notification', { error: notifError.message });
        // Don't fail the request if notification fails
      }

      return successResponse(res, 'Booking created successfully', booking, 201);
    } catch (error) {
      logger.error('Failed to create booking', { 
        error: error.message, 
        userId: req.user?.id,
        bookingData: req.body 
      });
      next(error);
    }
  }

  async getBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      logger.debug('Getting booking details', { bookingId, userId });

      const booking = await bookingService.getBookingById(bookingId, userId);

      return successResponse(res, 'Booking retrieved successfully', booking);
    } catch (error) {
      logger.error('Failed to get booking', { 
        error: error.message, 
        bookingId: req.params.bookingId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getUserBookings(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = req.query;

      logger.debug('Getting user bookings', { userId, filters });

      const result = await bookingService.getUserBookings(userId, filters);

      return successResponse(res, 'Bookings retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get user bookings', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getBookingHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { period = '30d', page = 1, limit = 20 } = req.query;

      logger.debug('Getting booking history', { userId, period });

      const history = await bookingService.getBookingHistory(userId, period, parseInt(page), parseInt(limit));

      return successResponse(res, 'Booking history retrieved successfully', history);
    } catch (error) {
      logger.error('Failed to get booking history', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async updateBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      logger.info('Updating booking', { bookingId, userId, updateData });

      const booking = await bookingService.updateBooking(bookingId, updateData, userId);

      return successResponse(res, 'Booking updated successfully', booking);
    } catch (error) {
      logger.error('Failed to update booking', { 
        error: error.message, 
        bookingId: req.params.bookingId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      const { reason } = req.body;

      logger.info('Cancelling booking', { bookingId, userId, reason });

      const booking = await bookingService.cancelBooking(bookingId, userId, reason);

      // Send cancellation notification
      try {
        await notificationHelper.sendBookingNotification(
          NOTIFICATION_TYPES.BOOKING_CANCELLED,
          {
            id: booking.id,
            vehicleName: booking.Vehicle?.name || 'Xe',
            startTime: booking.startTime,
            endTime: booking.endTime,
            reason: reason || 'Người dùng hủy'
          },
          userId
        );
        logger.info('Booking cancellation notification sent', { bookingId: booking.id });
      } catch (notifError) {
        logger.error('Failed to send cancellation notification', { error: notifError.message });
      }

      return successResponse(res, 'Booking cancelled successfully', booking);
    } catch (error) {
      logger.error('Failed to cancel booking', { 
        error: error.message, 
        bookingId: req.params.bookingId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getBookingStats(req, res, next) {
    try {
      const userId = req.user.id;
      const { groupId } = req.query;

      logger.debug('Getting booking stats', { userId, groupId });

      const stats = await bookingService.getBookingStats(userId, groupId);

      return successResponse(res, 'Booking stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get booking stats', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getBookingAnalytics(req, res, next) {
    try {
      const userId = req.user.id;
      const { period = '30d', groupId } = req.query;

      logger.debug('Getting booking analytics', { userId, period, groupId });

      const analytics = await bookingService.getBookingAnalytics(userId, period, groupId);

      return successResponse(res, 'Booking analytics retrieved successfully', analytics);
    } catch (error) {
      logger.error('Failed to get booking analytics', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getVehicleRevenue(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const userId = req.user.id;

      logger.debug('Getting vehicle revenue', { vehicleId, userId });

      const revenue = await bookingService.getVehicleRevenue(vehicleId, userId);

      return successResponse(res, 'Vehicle revenue retrieved successfully', revenue);
    } catch (error) {
      logger.error('Failed to get vehicle revenue', {
        error: error.message,
        vehicleId: req.params.vehicleId,
        userId: req.user?.id
      });
      next(error);
    }
  }
}

export default new BookingController();