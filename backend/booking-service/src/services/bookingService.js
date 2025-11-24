// booking-service/src/services/bookingService.js
import { logger, AppError, userServiceClient, redisClient } from '@ev-coownership/shared';
import db from '../models/index.js';
import priorityService from './priorityService.js';
import conflictService from './conflictService.js';
import validationService from './validationService.js';
import eventService from './eventService.js';
import calendarService from './calendarService.js';

const { Op } = db.Sequelize;

export class BookingService {
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

  async createBooking(bookingData, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      logger.info('Creating new booking', { userId, bookingData });

      // 1. Validate input data
      await validationService.validateBookingData(bookingData);

      // 2. Check user permissions and group membership
      await this.verifyUserPermissions(userId, bookingData.groupId);

      // 3. Check vehicle availability
      await validationService.validateVehicleAvailability(
        bookingData.vehicleId,
        bookingData.startTime,
        bookingData.endTime
      );

      // 4. Check user booking limits
      await validationService.validateUserBookingLimits(userId, bookingData);

      // 5. Calculate priority score
      const priorityScore = await priorityService.calculatePriorityScore(
        userId,
        bookingData.groupId,
        bookingData
      );

      // 6. Estimate cost (if not provided) and Create booking
      // Pricing can be configured via env vars: BOOKING_COST_PER_HOUR (VND), BOOKING_COST_PER_KM (VND)
      const perHour = parseFloat(process.env.BOOKING_COST_PER_HOUR) || 20000; // VND/hour default
      const perKm = parseFloat(process.env.BOOKING_COST_PER_KM) || 2500; // VND/km default

      let estimatedCost = 0;
      try {
        const start = new Date(bookingData.startTime);
        const end = new Date(bookingData.endTime);
        const durationHours = Math.max((end - start) / (1000 * 60 * 60), 0);

        if (bookingData.estimatedDistance && !isNaN(parseFloat(bookingData.estimatedDistance))) {
          estimatedCost = Math.round(parseFloat(bookingData.estimatedDistance) * perKm);
        } else {
          // Fallback to hourly rate if distance not provided
          estimatedCost = Math.round(durationHours * perHour);
        }
      } catch (e) {
        logger.warn('Failed to estimate booking cost, defaulting to 0', { error: e.message });
        estimatedCost = 0;
      }

      const booking = await db.Booking.create({
        ...bookingData,
        userId,
        cost: estimatedCost,
        priorityScore,
        status: priorityScore >= 80 ? 'confirmed' : 'pending'
      }, { transaction });

      // 7. Auto-confirm if high priority
      if (priorityScore >= 80) {
        await booking.update({ 
          status: 'confirmed',
          autoConfirmed: true 
        }, { transaction });
        await eventService.publishBookingConfirmed(booking);
        
        // 🔌 NEW: Real-time notification
        socketService.publishBookingCreated(booking);
      }

      await transaction.commit();

      // Post-commit operations (don't rollback if these fail)
      try {
        // 8. Check for conflicts (moved outside transaction to prevent FK errors)
        await conflictService.detectAndHandleConflicts(booking);

        // 9. Clear relevant caches
        await calendarService.clearCalendarCache(bookingData.vehicleId, bookingData.groupId);

        // 10. Publish events
        await eventService.publishBookingCreated(booking);
        
        // 🔌 NEW: Real-time notification for all cases
        if (booking.status !== 'confirmed') {
          socketService.publishBookingCreated(booking);
        }

        // 🔌 NEW: Trigger calendar update
        await calendarService.triggerCalendarUpdate(
          bookingData.vehicleId,
          bookingData.groupId,
          'booking_created',
          { bookingId: booking.id }
        );
      } catch (postCommitError) {
        // Log but don't fail the request - booking was created successfully
        logger.error('Post-commit operations failed', { 
          error: postCommitError.message,
          bookingId: booking.id
        });
      }

      logger.info('Booking created successfully', { 
        bookingId: booking.id, 
        userId,
        status: booking.status
      });

      return await this.getBookingById(booking.id, userId);
    } catch (error) {
      // Only rollback if transaction is still pending
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Failed to create booking', { 
        error: error.message, 
        userId,
        bookingData 
      });
      throw error;
    }
  }


  async getBookingById(bookingId, userId) {
    try {
      const booking = await db.Booking.findByPk(bookingId, {
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate', 'brand', 'model', 'status']
          },
          {
            model: db.CheckInOutLog,
            as: 'checkLogs',
            attributes: ['id', 'actionType', 'performedAt', 'odometerReading', 'fuelLevel'],
            order: [['performedAt', 'ASC']]
          }
        ]
      });

      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Check if user has permission to view this booking
      await this.verifyBookingAccess(booking, userId);

      return booking;
    } catch (error) {
      logger.error('Failed to get booking', { 
        error: error.message, 
        bookingId,
        userId 
      });
      throw error;
    }
  }

  async getUserBookings(userId, filters = {}) {
    try {
      const {
        status,
        vehicleId,
        groupId,
        page = 1,
        limit = 10,
        sort = 'startTime',
        order = 'DESC'
      } = filters;

      const where = { userId };
      
      if (status) where.status = status;
      if (vehicleId) where.vehicleId = vehicleId;
      if (groupId) where.groupId = groupId;

      const offset = (page - 1) * limit;

      const { count, rows: bookings } = await db.Booking.findAndCountAll({
        where,
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate', 'brand', 'model']
          }
        ],
        order: [[sort, order]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get user bookings', { 
        error: error.message, 
        userId 
      });
      throw error;
    }
  }

  async updateBooking(bookingId, updateData, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const booking = await this.getBookingById(bookingId, userId);

      // Store old data for real-time comparison
      const oldBookingData = { ...booking.toJSON() };

      // Check if booking can be modified
      if (!['pending', 'confirmed'].includes(booking.status)) {
        throw new AppError('Booking cannot be modified in its current state', 400, 'BOOKING_NOT_MODIFIABLE');
      }

      // Validate update data
      await validationService.validateBookingUpdate(updateData, booking);

      // If time is being changed, check availability
      if (updateData.startTime || updateData.endTime) {
        const newStartTime = updateData.startTime || booking.startTime;
        const newEndTime = updateData.endTime || booking.endTime;
        
        await validationService.validateVehicleAvailability(
          booking.vehicleId,
          newStartTime,
          newEndTime,
          bookingId
        );
      }

      // Update booking
      const updatedBooking = await booking.update(updateData, { transaction });

      // Re-check for conflicts if time changed
      if (updateData.startTime || updateData.endTime) {
        await conflictService.detectAndHandleConflicts(updatedBooking);
      }

      await transaction.commit();

      // Post-commit operations (don't rollback if these fail)
      try {
        // Clear caches
        await calendarService.clearCalendarCache(booking.vehicleId, booking.groupId);

        // Publish events
        await eventService.publishBookingUpdated(updatedBooking);
        
        // 🔌 NEW: Real-time notification
        socketService.publishBookingUpdated(updatedBooking, oldBookingData);

        // 🔌 NEW: Trigger calendar update
        await calendarService.triggerCalendarUpdate(
          booking.vehicleId,
          booking.groupId,
          'booking_updated',
          { 
            bookingId: booking.id,
            changes: socketService.getChangedFields(oldBookingData, updatedBooking.toJSON())
          }
        );
      } catch (postCommitError) {
        logger.error('Post-commit operations failed for booking update', { 
          error: postCommitError.message,
          bookingId
        });
      }

      logger.info('Booking updated successfully', { 
        bookingId, 
        userId 
      });

      return await this.getBookingById(bookingId, userId);
    } catch (error) {
      // Only rollback if transaction is still pending
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Failed to update booking', { 
        error: error.message, 
        bookingId,
        userId 
      });
      throw error;
    }
  }

  async cancelBooking(bookingId, userId, reason) {
    const transaction = await db.sequelize.transaction();

    try {
      const booking = await this.getBookingById(bookingId, userId);

      // Store old data
      const oldBookingData = { ...booking.toJSON() };

      // Check if booking can be cancelled
      if (!['pending', 'confirmed'].includes(booking.status)) {
        throw new AppError('Booking cannot be cancelled in its current state', 400, 'BOOKING_NOT_CANCELLABLE');
      }

      // Update booking status
      await booking.update({
        status: 'cancelled',
        cancellationReason: reason
      }, { transaction });

      // Resolve any conflicts related to this booking
      await db.BookingConflict.update(
        {
          resolved: true,
          resolvedBy: userId,
          resolutionNote: `Booking cancelled: ${reason}`,
          resolvedAt: new Date()
        },
        {
          where: {
            [Op.or]: [
              { bookingId_1: bookingId },
              { bookingId_2: bookingId }
            ],
            resolved: false
          },
          transaction
        }
      );

      await transaction.commit();

      // Post-commit operations (don't rollback if these fail)
      try {
        // Clear caches
        await calendarService.clearCalendarCache(booking.vehicleId, booking.groupId);

        // Publish events
        await eventService.publishBookingCancelled(booking);
        
        // 🔌 NEW: Real-time notification
        socketService.publishBookingCancelled(booking);

        // 🔌 NEW: Trigger calendar update
        await calendarService.triggerCalendarUpdate(
          booking.vehicleId,
          booking.groupId,
          'booking_cancelled',
          { bookingId: booking.id, reason }
        );
      } catch (postCommitError) {
        logger.error('Post-commit operations failed for booking cancellation', { 
          error: postCommitError.message,
          bookingId
        });
      }

      logger.info('Booking cancelled successfully', { 
        bookingId, 
        userId,
        reason 
      });

      return await this.getBookingById(bookingId, userId);
    } catch (error) {
      // Only rollback if transaction is still pending
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Failed to cancel booking', { 
        error: error.message, 
        bookingId,
        userId 
      });
      throw error;
    }
  }

  async getBookingHistory(userId, period = '30d', page = 1, limit = 20) {
    try {
      const dateRange = this.calculateDateRange(period);
      
      const { count, rows: bookings } = await db.Booking.findAndCountAll({
        where: {
          userId,
          // Include all bookings, not just completed/cancelled
          createdAt: {
            [Op.between]: [dateRange.start, dateRange.end]
          }
        },
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate', 'brand', 'model'],
            required: false  // LEFT JOIN instead of INNER JOIN
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (page - 1) * limit
      });

      logger.info('Booking history fetched', { 
        userId, 
        period, 
        count, 
        bookingsReturned: bookings.length 
      });

      return {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        },
        period
      };
    } catch (error) {
      logger.error('Failed to get booking history', { 
        error: error.message,
        stack: error.stack,
        userId 
      });
      throw error;
    }
  }

  async getBookingStats(userId, groupId = null) {
    try {
      const cacheKey = `booking_stats:${userId}:${groupId || 'all'}`;
      
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const where = { userId };
      if (groupId) {
        where.groupId = groupId;
      }

      const stats = await db.Booking.findAll({
        where,
        attributes: [
          'status',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count'],
          [db.Sequelize.fn('SUM', db.Sequelize.literal(
            "CASE WHEN status = 'completed' THEN EXTRACT(EPOCH FROM (end_time - start_time))/3600 ELSE 0 END"
          )), 'totalHours']
        ],
        group: ['status'],
        raw: true
      });

      const totalBookings = await db.Booking.count({ where });
      const upcomingBookings = await db.Booking.count({
        where: {
          ...where,
          status: ['pending', 'confirmed'],
          startTime: { [Op.gt]: new Date() }
        }
      });

      // Calculate weekly usage (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyUsageResult = await db.Booking.findOne({
        where: {
          userId,
          status: 'completed',
          endTime: { [Op.gte]: oneWeekAgo }
        },
        attributes: [
          [db.Sequelize.fn('SUM', db.Sequelize.literal(
            "EXTRACT(EPOCH FROM (end_time - start_time))/3600"
          )), 'weeklyHours']
        ],
        raw: true
      });

      const weeklyUsage = weeklyUsageResult?.weeklyHours 
        ? Math.round(parseFloat(weeklyUsageResult.weeklyHours) * 100) / 100 
        : 0;

      // Get group members count if groupId provided
      let groupMembers = 0;
      if (groupId) {
        try {
          // Query group-service via shared utils or direct DB if available
          // For now, set a placeholder - this should be fetched from group-service
          groupMembers = await this.getGroupMemberCount(groupId);
        } catch (err) {
          logger.warn('Failed to fetch group member count', { groupId, error: err.message });
        }
      }

      const completedBookings = stats.find(s => s.status === 'completed');
      const totalHours = completedBookings ? parseFloat(completedBookings.totalHours || 0) : 0;

      // Calculate total cost from completed bookings
      const totalCostResult = await db.Booking.findOne({
        where: {
          userId,
          status: 'completed'
        },
          attributes: [
            [db.Sequelize.fn('SUM', db.Sequelize.col('cost')), 'totalCost']
          ],
        raw: true
      });

      const totalCost = totalCostResult?.totalCost 
        ? Math.round(parseFloat(totalCostResult.totalCost)) 
        : 0;

      const result = {
        userId,
        groupId,
        totalBookings,
        upcomingBookings,
        totalHours: Math.round(totalHours * 100) / 100,
        totalCost, // Added totalCost
        weeklyUsage,
        groupMembers,
        byStatus: stats.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {})
      };

      // Cache for 5 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), 300);

      return result;
    } catch (error) {
      logger.error('Failed to get booking stats', { 
        error: error.message, 
        userId 
      });
      throw error;
    }
  }

  // Helper method to get group member count
  async getGroupMemberCount(groupId) {
    try {
      // Call user-service to get group member count
      const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
      const response = await fetch(`${USER_SERVICE_URL}/groups/${groupId}/count`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch group member count: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data?.count || 0;
    } catch (error) {
      logger.warn('Failed to fetch group member count from user-service', { 
        groupId, 
        error: error.message 
      });
      // Return default value on error
      return 0;
    }
  }

  async getBookingAnalytics(userId, period = '30d', groupId = null) {
    try {
      const cacheKey = `booking_analytics:${userId}:${period}:${groupId || 'all'}`;
      
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '365d':
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      const where = {
        userId,
        status: 'completed',
        startTime: { [Op.between]: [startDate, endDate] }
      };

      if (groupId) {
        where.groupId = groupId;
      }

      // Fetch all completed bookings for analytics
      const bookings = await db.Booking.findAll({
        where,
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['id', 'vehicleName', 'licensePlate', 'brand', 'model']
        }],
        order: [['startTime', 'ASC']]
      });

      // Process analytics data
      const analytics = {
        usageByDay: this.calculateUsageByDay(bookings),
        usageByCar: this.calculateUsageByCar(bookings),
        peakHours: this.calculatePeakHours(bookings),
        monthlyTrend: this.calculateMonthlyTrend(bookings),
        usageStats: this.calculateUsageStats(bookings)
      };

        // Enrich analytics with vehicle efficiency by calling vehicle-service
        try {
          const vehicleIds = Array.from(new Set(bookings.map(b => b.vehicleId).filter(Boolean)));
          if (vehicleIds.length > 0) {
            const VEHICLE_SERVICE = process.env.VEHICLE_SERVICE_URL || 'http://localhost:3005';
            const token = process.env.INTERNAL_SERVICE_TOKEN;

            // Prefer bulk endpoint to fetch efficiencies for all vehicleIds in one request
            let effMap = {};
            try {
              const res = await fetch(`${VEHICLE_SERVICE}/api/v1/vehicles/stats/bulk`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ids: vehicleIds })
              });

              if (res.ok) {
                const json = await res.json();
                // Expecting json.data to be a map { vehicleId: stats }
                const map = json.data || {};
                effMap = Object.keys(map).reduce((m, vid) => {
                  const st = map[vid];
                  const efficiency = st?.efficiency || st?.batteryHealth?.efficiency?.avgEfficiency || null;
                  m[vid] = efficiency;
                  return m;
                }, {});
              }
            } catch (err) {
              logger.warn('Bulk vehicle stats fetch failed, falling back to per-vehicle fetch', { error: err.message, userId });
              effMap = {};
            }

            // Attach per-car efficiency and compute weighted average
            let weightedSum = 0;
            let totalHours = 0;
            analytics.usageByCar = analytics.usageByCar.map((entry) => {
              const vEff = effMap[entry.vehicleId] || null;
              if (vEff && entry.hours) {
                weightedSum += (entry.hours || 0) * vEff;
                totalHours += entry.hours || 0;
              }
              return {
                ...entry,
                efficiency: vEff
              };
            });

            analytics.usageStats.efficiency = totalHours > 0 && weightedSum > 0 ? Math.round((weightedSum / totalHours) * 100) / 100 : null;
          }
        } catch (err) {
          logger.warn('Failed to enrich analytics with vehicle efficiency', { error: err.message, userId });
        }

      // Cache for 10 minutes
      await redisClient.set(cacheKey, JSON.stringify(analytics), 600);

      return analytics;
    } catch (error) {
      logger.error('Failed to get booking analytics', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  calculateUsageByDay(bookings) {
    const dayMap = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const usageByDay = {};
    dayMap.forEach(day => usageByDay[day] = 0);

    bookings.forEach(booking => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      const duration = booking.duration || ((endTime - startTime) / (1000 * 60 * 60));
      const dayName = dayMap[startTime.getDay()];
      usageByDay[dayName] += duration;
    });

    const maxHours = Math.max(...Object.values(usageByDay), 1);
    return Object.entries(usageByDay).map(([day, hours]) => ({
      day,
      hours: Math.round(hours * 10) / 10,
      percentage: Math.round((hours / maxHours) * 100)
    }));
  }

  calculateUsageByCar(bookings) {
    const usageByCar = {};
    
    bookings.forEach(booking => {
      const carName = booking.vehicle?.vehicleName || 'Unknown';
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      const duration = booking.duration || ((endTime - startTime) / (1000 * 60 * 60));

      if (!usageByCar[carName]) {
        usageByCar[carName] = { hours: 0, vehicleId: booking.vehicleId };
      }
      usageByCar[carName].hours += duration;
    });

    const totalHours = Object.values(usageByCar).reduce((sum, v) => sum + v.hours, 0);
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

    return Object.entries(usageByCar).map(([car, data], idx) => ({
      car,
      vehicleId: data.vehicleId,
      hours: Math.round(data.hours * 10) / 10,
      percentage: totalHours > 0 ? Math.round((data.hours / totalHours) * 100) : 0,
      color: colors[idx % colors.length]
    }));
  }

  calculatePeakHours(bookings) {
    const peakHours = {};
    for (let i = 0; i < 24; i += 2) {
      peakHours[`${i}-${i + 2}`] = 0;
    }

    bookings.forEach(booking => {
      const startTime = new Date(booking.startTime);
      const hour = startTime.getHours();
      const hourRange = `${Math.floor(hour / 2) * 2}-${Math.floor(hour / 2) * 2 + 2}`;
      if (peakHours[hourRange] !== undefined) {
        peakHours[hourRange]++;
      }
    });

    const maxUsage = Math.max(...Object.values(peakHours), 1);
    const colors = [
      'from-blue-100 to-blue-200', 'from-blue-200 to-blue-300',
      'from-blue-300 to-blue-400', 'from-blue-400 to-blue-500',
      'from-blue-500 to-blue-600', 'from-blue-600 to-blue-700',
      'from-blue-700 to-blue-800', 'from-blue-800 to-blue-900',
      'from-blue-900 to-blue-950', 'from-indigo-500 to-indigo-600',
      'from-indigo-600 to-indigo-700', 'from-indigo-700 to-indigo-800'
    ];

    return Object.entries(peakHours).map(([hour, usage], idx) => ({
      hour,
      usage: Math.round((usage / maxUsage) * 100),
      count: usage,
      color: colors[idx % colors.length]
    }));
  }

  calculateMonthlyTrend(bookings) {
    const monthlyTrend = {};

    bookings.forEach(booking => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      const duration = booking.duration || ((endTime - startTime) / (1000 * 60 * 60));
      const monthKey = `T${startTime.getMonth() + 1}`;

      if (!monthlyTrend[monthKey]) {
        monthlyTrend[monthKey] = { hours: 0, cost: 0 };
      }
      monthlyTrend[monthKey].hours += duration;
  monthlyTrend[monthKey].cost += booking.cost || 0;
    });

    return Object.entries(monthlyTrend).map(([month, data]) => ({
      month,
      hours: Math.round(data.hours * 10) / 10,
      cost: Math.round(data.cost)
    }));
  }

  calculateUsageStats(bookings) {
    const totalHours = bookings.reduce((sum, booking) => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      const duration = booking.duration || ((endTime - startTime) / (1000 * 60 * 60));
      return sum + duration;
    }, 0);

  const totalCost = bookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);
    
    const uniqueMonths = new Set(
      bookings.map(b => new Date(b.startTime).getMonth())
    ).size || 1;

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      averagePerMonth: Math.round((totalHours / uniqueMonths) * 10) / 10,
      costPerHour: totalHours > 0 ? Math.round(totalCost / totalHours) : 0,
      totalCost: Math.round(totalCost),
      totalBookings: bookings.length,
      efficiency: 'N/A' // Placeholder for vehicle efficiency data
    };
  }

  async getUpcomingBookings(userId, limit = 5) {
    try {
      const now = new Date();

      const bookings = await db.Booking.findAll({
        where: {
          userId,
          status: ['pending', 'confirmed'],
          startTime: { [Op.gt]: now }
        },
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['id', 'vehicleName', 'licensePlate', 'brand', 'model']
        }],
        order: [['startTime', 'ASC']],
        limit: parseInt(limit)
      });

      return bookings;
    } catch (error) {
      logger.error('Failed to get upcoming bookings', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  async checkBookingEligibility(userId, vehicleId, startTime, endTime) {
    try {
      const eligibility = {
        eligible: true,
        reasons: [],
        warnings: []
      };

      // Check vehicle availability
      const availability = await calendarService.checkAvailability(vehicleId, startTime, endTime, userId);
      if (!availability.available) {
        eligibility.eligible = false;
        eligibility.reasons.push(availability.reason);
      }

      // Check user booking limits
      try {
        await validationService.validateUserBookingLimits(userId, { startTime, endTime });
      } catch (error) {
        eligibility.eligible = false;
        eligibility.reasons.push(error.message);
      }

      // Check advance booking limit
      const now = new Date();
      const start = new Date(startTime);
      const maxAdvanceDate = new Date(now.getTime() + this.bookingRules.MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);
      
      if (start > maxAdvanceDate) {
        eligibility.eligible = false;
        eligibility.reasons.push(`Cannot book more than ${this.bookingRules.MAX_ADVANCE_DAYS} days in advance`);
      }

      // Check same-day booking cutoff
      if (this.isSameDay(start, now)) {
        const cutoffTime = new Date(now.getTime() + this.bookingRules.SAME_DAY_CUTOFF_HOURS * 60 * 60 * 1000);
        if (start < cutoffTime) {
          eligibility.eligible = false;
          eligibility.reasons.push(`Same-day bookings must be at least ${this.bookingRules.SAME_DAY_CUTOFF_HOURS} hours in advance`);
        }
      }

      // Add warnings for non-blocking issues
      const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
      if (duration > 8) {
        eligibility.warnings.push('Long booking duration may affect vehicle availability for other users');
      }

      return eligibility;
    } catch (error) {
      logger.error('Failed to check booking eligibility', {
        error: error.message,
        userId,
        vehicleId
      });
      throw error;
    }
  }

  async extendBooking(bookingId, newEndTime, userId, reason) {
    const transaction = await db.sequelize.transaction();

    try {
      const booking = await this.getBookingById(bookingId, userId);

      // Check if booking can be extended
      if (booking.status !== 'in_progress') {
        throw new AppError('Only in-progress bookings can be extended', 400, 'INVALID_BOOKING_STATUS');
      }

      const currentEndTime = new Date(booking.endTime);
      const requestedEndTime = new Date(newEndTime);

      if (requestedEndTime <= currentEndTime) {
        throw new AppError('New end time must be after current end time', 400, 'INVALID_EXTENSION_TIME');
      }

      // Check maximum extension (e.g., 2 hours)
      const maxExtension = 2 * 60 * 60 * 1000; // 2 hours
      if (requestedEndTime - currentEndTime > maxExtension) {
        throw new AppError(`Maximum extension is ${maxExtension / (60 * 60 * 1000)} hours`, 400, 'MAX_EXTENSION_EXCEEDED');
      }

      // Check vehicle availability for extension period
      const availability = await calendarService.checkAvailability(
        booking.vehicleId,
        currentEndTime,
        requestedEndTime,
        userId
      );

      if (!availability.available) {
        throw new AppError('Vehicle is not available for the extended period', 409, 'EXTENSION_NOT_AVAILABLE');
      }

      // Update booking
      const updatedBooking = await booking.update({
        endTime: requestedEndTime,
        notes: booking.notes ? `${booking.notes}\nExtended: ${reason}` : `Extended: ${reason}`
      }, { transaction });

      await transaction.commit();

      // Post-commit operations (don't rollback if these fail)
      try {
        // Clear caches
        await calendarService.clearCalendarCache(booking.vehicleId, booking.groupId);

        await eventService.publishBookingUpdated(updatedBooking);
      } catch (postCommitError) {
        logger.error('Post-commit operations failed for booking extension', { 
          error: postCommitError.message,
          bookingId
        });
      }

      logger.info('Booking extended successfully', {
        bookingId,
        userId,
        originalEndTime: currentEndTime,
        newEndTime: requestedEndTime,
        reason
      });

      return await this.getBookingById(bookingId, userId);
    } catch (error) {
      // Only rollback if transaction is still pending
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Failed to extend booking', {
        error: error.message,
        bookingId,
        userId
      });
      throw error;
    }
  }

  // ========== PRIVATE METHODS ==========

  async verifyUserPermissions(userId, groupId) {
    try {
      // Call User Service to fetch group members and verify membership
      // Use internal service token for authenticated internal calls
      // Use the internal route which accepts INTERNAL_SERVICE_TOKEN for membership check
      const response = await userServiceClient.get(
        `/api/v1/internal/groups/${groupId}/members/${userId}`,
        { headers: { Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN || ''}` } }
      );

      // HttpClient returns the parsed body; internal route returns { success: true, data: { isMember: true } }
      const isMember = response?.data?.isMember;
      if (!isMember) {
        throw new AppError('User is not a member of this group', 403, 'PERMISSION_DENIED');
      }

      return { isMember: true };
    } catch (error) {
      logger.error('Failed to verify user permissions', { 
        error: error.message, 
        userId,
        groupId 
      });
      
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Failed to verify user permissions', 500, 'PERMISSION_VERIFICATION_FAILED');
    }
  }

  async verifyBookingAccess(booking, userId) {
    // User can access their own bookings
    if (booking.userId === userId) {
      return true;
    }

    // Check if user is group admin or has permission to view all group bookings
    try {
      const response = await userServiceClient.get(
        `${process.env.USER_SERVICE_URL}/groups/${booking.groupId}/members/${userId}/permissions`
      );

      if (response.data.canViewAllBookings) {
        return true;
      }
    } catch (error) {
      logger.error('Failed to verify booking access permissions', { 
        error: error.message, 
        userId,
        groupId: booking.groupId 
      });
    }

    throw new AppError('You do not have permission to view this booking', 403, 'PERMISSION_DENIED');
  }

  calculateDateRange(period) {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }

    return { start, end };
  }

  isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  async autoProcessPendingBookings() {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Find pending bookings that start within the next hour
      const pendingBookings = await db.Booking.findAll({
        where: {
          status: 'pending',
          startTime: {
            [Op.between]: [now, oneHourFromNow]
          }
        },
        order: [['priorityScore', 'DESC'], ['createdAt', 'ASC']]
      });

      let processedCount = 0;

      for (const booking of pendingBookings) {
        try {
          // Check if vehicle is still available
          const availability = await calendarService.checkAvailability(
            booking.vehicleId,
            booking.startTime,
            booking.endTime,
            booking.userId
          );

          if (availability.available) {
            // Auto-confirm the booking
            await booking.update({ status: 'confirmed', autoConfirmed: true });
            await eventService.publishBookingConfirmed(booking);
            processedCount++;

            logger.info('Pending booking auto-confirmed', {
              bookingId: booking.id,
              priorityScore: booking.priorityScore
            });
          } else {
            // Mark as conflict if not available
            await booking.update({ status: 'conflict' });
            await conflictService.detectAndHandleConflicts(booking);
            
            logger.warn('Pending booking marked as conflict due to unavailability', {
              bookingId: booking.id
            });
          }
        } catch (error) {
          logger.error('Failed to auto-process pending booking', {
            error: error.message,
            bookingId: booking.id
          });
        }
      }

      logger.info('Auto-processed pending bookings', {
        total: pendingBookings.length,
        processed: processedCount,
        failed: pendingBookings.length - processedCount
      });

      return { processed: processedCount, total: pendingBookings.length };
    } catch (error) {
      logger.error('Failed to auto-process pending bookings', {
        error: error.message
      });
      throw error;
    }
  }

  async getVehicleRevenue(vehicleId, userId) {
    try {
      const cacheKey = `vehicle_revenue:${vehicleId}`;
      
      // Check cache first
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Query total revenue for completed bookings
      const result = await db.Booking.findOne({
        where: {
          vehicleId,
          status: 'completed'
        },
        attributes: [
          [db.Sequelize.fn('SUM', db.Sequelize.col('cost')), 'totalRevenue'],
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'totalBookings']
        ],
        raw: true
      });

      const revenue = {
        vehicleId,
        totalRevenue: result?.totalRevenue ? parseFloat(result.totalRevenue) : 0,
        totalBookings: result?.totalBookings ? parseInt(result.totalBookings) : 0,
        currency: 'VND'
      };

      // Cache for 5 minutes
      await redisClient.set(cacheKey, JSON.stringify(revenue), 300);

      logger.info('Vehicle revenue calculated', { vehicleId, revenue: revenue.totalRevenue });

      return revenue;
    } catch (error) {
      logger.error('Failed to get vehicle revenue', { 
        error: error.message,
        vehicleId,
        userId 
      });
      throw error;
    }
  }
}

export default new BookingService();