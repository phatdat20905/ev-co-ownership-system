// src/services/vietqrAdapter.js
import crypto from 'crypto';
import { AppError, logger } from '@ev-coownership/shared';

class VietQRAdapter {
  constructor() {
    this.bankId = process.env.VIETQR_BANK_ID;
    this.accountNo = process.env.VIETQR_ACCOUNT_NO;
    this.accountName = process.env.VIETQR_ACCOUNT_NAME;
    this.template = 'compact2';
  }

  generateQRCode(paymentData) {
    try {
      const { amount, description, extraData } = paymentData;
      
      // VietQR format based on bank's specification
      const qrData = {
        bank: this.bankId,
        account: this.accountNo,
        amount: amount,
        memo: description || 'EV Co-ownership Payment',
        template: this.template
      };

      // Generate QR code string
      const qrString = this.buildQRString(qrData);
      
      // Generate actual QR code URL using VietQR service
      const qrCodeUrl = `https://img.vietqr.io/image/${this.bankId}-${this.accountNo}-${this.template}.jpg?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(this.accountName)}`;

      logger.info('VietQR code generated', { amount, description });

      return {
        qrCodeUrl,
        qrString,
        bankId: this.bankId,
        accountNo: this.accountNo,
        accountName: this.accountName,
        amount,
        description
      };
    } catch (error) {
      logger.error('VietQRAdapter.generateQRCode - Error:', error);
      throw new AppError('Failed to generate VietQR code', 500, 'VIETQR_GENERATION_ERROR');
    }
  }

  buildQRString(qrData) {
    try {
      // Simplified QR string generation for demo
      // In production, use proper VietQR specification
      const qrContent = {
        bank: qrData.bank,
        account: qrData.account,
        amount: qrData.amount,
        memo: qrData.memo,
        template: qrData.template
      };

      return JSON.stringify(qrContent);
    } catch (error) {
      logger.error('VietQRAdapter.buildQRString - Error:', error);
      return `bank:${qrData.bank}|acc:${qrData.account}|amt:${qrData.amount}|desc:${qrData.memo}`;
    }
  }

  async verifyWebhook(webhookData) {
    try {
      // VietQR webhook verification - mock implementation
      // In production, this would verify with bank's API
      
      const {
        transactionId,
        amount,
        description,
        timestamp,
        signature
      } = webhookData;

      // Simple signature verification (mock)
      const expectedSignature = this.generateSignature(webhookData);
      if (signature !== expectedSignature) {
        throw new AppError('Invalid VietQR webhook signature', 400, 'INVALID_VIETQR_SIGNATURE');
      }

      // Mock validation - in production, verify with bank
      const isValid = await this.validateWithBank(transactionId, amount);

      return {
        success: isValid,
        transactionId,
        amount: parseFloat(amount),
        description,
        timestamp: new Date(timestamp),
        bankValidated: isValid
      };
    } catch (error) {
      logger.error('VietQRAdapter.verifyWebhook - Error:', error);
      throw error;
    }
  }

  async validateWithBank(transactionId, amount) {
    // Mock bank validation - always return true for demo
    // In production, integrate with actual bank API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 100);
    });
  }

  generateSignature(data) {
    const signatureData = `${data.transactionId}${data.amount}${data.timestamp}${process.env.VIETQR_SECRET_KEY || 'default_secret'}`;
    return crypto
      .createHash('sha256')
      .update(signatureData)
      .digest('hex');
  }

  validateBankTransfer(transferData) {
    try {
      const { accountNo, accountName, amount, description } = transferData;

      // Validate account number format
      if (!this.isValidAccountNumber(accountNo)) {
        throw new AppError('Invalid account number format', 400, 'INVALID_ACCOUNT_NUMBER');
      }

      // Validate amount
      if (amount <= 0) {
        throw new AppError('Invalid transfer amount', 400, 'INVALID_TRANSFER_AMOUNT');
      }

      return {
        valid: true,
        bankId: this.bankId,
        accountNo: this.accountNo,
        accountName: this.accountName,
        amount: amount,
        description: description
      };
    } catch (error) {
      logger.error('VietQRAdapter.validateBankTransfer - Error:', error);
      throw error;
    }
  }

  isValidAccountNumber(accountNo) {
    // Basic account number validation
    const accountRegex = /^\d{8,15}$/;
    return accountRegex.test(accountNo);
  }

  // Helper method to generate transfer instructions
  generateTransferInstructions(amount, description) {
    return {
      bank: this.getBankName(this.bankId),
      accountNumber: this.accountNo,
      accountName: this.accountName,
      amount: amount,
      description: description,
      template: 'compact2',
      qrCodeUrl: `https://img.vietqr.io/image/${this.bankId}-${this.accountNo}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(this.accountName)}`
    };
  }

  getBankName(bankId) {
    const bankNames = {
      '970436': 'TPBank',
      '970416': 'MB Bank',
      '970418': 'BIDV',
      '970405': 'Vietcombank',
      '970407': 'VietinBank'
    };
    return bankNames[bankId] || 'Ngân hàng';
  }
}

export default new VietQRAdapter();