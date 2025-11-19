// booking-service/src/services/analyticsService.js
import { logger, AppError, redisClient, userServiceClient } from '@ev-coownership/shared';
import db from '../models/index.js';

export class AnalyticsService {
  constructor() {
    this.cacheTTL = {
      ANALYTICS: 15 * 60,  // 15 minutes
      REPORTS: 30 * 60,    // 30 minutes
      STATS: 10 * 60       // 10 minutes
    };
  }

  async getBookingAnalytics(period = '30d', adminUserId) {
    try {
      const cacheKey = `analytics:booking:${period}`;
      
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const dateRange = this.calculateDateRange(period);
      
      const analytics = await Promise.all([
        this.getBookingCounts(dateRange),
        this.getBookingStatusDistribution(dateRange),
        this.getBookingTrends(dateRange),
        this.getVehicleUtilizationStats(dateRange),
        this.getUserParticipationStats(dateRange),
        this.getConflictStats(dateRange)
      ]);

      const result = {
        period,
        dateRange,
        overview: analytics[0],
        statusDistribution: analytics[1],
        trends: analytics[2],
        vehicleUtilization: analytics[3],
        userParticipation: analytics[4],
        conflicts: analytics[5],
        generatedAt: new Date().toISOString()
      };

      await redisClient.set(cacheKey, JSON.stringify(result), this.cacheTTL.ANALYTICS);

      logger.debug('Booking analytics generated', { period, adminUserId });

      return result;
    } catch (error) {
      logger.error('Failed to generate booking analytics', {
        error: error.message,
        period,
        adminUserId
      });
      throw error;
    }
  }

