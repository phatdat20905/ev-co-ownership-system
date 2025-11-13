// src/services/healthMonitorService.js
import { logger } from '@ev-coownership/shared';
import dashboardService from './dashboardService.js';

export class HealthMonitorService {
  constructor() {
    this.healthChecks = new Map();
    this.checkInterval = 60000; // 1 minute
    this.intervalId = null;
  }

  startMonitoring() {
    if (this.intervalId) {
      logger.warn('Health monitoring already started');
      return;
    }

    this.intervalId = setInterval(() => {
      this.performHealthChecks().catch(error => {
        logger.error('Health check failed', { error: error.message });
      });
    }, this.checkInterval);

    logger.info('Health monitoring started', { interval: this.checkInterval });
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Health monitoring stopped');
    }
  }

  async performHealthChecks() {
    try {
      const healthStatus = await dashboardService.getSystemHealth();
      
      // Store latest health status
      this.healthChecks.set(Date.now(), healthStatus);

      // Clean up old health checks (keep only last 24 hours)
      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
      for (const [timestamp] of this.healthChecks) {
        if (timestamp < twentyFourHoursAgo) {
          this.healthChecks.delete(timestamp);
        }
      }

      // Log if system is degraded
      if (healthStatus.status === 'degraded') {
        logger.warn('System health degraded', {
          failedChecks: Object.entries(healthStatus.checks)
            .filter(([_, check]) => !check.healthy)
            .map(([service]) => service)
        });
      }

      logger.debug('Health check completed', { status: healthStatus.status });
    } catch (error) {
      logger.error('Failed to perform health checks', { error: error.message });
    }
  }

  getHealthHistory(hours = 24) {
    const since = Date.now() - (hours * 60 * 60 * 1000);
    const history = [];

    for (const [timestamp, status] of this.healthChecks) {
      if (timestamp >= since) {
        history.push({
          timestamp: new Date(timestamp),
          status: status.status,
          checks: status.checks
        });
      }
    }

    return history.sort((a, b) => b.timestamp - a.timestamp);
  }

  getUptimeStats(hours = 24) {
    const history = this.getHealthHistory(hours);
    if (history.length === 0) return { uptime: 100, downtime: 0 };

    const totalChecks = history.length;
    const healthyChecks = history.filter(h => h.status === 'healthy').length;
    const uptime = (healthyChecks / totalChecks) * 100;

    return {
      uptime: Math.round(uptime * 100) / 100,
      downtime: Math.round((100 - uptime) * 100) / 100,
      totalChecks,
      healthyChecks
    };
  }

  async getServiceDependencies() {
    const services = [
      {
        name: 'PostgreSQL',
        type: 'database',
        critical: true,
        description: 'Primary transactional database'
      },
      {
        name: 'MongoDB',
        type: 'database',
        critical: false,
        description: 'Analytics and logging database'
      },
      {
        name: 'Redis',
        type: 'cache',
        critical: false,
        description: 'Caching and session storage'
      },
      {
        name: 'RabbitMQ',
        type: 'message-broker',
        critical: false,
        description: 'Event bus and message queue'
      },
      {
        name: 'Auth Service',
        type: 'microservice',
        critical: true,
        description: 'Authentication and authorization'
      },
      {
        name: 'User Service',
        type: 'microservice',
        critical: true,
        description: 'User profile and group management'
      },
      {
        name: 'Booking Service',
        type: 'microservice',
        critical: true,
        description: 'Vehicle booking and scheduling'
      },
      {
        name: 'Vehicle Service',
        type: 'microservice',
        critical: true,
        description: 'Vehicle and maintenance management'
      },
      {
        name: 'Cost Service',
        type: 'microservice',
        critical: true,
        description: 'Cost tracking and payment processing'
      }
    ];

    // Get current health status for each service
    const healthStatus = await dashboardService.getSystemHealth();
    
    return services.map(service => {
      const health = healthStatus.checks[service.name.toLowerCase().replace(' ', '_')] || 
                    healthStatus.checks.external_services?.services?.find(s => 
                      s.service === service.name.toLowerCase().replace(' service', '')
                    );

      return {
        ...service,
        healthy: health ? health.healthy : false,
        lastCheck: new Date(),
        details: health || {}
      };
    });
  }
}

export default new HealthMonitorService();