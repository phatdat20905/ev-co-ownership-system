// src/services/dashboardService.js
import analyticsRepository from '../repositories/analyticsRepository.js';
import disputeRepository from '../repositories/disputeRepository.js';
import kycRepository from '../repositories/kycRepository.js';
import staffRepository from '../repositories/staffRepository.js';
import { logger, AppError } from '@ev-coownership/shared';

export class DashboardService {
  async getOverviewStats(period = '7d') {
    try {
      const days = this.parsePeriod(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get data from multiple sources
      const [
        userStats,
        bookingStats,
        revenueStats,
        disputeStats,
        kycStats
      ] = await Promise.all([
        this.getUserStats(startDate),
        this.getBookingStats(startDate),
        this.getRevenueStats(startDate),
        this.getDisputeStats(startDate),
        this.getKYCStats(startDate)
      ]);

      const overview = {
        users: userStats,
        bookings: bookingStats,
        revenue: revenueStats,
        disputes: disputeStats,
        kyc: kycStats,
        period: {
          start: startDate,
          end: new Date(),
          days
        }
      };

      logger.debug('Dashboard overview stats retrieved successfully', { period });

      return overview;
    } catch (error) {
      logger.error('Failed to get dashboard overview stats', {
        error: error.message,
        period
      });
      throw error;
    }
  }

  async getUserStats(startDate) {
    try {
      // This would typically call User Service
      // For now, return mock data
      const userEvents = await analyticsRepository.aggregateEventMetrics(
        'user-service',
        'user.registered',
        startDate,
        new Date()
      );

      const totalNewUsers = userEvents.reduce((sum, day) => sum + day.count, 0);
      const totalActiveUsers = userEvents.reduce((sum, day) => sum + day.unique_users_count, 0);

      return {
        total: totalNewUsers,
        active: totalActiveUsers,
        growth: this.calculateGrowthRate(userEvents),
        trend: userEvents
      };
    } catch (error) {
      logger.error('Failed to get user stats', { error: error.message });
      return { total: 0, active: 0, growth: 0, trend: [] };
    }
  }

  async getBookingStats(startDate) {
    try {
      // This would typically call Booking Service
      const bookingEvents = await analyticsRepository.aggregateEventMetrics(
        'booking-service',
        'booking.created',
        startDate,
        new Date()
      );

      const totalBookings = bookingEvents.reduce((sum, day) => sum + day.count, 0);
      const completedBookings = bookingEvents.reduce((sum, day) => sum + day.count * 0.8, 0); // Mock completion rate

      return {
        total: totalBookings,
        completed: Math.round(completedBookings),
        cancellationRate: 12.5, // Mock data
        averageDuration: 4.2, // Mock data in hours
        trend: bookingEvents
      };
    } catch (error) {
      logger.error('Failed to get booking stats', { error: error.message });
      return { total: 0, completed: 0, cancellationRate: 0, averageDuration: 0, trend: [] };
    }
  }

  async getRevenueStats(startDate) {
    try {
      // This would typically call Cost Service
      const paymentEvents = await analyticsRepository.aggregateEventMetrics(
        'cost-service',
        'payment.completed',
        startDate,
        new Date()
      );

      const totalRevenue = paymentEvents.reduce((sum, day) => sum + day.count * 150000, 0); // Mock average transaction

      return {
        total: totalRevenue,
        averageTransaction: 150000,
        growth: 15.5, // Mock growth
        byService: {
          booking: totalRevenue * 0.6,
          charging: totalRevenue * 0.25,
          maintenance: totalRevenue * 0.15
        },
        trend: paymentEvents.map(day => ({
          ...day,
          revenue: day.count * 150000
        }))
      };
    } catch (error) {
      logger.error('Failed to get revenue stats', { error: error.message });
      return { total: 0, averageTransaction: 0, growth: 0, byService: {}, trend: [] };
    }
  }

  async getDisputeStats(startDate) {
    try {
      const disputeStats = await disputeRepository.getDisputeStats('30');
      const openDisputes = disputeStats.byStatus.open || 0;
      const resolvedDisputes = disputeStats.byStatus.resolved || 0;

      return {
        total: disputeStats.total,
        open: openDisputes,
        resolved: resolvedDisputes,
        resolutionRate: resolvedDisputes > 0 ? 
          (resolvedDisputes / (openDisputes + resolvedDisputes)) * 100 : 0,
        averageResolutionTime: disputeStats.averageResolutionTime
      };
    } catch (error) {
      logger.error('Failed to get dispute stats', { error: error.message });
      return { total: 0, open: 0, resolved: 0, resolutionRate: 0, averageResolutionTime: 0 };
    }
  }

  async getKYCStats(startDate) {
    try {
      const kycStats = await kycRepository.getKYCStats('30');
      const pending = kycStats.byStatus.pending || 0;
      const approved = kycStats.byStatus.approved || 0;

      return {
        total: kycStats.total,
        pending,
        approved,
        rejectionRate: kycStats.byStatus.rejected > 0 ? 
          (kycStats.byStatus.rejected / kycStats.total) * 100 : 0,
        averageProcessingTime: kycStats.averageProcessingTime
      };
    } catch (error) {
      logger.error('Failed to get KYC stats', { error: error.message });
      return { total: 0, pending: 0, approved: 0, rejectionRate: 0, averageProcessingTime: 0 };
    }
  }

  async getLiveMetrics() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));

      const metrics = {
        timestamp: now,
        system: {
          activeSessions: Math.floor(Math.random() * 100) + 50,
          concurrentBookings: Math.floor(Math.random() * 20) + 5,
          systemLoad: Math.random() * 100,
          memoryUsage: Math.random() * 100,
          databaseConnections: Math.floor(Math.random() * 50) + 10
        },
        performance: {
          responseTimes: {
            auth_service: Math.random() * 100 + 50,
            user_service: Math.random() * 80 + 40,
            booking_service: Math.random() * 120 + 60,
            vehicle_service: Math.random() * 90 + 45,
            cost_service: Math.random() * 110 + 55
          }
        },
        business: {
          realTimeBookings: Math.floor(Math.random() * 10) + 1,
          realTimePayments: Math.floor(Math.random() * 5) + 1,
          realTimeUsersOnline: Math.floor(Math.random() * 50) + 20
        }
      };

      // Save to MongoDB for historical data
      await analyticsRepository.saveAdminMetrics({
        metric_type: 'real_time',
        timestamp: now,
        metrics,
        environment: process.env.NODE_ENV || 'development'
      });

      return metrics;
    } catch (error) {
      logger.error('Failed to get live metrics', { error: error.message });
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const healthChecks = {
        database: await this.checkDatabaseHealth(),
        redis: await this.checkRedisHealth(),
        rabbitmq: await this.checkRabbitMQHealth(),
        external_services: await this.checkExternalServicesHealth()
      };

      const overallHealth = Object.values(healthChecks).every(check => check.healthy) ? 'healthy' : 'degraded';

      return {
        status: overallHealth,
        timestamp: new Date(),
        checks: healthChecks
      };
    } catch (error) {
      logger.error('Failed to get system health', { error: error.message });
      throw error;
    }
  }

  async checkDatabaseHealth() {
    try {
      const db = await import('../models/index.js');
      await db.default.sequelize.authenticate();
      return { healthy: true, service: 'database' };
    } catch (error) {
      return { healthy: false, service: 'database', error: error.message };
    }
  }

  async checkRedisHealth() {
    try {
      const { redisClient } = await import('@ev-coownership/shared');
      await redisClient.ping();
      return { healthy: true, service: 'redis' };
    } catch (error) {
      return { healthy: false, service: 'redis', error: error.message };
    }
  }

  async checkRabbitMQHealth() {
    try {
      const { rabbitMQClient } = await import('@ev-coownership/shared');
      await rabbitMQClient.healthCheck();
      return { healthy: true, service: 'rabbitmq' };
    } catch (error) {
      return { healthy: false, service: 'rabbitmq', error: error.message };
    }
  }

  async checkExternalServicesHealth() {
    const services = [
      'AUTH_SERVICE_URL',
      'USER_SERVICE_URL', 
      'BOOKING_SERVICE_URL',
      'VEHICLE_SERVICE_URL',
      'COST_SERVICE_URL'
    ];

    const checks = await Promise.all(
      services.map(async (serviceEnv) => {
        const url = process.env[serviceEnv];
        try {
          const response = await fetch(`${url}/health`);
          return {
            service: serviceEnv.replace('_SERVICE_URL', '').toLowerCase(),
            healthy: response.ok,
            status: response.status
          };
        } catch (error) {
          return {
            service: serviceEnv.replace('_SERVICE_URL', '').toLowerCase(),
            healthy: false,
            error: error.message
          };
        }
      })
    );

    return {
      healthy: checks.every(check => check.healthy),
      services: checks
    };
  }

  parsePeriod(period) {
    const unit = period.slice(-1);
    const value = parseInt(period.slice(0, -1));

    switch (unit) {
      case 'd': return value;
      case 'w': return value * 7;
      case 'm': return value * 30;
      default: return 7;
    }
  }

  calculateGrowthRate(data) {
    if (data.length < 2) return 0;
    
    const first = data[0].count;
    const last = data[data.length - 1].count;
    
    if (first === 0) return last > 0 ? 100 : 0;
    
    return ((last - first) / first) * 100;
  }

  async getRecentActivities({ limit = 10, offset = 0, type }) {
    try {
      const filter = type ? { event_type: { $regex: type, $options: 'i' } } : {};
      
      const activities = await analyticsRepository.findEvents({
        ...filter,
        limit,
        offset,
        sort: { timestamp: -1 }
      });

      // Transform to frontend-friendly format
      return activities.map(activity => ({
        id: activity._id || activity.id,
        user: activity.user_name || activity.metadata?.userName || 'System',
        userName: activity.user_name || activity.metadata?.userName || 'System',
        action: activity.event_type || activity.description || 'Activity',
        description: activity.description || activity.event_type,
        time: this.formatTimeAgo(activity.timestamp),
        timestamp: activity.timestamp,
        type: this.getActivityType(activity.event_type)
      }));
    } catch (error) {
      logger.error('Failed to get recent activities', { error: error.message });
      return [];
    }
  }

  async getNotifications({ staffId, limit = 20, unreadOnly = false }) {
    try {
      // Run dependent queries in parallel and guard them with short timeouts.
      const withTimeout = (p, ms, name) =>
        Promise.race([
          p,
          new Promise((resolve) => setTimeout(() => {
            logger.warn(`Timeout when fetching ${name} after ${ms}ms`);
            resolve([]);
          }, ms))
        ]);

      const analyticsPromise = withTimeout(
        analyticsRepository.findEvents({
          severity: { $in: ['high', 'critical'] },
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          limit,
          sort: { timestamp: -1 }
        }),
        4000,
        'analytics events'
      );

      const disputesPromise = withTimeout(disputeRepository.getRecentDisputes(5), 3000, 'recent disputes');
      const kycPromise = withTimeout(kycRepository.getPendingKYC(5), 3000, 'pending kyc');

      const [criticalEvents, disputes, kycPending] = await Promise.all([
        analyticsPromise,
        disputesPromise,
        kycPromise
      ]);

      const notifications = [
        ...(Array.isArray(criticalEvents) ? criticalEvents.map(event => ({
          id: event._id || event.id,
          title: this.getNotificationTitle(event.event_type),
          message: event.description || event.event_type,
          time: this.formatTimeAgo(event.timestamp),
          timestamp: event.timestamp,
          type: event.severity === 'critical' ? 'error' : 'warning',
          read: false
        })) : []),
        ...(Array.isArray(disputes) ? disputes.map(dispute => ({
          id: `dispute_${dispute.id}`,
          title: 'Tranh chấp mới',
          message: `Tranh chấp ${dispute.type || 'mới'} cần xử lý`,
          time: this.formatTimeAgo(dispute.created_at),
          timestamp: dispute.created_at,
          type: 'warning',
          read: false
        })) : []),
        ...(Array.isArray(kycPending) ? kycPending.map(kyc => ({
          id: `kyc_${kyc.id}`,
          title: 'KYC chờ duyệt',
          message: `Yêu cầu KYC từ ${kyc.user_name || 'người dùng'}`,
          time: this.formatTimeAgo(kyc.submitted_at),
          timestamp: kyc.submitted_at,
          type: 'info',
          read: false
        })) : [])
      ];

      // Sort by timestamp
      notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return notifications.slice(0, limit);
    } catch (error) {
      logger.error('Failed to get notifications', { error: error.message });
      return [];
    }
  }

  getActivityType(eventType) {
    if (!eventType) return 'info';
    
    if (eventType.includes('user.registered') || eventType.includes('user.created')) return 'success';
    if (eventType.includes('booking.created')) return 'success';
    if (eventType.includes('payment.completed')) return 'success';
    if (eventType.includes('dispute') || eventType.includes('error')) return 'error';
    if (eventType.includes('warning') || eventType.includes('pending')) return 'warning';
    
    return 'info';
  }

  getNotificationTitle(eventType) {
    if (!eventType) return 'Thông báo';
    
    if (eventType.includes('user')) return 'Người dùng';
    if (eventType.includes('booking')) return 'Đặt lịch';
    if (eventType.includes('payment')) return 'Thanh toán';
    if (eventType.includes('dispute')) return 'Tranh chấp';
    if (eventType.includes('vehicle')) return 'Phương tiện';
    if (eventType.includes('system')) return 'Hệ thống';
    
    return 'Thông báo';
  }

  formatTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds} giây trước`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} tuần trước`;
    
    return date.toLocaleDateString('vi-VN');
  }
}

export default new DashboardService();