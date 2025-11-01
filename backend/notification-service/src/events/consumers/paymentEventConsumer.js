// src/events/consumers/paymentEventConsumer.js
import notificationService from '../../services/notificationService.js';
import { logger } from '@ev-coownership/shared';

class PaymentEventConsumer {
  async handlePaymentSuccess(paymentData) {
    try {
      logger.info('Processing payment success event', { 
        paymentId: paymentData.paymentId,
        userId: paymentData.userId,
      });

      await notificationService.sendTemplateNotification('payment_success', paymentData.userId, {
        user_name: paymentData.userName || 'there',
        amount: this.formatCurrency(paymentData.amount),
        payment_date: this.formatDate(paymentData.paymentDate),
        purpose: paymentData.purpose || 'Payment',
      });

      logger.info('Payment success notification sent', { 
        paymentId: paymentData.paymentId,
        userId: paymentData.userId,
      });
    } catch (error) {
      logger.error('Failed to process payment success event', {
        paymentId: paymentData.paymentId,
        error: error.message,
      });
    }
  }

  async handlePaymentFailed(paymentData) {
    try {
      logger.info('Processing payment failed event', { 
        paymentId: paymentData.paymentId,
        userId: paymentData.userId,
      });

      await notificationService.sendTemplateNotification('payment_failed', paymentData.userId, {
        user_name: paymentData.userName || 'there',
        amount: this.formatCurrency(paymentData.amount),
        failure_reason: paymentData.failureReason || 'Unknown reason',
      });

      logger.info('Payment failed notification sent', { 
        paymentId: paymentData.paymentId,
        userId: paymentData.userId,
      });
    } catch (error) {
      logger.error('Failed to process payment failed event', {
        paymentId: paymentData.paymentId,
        error: error.message,
      });
    }
  }

  async handleInvoiceGenerated(invoiceData) {
    try {
      logger.info('Processing invoice generated event', { 
        invoiceId: invoiceData.invoiceId,
        userId: invoiceData.userId,
      });

      await notificationService.sendTemplateNotification('invoice_generated', invoiceData.userId, {
        user_name: invoiceData.userName || 'there',
        invoice_number: invoiceData.invoiceNumber,
        total_amount: this.formatCurrency(invoiceData.totalAmount),
        period: `${this.formatDate(invoiceData.periodStart)} - ${this.formatDate(invoiceData.periodEnd)}`,
      });

      logger.info('Invoice generated notification sent', { 
        invoiceId: invoiceData.invoiceId,
        userId: invoiceData.userId,
      });
    } catch (error) {
      logger.error('Failed to process invoice generated event', {
        invoiceId: invoiceData.invoiceId,
        error: error.message,
      });
    }
  }

  formatCurrency(amount) {
    if (!amount) return '0 VND';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  }
}

export default new PaymentEventConsumer();