// src/jobs/analyticsJob.js
import { logger } from '@ev-coownership/shared';
import analyticsRepository from '../repositories/analyticsRepository.js';
import dashboardService from '../services/dashboardService.js';

export class AnalyticsJob {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) {
      logger.warn('Analytics job is already running');
      return;
    }

    // Run every hour
    this.intervalId = setInterval(() => {
      this.collectAnalytics().catch(error => {
        logger.error('Analytics job failed', { error: error.message });
      });
    }, 60 * 60 * 1000); // 1 hour

    // Run immediately on start
    this.collectAnalytics().catch(error => {
      logger.error('Initial analytics collection failed', { error: error.message });
    });

    this.isRunning = true;
    logger.info('Analytics job started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('Analytics job stopped');
  }

  async collectAnalytics() {
    try {
      const now = new Date();
      const periodStart = new Date(now.getTime() - (60 * 60 * 1000)); // Last hour
      
      logger.debug('Starting analytics collection', {
        periodStart,
        periodEnd: now
      });

      // Collect system metrics
      await this.collectSystemMetrics(now);
      
      // Collect usage statistics
      await this.collectUsageStatistics(now);
      
      // Collect business metrics
      await this.collectBusinessMetrics(now);

      logger.info('Analytics collection completed successfully');
    } catch (error) {
      logger.error('Analytics collection failed', { error: error.message });
      throw error;
    }
  }

  async collectSystemMetrics(timestamp) {
    try {
      const health = await dashboardService.getSystemHealth();
      
      const systemMetrics = {
        metric_type: 'hourly',
        timestamp,
        metrics: {
          system_load: Math.random() * 100, // Mock data
          memory_usage: Math.random() * 100, // Mock data
          database_connections: Math.floor(Math.random() * 50) + 10, // Mock data
          service_health: health
        },
        environment: process.env.NODE_ENV || 'development'
      };

      await analyticsRepository.saveAdminMetrics(systemMetrics);
      
      logger.debug('System metrics collected', { timestamp });
    } catch (error) {
      logger.error('Failed to collect system metrics', { error: error.message });
    }
  }

  async collectUsageStatistics(timestamp) {
    try {
      const periodEnd = timestamp;
      const periodStart = new Date(timestamp.getTime() - (60 * 60 * 1000)); // Last hour

      // Mock usage data - in real implementation, this would aggregate from various services
      const usageStats = {
        period: 'hourly',
        period_start: periodStart,
        period_end: periodEnd,
        metrics: {
          total_users: Math.floor(Math.random() * 1000) + 500,
          active_users: Math.floor(Math.random() * 200) + 100,
          new_users: Math.floor(Math.random() * 50) + 10,
          total_bookings: Math.floor(Math.random() * 100) + 20,
          completed_bookings: Math.floor(Math.random() * 80) + 15,
          cancelled_bookings: Math.floor(Math.random() * 10) + 1,
          total_revenue: Math.floor(Math.random() * 10000000) + 5000000,
          active_vehicles: Math.floor(Math.random() * 50) + 10,
          maintenance_count: Math.floor(Math.random() * 5) + 1,
          charging_sessions: Math.floor(Math.random() * 30) + 5
        },
        service_usage: {
          auth_service: {
            requests: Math.floor(Math.random() * 1000) + 500,
            errors: Math.floor(Math.random() * 10) + 1,
            avg_response_time: Math.random() * 100 + 50
          },
          user_service: {
            requests: Math.floor(Math.random() * 800) + 400,
            errors: Math.floor(Math.random() * 8) + 1,
            avg_response_time: Math.random() * 80 + 40
          },
          booking_service: {
            requests: Math.floor(Math.random() * 600) + 300,
            errors: Math.floor(Math.random() * 5) + 1,
            avg_response_time: Math.random() * 120 + 60
          },
          vehicle_service: {
            requests: Math.floor(Math.random() * 400) + 200,
            errors: Math.floor(Math.random() * 3) + 1,
            avg_response_time: Math.random() * 90 + 45
          },
          cost_service: {
            requests: Math.floor(Math.random() * 500) + 250,
            errors: Math.floor(Math.random() * 6) + 1,
            avg_response_time: Math.random() * 110 + 55
          }
        }
      };

      await analyticsRepository.saveUsageStatistics(usageStats);
      
      logger.debug('Usage statistics collected', { 
        period: 'hourly',
        period_start: periodStart,
        period_end: periodEnd
      });
    } catch (error) {
      logger.error('Failed to collect usage statistics', { error: error.message });
    }
  }

  async collectBusinessMetrics(timestamp) {
    try {
      // Collect key business metrics
      const businessMetrics = {
        metric_type: 'hourly',
        timestamp,
        metrics: {
          user_acquisition: Math.floor(Math.random() * 50) + 10,
          booking_conversion: Math.random() * 100,
          revenue_per_user: Math.floor(Math.random() * 100000) + 50000,
          customer_satisfaction: Math.floor(Math.random() * 100) + 50,
          operational_efficiency: Math.floor(Math.random() * 100) + 60
        },
        environment: process.env.NODE_ENV || 'development'
      };

      await analyticsRepository.saveAdminMetrics(businessMetrics);
      
      logger.debug('Business metrics collected', { timestamp });
    } catch (error) {
      logger.error('Failed to collect business metrics', { error: error.message });
    }
  }

  async runDailyAggregation() {
    try {
      const now = new Date();
      const periodStart = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // Last 24 hours
      
      logger.info('Starting daily analytics aggregation', {
        periodStart,
        periodEnd: now
      });

      // Aggregate hourly data into daily summary
      const dailyStats = {
        period: 'daily',
        period_start: new Date(periodStart.setHours(0, 0, 0, 0)),
        period_end: new Date(now.setHours(23, 59, 59, 999)),
        metrics: await this.aggregateDailyMetrics(periodStart, now),
        service_usage: await this.aggregateDailyServiceUsage(periodStart, now)
      };

      await analyticsRepository.saveUsageStatistics(dailyStats);
      
      logger.info('Daily analytics aggregation completed successfully');
    } catch (error) {
      logger.error('Daily analytics aggregation failed', { error: error.message });
      throw error;
    }
  }

  async aggregateDailyMetrics(startDate, endDate) {
    // Mock aggregation - in real implementation, this would query the database
    return {
      total_users: Math.floor(Math.random() * 5000) + 1000,
      active_users: Math.floor(Math.random() * 1000) + 200,
      new_users: Math.floor(Math.random() * 200) + 50,
      total_bookings: Math.floor(Math.random() * 500) + 100,
      completed_bookings: Math.floor(Math.random() * 400) + 80,
      total_revenue: Math.floor(Math.random() * 50000000) + 10000000,
      active_vehicles: Math.floor(Math.random() * 100) + 20
    };
  }

  async aggregateDailyServiceUsage(startDate, endDate) {
    // Mock aggregation
    return {
      auth_service: {
        requests: Math.floor(Math.random() * 20000) + 5000,
        errors: Math.floor(Math.random() * 200) + 10,
        avg_response_time: Math.random() * 100 + 50
      },
      user_service: {
        requests: Math.floor(Math.random() * 15000) + 4000,
        errors: Math.floor(Math.random() * 150) + 8,
        avg_response_time: Math.random() * 80 + 40
      },
      booking_service: {
        requests: Math.floor(Math.random() * 10000) + 3000,
        errors: Math.floor(Math.random() * 100) + 5,
        avg_response_time: Math.random() * 120 + 60
      }
    };
  }
}

export default new AnalyticsJob();