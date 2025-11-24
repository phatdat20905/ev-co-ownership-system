// src/services/paymentService.js
import { 
  paymentRepository, 
  splitRepository,
  walletRepository,
} from '../repositories/index.js';
import { AppError, logger } from '@ev-coownership/shared';
import momoAdapter from './momoAdapter.js';
import vnpayAdapter from './vnpayAdapter.js';
import vietqrAdapter from './vietqrAdapter.js';
import eventService from './eventService.js';
import db from '../models/index.js'; // THÊM DÒNG NÀY
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class PaymentService {
  async createPayment(paymentData, userId) {
    try {
      const { costSplitId, amount, paymentMethod, providerName } = paymentData;

      // Validate cost split exists and belongs to user
      const split = await splitRepository.findById(costSplitId);
      
      if (split.userId !== userId) {
        throw new AppError('Not authorized to pay this cost split', 403, 'PAYMENT_UNAUTHORIZED');
      }

      const remainingAmount = parseFloat(split.splitAmount) - parseFloat(split.paidAmount || 0);
      if (amount > remainingAmount) {
        throw new AppError(`Payment amount exceeds remaining balance. Remaining: ${remainingAmount}`, 400, 'PAYMENT_AMOUNT_EXCEEDED');
      }

      let paymentResult;

      // Handle different payment methods
      switch (paymentMethod) {
        case 'internal_wallet':
          paymentResult = await this.processInternalWalletPayment(userId, amount, costSplitId);
          break;
        
        case 'e_wallet':
          paymentResult = await momoAdapter.createPayment({
            amount,
            orderInfo: `Payment for cost split ${costSplitId}`,
            extraData: { costSplitId, userId }
          });
          break;
        
        case 'vnpay':
          paymentResult = await vnpayAdapter.createPayment({
            amount,
            orderDescription: `Payment for cost split ${costSplitId}`,
            extraData: { costSplitId, userId }
          });
          break;
        
        case 'bank_transfer':
          paymentResult = await vietqrAdapter.generateQRCode({
            amount,
            description: `Payment for cost split ${costSplitId}`,
            extraData: { costSplitId, userId }
          });
          break;
        
        default:
          throw new AppError('Unsupported payment method', 400, 'UNSUPPORTED_PAYMENT_METHOD');
      }

      // Create payment record
      const payment = await paymentRepository.create({
        costSplitId,
        userId,
        amount,
        paymentMethod,
        providerName: providerName || paymentMethod,
        paymentStatus: paymentMethod === 'internal_wallet' ? 'completed' : 'pending',
        transactionId: paymentResult.transactionId,
        orderRef: paymentResult.orderRef,
        paymentUrl: paymentResult.paymentUrl || paymentResult.qrCodeUrl, // Handle both URL types
        gatewayResponse: paymentResult
      });

      // If internal wallet payment, update related payment ID
      if (paymentMethod === 'internal_wallet' && paymentResult.transactionId) {
        // Find the wallet transaction and update it with payment ID
        // This would require additional wallet service method
      }

      // Publish event
      await eventService.publishPaymentInitiated({
        paymentId: payment.id,
        userId,
        amount,
        paymentMethod,
        costSplitId
      });

      logger.info('Payment created successfully', { paymentId: payment.id, paymentMethod });
      return payment;
    } catch (error) {
      logger.error('PaymentService.createPayment - Error:', error);
      throw error;
    }
  }

  async processInternalWalletPayment(userId, amount, costSplitId) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Get user wallet
      const wallet = await walletRepository.findByUserId(userId);
      
      // Check balance
      if (parseFloat(wallet.balance) < amount) {
        throw new AppError('Insufficient wallet balance', 400, 'INSUFFICIENT_WALLET_BALANCE');
      }

      // Deduct from wallet
      const updatedWallet = await walletRepository.updateBalance(wallet.id, -amount, transaction);
      
      // Create wallet transaction first without relatedPaymentId
      const walletTransaction = await walletRepository.createTransaction({
        walletId: wallet.id,
        type: 'withdraw',
        amount,
        description: `Payment for cost split ${costSplitId}`
      }, transaction);

      // Update cost split status
      const split = await splitRepository.updateSplitStatus(
        costSplitId, 
        'paid', 
        amount, 
        transaction
      );

      await transaction.commit();

      return {
        transactionId: `wallet_${Date.now()}`,
        status: 'completed',
        walletTransactionId: walletTransaction.id
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('Internal wallet payment failed', { userId, amount, costSplitId, error: error.message });
      throw error;
    }
  }

  async processPaymentWebhook(provider, webhookData) {
    try {
      let payment;
      
      switch (provider) {
        case 'momo':
          payment = await momoAdapter.verifyWebhook(webhookData);
          break;
        
        case 'vnpay':
          payment = await vnpayAdapter.verifyIPN(webhookData);
          break;
        
        case 'vietqr':
          payment = await vietqrAdapter.verifyWebhook(webhookData);
          break;
        
        default:
          throw new AppError('Unsupported payment provider', 400, 'UNSUPPORTED_PROVIDER');
      }

      if (payment.success) {
        await this.completePayment(payment.transactionId, payment.amount);
      }

      // Publish webhook event
      await eventService.publishPaymentWebhookReceived({
        provider,
        transactionId: payment.transactionId,
        success: payment.success,
        amount: payment.amount
      });

      return payment;
    } catch (error) {
      logger.error('PaymentService.processPaymentWebhook - Error:', error);
      throw error;
    }
  }

  async completePayment(transactionId, amount) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const payment = await paymentRepository.findByTransactionId(transactionId);
      
      if (!payment) {
        throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
      }

      if (payment.paymentStatus === 'completed') {
        return payment; // Already processed
      }

      // Update payment status
      const updatedPayment = await paymentRepository.updateStatus(
        payment.id, 
        'completed', 
        { 
          verified: true, 
          verifiedAt: new Date(),
          paymentDate: new Date()
        },
        transaction
      );

      // Update cost split
      await splitRepository.updateSplitStatus(
        payment.costSplitId,
        'paid',
        amount,
        transaction
      );

      await transaction.commit();

      // Publish completion event
      await eventService.publishPaymentCompleted({
        paymentId: payment.id,
        userId: payment.userId,
        amount: payment.amount,
        costSplitId: payment.costSplitId
      });

      logger.info('Payment completed successfully', { paymentId: payment.id });
      return updatedPayment;
    } catch (error) {
      await transaction.rollback();
      logger.error('Payment completion failed', { transactionId, error: error.message });
      throw error;
    }
  }

  async getUserPayments(userId, filters) {
    try {
      return await paymentRepository.findByUserId(userId, filters);
    } catch (error) {
      logger.error('PaymentService.getUserPayments - Error:', error);
      throw error;
    }
  }

  // Return a single payment by id, ensure the requesting user is authorized to view it
  async getPayment(id, userId) {
    try {
      const payment = await paymentRepository.findById(id);
      // Authorization: allow owner of payment or admins (admin check omitted here — add if needed)
      if (payment.userId !== userId) {
        throw new AppError('Not authorized to view this payment', 403, 'PAYMENT_VIEW_UNAUTHORIZED');
      }
      return payment;
    } catch (error) {
      logger.error('PaymentService.getPayment - Error:', error);
      throw error;
    }
  }

  async getPaymentSummary(groupId, period) {
    try {
      return await paymentRepository.getPaymentSummary(groupId, period);
    } catch (error) {
      logger.error('PaymentService.getPaymentSummary - Error:', error);
      throw error;
    }
  }

  /**
   * Return payment provider fee configuration.
   * For now this is static — can be loaded from env or DB later.
   */
  async getPaymentFees() {
    try {
      const fees = {
        currency: 'VND',
        providers: [
          { name: 'momo', label: 'MoMo', feePercent: 0.02, fixedFee: 1000 },
          { name: 'vnpay', label: 'VNPay', feePercent: 0.015, fixedFee: 500 },
          { name: 'vietqr', label: 'VietQR/Bank Transfer', feePercent: 0.005, fixedFee: 0 }
        ]
      };

      return fees;
    } catch (error) {
      logger.error('PaymentService.getPaymentFees - Error:', error);
      throw error;
    }
  }

  /**
   * Schedule a payment to be executed later. This will create a Payment record with
   * paymentStatus set to 'pending' and a gatewayResponse.schedule meta so the
   * scheduler (cron/job) can pick it up later. No schema migration required.
   */
  async schedulePayment(scheduleData, userId) {
    try {
      const { costSplitId, amount, scheduleAt, paymentMethod, providerName } = scheduleData;

      // Basic validations: cost split ownership & amount checks
      const split = await splitRepository.findById(costSplitId);
      if (split.userId !== userId) throw new AppError('Not authorized to schedule this payment', 403, 'SCHEDULE_UNAUTHORIZED');

      const remainingAmount = parseFloat(split.splitAmount) - parseFloat(split.paidAmount || 0);
      if (amount > remainingAmount) {
        throw new AppError(`Scheduled amount exceeds remaining balance. Remaining: ${remainingAmount}`, 400, 'SCHEDULE_AMOUNT_EXCEEDED');
      }

      const txnId = `SCHED-${Date.now()}`;

      const payment = await paymentRepository.create({
        costSplitId,
        userId,
        amount,
        paymentMethod: paymentMethod || 'bank_transfer',
        providerName: providerName || 'scheduled',
        paymentStatus: 'pending',
        transactionId: txnId,
        gatewayResponse: { scheduled: true, scheduleAt, scheduledBy: userId }
      });

      // Note: actual scheduled execution should be handled by a background job/cron
      return payment;
    } catch (error) {
      logger.error('PaymentService.schedulePayment - Error:', error);
      throw error;
    }
  }

  /**
   * Save auto-payment setup for a user (dev-friendly JSON persistence).
   * This is intentionally simple: stores per-user config in src/data/autoPaymentSetups.json
   */
  async setupAutoPayment(setupData, userId) {
    try {
      const { providerName, providerConfig = {}, enabled = true } = setupData;

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const filePath = path.join(__dirname, '../data/autoPaymentSetups.json');

      let existing = {};
      try {
        const raw = await readFile(filePath, 'utf8');
        existing = raw ? JSON.parse(raw) : {};
      } catch (err) {
        // If file doesn't exist or is malformed, start with empty object
        existing = {};
      }

      existing[userId] = {
        providerName,
        providerConfig,
        enabled,
        updatedAt: new Date().toISOString()
      };

      await writeFile(filePath, JSON.stringify(existing, null, 2), 'utf8');

      return existing[userId];
    } catch (error) {
      logger.error('PaymentService.setupAutoPayment - Error:', error);
      throw error;
    }
  }
}

export default new PaymentService();