  async getVehicleUtilization(period = '30d', vehicleId = null, adminUserId) {
    try {
      const cacheKey = `analytics:vehicle_utilization:${period}:${vehicleId || 'all'}`;
      
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const dateRange = this.calculateDateRange(period);

      const where = {
        status: 'completed',
        startTime: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        },
        // Only include bookings with a recorded end time (completed sessions)
        endTime: { [db.Sequelize.Op.ne]: null }
      };

      if (vehicleId) {
        where.vehicleId = vehicleId;
      }

      let utilizationData;
      try {
        utilizationData = await db.Booking.findAll({
          where,
          attributes: [
            'vehicleId',
            [db.Sequelize.fn('COUNT', db.Sequelize.col('Booking.id')), 'totalBookings'],
            [db.Sequelize.fn('SUM', db.Sequelize.literal(
              'EXTRACT(EPOCH FROM (end_time - start_time)) / 3600'
            )), 'totalHours'],
            [db.Sequelize.fn('AVG', db.Sequelize.literal(
              'EXTRACT(EPOCH FROM (end_time - start_time)) / 3600'
            )), 'avgDuration'],
            [db.Sequelize.fn('MAX', db.Sequelize.literal(
              'EXTRACT(EPOCH FROM (end_time - start_time)) / 3600'
            )), 'maxDuration']
          ],
          group: [
            db.Sequelize.col('Booking.vehicle_id'),
            db.Sequelize.col('vehicle.vehicle_name'),
            db.Sequelize.col('vehicle.license_plate'),
            db.Sequelize.col('vehicle.status'),
            db.Sequelize.col('vehicle.group_id')
          ],
          include: [{
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['vehicleName', 'licensePlate', 'status', 'groupId']
          }],
          raw: true
        });
      } catch (dbErr) {
        // Log minimal DB error details (avoid noisy stack traces in normal logs)
        logger.error('Database query failed in getVehicleUtilization', {
          message: dbErr.message,
          sql: dbErr.sql || (dbErr.parent && dbErr.parent.sql) || null
        });

        // Rethrow a concise AppError; detailed DB metadata is logged above.
        throw new AppError('Failed to execute vehicle utilization query', 500, 'DATABASE_ERROR');
      }

  const totalPeriodHours = (dateRange.end - dateRange.start) / (1000 * 60 * 60);
      
  const utilization = utilizationData.map(item => {
        const totalHours = parseFloat(item.totalHours || 0);
        const utilizationRate = (totalHours / totalPeriodHours) * 100;
        
        return {
          vehicleId: item.vehicleId,
          vehicleName: item['vehicle.vehicleName'],
          licensePlate: item['vehicle.licensePlate'],
          status: item['vehicle.status'],
          groupId: item['vehicle.groupId'],
          totalBookings: parseInt(item.totalBookings),
          totalHours: Math.round(totalHours * 100) / 100,
          avgDuration: Math.round(parseFloat(item.avgDuration || 0) * 100) / 100,
          maxDuration: Math.round(parseFloat(item.maxDuration || 0) * 100) / 100,
          utilizationRate: Math.min(Math.round(utilizationRate * 100) / 100, 100),
          efficiency: this.calculateEfficiencyScore(totalHours, parseInt(item.totalBookings))
        };
      });

      const result = {
        period,
        dateRange,
        totalPeriodHours: Math.round(totalPeriodHours * 100) / 100,
        utilization,
        summary: {
          totalVehicles: utilization.length,
          totalBookings: utilization.reduce((sum, item) => sum + item.totalBookings, 0),
          totalHours: utilization.reduce((sum, item) => sum + item.totalHours, 0),
          avgUtilizationRate: utilization.length > 0 ? 
            utilization.reduce((sum, item) => sum + item.utilizationRate, 0) / utilization.length : 0,
          avgEfficiency: utilization.length > 0 ?
            utilization.reduce((sum, item) => sum + item.efficiency, 0) / utilization.length : 0
        }
      };

      await redisClient.set(cacheKey, JSON.stringify(result), this.cacheTTL.ANALYTICS);

      return result;
    } catch (error) {
      logger.error('Failed to get vehicle utilization analytics', {
        error: error.message,
        period,
        vehicleId,
        adminUserId
      });
      throw error;
    }
  }

  async getGroupTrends(groupId, period = '30d', adminUserId) {
    try {
      const cacheKey = `analytics:group_trends:${groupId}:${period}`;
      
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const dateRange = this.calculateDateRange(period);

      // Get group information from User Service
      let groupInfo = {};
      try {
        const response = await userServiceClient.get(
          `${process.env.USER_SERVICE_URL}/groups/${groupId}`
        );
        groupInfo = response.data;
      } catch (error) {
        logger.warn('Failed to fetch group info from User Service', {
          error: error.message,
          groupId
        });
      }

      const trends = await Promise.all([
        this.getGroupBookingTrends(groupId, dateRange),
        this.getGroupMemberParticipation(groupId, dateRange),
        this.getGroupVehicleUsage(groupId, dateRange),
        this.getGroupConflictStats(groupId, dateRange)
      ]);

      const result = {
        groupId,
        groupInfo,
        period,
        dateRange,
        bookingTrends: trends[0],
        memberParticipation: trends[1],
        vehicleUsage: trends[2],
        conflicts: trends[3],
        summary: await this.generateGroupSummary(groupId, dateRange, trends)
      };

      await redisClient.set(cacheKey, JSON.stringify(result), this.cacheTTL.ANALYTICS);

      return result;
    } catch (error) {
      logger.error('Failed to get group trends', {
        error: error.message,
        groupId,
        period,
        adminUserId
      });
      throw error;
    }
  }

  async generateBookingReport(startDate, endDate, reportType = 'detailed', adminUserId) {
    try {
      const cacheKey = `report:booking:${startDate}:${endDate}:${reportType}`;
      
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const where = {
        createdAt: {
          [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };

      const bookings = await db.Booking.findAll({
        where,
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate', 'brand', 'model', 'groupId']
          },
          {
            model: db.CheckInOutLog,
            as: 'checkLogs',
            attributes: ['id', 'actionType', 'performedAt', 'odometerReading'],
            limit: 2,
            order: [['performedAt', 'ASC']]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      let reportData;
      
      switch (reportType) {
        case 'summary':
          reportData = this.generateSummaryReport(bookings, startDate, endDate);
          break;
        case 'detailed':
          reportData = this.generateDetailedReport(bookings, startDate, endDate);
          break;
        case 'financial':
          reportData = await this.generateFinancialReport(bookings, startDate, endDate);
          break;
        default:
          reportData = this.generateDetailedReport(bookings, startDate, endDate);
      }

      await redisClient.set(cacheKey, JSON.stringify(reportData), this.cacheTTL.REPORTS);

      logger.info('Booking report generated', { 
        adminUserId, 
        reportType,
        period: `${startDate} to ${endDate}`,
        bookingsCount: bookings.length 
      });

      return reportData;
    } catch (error) {
      logger.error('Failed to generate booking report', { 
        error: error.message, 
        adminUserId 
      });
      throw error;
    }
  }

  async getUserBookingStats(userId, groupId = null) {
    try {
      const cacheKey = `stats:user:${userId}:${groupId || 'all'}`;
      
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
          startTime: { [db.Sequelize.Op.gt]: new Date() }
        }
      });

      const completedBookings = stats.find(s => s.status === 'completed');
      const totalHours = completedBookings ? parseFloat(completedBookings.totalHours || 0) : 0;

      // Get user's ownership percentage from User Service
      let ownershipPercentage = 0;
      if (groupId) {
        try {
          const response = await userServiceClient.get(
            `${process.env.USER_SERVICE_URL}/groups/${groupId}/members/${userId}/ownership`
          );
          ownershipPercentage = response.data.ownershipPercentage || 0;
        } catch (error) {
          logger.warn('Failed to fetch ownership percentage', {
            error: error.message,
            userId,
            groupId
          });
        }
      }

      const result = {
        userId,
        groupId,
        totalBookings,
        upcomingBookings,
        totalHours: Math.round(totalHours * 100) / 100,
        ownershipPercentage,
        byStatus: stats.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        utilization: await this.calculateUserUtilization(userId, groupId, totalHours),
        trends: await this.getUserBookingTrends(userId, groupId)
      };

      await redisClient.set(cacheKey, JSON.stringify(result), this.cacheTTL.STATS);

      return result;
    } catch (error) {
      logger.error('Failed to get user booking stats', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  // Private methods
  async getBookingCounts(dateRange) {
    const totalBookings = await db.Booking.count({
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      }
    });

    const completedBookings = await db.Booking.count({
      where: {
        status: 'completed',
        createdAt: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      }
    });

    const cancelledBookings = await db.Booking.count({
      where: {
        status: 'cancelled',
        createdAt: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      }
    });

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0
    };
  }

  async getBookingStatusDistribution(dateRange) {
    const distribution = await db.Booking.findAll({
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      },
        attributes: [
        'status',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('Booking.id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    return distribution.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});
  }

  async getBookingTrends(dateRange) {
    const dailyTrends = await db.Booking.findAll({
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      },
        attributes: [
        [db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')), 'date'],
        [db.Sequelize.fn('COUNT', db.Sequelize.col('Booking.id')), 'count']
      ],
      group: [db.Sequelize.fn('DATE', db.Sequelize.col('createdAt'))],
      order: [[db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    return dailyTrends.map(trend => ({
      date: trend.date,
      count: parseInt(trend.count)
    }));
  }

  async getVehicleUtilizationStats(dateRange) {
    const stats = await db.Booking.findAll({
      where: {
        status: 'completed',
        startTime: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      },
      attributes: [
        'vehicleId',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('Booking.id')), 'bookingCount'],
        [db.Sequelize.fn('SUM', db.Sequelize.literal(
          'EXTRACT(EPOCH FROM (end_time - start_time)) / 3600'
        )), 'totalHours']
      ],
      group: [
        db.Sequelize.col('Booking.vehicle_id'),
        db.Sequelize.col('vehicle.vehicle_name'),
        db.Sequelize.col('vehicle.license_plate'),
        db.Sequelize.col('vehicle.group_id')
      ],
      include: [{
        model: db.Vehicle,
        as: 'vehicle',
        attributes: ['vehicleName', 'licensePlate']
      }],
      raw: true
    });

    return stats.map(stat => ({
      vehicleId: stat.vehicleId,
      vehicleName: stat['vehicle.vehicleName'],
      licensePlate: stat['vehicle.licensePlate'],
      bookingCount: parseInt(stat.bookingCount),
      totalHours: parseFloat(stat.totalHours || 0)
    }));
  }

  async getUserParticipationStats(dateRange) {
    const stats = await db.Booking.findAll({
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      },
      attributes: [
        'userId',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('Booking.id')), 'bookingCount']
      ],
      group: ['userId'],
      order: [[db.Sequelize.literal('bookingCount'), 'DESC']],
      limit: 10,
      raw: true
    });

    return stats.map(stat => ({
      userId: stat.userId,
      bookingCount: parseInt(stat.bookingCount)
    }));
  }

  async getConflictStats(dateRange) {
    const totalConflicts = await db.BookingConflict.count({
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      }
    });

    const resolvedConflicts = await db.BookingConflict.count({
      where: {
        resolved: true,
        createdAt: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      }
    });

    const conflictTypes = await db.BookingConflict.findAll({
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      },
      attributes: [
        'conflictType',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('BookingConflict.id')), 'count']
      ],
      group: ['conflictType'],
      raw: true
    });

    return {
      totalConflicts,
      resolvedConflicts,
      resolutionRate: totalConflicts > 0 ? (resolvedConflicts / totalConflicts) * 100 : 0,
      byType: conflictTypes.reduce((acc, item) => {
        acc[item.conflictType] = parseInt(item.count);
        return acc;
      }, {})
    };
  }

  async getGroupBookingTrends(groupId, dateRange) {
    const trends = await db.Booking.findAll({
      where: {
        groupId,
        createdAt: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      },
      attributes: [
        [db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')), 'date'],
        'status',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('Booking.id')), 'count']
      ],
      group: [
        db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')),
        'status'
      ],
      order: [[db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    return this.formatTrendsData(trends);
  }

  async getGroupMemberParticipation(groupId, dateRange) {
    const participation = await db.Booking.findAll({
      where: {
        groupId,
        createdAt: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      },
      attributes: [
        'userId',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('Booking.id')), 'bookingCount'],
        [db.Sequelize.fn('SUM', db.Sequelize.literal(
          "CASE WHEN status = 'completed' THEN EXTRACT(EPOCH FROM (end_time - start_time))/3600 ELSE 0 END"
        )), 'totalHours']
      ],
      group: ['userId'],
      order: [[db.Sequelize.literal('bookingCount'), 'DESC']],
      raw: true
    });

    return participation.map(member => ({
      userId: member.userId,
      bookingCount: parseInt(member.bookingCount),
      totalHours: parseFloat(member.totalHours || 0)
    }));
  }

  async getGroupVehicleUsage(groupId, dateRange) {
    const vehicles = await db.Vehicle.findAll({
      where: { groupId },
      attributes: ['id', 'vehicleName', 'licensePlate']
    });

    const usage = await Promise.all(
      vehicles.map(async vehicle => {
        const vehicleBookings = await db.Booking.count({
          where: {
            vehicleId: vehicle.id,
            status: 'completed',
            startTime: {
              [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
            }
          }
        });

        return {
          vehicleId: vehicle.id,
          vehicleName: vehicle.vehicleName,
          licensePlate: vehicle.licensePlate,
          bookingCount: vehicleBookings
        };
      })
    );

    return usage.sort((a, b) => b.bookingCount - a.bookingCount);
  }

  async getGroupConflictStats(groupId, dateRange) {
    const vehicles = await db.Vehicle.findAll({
      where: { groupId },
      attributes: ['id']
    });

    const vehicleIds = vehicles.map(v => v.id);

    const conflicts = await db.BookingConflict.count({
      include: [{
        model: db.Booking,
        as: 'booking1',
        where: { vehicleId: { [db.Sequelize.Op.in]: vehicleIds } },
        required: true
      }],
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        }
      }
    });

    return {
      totalConflicts: conflicts,
      resolvedConflicts: await db.BookingConflict.count({
        include: [{
          model: db.Booking,
          as: 'booking1',
          where: { vehicleId: { [db.Sequelize.Op.in]: vehicleIds } },
          required: true
        }],
        where: {
          resolved: true,
          createdAt: {
            [db.Sequelize.Op.between]: [dateRange.start, dateRange.end]
          }
        }
      })
    };
  }

  async generateGroupSummary(groupId, dateRange, trends) {
    const totalBookings = trends[0].reduce((sum, day) => {
      return sum + Object.values(day).reduce((daySum, count) => daySum + (typeof count === 'number' ? count : 0), 0);
    }, 0) - trends[0].length; // Subtract number of days because of date field

    const activeMembers = trends[1].length;
    const totalVehicleUsage = trends[2].reduce((sum, vehicle) => sum + vehicle.bookingCount, 0);

    return {
      totalBookings,
      activeMembers,
      totalVehicleUsage,
      avgBookingsPerMember: activeMembers > 0 ? totalBookings / activeMembers : 0,
      conflictRate: trends[3].totalConflicts > 0 ? (trends[3].totalConflicts / totalBookings) * 100 : 0
    };
  }

  generateSummaryReport(bookings, startDate, endDate) {
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    const totalHours = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, booking) => {
        const duration = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);

    const totalDistance = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, booking) => {
        const checkInLog = booking.checkLogs?.find(log => log.actionType === 'check_in');
        const checkOutLog = booking.checkLogs?.find(log => log.actionType === 'check_out');
        
        if (checkInLog && checkOutLog && checkInLog.odometerReading && checkOutLog.odometerReading) {
          return sum + (checkOutLog.odometerReading - checkInLog.odometerReading);
        }
        return sum;
      }, 0);

    return {
      reportType: 'summary',
      period: { startDate, endDate },
      summary: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
        cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
        totalHours: Math.round(totalHours * 100) / 100,
        totalDistance,
        avgBookingDuration: completedBookings > 0 ? totalHours / completedBookings : 0
      },
      generatedAt: new Date().toISOString()
    };
  }

  generateDetailedReport(bookings, startDate, endDate) {
    return {
      reportType: 'detailed',
      period: { startDate, endDate },
      bookings: bookings.map(booking => ({
        id: booking.id,
        userId: booking.userId,
        vehicle: booking.vehicle,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        purpose: booking.purpose,
        priorityScore: booking.priorityScore,
        checkInOutLogs: booking.checkLogs,
        duration: booking.status === 'completed' ? 
          (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60) : null
      })),
      generatedAt: new Date().toISOString()
    };
  }

  async generateFinancialReport(bookings, startDate, endDate) {
    // This would integrate with Cost Service to get financial data
    // For now, return basic structure
    return {
      reportType: 'financial',
      period: { startDate, endDate },
      financialSummary: {
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        estimatedRevenue: 0, // Would come from Cost Service
        costBreakdown: {} // Would come from Cost Service
      },
      generatedAt: new Date().toISOString(),
      note: 'Financial data integration with Cost Service required'
    };
  }

  async calculateUserUtilization(userId, groupId, totalHours) {
    if (!groupId) return null;

    try {
      // Get group's total usage for comparison
      const groupUsage = await db.Booking.findAll({
        where: {
          groupId,
          status: 'completed'
        },
        attributes: [
          [db.Sequelize.fn('SUM', db.Sequelize.literal(
            'EXTRACT(EPOCH FROM (end_time - start_time)) / 3600'
          )), 'totalGroupHours']
        ],
        raw: true
      });

      const totalGroupHours = parseFloat(groupUsage[0]?.totalGroupHours || 0);
      
      if (totalGroupHours === 0) return 0;

      // Get user's ownership percentage
      const response = await userServiceClient.get(
        `${process.env.USER_SERVICE_URL}/groups/${groupId}/members/${userId}/ownership`
      );
      const ownershipPercentage = response.data.ownershipPercentage || 0;

      // Calculate utilization ratio
      const expectedHours = totalGroupHours * (ownershipPercentage / 100);
      const utilizationRatio = expectedHours > 0 ? (totalHours / expectedHours) * 100 : 0;

      return Math.round(utilizationRatio * 100) / 100;
    } catch (error) {
      logger.warn('Failed to calculate user utilization', {
        error: error.message,
        userId,
        groupId
      });
      return null;
    }
  }

  async getUserBookingTrends(userId, groupId = null) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const where = {
      userId,
      createdAt: {
        [db.Sequelize.Op.gte]: thirtyDaysAgo
      }
    };

    if (groupId) {
      where.groupId = groupId;
    }

    const trends = await db.Booking.findAll({
      where,
      attributes: [
        [db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')), 'date'],
        [db.Sequelize.fn('COUNT', db.Sequelize.col('Booking.id')), 'count']
      ],
      group: [db.Sequelize.fn('DATE', db.Sequelize.col('createdAt'))],
      order: [[db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    return trends.map(trend => ({
      date: trend.date,
      count: parseInt(trend.count)
    }));
  }

  calculateEfficiencyScore(totalHours, totalBookings) {
    if (totalBookings === 0) return 0;
    
    const avgDuration = totalHours / totalBookings;
    // Score based on optimal booking duration (4-8 hours is considered efficient)
    if (avgDuration >= 4 && avgDuration <= 8) {
      return 100;
    } else if (avgDuration < 4) {
      return (avgDuration / 4) * 100;
    } else {
      return Math.max(0, 100 - ((avgDuration - 8) / 8) * 100);
    }
  }

  formatTrendsData(trends) {
    const formatted = {};
    
    trends.forEach(trend => {
      if (!formatted[trend.date]) {
        formatted[trend.date] = {};
      }
      formatted[trend.date][trend.status] = parseInt(trend.count);
    });

    return Object.entries(formatted).map(([date, statusCounts]) => ({
      date,
      ...statusCounts
    }));
  }

  calculateDateRange(period) {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    return {
      start: startDate,
      end: now
    };
  }

  async clearAnalyticsCache() {
    try {
      const patterns = [
        'analytics:*',
        'report:*',
        'stats:*'
      ];

      for (const pattern of patterns) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await Promise.all(keys.map(key => redisClient.del(key)));
        }
      }

      logger.info('Analytics cache cleared');
    } catch (error) {
      logger.error('Failed to clear analytics cache', { error: error.message });
    }
  }
}

export default new AnalyticsService();