// booking-service/src/services/eventService.js
import { 
  createEventBus, 
  eventTypes,
  logger 
} from '@ev-coownership/shared';

class EventService {
  constructor() {
    this.eventBus = createEventBus('booking-service');
    this.isConnected = false;
    this.retryAttempts = 3;
    this.retryDelay = 500;
  }

  async initialize() {
    try {
      await this.eventBus.rabbitMQ.connect();
      this.isConnected = true;
      logger.info('Booking event service initialized successfully');
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to initialize booking event service', { error: error.message });
    }
  }

  // Helper method for publishing events
  async publishEvent(eventType, payload) {
    if (!this.isConnected) {
      logger.warn('Event service not connected, skipping publish', { eventType });
      return;
    }

    if (!payload || Object.keys(payload).length === 0) {
      logger.warn('Empty payload, skipping publish', { eventType });
      return;
    }

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        await this.eventBus.publish(eventType, payload);
        logger.debug(`Event published: ${eventType}`, { 
          eventType,
          payloadSize: JSON.stringify(payload).length 
        });
        return;
      } catch (error) {
        logger.error(`Failed to publish event [Attempt ${attempt}]`, { 
          eventType, 
          error: error.message 
        });
        if (attempt < this.retryAttempts) {
          await new Promise(res => setTimeout(res, this.retryDelay));
        }
      }
    }
  }

  // Booking Events
  async publishBookingCreated(booking) {
    await this.publishEvent(eventTypes.BOOKING_CREATED, {
      bookingId: booking.id,
      userId: booking.userId,
      vehicleId: booking.vehicleId,
      groupId: booking.groupId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      priorityScore: booking.priorityScore,
      purpose: booking.purpose,
      createdAt: booking.createdAt
    });
  }

  async publishBookingUpdated(booking) {
    await this.publishEvent(eventTypes.BOOKING_UPDATED, {
      bookingId: booking.id,
      userId: booking.userId,
      vehicleId: booking.vehicleId,
      updates: booking._previousDataValues ? 
        this.getChangedFields(booking._previousDataValues, booking.dataValues) : {},
      updatedAt: booking.updatedAt
    });
  }

  async publishBookingCancelled(booking) {
    await this.publishEvent(eventTypes.BOOKING_CANCELLED, {
      bookingId: booking.id,
      userId: booking.userId,
      vehicleId: booking.vehicleId,
      cancellationReason: booking.cancellationReason,
      cancelledAt: new Date().toISOString()
    });
  }

  async publishBookingConfirmed(booking) {
    await this.publishEvent(eventTypes.BOOKING_CONFIRMED, {
      bookingId: booking.id,
      userId: booking.userId,
      vehicleId: booking.vehicleId,
      autoConfirmed: booking.autoConfirmed,
      confirmedAt: new Date().toISOString()
    });
  }

  async publishBookingCompleted(booking) {
    await this.publishEvent(eventTypes.BOOKING_COMPLETED, {
      bookingId: booking.id,
      userId: booking.userId,
      vehicleId: booking.vehicleId,
      completedAt: new Date().toISOString()
    });
  }

  // Conflict Events
  async publishBookingConflictDetected(booking, conflicts) {
    await this.publishEvent(eventTypes.BOOKING_CONFLICT_DETECTED, {
      bookingId: booking.id,
      userId: booking.userId,
      vehicleId: booking.vehicleId,
      conflicts: conflicts.map(conflict => ({
        type: conflict.type,
        description: conflict.description,
        severity: conflict.severity
      })),
      detectedAt: new Date().toISOString()
    });
  }

  async publishBookingConflictResolved(conflict, resolution) {
    await this.publishEvent(eventTypes.BOOKING_CONFLICT_RESOLVED, {
      conflictId: conflict.id,
      bookingIds: [conflict.bookingId_1, conflict.bookingId_2].filter(Boolean),
      resolution: resolution.note,
      resolvedBy: conflict.resolvedBy,
      action: resolution.action,
      resolvedAt: conflict.resolvedAt
    });
  }

  // Check-in/Check-out Events
  async publishCheckInSuccess(booking, checkInLog) {
    await this.publishEvent(eventTypes.CHECK_IN_SUCCESS, {
      bookingId: booking.id,
      userId: booking.userId,
      vehicleId: booking.vehicleId,
      checkInTime: checkInLog.performedAt,
      odometerReading: checkInLog.odometerReading,
      fuelLevel: checkInLog.fuelLevel,
      location: checkInLog.location
    });
  }

  async publishCheckOutSuccess(booking, checkOutLog) {
    await this.publishEvent(eventTypes.CHECK_OUT_SUCCESS, {
      bookingId: booking.id,
      userId: booking.userId,
      vehicleId: booking.vehicleId,
      checkOutTime: checkOutLog.performedAt,
      odometerReading: checkOutLog.odometerReading,
      fuelLevel: checkOutLog.fuelLevel,
      location: checkOutLog.location,
      usageDuration: this.calculateUsageDuration(booking, checkOutLog)
    });
  }

  async publishCheckInFailed(bookingId, userId, reason) {
    await this.publishEvent(eventTypes.CHECK_IN_FAILED, {
      bookingId,
      userId,
      reason,
      failedAt: new Date().toISOString()
    });
  }

  // QR Code Events
  async publishQRCodeGenerated(bookingId, userId) {
    await this.publishEvent(eventTypes.QR_CODE_GENERATED, {
      bookingId,
      userId,
      generatedAt: new Date().toISOString()
    });
  }

  async publishQRCodeValidated(bookingId, userId, isValid) {
    await this.publishEvent(eventTypes.QR_CODE_VALIDATED, {
      bookingId,
      userId,
      isValid,
      validatedAt: new Date().toISOString()
    });
  }

  // Calendar Events
  async publishCalendarUpdated(vehicleId, groupId, changes) {
    await this.publishEvent(eventTypes.CALENDAR_UPDATED, {
      vehicleId,
      groupId,
      changes,
      updatedAt: new Date().toISOString()
    });
  }

  // Notification Events
  async publishBookingReminder(booking) {
    await this.publishEvent(eventTypes.BOOKING_REMINDER, {
      bookingId: booking.id,
      userId: booking.userId,
      vehicleId: booking.vehicleId,
      startTime: booking.startTime,
      reminderSentAt: new Date().toISOString()
    });
  }

  async publishBookingConfirmationRequired(booking) {
    await this.publishEvent(eventTypes.BOOKING_CONFIRMATION_REQUIRED, {
      bookingId: booking.id,
      userId: booking.userId,
      vehicleId: booking.vehicleId,
      priorityScore: booking.priorityScore,
      requestedAt: new Date().toISOString()
    });
  }

  // Usage Statistics Event
  async publishUsageStatistics(usageStats) {
    await this.publishEvent('booking.usage.statistics', {
      bookingId: usageStats.bookingId,
      userId: usageStats.userId,
      vehicleId: usageStats.vehicleId,
      groupId: usageStats.groupId,
      distanceKm: usageStats.distanceKm,
      durationHours: usageStats.durationHours,
      fuelConsumed: usageStats.fuelConsumed,
      period: {
        start: usageStats.checkInTime,
        end: usageStats.checkOutTime
      }
    });
  }

  // Admin Events
  async publishAdminBookingStatusUpdate(bookingId, adminUserId, oldStatus, newStatus, reason) {
    await this.publishEvent('booking.admin.status_updated', {
      bookingId,
      adminUserId,
      oldStatus,
      newStatus,
      reason,
      updatedAt: new Date().toISOString()
    });
  }

  async publishAdminBookingDeletion(bookingId, adminUserId, originalBooking, reason) {
    await this.publishEvent('booking.admin.deleted', {
      bookingId,
      adminUserId,
      originalBooking: {
        id: originalBooking.id,
        userId: originalBooking.userId,
        vehicleId: originalBooking.vehicleId,
        status: originalBooking.status,
        startTime: originalBooking.startTime,
        endTime: originalBooking.endTime
      },
      reason,
      deletedAt: new Date().toISOString()
    });
  }

  // Helper methods
  getChangedFields(previous, current) {
    const changes = {};
    for (const key in current) {
      if (previous[key] !== current[key]) {
        changes[key] = {
          from: previous[key],
          to: current[key]
        };
      }
    }
    return changes;
  }

  calculateUsageDuration(booking, checkOutLog) {
    const checkInLog = booking.checkLogs?.find(log => log.actionType === 'check_in');
    if (checkInLog) {
      return (new Date(checkOutLog.performedAt) - new Date(checkInLog.performedAt)) / (1000 * 60 * 60); // hours
    }
    return null;
  }

  // Health check
  async healthCheck() {
    return await this.eventBus.healthCheck();
  }

  // Start event consumers for booking service
  async startEventConsumers() {
    if (!this.isConnected) {
      logger.warn('Event service not connected, skipping event consumers');
      return;
    }

    try {
      // Subscribe to vehicle updates
      await this.eventBus.subscribe(
        eventTypes.VEHICLE_UPDATED, 
        this.handleVehicleUpdated.bind(this)
      );

      // Subscribe to user updates
      await this.eventBus.subscribe(
        eventTypes.USER_UPDATED,
        this.handleUserUpdated.bind(this)
      );

      // Subscribe to group updates
      await this.eventBus.subscribe(
        eventTypes.GROUP_UPDATED,
        this.handleGroupUpdated.bind(this)
      );

      logger.info('Booking service event consumers started successfully');
    } catch (error) {
      logger.error('Failed to start booking service event consumers', { error: error.message });
    }
  }

  // Event handlers
  async handleVehicleUpdated(vehicleData) {
    try {
      logger.info('Vehicle updated event received', { vehicleId: vehicleData.vehicleId });

      // Update local vehicle cache or trigger cache invalidation
      // This would update the replicated vehicle data in booking service

    } catch (error) {
      logger.error('Error handling vehicle updated event', { 
        error: error.message, 
        vehicleId: vehicleData.vehicleId 
      });
    }
  }

  async handleUserUpdated(userData) {
    try {
      logger.info('User updated event received', { userId: userData.userId });

      // Handle user updates that might affect bookings
      // For example, if user is deactivated, cancel their future bookings

    } catch (error) {
      logger.error('Error handling user updated event', { 
        error: error.message, 
        userId: userData.userId 
      });
    }
  }

  async handleGroupUpdated(groupData) {
    try {
      logger.info('Group updated event received', { groupId: groupData.groupId });

      // Handle group updates that might affect bookings
      // For example, if group is dissolved, handle related bookings

    } catch (error) {
      logger.error('Error handling group updated event', { 
        error: error.message, 
        groupId: groupData.groupId 
      });
    }
  }
}

export default new EventService();