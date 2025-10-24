// booking-service/src/services/calendarService.js
import { logger, AppError, redisClient } from '@ev-coownership/shared';
import db from '../models/index.js';

export class CalendarService {
  constructor() {
    this.cacheTTL = {
      CALENDAR: 5 * 60,      // 5 minutes
      AVAILABILITY: 2 * 60,  // 2 minutes
      VEHICLES: 10 * 60      // 10 minutes
    };
  }

  async getVehicleCalendar(vehicleId, startDate, endDate, userId) {
    try {
      const cacheKey = `vehicle_calendar:${vehicleId}:${startDate}:${endDate}`;
      
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const bookings = await db.Booking.findAll({
        where: {
          vehicleId,
          startTime: { [db.Sequelize.Op.between]: [start, end] },
          status: { [db.Sequelize.Op.ne]: 'cancelled' }
        },
        attributes: ['id', 'startTime', 'endTime', 'status', 'userId', 'purpose'],
        order: [['startTime', 'ASC']]
      });

      const vehicle = await db.Vehicle.findByPk(vehicleId, {
        attributes: ['id', 'vehicleName', 'licensePlate', 'status']
      });

      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      const calendar = {
        vehicle,
        period: { startDate, endDate },
        bookings: bookings.map(booking => ({
          id: booking.id,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          userId: booking.userId,
          purpose: booking.purpose,
          isCurrentUser: booking.userId === userId
        })),
        availability: this.calculateAvailabilitySlots(bookings, start, end)
      };

      await redisClient.set(cacheKey, JSON.stringify(calendar), this.cacheTTL.CALENDAR);

      return calendar;
    } catch (error) {
      logger.error('Failed to get vehicle calendar', {
        error: error.message,
        vehicleId,
        userId
      });
      throw error;
    }
  }

  async getGroupCalendar(groupId, startDate, endDate, userId) {
    try {
      const cacheKey = `group_calendar:${groupId}:${startDate}:${endDate}`;
      
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Get all vehicles in the group
      const vehicles = await db.Vehicle.findAll({
        where: { groupId },
        attributes: ['id', 'vehicleName', 'licensePlate', 'status']
      });

      // Get bookings for all vehicles in the group
      const bookings = await db.Booking.findAll({
        where: {
          vehicleId: vehicles.map(v => v.id),
          startTime: { [db.Sequelize.Op.between]: [start, end] },
          status: { [db.Sequelize.Op.ne]: 'cancelled' }
        },
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['id', 'vehicleName', 'licensePlate']
        }],
        order: [['startTime', 'ASC']]
      });

      const calendar = {
        groupId,
        period: { startDate, endDate },
        vehicles: vehicles.map(vehicle => ({
          ...vehicle.toJSON(),
          availability: this.calculateVehicleAvailability(vehicle.id, bookings, start, end)
        })),
        bookings: bookings.map(booking => ({
          id: booking.id,
          vehicleId: booking.vehicleId,
          vehicleName: booking.vehicle.vehicleName,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          userId: booking.userId,
          purpose: booking.purpose,
          isCurrentUser: booking.userId === userId
        }))
      };

      await redisClient.set(cacheKey, JSON.stringify(calendar), this.cacheTTL.CALENDAR);

