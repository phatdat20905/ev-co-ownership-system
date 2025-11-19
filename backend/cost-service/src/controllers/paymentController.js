// src/controllers/paymentController.js
import paymentService from '../services/paymentService.js';
import { successResponse, logger } from '@ev-coownership/shared';

export class PaymentController {
  async createPayment(req, res, next) {
    try {
      const paymentData = req.body;
      const userId = req.user.id;

      const payment = await paymentService.createPayment(paymentData, userId);

      logger.info('Payment created successfully', { 
        paymentId: payment.id, 
        userId,
        paymentMethod: payment.paymentMethod 
      });

      return successResponse(res, 'Payment created successfully', payment, 201);
    } catch (error) {
      logger.error('Failed to create payment', { 
        error: error.message, 
        userId: req.user?.id,
        paymentData: req.body 
      });
      next(error);
    }
  }

  async getPayment(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const payment = await paymentService.getPayment(id, userId);

      logger.info('Payment retrieved successfully', { paymentId: id, userId });

      return successResponse(res, 'Payment retrieved successfully', payment);
    } catch (error) {
      logger.error('Failed to get payment', { 
        error: error.message, 
        paymentId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getUserPayments(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = req.query;

      const result = await paymentService.getUserPayments(userId, filters);

      logger.info('User payments retrieved successfully', { userId, count: result.payments.length });

      return successResponse(res, 'Payments retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get user payments', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getPaymentSummary(req, res, next) {
    try {
      const { groupId } = req.params;
      const { period = 'month' } = req.query;
      const userId = req.user.id;

      const summary = await paymentService.getPaymentSummary(groupId, period);

      logger.info('Payment summary retrieved successfully', { groupId, period, userId });

      return successResponse(res, 'Payment summary retrieved successfully', summary);
    } catch (error) {
      logger.error('Failed to get payment summary', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getPaymentFees(req, res, next) {
    try {
      const fees = await paymentService.getPaymentFees();

      logger.info('Payment fees retrieved', { userId: req.user?.id });
      return successResponse(res, 'Payment fees retrieved successfully', fees);
    } catch (error) {
      logger.error('Failed to get payment fees', { error: error.message, userId: req.user?.id });
      next(error);
    }
  }

  async schedulePayment(req, res, next) {
    try {
      const scheduleData = req.body;
      const userId = req.user.id;

      const payment = await paymentService.schedulePayment(scheduleData, userId);

      logger.info('Payment scheduled', { paymentId: payment.id, userId });
      return successResponse(res, 'Payment scheduled successfully', payment, 201);
    } catch (error) {
      logger.error('Failed to schedule payment', { error: error.message, userId: req.user?.id, body: req.body });
      next(error);
    }
  }

  async setupAutoPayment(req, res, next) {
    try {
      const setupData = req.body;
      const userId = req.user.id;

      const saved = await paymentService.setupAutoPayment(setupData, userId);

      logger.info('Auto-payment setup saved', { userId, provider: saved.providerName });
      return successResponse(res, 'Auto-payment setup saved', saved);
    } catch (error) {
      logger.error('Failed to save auto-payment setup', { error: error.message, userId: req.user?.id, body: req.body });
      next(error);
    }
  }

  async processMoMoWebhook(req, res, next) {
    try {
      const webhookData = req.body;

      const result = await paymentService.processPaymentWebhook('momo', webhookData);

      logger.info('MoMo webhook processed successfully', { 
        transactionId: result.transactionId,
        success: result.success 
      });

      return successResponse(res, 'Webhook processed successfully', result);
    } catch (error) {
      logger.error('Failed to process MoMo webhook', { 
        error: error.message, 
        webhookData: req.body 
      });
      next(error);
    }
  }

  async processVNPayReturn(req, res, next) {
    try {
      const returnData = req.query;

      const result = await paymentService.processPaymentWebhook('vnpay', returnData);

      logger.info('VNPay return processed successfully', { 
        transactionId: result.transactionId,
        success: result.success 
      });

      // Redirect to frontend with payment status
      const redirectUrl = `${process.env.FRONTEND_URL}/payments/result?status=${result.success ? 'success' : 'failed'}&transactionId=${result.transactionId}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Failed to process VNPay return', { 
        error: error.message, 
        returnData: req.query 
      });
      const redirectUrl = `${process.env.FRONTEND_URL}/payments/result?status=error`;
      return res.redirect(redirectUrl);
    }
  }

  async processVNPayIPN(req, res, next) {
    try {
      const ipnData = req.body;

      const result = await paymentService.processPaymentWebhook('vnpay', ipnData);

      logger.info('VNPay IPN processed successfully', { 
        transactionId: result.transactionId,
        success: result.success 
      });

      // VNPay expects specific response format
      return res.status(200).json({ 
        RspCode: '00', 
        Message: 'Success' 
      });
    } catch (error) {
      logger.error('Failed to process VNPay IPN', { 
        error: error.message, 
        ipnData: req.body 
      });
      // VNPay expects specific error format
      return res.status(200).json({ 
        RspCode: '99', 
        Message: 'Failed' 
      });
    }
  }

  async processVietQRWebhook(req, res, next) {
    try {
      const webhookData = req.body;

      const result = await paymentService.processPaymentWebhook('vietqr', webhookData);

      logger.info('VietQR webhook processed successfully', { 
        transactionId: result.transactionId,
        success: result.success 
      });

      return successResponse(res, 'Webhook processed successfully', result);
    } catch (error) {
      logger.error('Failed to process VietQR webhook', { 
        error: error.message, 
        webhookData: req.body 
      });
      next(error);
    }
  }
}

export default new PaymentController();