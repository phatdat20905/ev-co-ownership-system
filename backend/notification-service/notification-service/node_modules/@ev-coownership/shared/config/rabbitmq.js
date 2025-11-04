import amqp from 'amqplib';
import logger from '../utils/logger.js';

export class RabbitMQClient {
  constructor(serviceName = 'unknown-service') {
    this.connection = null;
    this.channel = null;
    this.serviceName = serviceName;
    this.exchange = process.env.RABBITMQ_EXCHANGE || 'ev_exchange';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      // Assert exchange
      await this.channel.assertExchange(this.exchange, 'topic', { 
        durable: true 
      });
      
      logger.info(`RabbitMQ connected for ${this.serviceName}`);
    } catch (error) {
      logger.error(`Failed to connect to RabbitMQ for ${this.serviceName}:`, error);
      throw error;
    }
  }

  async publish(routingKey, message, options = {}) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const messageBuffer = Buffer.from(JSON.stringify({
        ...message,
        metadata: {
          service: this.serviceName,
          timestamp: new Date().toISOString(),
          ...message.metadata
        }
      }));

      this.channel.publish(
        this.exchange,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          ...options
        }
      );

      logger.debug(`Message published to ${routingKey}`, { 
        service: this.serviceName,
        routingKey 
      });
    } catch (error) {
      logger.error(`Failed to publish message for ${this.serviceName}:`, error);
      throw error;
    }
  }

  async consume(queue, routingKey, callback, options = {}) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      // Assert queue
      const q = await this.channel.assertQueue(queue, { 
        durable: true,
        ...options 
      });

      // Bind queue to exchange with routing key
      await this.channel.bindQueue(q.queue, this.exchange, routingKey);

      this.channel.consume(q.queue, async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content, msg);
            this.channel.ack(msg);
          } catch (error) {
            logger.error(`Error processing message for ${this.serviceName}:`, error);
            this.channel.nack(msg, false, false); // Don't requeue
          }
        }
      });

      logger.info(`Started consuming from ${queue} with routing key ${routingKey}`, { 
        service: this.serviceName 
      });
    } catch (error) {
      logger.error(`Failed to setup consumer for ${this.serviceName}:`, error);
      throw error;
    }
  }

  async disconnect() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    logger.info(`RabbitMQ disconnected for ${this.serviceName}`);
  }
}

// Create default instance
export const rabbitMQClient = new RabbitMQClient('shared');