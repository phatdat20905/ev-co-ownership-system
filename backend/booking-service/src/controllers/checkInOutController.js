import checkInOutService from '../services/checkInOutService.js';
import { successResponse, logger } from '@ev-coownership/shared';

export class CheckInOutController {
  async checkIn(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      const checkInData = req.body;

      logger.info('Processing check-in', { bookingId, userId, userRole });

      const checkInLog = await checkInOutService.checkIn(bookingId, userId, userRole, checkInData);

      return successResponse(res, 'Check-in completed successfully', checkInLog);
    } catch (error) {
      logger.error('Failed to process check-in', { 
        error: error.message, 
        bookingId: req.params.bookingId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async checkOut(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      const checkOutData = req.body;

      logger.info('Processing check-out', { bookingId, userId, userRole });

      const checkOutLog = await checkInOutService.checkOut(bookingId, userId, userRole, checkOutData);

      return successResponse(res, 'Check-out completed successfully', checkOutLog);
    } catch (error) {
      logger.error('Failed to process check-out', { 
        error: error.message, 
        bookingId: req.params.bookingId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getCheckLogs(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      logger.debug('Getting check logs', { bookingId, userId, userRole });

      const logs = await checkInOutService.getCheckLogs(bookingId, userId, userRole);

      return successResponse(res, 'Check logs retrieved successfully', logs);
    } catch (error) {
      logger.error('Failed to get check logs', { 
        error: error.message, 
        bookingId: req.params.bookingId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async generateQRCode(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      logger.debug('Generating QR code', { bookingId, userId, userRole });

      const qrData = await checkInOutService.generateQRCode(bookingId, userId, userRole);

      return successResponse(res, 'QR code generated successfully', qrData);
    } catch (error) {
      logger.error('Failed to generate QR code', { 
        error: error.message, 
        bookingId: req.params.bookingId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async validateQRCode(req, res, next) {
    try {
      const { qrCode, secret } = req.body;
      const userId = req.user.id;

      logger.debug('Validating QR code', { userId });

      const validationResult = await checkInOutService.validateQRCode(qrCode, secret, userId);

      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_QR_CODE',
            message: validationResult.error
          }
        });
      }

      return successResponse(res, 'QR code validated successfully', validationResult);
    } catch (error) {
      logger.error('Failed to validate QR code', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new CheckInOutController();