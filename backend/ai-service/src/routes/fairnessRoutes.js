import express from 'express';
import fairnessController from '../controllers/fairnessController.js';

const router = express.Router();

/**
 * @route   POST /ai/fairness/analyze
 * @desc    Analyze fairness for a group
 * @access  Private
 */
router.post('/analyze', 
  async (req, res) => await fairnessController.analyzeFairness(req, res)
);

/**
 * @route   GET /ai/fairness/history/:groupId
 * @desc    Get fairness history for a group
 * @access  Private
 */
router.get('/history/:groupId',
  async (req, res) => await fairnessController.getHistory(req, res)
);

/**
 * @route   GET /ai/fairness/latest/:groupId
 * @desc    Get latest fairness record for a group
 * @access  Private
 */
router.get('/latest/:groupId',
  async (req, res) => await fairnessController.getLatest(req, res)
);

export default router;
