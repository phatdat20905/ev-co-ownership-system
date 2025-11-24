// booking-service/src/services/validationService.js
import { AppError, logger } from '@ev-coownership/shared';
import db from '../models/index.js';

export class ValidationService {
  constructor() {
    this.bookingRules = {
      MIN_DURATION: 2 * 60 * 60 * 1000,      // 2 hours
      MAX_DURATION: 24 * 60 * 60 * 1000,     // 24 hours
      MAX_ADVANCE_DAYS: 30,
      SAME_DAY_CUTOFF_HOURS: 2,
      MAX_BOOKINGS_PER_DAY: 3,
      MAX_ACTIVE_BOOKINGS: 5
    };
  }

  async validateBookingData(bookingData) {
    const errors = [];

    // Required fields
    if (!bookingData.vehicleId) {
      errors.push('Vehicle ID is required');
    }
    if (!bookingData.groupId) {
      errors.push('Group ID is required');
    }
    if (!bookingData.startTime) {
      errors.push('Start time is required');
    }
    if (!bookingData.endTime) {
      errors.push('End time is required');
    }

    // Time validation
    if (bookingData.startTime && bookingData.endTime) {
      const startTime = new Date(bookingData.startTime);
      const endTime = new Date(bookingData.endTime);
      const now = new Date();

      // Start time must be in the future
      if (startTime <= now) {
        errors.push('Start time must be in the future');
      }

      // End time must be after start time
      if (endTime <= startTime) {
        errors.push('End time must be after start time');
      }

      // Duration validation
      const duration = endTime - startTime;
      if (duration < this.bookingRules.MIN_DURATION) {
        errors.push(`Minimum booking duration is ${this.bookingRules.MIN_DURATION / (60 * 60 * 1000)} hours`);
      }
      if (duration > this.bookingRules.MAX_DURATION) {
        errors.push(`Maximum booking duration is ${this.bookingRules.MAX_DURATION / (60 * 60 * 1000)} hours`);
      }

      // Advance booking limit
      const maxAdvanceDate = new Date(now.getTime() + this.bookingRules.MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);
      if (startTime > maxAdvanceDate) {
        errors.push(`Cannot book more than ${this.bookingRules.MAX_ADVANCE_DAYS} days in advance`);
      }

      // Same-day booking cutoff
      if (this.isSameDay(startTime, now)) {
        const cutoffTime = new Date(now.getTime() + this.bookingRules.SAME_DAY_CUTOFF_HOURS * 60 * 60 * 1000);
        if (startTime < cutoffTime) {
          errors.push(`Same-day bookings must be at least ${this.bookingRules.SAME_DAY_CUTOFF_HOURS} hours in advance`);
        }
      }
    }

    // Purpose validation
    if (bookingData.purpose && bookingData.purpose.length > 500) {
      errors.push('Purpose cannot exceed 500 characters');
    }

    if (errors.length > 0) {
      throw new AppError('Booking validation failed', 400, 'VALIDATION_ERROR', { errors });
    }

    return true;
  }

  async validateBookingUpdate(updateData, existingBooking) {
    const errors = [];

    // Cannot modify completed or cancelled bookings
    if (['completed', 'cancelled'].includes(existingBooking.status)) {
      errors.push('Cannot modify completed or cancelled bookings');
    }

    // Time validation for updates
    if (updateData.startTime || updateData.endTime) {
      const startTime = new Date(updateData.startTime || existingBooking.startTime);
      const endTime = new Date(updateData.endTime || existingBooking.endTime);
      const now = new Date();

      // For in-progress bookings, cannot modify start time
      if (existingBooking.status === 'in_progress' && updateData.startTime) {
        errors.push('Cannot modify start time of in-progress booking');
      }

      // End time must be after start time
      if (endTime <= startTime) {
        errors.push('End time must be after start time');
      }

      // Duration validation
      const duration = endTime - startTime;
      if (duration < this.bookingRules.MIN_DURATION) {
        errors.push(`Minimum booking duration is ${this.bookingRules.MIN_DURATION / (60 * 60 * 1000)} hours`);
      }
      if (duration > this.bookingRules.MAX_DURATION) {
        errors.push(`Maximum booking duration is ${this.bookingRules.MAX_DURATION / (60 * 60 * 1000)} hours`);
      }
    }

    // Status transition validation
    if (updateData.status) {
      const validTransitions = this.getValidStatusTransitions(existingBooking.status);
      if (!validTransitions.includes(updateData.status)) {
        errors.push(`Invalid status transition from ${existingBooking.status} to ${updateData.status}`);
      }
    }

    if (errors.length > 0) {
      throw new AppError('Booking update validation failed', 400, 'VALIDATION_ERROR', { errors });
    }

    return true;
  }

