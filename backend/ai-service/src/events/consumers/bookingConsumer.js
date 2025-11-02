import { logger } from '@ev-coownership/shared';
import aiService from '../../services/aiService.js';
import CacheService from '../../services/cacheService.js';

export class BookingConsumer {
  async handleBookingCreated(bookingData) {
    try {
      logger.info('Processing booking created event', {
        bookingId: bookingData.booking_id,
        groupId: bookingData.group_id,
        userId: bookingData.user_id
      });

      // Check if this booking might require schedule re-optimization
      const shouldReoptimize = await this.shouldReoptimizeSchedule(bookingData);
      
      if (shouldReoptimize) {
        await this.triggerScheduleReoptimization(bookingData);
      }

      // Invalidate relevant caches
      await CacheService.invalidateGroupCache(bookingData.group_id);

      logger.info('Booking event processed successfully', {
        bookingId: bookingData.booking_id,
        reoptimized: shouldReoptimize
      });

    } catch (error) {
      logger.error('Error processing booking created event', {
        error: error.message,
        bookingId: bookingData.booking_id
      });
    }
  }

  async shouldReoptimizeSchedule(bookingData) {
    try {
      // Check if there are recent schedule optimizations
      const recentOptimizations = await aiService.getGroupRecommendations(bookingData.group_id, {
        limit: 1,
        feature_type: 'schedule'
      });

      if (recentOptimizations.recommendations.length === 0) {
        return true; // No existing optimization, should create one
      }

      const latestOptimization = recentOptimizations.recommendations[0];
      const optimizationAge = Date.now() - new Date(latestOptimization.created_at).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      // Re-optimize if optimization is older than 24 hours
      return optimizationAge > maxAge;

    } catch (error) {
      logger.error('Error checking schedule reoptimization need', {
        error: error.message,
        groupId: bookingData.group_id
      });
      return false;
    }
  }

  async triggerScheduleReoptimization(bookingData) {
    try {
      // In a real implementation, this would fetch current group data
      // and trigger a new optimization
      const groupData = {
        group_id: bookingData.group_id,
        members: [], // This would be fetched from user service
        constraints: {},
        usage_history: []
      };

      // Use system user for auto-triggered optimizations
      const systemUserId = 'system-auto';

      // For now, just log the intent - in production, this would call the service
      logger.info('Schedule reoptimization triggered', {
        groupId: bookingData.group_id,
        trigger: 'booking_created',
        bookingId: bookingData.booking_id
      });

      // Uncomment to actually trigger reoptimization:
      // await aiService.generateScheduleOptimization(groupData, systemUserId);

    } catch (error) {
      logger.error('Error triggering schedule reoptimization', {
        error: error.message,
        groupId: bookingData.group_id
      });
    }
  }
}

export default new BookingConsumer();