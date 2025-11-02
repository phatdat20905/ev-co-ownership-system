import mongoose from 'mongoose';
import { idGenerator } from '../utils/idGenerator.js';

const recommendationSchema = new mongoose.Schema({
  recommendation_id: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => idGenerator.generateUUID()
  },
  group_id: { 
    type: String, 
    required: true, 
    index: true 
  },
  user_id: { 
    type: String, 
    required: true 
  },
  feature_type: { 
    type: String, 
    required: true, 
    enum: ['schedule', 'cost', 'dispute', 'analytics'],
    index: true
  },
  
  // Simple input/output storage
  input_summary: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ai_response: { 
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  confidence_score: { 
    type: Number, 
    min: 0, 
    max: 1,
    default: 0.8
  },
  
  // Version tracking
  version: { 
    type: String, 
    default: 'v1' 
  },
  cost_estimate: {
    estimated_savings: Number,
    currency: { type: String, default: 'VND' }
  },
  trigger_source: {
    type: String, 
    enum: ['user_request', 'system_auto', 'event_driven'],
    default: 'user_request'
  },
  
  // Status and feedback
  status: {
    type: String,
    enum: ['active', 'accepted', 'rejected'],
    default: 'active'
  },
  
  user_feedback: {
    rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    comment: { type: String },
    provided_at: { type: Date }
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Indexes for performance
recommendationSchema.index({ group_id: 1, created_at: -1 });
recommendationSchema.index({ user_id: 1, feature_type: 1 });
recommendationSchema.index({ status: 1, created_at: -1 });

// Static methods
recommendationSchema.statics.findByGroupId = function(groupId, options = {}) {
  const { limit = 10, page = 1, feature_type } = options;
  
  const query = { group_id: groupId };
  if (feature_type) query.feature_type = feature_type;
  
  return this.find(query)
    .sort({ created_at: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
};

recommendationSchema.statics.getActiveRecommendations = function(groupId, featureType) {
  const query = { 
    group_id: groupId, 
    status: 'active' 
  };
  
  if (featureType) query.feature_type = featureType;
  
  return this.find(query).sort({ created_at: -1 });
};

// Instance methods
recommendationSchema.methods.accept = function(feedback = {}) {
  this.status = 'accepted';
  if (feedback.rating || feedback.comment) {
    this.user_feedback = {
      rating: feedback.rating,
      comment: feedback.comment,
      provided_at: new Date()
    };
  }
  return this.save();
};

recommendationSchema.methods.reject = function(feedback = {}) {
  this.status = 'rejected';
  if (feedback.rating || feedback.comment) {
    this.user_feedback = {
      rating: feedback.rating,
      comment: feedback.comment,
      provided_at: new Date()
    };
  }
  return this.save();
};

export const Recommendation = mongoose.model('Recommendation', recommendationSchema);
export default Recommendation;