import Joi from 'joi';

// Common validators
export const commonValidators = {
  id: Joi.string().uuid().required(),
  groupId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  limit: Joi.number().integer().min(1).max(100).default(10),
  page: Joi.number().integer().min(1).default(1),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().max(500).allow('', null)
};

// Schedule validators
export const scheduleValidators = {
  optimizeSchedule: Joi.object({
    group_data: Joi.object({
      group_id: commonValidators.groupId,
      members: Joi.array().items(
        Joi.object({
          user_id: commonValidators.userId,
          ownership_percentage: Joi.number().min(0).max(100).required(),
          recent_usage_hours: Joi.number().min(0).default(0)
        })
      ).min(1).required(),
      date_range: Joi.string().default('7 days'),
      constraints: Joi.object({
        operating_hours: Joi.string().default('06:00-22:00'),
        max_hours_per_user: Joi.number().min(1).max(24),
        special_requests: Joi.array().items(Joi.string())
      }).default({}),
      usage_history: Joi.array().items(Joi.object()).default([])
    }).required()
  }),

  getRecommendations: Joi.object({
    groupId: commonValidators.groupId,
    limit: commonValidators.limit,
    page: commonValidators.page
  }),

  getActiveRecommendation: Joi.object({
    groupId: commonValidators.groupId
  })
};

// Cost validators
export const costValidators = {
  analyzeCosts: Joi.object({
    cost_data: Joi.object({
      group_id: commonValidators.groupId,
      history: Joi.array().items(
        Joi.object({
          amount: Joi.number().min(0).required(),
          category: Joi.string().required(),
          date: Joi.date().required()
        })
      ).default([]),
      current: Joi.object({
        amount: Joi.number().min(0).required(),
        category: Joi.string().required()
      }),
      category: Joi.string().default('general'),
      vehicle_info: Joi.object().default({})
    }).required()
  }),

  getRecommendations: Joi.object({
    groupId: commonValidators.groupId,
    limit: commonValidators.limit,
    page: commonValidators.page
  }),

  getInsights: Joi.object({
    groupId: commonValidators.groupId
  })
};

// Dispute validators
export const disputeValidators = {
  analyzeDispute: Joi.object({
    dispute_data: Joi.object({
      group_id: commonValidators.groupId,
      type: Joi.string().valid('scheduling', 'cost', 'behavior', 'other').required(),
      messages: Joi.array().items(
        Joi.object({
          user_id: commonValidators.userId,
          content: Joi.string().required(),
          timestamp: Joi.date().required()
        })
      ).default([]),
      context: Joi.object({
        involved_parties: Joi.array().items(commonValidators.userId).min(1),
        dispute_start: Joi.date().required(),
        previous_issues: Joi.array().items(Joi.string()).default([])
      }).default({}),
      user_history: Joi.array().items(Joi.object()).default([])
    }).required()
  }),

  getRecommendations: Joi.object({
    groupId: commonValidators.groupId,
    limit: commonValidators.limit,
    page: commonValidators.page
  }),

  getPatterns: Joi.object({
    groupId: commonValidators.groupId
  })
};

// Analytics validators
export const analyticsValidators = {
  generateAnalytics: Joi.object({
    analytics_data: Joi.object({
      group_id: commonValidators.groupId,
      booking_history: Joi.array().items(Joi.object()).default([]),
      cost_data: Joi.object().default({}),
      period: Joi.string().default('30 days'),
      scope: Joi.string().valid('basic', 'detailed', 'comprehensive').default('basic')
    }).required()
  }),

  getRecommendations: Joi.object({
    groupId: commonValidators.groupId,
    limit: commonValidators.limit,
    page: commonValidators.page
  }),

  getMetrics: Joi.object({
    days: Joi.number().integer().min(1).max(365).default(30)
  }),

  getSummary: Joi.object({
    groupId: commonValidators.groupId
  })
};

// Feedback validators
export const feedbackValidators = {
  submitFeedback: Joi.object({
    recommendationId: commonValidators.id,
    rating: commonValidators.rating.optional(),
    comment: commonValidators.comment,
    accepted: Joi.boolean().required()
  }),

  getStats: Joi.object({
    groupId: commonValidators.groupId
  }),

  getHistory: Joi.object({
    limit: commonValidators.limit,
    page: commonValidators.page
  })
};

export default {
  scheduleValidators,
  costValidators,
  disputeValidators,
  analyticsValidators,
  feedbackValidators
};