// src/services/momoAdapter.js
import crypto from 'crypto';
import axios from 'axios';
import { AppError, logger } from '@ev-coownership/shared';

class MoMoAdapter {
  constructor() {
    this.partnerCode = process.env.MOMO_PARTNER_CODE;
    this.accessKey = process.env.MOMO_ACCESS_KEY;
    this.secretKey = process.env.MOMO_SECRET_KEY;
    this.endpoint = process.env.MOMO_ENDPOINT;
  }

  generateSignature(rawSignature) {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  async createPayment(paymentData) {
    try {
      const { amount, orderInfo, extraData } = paymentData;
      
      const requestId = this.partnerCode + new Date().getTime();
      const orderId = requestId;
      const requestType = 'captureWallet';
      const redirectUrl = `${process.env.FRONTEND_URL}/payments/callback`;
      const ipnUrl = `${process.env.COST_SERVICE_URL || 'http://localhost:3005'}/payments/webhook/momo`; // THÊM FALLBACK
      
      const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      
      const signature = this.generateSignature(rawSignature);

      const requestBody = {
        partnerCode: this.partnerCode,
        partnerName: "EV Co-ownership System",
        storeId: this.partnerCode,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang: 'vi',
        extraData: extraData ? JSON.stringify(extraData) : '', // SỬA: stringify extraData
        requestType,
        signature
      };

      logger.info('Creating MoMo payment', { orderId, amount });

      const response = await axios.post(this.endpoint, requestBody, {
        timeout: parseInt(process.env.MOMO_TIMEOUT) || 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.resultCode !== 0) {
        throw new AppError(
          `MoMo payment creation failed: ${response.data.message}`,
          400,
          'MOMO_PAYMENT_FAILED'
        );
      }

      return {
        paymentUrl: response.data.payUrl,
        transactionId: response.data.transId,
        orderRef: orderId,
        deeplink: response.data.deeplink,
        qrCodeUrl: response.data.qrCodeUrl
      };
    } catch (error) {
      logger.error('MoMoAdapter.createPayment - Error:', error);
      
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        'Failed to create MoMo payment',
        500,
        'MOMO_SERVICE_ERROR'
      );
    }
  }

  async verifyWebhook(webhookData) {
    try {
      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature
      } = webhookData;

      // Verify signature
      const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${this.partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
      
      const expectedSignature = this.generateSignature(rawSignature);

      if (signature !== expectedSignature) {
        throw new AppError('Invalid MoMo webhook signature', 400, 'INVALID_SIGNATURE');
      }

      const success = resultCode === 0;

      // Parse extraData safely
      let parsedExtraData = null;
      if (extraData) {
        try {
          parsedExtraData = JSON.parse(extraData);
        } catch (e) {
          logger.warn('Failed to parse MoMo extra data', { error: e.message });
        }
      }

      return {
        success,
        transactionId: transId,
        amount: parseInt(amount),
        orderId,
        message,
        extraData: parsedExtraData
      };
    } catch (error) {
      logger.error('MoMoAdapter.verifyWebhook - Error:', error);
      throw error;
    }
  }

  async checkPaymentStatus(orderId) {
    try {
      const rawSignature = `accessKey=${this.accessKey}&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${orderId}`;
      const signature = this.generateSignature(rawSignature);

      const requestBody = {
        partnerCode: this.partnerCode,
        orderId,
        requestId: orderId,
        lang: 'vi',
        signature
      };

      const response = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/query',
        requestBody,
        {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return {
        success: response.data.resultCode === 0,
        transactionId: response.data.transId,
        amount: response.data.amount,
        status: response.data.resultCode === 0 ? 'completed' : 'failed'
      };
    } catch (error) {
      logger.error('MoMoAdapter.checkPaymentStatus - Error:', error);
      throw new AppError('Failed to check MoMo payment status', 500, 'MOMO_STATUS_CHECK_ERROR');
    }
  }
}

export default new MoMoAdapter();