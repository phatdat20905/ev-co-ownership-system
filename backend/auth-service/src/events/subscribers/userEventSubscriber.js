import amqp from 'amqplib';
import logger from '../../utils/logger.js';

export class UserEventSubscriber {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = process.env.RABBITMQ_EXCHANGE || 'ev_exchange';
    this.queue = process.env.RABBITMQ_QUEUE_AUTH || 'auth_queue';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      
      const q = await this.channel.assertQueue(this.queue, { durable: true });
      
      // Bind to relevant events
      await this.channel.bindQueue(q.queue, this.exchange, 'user.*');
      
      logger.info('Connected to RabbitMQ for event subscription');
      
      return this.channel;
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ for subscription', { error: error.message });
      throw error;
    }
  }

  async startConsuming() {
    try {
      if (!this.channel) {
        await this.connect();
      }

      this.channel.consume(this.queue, (msg) => {
        if (msg !== null) {
          this.handleMessage(msg);
        }
      }, { noAck: false });

      logger.info('Started consuming messages from RabbitMQ');
    } catch (error) {
      logger.error('Failed to start consuming messages', { error: error.message });
    }
  }

  async handleMessage(msg) {
    try {
      const content = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;

      logger.info('Received message', { routingKey, content });

      // Handle different event types
      switch (routingKey) {
        case 'user.sync':
          await this.handleUserSync(content);
          break;
        // Add more event handlers as needed
        default:
          logger.warn('Unknown routing key', { routingKey });
      }

      this.channel.ack(msg);
    } catch (error) {
      logger.error('Error handling message', { error: error.message });
      this.channel.nack(msg);
    }
  }

  async handleUserSync(content) {
    // Handle user synchronization events from other services
    logger.info('Processing user sync event', { content });
  }
}

export default new UserEventSubscriber();