// AI Feature Types
export const FEATURE_TYPES = {
  SCHEDULE_OPTIMIZATION: 'schedule',
  COST_ANALYSIS: 'cost',
  DISPUTE_ANALYSIS: 'dispute',
  USAGE_ANALYTICS: 'analytics'
};

// Recommendation Status
export const RECOMMENDATION_STATUS = {
  ACTIVE: 'active',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
};

// Trigger Sources
export const TRIGGER_SOURCES = {
  USER_REQUEST: 'user_request',
  SYSTEM_AUTO: 'system_auto',
  EVENT_DRIVEN: 'event_driven'
};

// Cache Keys
export const CACHE_KEYS = {
  SCHEDULE_OPTIMIZATION: (groupId) => `ai:schedule:${groupId}`,
  COST_ANALYSIS: (groupId) => `ai:cost:${groupId}`,
  DISPUTE_PATTERNS: (groupId) => `ai:dispute:patterns:${groupId}`,
  USAGE_PATTERNS: (groupId) => `ai:usage:patterns:${groupId}`
};

// Event Types for AI Service
export const AI_EVENT_TYPES = {
  RECOMMENDATION_GENERATED: 'ai.recommendation.generated',
  RECOMMENDATION_ACCEPTED: 'ai.recommendation.accepted',
  RECOMMENDATION_REJECTED: 'ai.recommendation.rejected',
  AI_ANOMALY_DETECTED: 'ai.anomaly.detected',
  SCHEDULE_REOPTIMIZED: 'ai.schedule.reoptimized'
};

// Rate Limiting
export const RATE_LIMITS = {
  SCHEDULE_OPTIMIZATION: 10, // per minute per user
  COST_ANALYSIS: 15,
  DISPUTE_ANALYSIS: 20,
  USAGE_ANALYTICS: 10
};

// Default confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4
};

export default {
  FEATURE_TYPES,
  RECOMMENDATION_STATUS,
  TRIGGER_SOURCES,
  CACHE_KEYS,
  AI_EVENT_TYPES,
  RATE_LIMITS,
  CONFIDENCE_THRESHOLDS
};