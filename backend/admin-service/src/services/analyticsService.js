// src/services/analyticsService.js
import analyticsRepository from '../repositories/analyticsRepository.js';
import { logger, AppError } from '@ev-coownership/shared';

export class AnalyticsService {
  async getUserAnalytics(period = '30d', groupBy = 'role', metrics = ['growth', 'activity']) {
    try {
      const days = this.parsePeriod(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const userEvents = await analyticsRepository.aggregateEventMetrics(
        'user-service',
        'user.registered',
        startDate,
        new Date()
      );

      const userActivity = await analyticsRepository.aggregateEventMetrics(
        'user-service',
        'user.logged_in',
        startDate,
        new Date()
      );

      const analytics = {
        period: {
          start: startDate,
          end: new Date(),
          days
        },
        summary: {
          totalUsers: userEvents.reduce((sum, day) => sum + day.count, 0),
          activeUsers: userActivity.reduce((sum, day) => sum + day.unique_users_count, 0),
          growthRate: this.calculateGrowthRate(userEvents),
          retentionRate: this.calculateRetentionRate(userEvents, userActivity)
        },
        trends: {
          registrations: userEvents,
          activity: userActivity
        },
        segmentation: {
          byRole: this.segmentByRole(userEvents), // Mock data
          byTimeOfDay: this.segmentByTimeOfDay(userActivity) // Mock data
        }
      };

      logger.debug('User analytics retrieved successfully', { period });

      return analytics;
    } catch (error) {
      logger.error('Failed to get user analytics', {
        error: error.message,
        period
      });
      throw error;
    }
  }

  async getRevenueAnalytics(period = 'monthly', breakdown = 'service', groupBy = 'week') {
    try {
      const days = this.parsePeriod(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const paymentEvents = await analyticsRepository.aggregateEventMetrics(
        'cost-service',
        'payment.completed',
        startDate,
        new Date()
      );

      const revenueData = paymentEvents.map(day => ({
        ...day,
        revenue: day.count * 150000 // Mock average transaction
      }));

      const analytics = {
        period: {
          start: startDate,
          end: new Date(),
          days
        },
        summary: {
          totalRevenue: revenueData.reduce((sum, day) => sum + day.revenue, 0),
          averageTransaction: 150000,
          transactionCount: revenueData.reduce((sum, day) => sum + day.count, 0),
          growthRate: this.calculateGrowthRate(revenueData.map(d => ({ count: d.revenue })))
        },
        breakdown: {
          byService: {
            booking: revenueData.reduce((sum, day) => sum + day.revenue * 0.6, 0),
            charging: revenueData.reduce((sum, day) => sum + day.revenue * 0.25, 0),
            maintenance: revenueData.reduce((sum, day) => sum + day.revenue * 0.15, 0)
          },
          byTimePeriod: this.groupByTimePeriod(revenueData, groupBy)
        },
        trends: revenueData
      };

      logger.debug('Revenue analytics retrieved successfully', { period });

      return analytics;
    } catch (error) {
      logger.error('Failed to get revenue analytics', {
        error: error.message,
        period
      });
      throw error;
    }
  }

  async getUsageAnalytics(period = 'weekly', metric = 'active_users', dimension = 'time_of_day') {
    try {
      const days = this.parsePeriod(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const usageData = await analyticsRepository.getUsageStatistics(
        'daily',
        startDate,
        new Date()
      );

      const analytics = {
        period: {
          start: startDate,
          end: new Date(),
          days
        },
        metric,
        dimension,
        data: this.analyzeUsagePatterns(usageData, metric, dimension),
        insights: this.generateUsageInsights(usageData)
      };

      logger.debug('Usage analytics retrieved successfully', { period, metric });

      return analytics;
    } catch (error) {
      logger.error('Failed to get usage analytics', {
        error: error.message,
        period,
        metric
      });
      throw error;
    }
  }

  async getSystemLogs(filters = {}) {
    try {
      const {
        level,
        service,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = filters;

      const query = {};
      if (level) query.log_level = level;
      if (service) query.service_name = service;
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const result = await analyticsRepository.getSystemLogs(query, {
        page,
        limit,
        sort: { timestamp: -1 }
      });

      logger.debug('System logs retrieved successfully', {
        total: result.pagination.total,
        page,
        limit
      });

      return result;
    } catch (error) {
      logger.error('Failed to get system logs', {
        error: error.message,
        filters
      });
      throw error;
    }
  }

  async getServicePerformance(services = ['auth', 'booking'], period = '24h') {
    try {
      const hours = this.parsePeriod(period);
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - hours);

      const performanceData = {};

      for (const service of services) {
        const serviceEvents = await analyticsRepository.aggregateEventMetrics(
          `${service}-service`,
          'system.service.healthy',
          startDate,
          new Date()
        );

        const errorLogs = await analyticsRepository.getErrorLogsSummary(
          `${service}-service`,
          startDate,
          new Date()
        );

        performanceData[service] = {
          uptime: this.calculateUptime(serviceEvents),
          errorRate: this.calculateErrorRate(serviceEvents, errorLogs),
          responseTime: this.calculateAverageResponseTime(service), // Mock data
          throughput: serviceEvents.reduce((sum, day) => sum + day.count, 0) / hours
        };
      }

      return {
        period: {
          start: startDate,
          end: new Date(),
          hours
        },
        services: performanceData
      };
    } catch (error) {
      logger.error('Failed to get service performance', {
        error: error.message,
        services,
        period
      });
      throw error;
    }
  }

  async getBusinessInsights(period = 'quarterly', type = 'trends') {
    try {
      const days = this.parsePeriod(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Aggregate data from multiple sources
      const [
        userGrowth,
        revenueTrends,
        usagePatterns,
        disputeMetrics
      ] = await Promise.all([
        this.getUserAnalytics(period),
        this.getRevenueAnalytics(period),
        this.getUsageAnalytics(period),
        this.getDisputeInsights(period)
      ]);

      const insights = {
        period: {
          start: startDate,
          end: new Date(),
          days
        },
        keyMetrics: {
          userGrowth: userGrowth.summary.growthRate,
          revenueGrowth: revenueTrends.summary.growthRate,
          customerSatisfaction: this.calculateSatisfactionScore(disputeMetrics), // Mock
          operationalEfficiency: this.calculateEfficiencyScore(usagePatterns) // Mock
        },
        trends: {
          userAcquisition: userGrowth.trends.registrations,
          revenue: revenueTrends.trends,
          usage: usagePatterns.data
        },
        recommendations: this.generateRecommendations({
          userGrowth,
          revenueTrends,
          usagePatterns,
          disputeMetrics
        })
      };

      logger.debug('Business insights generated successfully', { period, type });

      return insights;
    } catch (error) {
      logger.error('Failed to get business insights', {
        error: error.message,
        period,
        type
      });
      throw error;
    }
  }

  // Helper methods
  parsePeriod(period) {
    const unit = period.slice(-1);
    const value = parseInt(period.slice(0, -1));

    switch (unit) {
      case 'h': return value;
      case 'd': return value;
      case 'w': return value * 7;
      case 'm': return value * 30;
      default: return 30;
    }
  }

  calculateGrowthRate(data) {
    if (data.length < 2) return 0;
    const first = data[0].count;
    const last = data[data.length - 1].count;
    if (first === 0) return last > 0 ? 100 : 0;
    return ((last - first) / first) * 100;
  }

  calculateRetentionRate(registrations, activity) {
    if (registrations.length === 0) return 0;
    const totalRegistrations = registrations.reduce((sum, day) => sum + day.count, 0);
    const activeUsers = activity.reduce((sum, day) => sum + day.unique_users_count, 0);
    return (activeUsers / totalRegistrations) * 100;
  }

  segmentByRole(events) {
    // Mock data - in real implementation, this would come from user service
    return {
      co_owner: events.reduce((sum, day) => sum + day.count * 0.7, 0),
      staff: events.reduce((sum, day) => sum + day.count * 0.2, 0),
      admin: events.reduce((sum, day) => sum + day.count * 0.1, 0)
    };
  }

  segmentByTimeOfDay(activity) {
    // Mock data - in real implementation, this would analyze timestamps
    return {
      morning: 35,
      afternoon: 45,
      evening: 15,
      night: 5
    };
  }

  groupByTimePeriod(data, period) {
    // Mock implementation
    return data.reduce((acc, day) => {
      const periodKey = day.date; // In real implementation, group by week/month
      acc[periodKey] = (acc[periodKey] || 0) + day.revenue;
      return acc;
    }, {});
  }

  analyzeUsagePatterns(usageData, metric, dimension) {
    // Mock implementation
    return usageData.map(period => ({
      period: period.period_start,
      value: period.metrics.total_users || 0,
      dimension: 'average' // Mock
    }));
  }

  generateUsageInsights(usageData) {
    // Mock insights
    return [
      "Peak usage occurs between 2 PM and 6 PM",
      "Weekend usage is 25% higher than weekdays",
      "Mobile app usage increased by 15% this month"
    ];
  }

  calculateUptime(events) {
    if (events.length === 0) return 100;
    const totalPeriods = events.length;
    const healthyPeriods = events.filter(e => e.count > 0).length;
    return (healthyPeriods / totalPeriods) * 100;
  }

  calculateErrorRate(events, errorLogs) {
    if (events.length === 0) return 0;
    const totalEvents = events.reduce((sum, e) => sum + e.count, 0);
    const totalErrors = errorLogs.reduce((sum, e) => sum + e.error_count, 0);
    return (totalErrors / totalEvents) * 100;
  }

  calculateAverageResponseTime(service) {
    // Mock data
    const responseTimes = {
      auth: 85,
      user: 65,
      booking: 120,
      vehicle: 75,
      cost: 95
    };
    return responseTimes[service] || 100;
  }

  async getDisputeInsights(period) {
    // Mock implementation
    return {
      resolutionRate: 85,
      averageResolutionTime: 24,
      commonTypes: ['booking_conflict', 'cost_dispute']
    };
  }

  calculateSatisfactionScore(disputeMetrics) {
    // Mock calculation
    return Math.min(100, 100 - (disputeMetrics.averageResolutionTime / 2));
  }

  calculateEfficiencyScore(usagePatterns) {
    // Mock calculation
    return 78;
  }

  generateRecommendations(data) {
    const recommendations = [];

    if (data.userGrowth.growthRate < 10) {
      recommendations.push("Consider implementing referral program to boost user growth");
    }

    if (data.revenueTrends.breakdown.byService.charging < 20) {
      recommendations.push("Promote charging services to increase revenue diversification");
    }

    if (data.disputeMetrics.resolutionRate < 80) {
      recommendations.push("Improve dispute resolution process to increase customer satisfaction");
    }

    return recommendations;
  }
}

export default new AnalyticsService();