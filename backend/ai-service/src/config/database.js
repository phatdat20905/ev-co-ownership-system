import mongoose from 'mongoose';
import { logger } from '@ev-coownership/shared';

class Database {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        return;
      }

      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      await mongoose.connect(process.env.MONGODB_URL, options);
      
      this.isConnected = true;
      logger.info('✅ MongoDB connected successfully for AI Service');

      // Event listeners
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error', { error: error.message });
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      logger.error('❌ MongoDB connection failed', { error: error.message });
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting MongoDB', { error: error.message });
      throw error;
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { healthy: false, service: 'mongodb', error: 'Not connected' };
      }

      // Simple ping to check connection
      await mongoose.connection.db.admin().ping();
      return { healthy: true, service: 'mongodb' };
    } catch (error) {
      return { 
        healthy: false, 
        service: 'mongodb', 
        error: error.message 
      };
    }
  }
}

export default new Database();