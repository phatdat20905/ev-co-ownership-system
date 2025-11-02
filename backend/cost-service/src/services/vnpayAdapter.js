// src/services/vnpayAdapter.js
import crypto from 'crypto';
import querystring from 'querystring';
import { AppError, logger } from '@ev-coownership/shared';

class VNPayAdapter {
  constructor() {
    this.tmnCode = process.env.VNPAY_TMNCODE;
    this.hashSecret = process.env.VNPAY_HASHSECRET;
    this.baseUrl = process.env.VNPAY_URL;
    this.returnUrl = process.env.VNPAY_RETURN_URL;
    this.ipnUrl = process.env.VNPAY_IPN_URL;
  }

  // Helper method to format date (thay thế Date.prototype)
  formatDate(date, format) {
    const pad = (n) => n.toString().padStart(2, '0');
    
    return format
      .replace('YYYY', date.getFullYear())
      .replace('MM', pad(date.getMonth() + 1))
      .replace('DD', pad(date.getDate()))
      .replace('HH', pad(date.getHours()))
      .replace('mm', pad(date.getMinutes()))
      .replace('ss', pad(date.getSeconds()));
  }

  generateSignature(data) {
    const sortedData = Object.keys(data)
      .filter(key => data[key] !== '' && data[key] !== null && data[key] !== undefined)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    return crypto
      .createHmac('sha512', this.hashSecret)
      .update(sortedData)
      .digest('hex');
  }

  async createPayment(paymentData) {
    try {
      const { amount, orderDescription, extraData } = paymentData;
      
      const date = new Date();
      const createDate = this.formatDate(date, 'YYYYMMDDHHmmss');
      const orderId = date.getTime().toString();
      const transactionId = `${this.tmnCode}${orderId}`;

      const vnpParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.tmnCode,
        vnp_Amount: amount * 100, // VNPay expects amount in VND subunits
        vnp_BankCode: '',
        vnp_CreateDate: createDate,
        vnp_CurrCode: 'VND',
        vnp_IpAddr: '127.0.0.1', // In production, this should be the client IP
        vnp_Locale: 'vn',
        vnp_OrderInfo: orderDescription,
        vnp_OrderType: 'billpayment',
        vnp_ReturnUrl: this.returnUrl,
        vnp_TxnRef: orderId,
        vnp_ExpireDate: this.formatDate(new Date(date.getTime() + 15 * 60 * 1000), 'YYYYMMDDHHmmss') // 15 minutes
      };

      if (extraData) {
        vnpParams.vnp_ExtraData = Buffer.from(JSON.stringify(extraData)).toString('base64');
      }

      // Generate signature
      vnpParams.vnp_SecureHash = this.generateSignature(vnpParams);

      const paymentUrl = `${this.baseUrl}?${querystring.stringify(vnpParams)}`;

      logger.info('VNPay payment URL generated', { orderId, amount });

      return {
        paymentUrl,
        transactionId,
        orderRef: orderId
      };
    } catch (error) {
      logger.error('VNPayAdapter.createPayment - Error:', error);
      throw new AppError('Failed to create VNPay payment', 500, 'VNPAY_PAYMENT_ERROR');
    }
  }

  verifyReturn(returnData) {
    try {
      const { vnp_SecureHash, ...dataToVerify } = returnData;
      
      // Remove secure hash for verification
      delete dataToVerify.vnp_SecureHash;
      
      const calculatedHash = this.generateSignature(dataToVerify);
      
      if (vnp_SecureHash !== calculatedHash) {
        throw new AppError('Invalid VNPay return signature', 400, 'INVALID_VNPAY_SIGNATURE');
      }

      const responseCode = returnData.vnp_ResponseCode;
      const success = responseCode === '00';

      return {
        success,
        transactionId: returnData.vnp_TransactionNo,
        amount: parseInt(returnData.vnp_Amount) / 100, // Convert back to VND
        orderId: returnData.vnp_TxnRef,
        bankCode: returnData.vnp_BankCode,
        cardType: returnData.vnp_CardType,
        payDate: returnData.vnp_PayDate,
        responseCode
      };
    } catch (error) {
      logger.error('VNPayAdapter.verifyReturn - Error:', error);
      throw error;
    }
  }

  async verifyIPN(ipnData) {
    try {
      const { vnp_SecureHash, ...dataToVerify } = ipnData;
      
      const calculatedHash = this.generateSignature(dataToVerify);
      
      if (vnp_SecureHash !== calculatedHash) {
        throw new AppError('Invalid VNPay IPN signature', 400, 'INVALID_VNPAY_IPN_SIGNATURE');
      }

      const responseCode = ipnData.vnp_ResponseCode;
      const success = responseCode === '00';

      let extraData = null;
      if (ipnData.vnp_ExtraData) {
        try {
          extraData = JSON.parse(Buffer.from(ipnData.vnp_ExtraData, 'base64').toString());
        } catch (e) {
          logger.warn('Failed to parse VNPay extra data', { error: e.message });
        }
      }

      return {
        success,
        transactionId: ipnData.vnp_TransactionNo,
        amount: parseInt(ipnData.vnp_Amount) / 100,
        orderId: ipnData.vnp_TxnRef,
        responseCode,
        extraData
      };
    } catch (error) {
      logger.error('VNPayAdapter.verifyIPN - Error:', error);
      throw error;
    }
  }
}

export default new VNPayAdapter();