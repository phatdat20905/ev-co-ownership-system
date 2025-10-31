// src/providers/email/smtpClient.js
import nodemailer from 'nodemailer';
import { logger } from '@ev-coownership/shared';

class SMTPClient {
  constructor() {
    this.transporter = null;
    this.isConnected = false;
    this.initialize();
  }

  initialize() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      this.isConnected = true;
      logger.info('SMTP client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize SMTP client', { error: error.message });
      this.isConnected = false;
    }
  }

  async sendEmail(emailData) {
    if (!this.isConnected || !this.transporter) {
      throw new Error('SMTP client not connected');
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { 
        to: emailData.to, 
        messageId: result.messageId 
      });
      
      return result;
    } catch (error) {
      logger.error('Failed to send email', { 
        error: error.message, 
        to: emailData.to 
      });
      throw error;
    }
  }

  async verifyConnection() {
    if (!this.transporter) return false;
    
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('SMTP connection verification failed', { error: error.message });
      return false;
    }
  }
}

export default new SMTPClient();