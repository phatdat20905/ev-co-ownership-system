// src/providers/email/emailProvider.js
import smtpClient from './smtpClient.js';
import { logger } from '@ev-coownership/shared';

class EmailProvider {
  constructor() {
    this.name = 'email';
  }

  async send(notification) {
    try {
      const emailData = {
        to: notification.metadata?.email || notification.userId, // In real app, get email from user service
        subject: notification.title,
        html: this.formatEmailHTML(notification),
        text: notification.message,
      };

      const result = await smtpClient.sendEmail(emailData);
      
      return {
        success: true,
        provider: this.name,
        messageId: result.messageId,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Email provider failed to send notification', {
        notificationId: notification.id,
        error: error.message,
      });
      
      return {
        success: false,
        provider: this.name,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  formatEmailHTML(notification) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>EV Co-ownership</h1>
          </div>
          <div class="content">
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
            ${notification.metadata?.actionUrl ? 
              `<a href="${notification.metadata.actionUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Details</a>` : ''}
          </div>
          <div class="footer">
            <p>&copy; 2024 EV Co-ownership System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async healthCheck() {
    const isConnected = await smtpClient.verifyConnection();
    return {
      healthy: isConnected,
      provider: this.name,
    };
  }
}

export default new EmailProvider();