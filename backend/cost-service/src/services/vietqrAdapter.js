// src/services/vietqrAdapter.js
import crypto from 'crypto';
import { AppError, logger } from '@ev-coownership/shared';

class VietQRAdapter {
  constructor() {
    this.bankId = process.env.VIETQR_BANK_ID;
    this.accountNo = process.env.VIETQR_ACCOUNT_NO;
    this.accountName = process.env.VIETQR_ACCOUNT_NAME;
    this.secretKey = process.env.VIETQR_SECRET_KEY || null;
    this.template = process.env.VIETQR_TEMPLATE || 'compact2';
    this.baseUrl = process.env.VIETQR_BASE_URL || 'https://img.vietqr.io';
  }

  /**
   * Generate static QR code (public VietQR image link)
   */
  generateQRCode(paymentData) {
    try {
      const { amount, description = 'EV Co-ownership Payment' } = paymentData;

      if (!amount || amount <= 0) {
        throw new AppError('Invalid payment amount', 400, 'INVALID_VIETQR_AMOUNT');
      }

      const qrCodeUrl = `${this.baseUrl}/image/${this.bankId}-${this.accountNo}-${this.template}.jpg` +
        `?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(this.accountName)}`;

      logger.info('✅ VietQR code generated', { amount, description, qrCodeUrl });

      return {
        qrCodeUrl,
        bankId: this.bankId,
        accountNo: this.accountNo,
        accountName: this.accountName,
        amount,
        description
      };
    } catch (error) {
      logger.error('❌ VietQRAdapter.generateQRCode - Error:', error);
      throw new AppError('Failed to generate VietQR code', 500, 'VIETQR_GENERATION_ERROR');
    }
  }

  /**
   * Generate simple checksum (optional, only if secret key exists)
   */
  generateSignature(data) {
    if (!this.secretKey) return null; // no signature needed in demo mode

    const rawString = `${data.transactionId}${data.amount}${data.timestamp}${this.secretKey}`;
    return crypto.createHash('sha256').update(rawString).digest('hex');
  }

  /**
   * Verify webhook (mock for dev, real check for production)
   */
  async verifyWebhook(webhookData) {
    try {
      if (!this.secretKey) {
        logger.warn('⚠️ VietQR webhook verification skipped (no secret key in dev mode)');
        return { success: true, mock: true };
      }

      const { signature } = webhookData;
      const expectedSignature = this.generateSignature(webhookData);

      if (signature !== expectedSignature) {
        throw new AppError('Invalid VietQR signature', 400, 'INVALID_VIETQR_SIGNATURE');
      }

      // Optional: integrate actual bank validation here
      return { success: true, validated: true };
    } catch (error) {
      logger.error('❌ VietQRAdapter.verifyWebhook - Error:', error);
      throw error;
    }
  }

  /**
   * Helper - return transfer instruction for manual payment
   */
  generateTransferInstructions(amount, description) {
    const qrUrl = `${this.baseUrl}/image/${this.bankId}-${this.accountNo}-${this.template}.jpg` +
      `?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(this.accountName)}`;

    return {
      bank: this.getBankName(this.bankId),
      accountNumber: this.accountNo,
      accountName: this.accountName,
      amount,
      description,
      qrCodeUrl: qrUrl
    };
  }

  /**
   * Basic mapping of popular banks (for display)
   */
  getBankName(bankId) {
    const bankNames = {
      '970436': 'TPBank',
      '970405': 'Vietcombank',
      '970407': 'VietinBank',
      '970416': 'MB Bank',
      '970418': 'BIDV'
    };
    return bankNames[bankId] || 'Ngân hàng';
  }
}

export default new VietQRAdapter();
