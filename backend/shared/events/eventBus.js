// backend/shared/events/eventBus.js
import { rabbitMQClient } from '../config/rabbitmq.js';
import { eventTypes } from './eventTypes.js';
import logger from '../utils/logger.js';

export class EventBus {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.rabbitMQ = rabbitMQClient;
  }

  async publish(eventType, data, routingKey = null) {
    const event = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      source: this.serviceName
    };

    const key = routingKey || this.getRoutingKey(eventType);
    
    await this.rabbitMQ.publish(key, event);
    
    logger.debug('Event published', {
      service: this.serviceName,
      eventType,
      routingKey: key
    });
  }

  async subscribe(eventType, handler, queueSuffix = '') {
    const queueName = `${this.serviceName}.${eventType}${queueSuffix}`;
    const routingKey = this.getRoutingKey(eventType);

    await this.rabbitMQ.consume(queueName, routingKey, async (message) => {
      logger.debug('Event received', {
        service: this.serviceName,
        eventType: message.type,
        queue: queueName
      });

      try {
        await handler(message.data, message);
        logger.debug('Event processed successfully', {
          service: this.serviceName,
          eventType: message.type
        });
      } catch (error) {
        logger.error('Error processing event', {
          service: this.serviceName,
          eventType: message.type,
          error: error.message
        });
        throw error;
      }
    });
  }

  getRoutingKey(eventType) {
    // FIX: Kiểm tra nếu eventType có dấu chấm để split
    if (typeof eventType !== 'string') {
      logger.warn('Invalid event type', { eventType });
      return 'unknown.unknown';
    }

    const parts = eventType.split('.');
    
    // FIX: Đảm bảo có ít nhất 2 phần
    if (parts.length < 2) {
      logger.warn(`Event type '${eventType}' doesn't follow category.action pattern`);
      return `${parts[0] || 'unknown'}.${parts[0] || 'unknown'}`;
    }

    const category = parts[0];
    const action = parts.slice(1).join('.');
    
    return `${category}.${action}`;
  }

  async healthCheck() {
    try {
      // Simple health check by trying to connect
      await this.rabbitMQ.connect();
      return { healthy: true, service: 'event-bus' };
    } catch (error) {
      return { 
        healthy: false, 
        service: 'event-bus', 
        error: error.message 
      };
    }
  }
}

// Create event bus factory
export const createEventBus = (serviceName) => {
  return new EventBus(serviceName);
};