import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

export class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });

      logger.info('Email transporter initialized');
    } catch (error) {
      logger.error('Failed to initialize email transporter', { error: error.message });
    }
  }

  async sendVerificationEmail(email, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - EV Co-ownership',
      html: this.getVerificationEmailTemplate(verificationUrl)
    };

    return await this.sendEmail(mailOptions);
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request - EV Co-ownership',
      html: this.getPasswordResetEmailTemplate(resetUrl)
    };

    return await this.sendEmail(mailOptions);
  }

  getVerificationEmailTemplate(verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .button { background: #007bff; color: white; padding: 12px 24px; 
                   text-decoration: none; border-radius: 4px; display: inline-block; }
          .footer { padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>EV Co-ownership</h1>
          </div>
          <div class="content">
            <h2>Email Verification</h2>
            <p>Welcome to EV Co-ownership! Please verify your email address to complete your registration.</p>
            <p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetEmailTemplate(resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .button { background: #dc3545; color: white; padding: 12px 24px; 
                   text-decoration: none; border-radius: 4px; display: inline-block; }
          .footer { padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>EV Co-ownership</h1>
          </div>
          <div class="content">
            <h2>Password Reset</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <p>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>EV Co-ownership Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendEmail(mailOptions) {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }

      // Don't send emails in test environment
      if (process.env.NODE_ENV === 'test') {
        logger.info('Email sending skipped in test environment', {
          to: mailOptions.to,
          subject: mailOptions.subject
        });
        return { messageId: 'test-mode' };
      }

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      return info;
    } catch (error) {
      logger.error('Failed to send email', {
        error: error.message,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      throw error;
    }
  }

  async verifyConnection() {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }
      await this.transporter.verify();
      logger.info('Email transporter connection verified');
      return true;
    } catch (error) {
      logger.error('Email transporter connection failed', { error: error.message });
      return false;
    }
  }
}

export default new EmailService();