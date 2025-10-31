// src/config/config.js
import dotenv from 'dotenv';
dotenv.config();

const commonConfig = {
  dialect: 'postgres',
  port: process.env.DB_PORT || 5436,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 10000
  },
};

export default {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    database: process.env.DB_NAME || 'vehicle_db',
    host: process.env.DB_HOST || 'localhost',
    logging: console.log,
    ...commonConfig,
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    database: process.env.DB_NAME || 'vehicle_db_test',
    host: process.env.DB_HOST || 'localhost',
    logging: false,
    ...commonConfig,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
    },
    ...commonConfig,
  },
};