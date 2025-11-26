import { logger } from '@ev-coownership/shared';
import fairnessService from '../services/fairnessService.js';

export class FairnessController {
  /**
   * POST /ai/fairness/analyze
   * Analyze fairness for a group
   */
  async analyzeFairness(req, res) {
    try {
      const { groupId, timeRange, startDate, endDate } = req.body;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: 'groupId is required'
        });
      }

      const result = await fairnessService.analyzeFairness({
        groupId,
        timeRange: timeRange || 'month',
        startDate,
        endDate
      });

      // Notifications intentionally disabled for fairness analysis (performance & reliability)
      logger.info('Fairness analysis completed successfully', {
        groupId,
        overallScore: result.data?.overallFairnessScore
      });

      return res.status(200).json(result);
      
    } catch (error) {
      logger.error('Fairness analysis controller error', {
        error: error.message,
        stack: error.stack
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to analyze fairness',
        error: error.message
      });
    }
  }

  /**
   * GET /ai/fairness/history/:groupId
   * Get fairness history for a group
   */
  async getHistory(req, res) {
    try {
      const { groupId } = req.params;
      const { limit } = req.query;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: 'groupId is required'
        });
      }

      const result = await fairnessService.getHistory({
        groupId,
        limit: parseInt(limit) || 10
      });

      return res.status(200).json(result);
      
    } catch (error) {
      logger.error('Get fairness history error', {
        error: error.message,
        groupId: req.params.groupId
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fairness history',
        error: error.message
      });
    }
  }

  /**
   * GET /ai/fairness/latest/:groupId
   * Get latest fairness record for a group
   */
  async getLatest(req, res) {
    try {
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: 'groupId is required'
        });
      }

      const result = await fairnessService.getHistory({
        groupId,
        limit: 1
      });

      if (result.data && result.data.length > 0) {
        return res.status(200).json({
          success: true,
          data: result.data[0]
        });
      }

      return res.status(404).json({
        success: false,
        message: 'No fairness records found for this group'
      });
      
    } catch (error) {
      logger.error('Get latest fairness record error', {
        error: error.message,
        groupId: req.params.groupId
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch latest fairness record',
        error: error.message
      });
    }
  }
}

export default new FairnessController();
