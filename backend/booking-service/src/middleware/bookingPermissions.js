import db from '../models/index.js';
import { AppError, logger } from '@ev-coownership/shared';

export class BookingPermissions {
  async canViewBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const booking = await db.Booking.findByPk(bookingId);
      
      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Admin and staff can view any booking
      if (['admin', 'staff'].includes(userRole)) {
        return next();
      }

      // Co-owner can only view their own bookings or bookings in their groups
      if (booking.userId !== userId) {
        // In a real implementation, check if user is in the same group
        // For now, only allow viewing own bookings
        throw new AppError('Access denied to this booking', 403, 'ACCESS_DENIED');
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  async canModifyBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const booking = await db.Booking.findByPk(bookingId);
      
      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Admin and staff can modify any booking
      if (['admin', 'staff'].includes(userRole)) {
        return next();
      }

      // Co-owner can only modify their own bookings
      if (booking.userId !== userId) {
        throw new AppError('You can only modify your own bookings', 403, 'MODIFICATION_PERMISSION_DENIED');
      }

      // Check if booking is in a modifiable state
      if (['in_progress', 'completed', 'cancelled'].includes(booking.status)) {
        throw new AppError(`Cannot modify booking in ${booking.status} status`, 400, 'INVALID_BOOKING_STATUS');
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  async canCheckInOut(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const booking = await db.Booking.findByPk(bookingId);
      
      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Staff can check-in/out any booking
      if (['staff', 'admin'].includes(userRole)) {
        return next();
      }

      // Co-owner can only check-in/out their own bookings
      if (booking.userId !== userId) {
        throw new AppError('You can only check-in/out your own bookings', 403, 'CHECK_IN_OUT_PERMISSION_DENIED');
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  async isGroupAdmin(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      // In a real implementation, check if user is admin of the group
      // For now, allow if user has staff or admin role
      if (['staff', 'admin'].includes(req.user.role)) {
        return next();
      }

      // This would typically check group membership and role from User Service
      throw new AppError('Group admin access required', 403, 'GROUP_ADMIN_REQUIRED');
    } catch (error) {
      next(error);
    }
  }
}

export default new BookingPermissions();