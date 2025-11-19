// src/repositories/analyticsRepository.js
import { mongoDBClient } from '../config/mongodb.js';
import { logger } from '@ev-coownership/shared';

export class AnalyticsRepository {
  constructor() {
    this.collections = {
      ANALYTICS_EVENTS: 'analytics_events',
      SYSTEM_LOGS: 'system_logs',
      USAGE_STATISTICS: 'usage_statistics',
      ADMIN_METRICS: 'admin_metrics',
      AUDIT_EVENTS: 'audit_events'
    };
  }

  async logAnalyticsEvent(eventData) {
    try {
      const collection = mongoDBClient.getCollection(this.collections.ANALYTICS_EVENTS);
      
      const event = {
        ...eventData,
        indexed_service: eventData.service,
        indexed_event_type: eventData.event_type,
        indexed_timestamp: new Date(eventData.timestamp),
        created_at: new Date()
      };

      await collection.insertOne(event);
    } catch (error) {
      logger.error('Error logging analytics event:', error);
    }
  }

  async logSystemLog(logData) {
    try {
      const collection = mongoDBClient.getCollection(this.collections.SYSTEM_LOGS);
      
      const log = {
        ...logData,
        indexed_service: logData.service_name,
        indexed_level: logData.log_level,
        indexed_timestamp: new Date(logData.timestamp),
        created_at: new Date()
      };

      await collection.insertOne(log);
    } catch (error) {
      logger.error('Error logging system log:', error);
    }
  }

  async saveUsageStatistics(statistics) {
    try {
      const collection = mongoDBClient.getCollection(this.collections.USAGE_STATISTICS);
      
      const stats = {
        ...statistics,
        indexed_period: statistics.period,
        indexed_period_start: new Date(statistics.period_start),
        created_at: new Date()
      };

      await collection.insertOne(stats);
    } catch (error) {
      logger.error('Error saving usage statistics:', error);
    }
  }

  async saveAdminMetrics(metrics) {
    try {
      const collection = mongoDBClient.getCollection(this.collections.ADMIN_METRICS);
      
      const metric = {
        ...metrics,
        indexed_metric_type: metrics.metric_type,
        indexed_timestamp: new Date(metrics.timestamp),
        created_at: new Date()
      };

      await collection.insertOne(metric);
    } catch (error) {
      logger.error('Error saving admin metrics:', error);
    }
  }

  async getAnalyticsEvents(query = {}, options = {}) {
    try {
      const collection = mongoDBClient.getCollection(this.collections.ANALYTICS_EVENTS);
      
      const {
        page = 1,
        limit = 50,
        sort = { timestamp: -1 },
        ...filters
      } = options;

      const skip = (page - 1) * limit;

      const cursor = collection.find({ ...query, ...filters })
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const results = await cursor.toArray();
      const total = await collection.countDocuments({ ...query, ...filters });

      return {
        data: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting analytics events:', error);
      throw error;
    }
  }

  async getSystemLogs(query = {}, options = {}) {
    try {
      const collection = mongoDBClient.getCollection(this.collections.SYSTEM_LOGS);
      
      const {
        page = 1,
        limit = 50,
        sort = { timestamp: -1 },
        ...filters
      } = options;

      const skip = (page - 1) * limit;

      const cursor = collection.find({ ...query, ...filters })
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const results = await cursor.toArray();
      const total = await collection.countDocuments({ ...query, ...filters });

      return {
        data: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting system logs:', error);
      throw error;
    }
  }

  async getUsageStatistics(period, startDate, endDate) {
    try {
      const collection = mongoDBClient.getCollection(this.collections.USAGE_STATISTICS);
      
      const query = {
        period,
        period_start: { $gte: new Date(startDate) },
        period_end: { $lte: new Date(endDate) }
      };

      return await collection.find(query)
        .sort({ period_start: 1 })
        .toArray();
    } catch (error) {
      logger.error('Error getting usage statistics:', error);
      throw error;
    }
  }

  async getAdminMetrics(metricType, startDate, endDate) {
    try {
      const collection = mongoDBClient.getCollection(this.collections.ADMIN_METRICS);
      
      const query = {
        metric_type: metricType,
        timestamp: { 
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      return await collection.find(query)
        .sort({ timestamp: 1 })
        .toArray();
    } catch (error) {
      logger.error('Error getting admin metrics:', error);
      throw error;
    }
  }

  async aggregateEventMetrics(service, eventType, startDate, endDate) {
    try {
      const collection = mongoDBClient.getCollection(this.collections.ANALYTICS_EVENTS);
      
      const pipeline = [
        {
          $match: {
            indexed_service: service,
            indexed_event_type: eventType,
            indexed_timestamp: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$indexed_timestamp"
              }
            },
            count: { $sum: 1 },
            unique_users: { $addToSet: "$user_id" }
          }
        },
        {
          $project: {
            date: "$_id",
            count: 1,
            unique_users_count: { $size: "$unique_users" },
            _id: 0
          }
        },
        {
          $sort: { date: 1 }
        }
      ];

      return await collection.aggregate(pipeline).toArray();
    } catch (error) {
      logger.error('Error aggregating event metrics:', error);
      throw error;
    }
  }

  async getErrorLogsSummary(service, startDate, endDate) {
    try {
      const collection = mongoDBClient.getCollection(this.collections.SYSTEM_LOGS);
      
      const pipeline = [
        {
          $match: {
            indexed_service: service,
            log_level: 'error',
            indexed_timestamp: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$indexed_timestamp"
              }
            },
            error_count: { $sum: 1 },
            unique_errors: { $addToSet: "$message" }
          }
        },
        {
          $project: {
            date: "$_id",
            error_count: 1,
            unique_errors_count: { $size: "$unique_errors" },
            _id: 0
          }
        },
        {
          $sort: { date: 1 }
        }
      ];

      return await collection.aggregate(pipeline).toArray();
    } catch (error) {
      logger.error('Error getting error logs summary:', error);
      throw error;
    }
  }

  async findEvents({ limit = 10, offset = 0, sort = { timestamp: -1 }, ...filter }) {
    try {
      const collection = mongoDBClient.getCollection(this.collections.ANALYTICS_EVENTS);
      
      const cursor = collection.find(filter)
        .sort(sort)
        .skip(offset)
        .limit(limit);

      return await cursor.toArray();
    } catch (error) {
      logger.error('Error finding events:', error);
      return [];
    }
  }
}

export default new AnalyticsRepository();