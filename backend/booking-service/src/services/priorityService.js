// booking-service/src/services/priorityService.js
import { logger, AppError, userServiceClient } from '@ev-coownership/shared';
import db from '../models/index.js';

export class PriorityService {
  constructor() {
    this.weights = {
      ownershipRatio: 0.40,    // 40% - Tỷ lệ sở hữu
      usageHistory: 0.30,      // 30% - Lịch sử sử dụng
      advanceBooking: 0.20,    // 20% - Thời gian đặt trước
      purposeWeight: 0.10      // 10% - Mục đích sử dụng
    };

    this.purposeWeights = {
      business: 1.0,
      family: 0.8,
      personal: 0.6,
      emergency: 1.2,
      other: 0.5
    };
  }

  async calculatePriorityScore(userId, groupId, bookingData) {
    try {
      logger.debug('Calculating priority score', { userId, groupId });

      const [
        ownershipScore,
        usageScore,
        advanceScore,
        purposeScore
      ] = await Promise.all([
        this.calculateOwnershipScore(userId, groupId),
        this.calculateUsageScore(userId, groupId),
        this.calculateAdvanceScore(bookingData.startTime),
        this.calculatePurposeScore(bookingData.purpose)
      ]);

      const totalScore = Math.round(
        (ownershipScore * this.weights.ownershipRatio) +
        (usageScore * this.weights.usageHistory) +
        (advanceScore * this.weights.advanceBooking) +
        (purposeScore * this.weights.purposeWeight)
      );

      logger.info('Priority score calculated', {
        userId,
        groupId,
        ownershipScore,
        usageScore,
        advanceScore,
        purposeScore,
        totalScore
      });

      return Math.min(Math.max(totalScore, 0), 100);
    } catch (error) {
      logger.error('Failed to calculate priority score', {
        error: error.message,
        userId,
        groupId
      });
      return 50; // Default score if calculation fails
    }
  }

  async calculateOwnershipScore(userId, groupId) {
    try {
      // Call User Service to get group members and extract ownership percentage for the user
      const response = await userServiceClient.get(
        `/api/v1/user/groups/${groupId}/members`,
        { headers: { Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN || ''}` } }
      );

      const members = response?.data || [];
      const member = members.find(m => String(m.userId) === String(userId) || String(m.userProfile?.id) === String(userId));
      const ownershipPercentage = member?.ownershipPercentage || 0;

      // Higher ownership = higher score (linear scaling)
      return Math.min(ownershipPercentage * 100, 100);
    } catch (error) {
      logger.warn('Failed to get ownership data, using default score', {
        error: error.message,
        userId,
        groupId
      });
      return 50;
    }
  }

  async calculateUsageScore(userId, groupId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get user's recent booking history
      const userBookings = await db.Booking.findAll({
        where: {
          userId,
          groupId,
          status: 'completed',
          startTime: {
            [db.Sequelize.Op.gte]: thirtyDaysAgo
          }
        },
        attributes: [
          [db.Sequelize.fn('SUM', db.Sequelize.literal(
            'EXTRACT(EPOCH FROM (end_time - start_time)) / 3600'
          )), 'totalHours']
        ],
        raw: true
      });

      const totalHours = parseFloat(userBookings[0]?.totalHours || 0);
      
      // Inverse scoring: less usage = higher priority
      // Max score for 0 hours, decreasing to 0 for 50+ hours
      const usageScore = Math.max(0, 100 - (totalHours * 2));
      
      return usageScore;
    } catch (error) {
      logger.error('Failed to calculate usage score', {
        error: error.message,
        userId,
        groupId
      });
      return 50;
    }
  }

  calculateAdvanceScore(startTime) {
    const now = new Date();
    const bookingTime = new Date(startTime);
    const hoursInAdvance = (bookingTime - now) / (1000 * 60 * 60);

    if (hoursInAdvance <= 2) {
      return 20; // Last-minute booking
    } else if (hoursInAdvance <= 24) {
      return 50; // Same day booking
    } else if (hoursInAdvance <= 168) {
      return 80; // Within a week
    } else {
      return 100; // More than a week in advance
    }
  }

  calculatePurposeScore(purpose) {
    const normalizedPurpose = (purpose || 'other').toLowerCase();
    const weight = this.purposeWeights[normalizedPurpose] || this.purposeWeights.other;
    
    return weight * 100;
  }

  async autoConfirmBooking(booking) {
    // Auto-confirm if priority score is above threshold
    const autoConfirmThreshold = 80;
    
    if (booking.priorityScore >= autoConfirmThreshold) {
      await booking.update({
        status: 'confirmed',
        autoConfirmed: true
      });
      
      logger.info('Booking auto-confirmed due to high priority score', {
        bookingId: booking.id,
        priorityScore: booking.priorityScore
      });
      
      return true;
    }
    
    return false;
  }
}

export default new PriorityService();