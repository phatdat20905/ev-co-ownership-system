// src/config/smtp.js
import nodemailer from 'nodemailer';
import { logger } from '@ev-coownership/shared';

const initializeSMTP = () => {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    logger.info('SMTP transporter initialized successfully');
    return transporter;
  } catch (error) {
    logger.error('Failed to initialize SMTP transporter', { error: error.message });
    return null;
  }
};

export default initializeSMTP;