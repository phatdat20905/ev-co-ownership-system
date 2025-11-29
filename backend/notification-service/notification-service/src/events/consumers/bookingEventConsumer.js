// src/events/consumers/bookingEventConsumer.js
import notificationService from '../../services/notificationService.js';
import { logger } from '@ev-coownership/shared';

class BookingEventConsumer {
  async handleBookingCreated(bookingData) {
    try {
      logger.info('Processing booking created event', { 
        bookingId: bookingData.bookingId,
        userId: bookingData.userId,
      });

      await notificationService.sendTemplateNotification('booking_created', bookingData.userId, {
        user_name: bookingData.userName || 'there',
        booking_id: bookingData.bookingId,
        vehicle_name: bookingData.vehicleName,
        start_time: this.formatDate(bookingData.startTime),
        end_time: this.formatDate(bookingData.endTime),
      });

      logger.info('Booking created notification sent', { 
        bookingId: bookingData.bookingId,
        userId: bookingData.userId,
      });
    } catch (error) {
      logger.error('Failed to process booking created event', {
        bookingId: bookingData.bookingId,
        error: error.message,
      });
    }
  }

  async handleBookingConfirmed(bookingData) {
    try {
      logger.info('Processing booking confirmed event', { 
        bookingId: bookingData.bookingId,
        userId: bookingData.userId,
      });

      await notificationService.sendTemplateNotification('booking_confirmed', bookingData.userId, {
        user_name: bookingData.userName || 'there',
        vehicle_name: bookingData.vehicleName,
        license_plate: bookingData.licensePlate,
        start_time: this.formatDate(bookingData.startTime),
        end_time: this.formatDate(bookingData.endTime),
      });

      logger.info('Booking confirmed notification sent', { 
        bookingId: bookingData.bookingId,
        userId: bookingData.userId,
      });
    } catch (error) {
      logger.error('Failed to process booking confirmed event', {
        bookingId: bookingData.bookingId,
        error: error.message,
      });
    }
  }

  async handleBookingReminder(bookingData) {
    try {
      logger.info('Processing booking reminder event', { 
        bookingId: bookingData.bookingId,
        userId: bookingData.userId,
      });

      await notificationService.sendTemplateNotification('booking_reminder', bookingData.userId, {
        user_name: bookingData.userName || 'there',
        vehicle_name: bookingData.vehicleName,
        start_time: this.formatDate(bookingData.startTime),
      });

      logger.info('Booking reminder notification sent', { 
        bookingId: bookingData.bookingId,
        userId: bookingData.userId,
      });
    } catch (error) {
      logger.error('Failed to process booking reminder event', {
        bookingId: bookingData.bookingId,
        error: error.message,
      });
    }
  }

  async handleBookingCancelled(bookingData) {
    try {
      logger.info('Processing booking cancelled event', { 
        bookingId: bookingData.bookingId,
        userId: bookingData.userId,
      });

      await notificationService.sendTemplateNotification('booking_cancelled', bookingData.userId, {
        user_name: bookingData.userName || 'there',
        vehicle_name: bookingData.vehicleName,
        cancellation_reason: bookingData.cancellationReason || 'No reason provided',
      });

      logger.info('Booking cancelled notification sent', { 
        bookingId: bookingData.bookingId,
        userId: bookingData.userId,
      });
    } catch (error) {
      logger.error('Failed to process booking cancelled event', {
        bookingId: bookingData.bookingId,
        error: error.message,
      });
    }
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  }
}

export default new BookingEventConsumer();