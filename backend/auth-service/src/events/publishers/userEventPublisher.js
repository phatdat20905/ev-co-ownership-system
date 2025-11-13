import amqp from 'amqplib';
import logger from '../../utils/logger.js';

export class UserEventPublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = process.env.RABBITMQ_EXCHANGE || 'ev_exchange';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      
      logger.info('Connected to RabbitMQ for event publishing');
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ for publishing', { error: error.message });
    }
  }

  async publishUserCreated(user) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const message = {
        eventType: 'USER_CREATED',
        userId: user.id,
        email: user.email,
        role: user.role,
        timestamp: new Date().toISOString()
      };

      this.channel.publish(
        this.exchange,
        'user.created',
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      logger.info('User created event published', { userId: user.id });
    } catch (error) {
      logger.error('Failed to publish user created event', { error: error.message });
    }
  }

  async publishUserVerified(userId) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const message = {
        eventType: 'USER_VERIFIED',
        userId,
        timestamp: new Date().toISOString()
      };

      this.channel.publish(
        this.exchange,
        'user.verified',
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      logger.info('User verified event published', { userId });
    } catch (error) {
      logger.error('Failed to publish user verified event', { error: error.message });
    }
  }
}

export default new UserEventPublisher();