// src/config/database.js
import { Sequelize } from 'sequelize';
import config from './config.js';
import { logger } from '@ev-coownership/shared';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    // logging: env === 'development' ? (msg) => logger.debug(msg) : false,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions,
  }
);

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Cost Service Database connection established successfully.');

    if (env === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('🗂 Cost Service Database synced successfully (dev mode).');
    }
  } catch (error) {
    logger.error('❌ Cost Service Unable to connect to the database:', error);
    throw error;
  }
};

export { sequelize };
export default sequelize;