      return calendar;
    } catch (error) {
      logger.error('Failed to get group calendar', {
        error: error.message,
        groupId,
        userId
      });
      throw error;
    }
  }

  async checkAvailability(vehicleId, startTime, endTime, userId) {
    try {
      const cacheKey = `availability:${vehicleId}:${startTime}:${endTime}`;
      
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const start = new Date(startTime);
      const end = new Date(endTime);

      // Check vehicle status
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle || vehicle.status !== 'available') {
        const result = { available: false, reason: 'Vehicle not available' };
        await redisClient.set(cacheKey, JSON.stringify(result), this.cacheTTL.AVAILABILITY);
        return result;
      }

      // Check for overlapping bookings
      const overlappingBooking = await db.Booking.findOne({
        where: {
          vehicleId,
          status: ['pending', 'confirmed', 'in_progress'],
          [db.Sequelize.Op.or]: [
            {
              startTime: { [db.Sequelize.Op.between]: [start, end] }
            },
            {
              endTime: { [db.Sequelize.Op.between]: [start, end] }
            },
            {
              [db.Sequelize.Op.and]: [
                { startTime: { [db.Sequelize.Op.lte]: start } },
                { endTime: { [db.Sequelize.Op.gte]: end } }
              ]
            }
          ]
        }
      });

      const available = !overlappingBooking;
      const result = {
        available,
        reason: available ? 'Available' : `Conflicts with booking ${overlappingBooking?.id}`,
        conflictingBooking: available ? null : {
          id: overlappingBooking.id,
          startTime: overlappingBooking.startTime,
          endTime: overlappingBooking.endTime,
          status: overlappingBooking.status
        }
      };

      await redisClient.set(cacheKey, JSON.stringify(result), this.cacheTTL.AVAILABILITY);

      return result;
    } catch (error) {
      logger.error('Failed to check availability', {
        error: error.message,
        vehicleId,
        userId
      });
      throw error;
    }
  }

  async getAvailableVehicles(startTime, endTime, groupId = null, userId) {
    try {
      const cacheKey = `available_vehicles:${startTime}:${endTime}:${groupId || 'all'}`;
      
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const start = new Date(startTime);
      const end = new Date(endTime);

      const where = { status: 'available' };
      if (groupId) {
        where.groupId = groupId;
      }

      const vehicles = await db.Vehicle.findAll({ where });

      const availableVehicles = await Promise.all(
        vehicles.map(async vehicle => {
          const availability = await this.checkAvailability(vehicle.id, startTime, endTime, userId);
          return {
            ...vehicle.toJSON(),
            available: availability.available,
            availabilityDetails: availability
          };
        })
      );

      const result = {
        period: { startTime, endTime },
        groupId,
        availableVehicles: availableVehicles.filter(v => v.available),
        unavailableVehicles: availableVehicles.filter(v => !v.available),
        totalAvailable: availableVehicles.filter(v => v.available).length,
        totalUnavailable: availableVehicles.filter(v => !v.available).length
      };

      await redisClient.set(cacheKey, JSON.stringify(result), this.cacheTTL.VEHICLES);

      return result;
    } catch (error) {
      logger.error('Failed to get available vehicles', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  async getPersonalCalendar(userId, startDate, endDate) {
    try {
      const cacheKey = `personal_calendar:${userId}:${startDate}:${endDate}`;
      
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const bookings = await db.Booking.findAll({
        where: {
          userId,
          startTime: { [db.Sequelize.Op.between]: [start, end] }
        },
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['id', 'vehicleName', 'licensePlate', 'brand', 'model']
        }],
        order: [['startTime', 'ASC']]
      });

      const personalCalendar = {
        userId,
        period: { startDate, endDate },
        bookings: bookings.map(booking => ({
          id: booking.id,
          vehicle: booking.vehicle,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          purpose: booking.purpose,
          priorityScore: booking.priorityScore
        })),
        stats: {
          totalBookings: bookings.length,
          confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
          pendingBookings: bookings.filter(b => b.status === 'pending').length,
          completedBookings: bookings.filter(b => b.status === 'completed').length
        }
      };

      await redisClient.set(cacheKey, JSON.stringify(personalCalendar), this.cacheTTL.CALENDAR);

      return personalCalendar;
    } catch (error) {
      logger.error('Failed to get personal calendar', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  async subscribeToCalendarUpdates(userId, groupId) {
    // This would typically setup WebSocket connection
    // For now, return subscription info
    return {
      subscribed: true,
      userId,
      groupId,
      subscriptionId: `calendar_sub_${userId}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }

  // Helper methods
  calculateAvailabilitySlots(bookings, startDate, endDate) {
    const slots = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const dayBookings = bookings.filter(booking => 
        booking.startTime.toISOString().split('T')[0] === dateStr
      );

      slots.push({
        date: dateStr,
        available: this.isDateAvailable(dayBookings),
        bookedSlots: dayBookings.map(booking => ({
          start: booking.startTime,
          end: booking.endTime,
          status: booking.status
        }))
      });

      current.setDate(current.getDate() + 1);
    }

    return slots;
  }

  isDateAvailable(dayBookings) {
    // A date is considered available if there are gaps between bookings
    if (dayBookings.length === 0) return true;

    const sortedBookings = dayBookings.sort((a, b) => a.startTime - b.startTime);
    
    // Check if there's any gap between bookings
    for (let i = 0; i < sortedBookings.length - 1; i++) {
      const currentEnd = sortedBookings[i].endTime;
      const nextStart = sortedBookings[i + 1].startTime;
      
      if (nextStart - currentEnd > 0) {
        return true; // There's a gap, so date is available
      }
    }

    return false;
  }

  calculateVehicleAvailability(vehicleId, bookings, startDate, endDate) {
    const vehicleBookings = bookings.filter(b => b.vehicleId === vehicleId);
    return this.calculateAvailabilitySlots(vehicleBookings, startDate, endDate);
  }

  async clearCalendarCache(vehicleId = null, groupId = null) {
    try {
      const patterns = [
        vehicleId ? `vehicle_calendar:${vehicleId}:*` : 'vehicle_calendar:*',
        groupId ? `group_calendar:${groupId}:*` : 'group_calendar:*',
        'available_vehicles:*',
        'availability:*'
      ];

      for (const pattern of patterns) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await Promise.all(keys.map(key => redisClient.del(key)));
        }
      }

      logger.info('Calendar cache cleared', { vehicleId, groupId });
    } catch (error) {
      logger.error('Failed to clear calendar cache', { error: error.message });
    }
  }
}

export default new CalendarService();