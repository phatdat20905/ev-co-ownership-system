// src/services/paymentService.js
import { 
  paymentRepository, 
  splitRepository,
  walletRepository,
  eventService 
} from '../repositories/index.js';
import { AppError, logger } from '@ev-coownership/shared';
import momoAdapter from './momoAdapter.js';
import vnpayAdapter from './vnpayAdapter.js';
import vietqrAdapter from './vietqrAdapter.js';

export class PaymentService {
  async createPayment(paymentData, userId) {
    try {
      const { costSplitId, amount, paymentMethod, providerName } = paymentData;

      // Validate cost split
      const costSplit = await splitRepository.findByCostId(costSplitId);
      const split = costSplit.find(s => s.id === costSplitId);
      
      if (!split) {
        throw new AppError('Cost split not found', 404, 'COST_SPLIT_NOT_FOUND');
      }

      if (split.userId !== userId) {
        throw new AppError('Not authorized to pay this cost split', 403, 'PAYMENT_UNAUTHORIZED');
      }

      const remainingAmount = parseFloat(split.splitAmount) - parseFloat(split.paidAmount);
      if (amount > remainingAmount) {
        throw new AppError('Payment amount exceeds remaining balance', 400, 'PAYMENT_AMOUNT_EXCEEDED');
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
        paymentUrl: paymentResult.paymentUrl,
        gatewayResponse: paymentResult
      });

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
      await walletRepository.updateBalance(wallet.id, -amount, transaction);
      
      // Create wallet transaction
      await walletRepository.createTransaction({
        walletId: wallet.id,
        type: 'withdraw',
        amount,
        relatedPaymentId: null, // Will be updated after payment creation
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
        status: 'completed'
      };
    } catch (error) {
      await transaction.rollback();
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
        { verified: true, verifiedAt: new Date() },
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

  async getPaymentSummary(groupId, period) {
    try {
      return await paymentRepository.getPaymentSummary(groupId, period);
    } catch (error) {
      logger.error('PaymentService.getPaymentSummary - Error:', error);
      throw error;
    }
  }
}

export default new PaymentService();