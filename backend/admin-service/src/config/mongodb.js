// src/config/mongodb.js
import { MongoClient } from 'mongodb';
import { logger } from '@ev-coownership/shared';

class MongoDBClient {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const mongoUrl = process.env.MONGODB_URL || 'mongodb://admin:admin123@localhost:27017';
      
      this.client = new MongoClient(mongoUrl, {
        maxPoolSize: 10,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db('admin_analytics');
      this.isConnected = true;
      
      logger.info('✅ MongoDB connected successfully for Admin Service');
    } catch (error) {
      logger.error('❌ Failed to connect to MongoDB:', error);
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

  getCollection(collectionName) {
    if (!this.isConnected || !this.db) {
      throw new Error('MongoDB not connected');
    }
    return this.db.collection(collectionName);
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