  async validateCheckInData(checkInData) {
    const errors = [];

    // Odometer validation
    if (checkInData.odometerReading !== undefined) {
      if (!Number.isInteger(checkInData.odometerReading) || checkInData.odometerReading < 0) {
        errors.push('Odometer reading must be a positive integer');
      }
    }

    // Fuel level validation (for EVs, this is battery percentage)
    if (checkInData.fuelLevel !== undefined) {
      if (typeof checkInData.fuelLevel !== 'number' || checkInData.fuelLevel < 0 || checkInData.fuelLevel > 100) {
        errors.push('Fuel level (battery percentage) must be between 0 and 100');
      }
    }

    // Images validation
    if (checkInData.images && !Array.isArray(checkInData.images)) {
      errors.push('Images must be an array');
    }

    if (checkInData.images && checkInData.images.length > 10) {
      errors.push('Maximum 10 images allowed');
    }

    // Location validation
    if (checkInData.location) {
      if (typeof checkInData.location !== 'object') {
        errors.push('Location must be an object');
      } else {
        const { latitude, longitude } = checkInData.location;
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
          errors.push('Location must contain numeric latitude and longitude');
        }
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          errors.push('Invalid latitude or longitude values');
        }
      }
    }

    if (errors.length > 0) {
      throw new AppError('Check-in data validation failed', 400, 'VALIDATION_ERROR', { errors });
    }

    return true;
  }

  async validateCheckOutData(checkOutData) {
    const errors = [];

    // Odometer validation
    if (checkOutData.odometerReading !== undefined) {
      if (!Number.isInteger(checkOutData.odometerReading) || checkOutData.odometerReading < 0) {
        errors.push('Odometer reading must be a positive integer');
      }
    }

    // Fuel level validation
    if (checkOutData.fuelLevel !== undefined) {
      if (typeof checkOutData.fuelLevel !== 'number' || checkOutData.fuelLevel < 0 || checkOutData.fuelLevel > 100) {
        errors.push('Fuel level (battery percentage) must be between 0 and 100');
      }
    }

    // Notes validation
    if (checkOutData.notes && checkOutData.notes.length > 1000) {
      errors.push('Notes cannot exceed 1000 characters');
    }

    if (errors.length > 0) {
      throw new AppError('Check-out data validation failed', 400, 'VALIDATION_ERROR', { errors });
    }

    return true;
  }

  async validateVehicleAvailability(vehicleId, startTime, endTime, excludeBookingId = null) {
    try {
      const where = {
        vehicleId,
        status: ['pending', 'confirmed', 'in_progress'],
        [db.Sequelize.Op.or]: [
          {
            startTime: { [db.Sequelize.Op.between]: [startTime, endTime] }
          },
          {
            endTime: { [db.Sequelize.Op.between]: [startTime, endTime] }
          },
          {
            [db.Sequelize.Op.and]: [
              { startTime: { [db.Sequelize.Op.lte]: startTime } },
              { endTime: { [db.Sequelize.Op.gte]: endTime } }
            ]
          }
        ]
      };

      if (excludeBookingId) {
        where.id = { [db.Sequelize.Op.ne]: excludeBookingId };
      }

      const conflictingBooking = await db.Booking.findOne({ where });

      if (conflictingBooking) {
        throw new AppError(
          `Vehicle is not available. Conflicts with booking ${conflictingBooking.id}`,
          409,
          'VEHICLE_UNAVAILABLE',
          { conflictingBookingId: conflictingBooking.id }
        );
      }

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Failed to validate vehicle availability', {
        error: error.message,
        vehicleId
      });
      throw new AppError('Failed to validate vehicle availability', 500, 'VALIDATION_ERROR');
    }
  }

  async validateUserBookingLimits(userId, bookingData) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const now = new Date();

      // Check daily booking limit
      const todaysBookings = await db.Booking.count({
        where: {
          userId,
          startTime: {
            [db.Sequelize.Op.between]: [today, tomorrow]
          },
          status: ['pending', 'confirmed']
        }
      });

      if (todaysBookings >= this.bookingRules.MAX_BOOKINGS_PER_DAY) {
        throw new AppError(
          `Maximum ${this.bookingRules.MAX_BOOKINGS_PER_DAY} bookings per day exceeded`,
          400,
          'DAILY_LIMIT_EXCEEDED'
        );
      }

      // Check active bookings limit
      // Count only bookings that are still active/future to avoid counting stale past bookings
      // Consider pending, confirmed and in_progress statuses but require endTime > now
      const activeBookings = await db.Booking.count({
        where: {
          userId,
          status: ['pending', 'confirmed', 'in_progress'],
          endTime: {
            [db.Sequelize.Op.gt]: now
          }
        }
      });

      if (activeBookings >= this.bookingRules.MAX_ACTIVE_BOOKINGS) {
        throw new AppError(
          `Maximum ${this.bookingRules.MAX_ACTIVE_BOOKINGS} active bookings exceeded`,
          400,
          'ACTIVE_BOOKINGS_LIMIT'
        );
      }

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Failed to validate user booking limits', {
        error: error.message,
        userId
      });
      throw new AppError('Failed to validate user booking limits', 500, 'VALIDATION_ERROR');
    }
  }

  // Helper methods
  isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  getValidStatusTransitions(currentStatus) {
    const transitions = {
      pending: ['confirmed', 'cancelled', 'conflict'],
      confirmed: ['in_progress', 'cancelled', 'conflict'],
      in_progress: ['completed'],
      conflict: ['confirmed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    return transitions[currentStatus] || [];
  }

  isValidStatusTransition(fromStatus, toStatus) {
    const validTransitions = this.getValidStatusTransitions(fromStatus);
    return validTransitions.includes(toStatus);
  }
}

export default new ValidationService();