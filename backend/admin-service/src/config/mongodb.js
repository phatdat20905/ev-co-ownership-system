import { MongoClient } from 'mongodb';
import { logger } from '@ev-coownership/shared';

class MongoDBClient {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://admin:admin123@localhost:27017/admin_analytics';

    try {
      logger.info(`🚀 Connecting to MongoDB at: ${mongoUrl}`);

      this.client = new MongoClient(mongoUrl, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();

      // ✅ Lấy db từ URL (nếu có), fallback về admin_analytics
      const dbName = this.client.options.dbName || 'admin_analytics';
      this.db = this.client.db(dbName);
      this.isConnected = true;

      logger.info(`✅ MongoDB connected successfully → Database: ${dbName}`);
    } catch (error) {
      logger.error('❌ Failed to connect to MongoDB:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      logger.info('🔌 MongoDB disconnected');
    }
  }

  getCollection(name) {
    if (!this.isConnected || !this.db) {
      throw new Error('MongoDB not connected');
    }
    return this.db.collection(name);
  }

  async healthCheck() {
    try {
      if (!this.isConnected) return { healthy: false, error: 'Not connected' };
      await this.db.command({ ping: 1 });
      return { healthy: true, service: 'mongodb' };
    } catch (error) {
      return { healthy: false, service: 'mongodb', error: error.message };
    }
  }
}

export const mongoDBClient = new MongoDBClient();
export default mongoDBClient;
