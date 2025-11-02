import mongoose from 'mongoose';

const usageLogSchema = new mongoose.Schema({
  user_id: { 
    type: String, 
    required: true 
  },
  group_id: { 
    type: String,
    index: true
  },
  feature_type: { 
    type: String, 
    enum: ['schedule', 'cost', 'dispute', 'analytics'],
    index: true
  },
  endpoint: { 
    type: String 
  },
  
  // Performance tracking
  response_time: { 
    type: Number  // milliseconds
  },
  token_usage: { 
    type: Number 
  },
  cost_estimate: {
    input_tokens: Number,
    output_tokens: Number,
    estimated_cost: Number
  },
  cache_hit: { 
    type: Boolean, 
    default: false 
  },
  model_version: String,
  success: { 
    type: Boolean, 
    default: true 
  },
  
  // Simple error tracking
  error_message: { type: String },
  
  created_at: { 
    type: Date, 
    default: Date.now,
    index: true 
  }
});

// Indexes for performance
usageLogSchema.index({ created_at: -1 });
usageLogSchema.index({ user_id: 1, created_at: -1 });
usageLogSchema.index({ feature_type: 1, created_at: -1 });

// Static methods for analytics
usageLogSchema.statics.getDailyUsage = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        created_at: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          feature_type: "$feature_type"
        },
        total_requests: { $sum: 1 },
        average_response_time: { $avg: "$response_time" },
        total_tokens: { $sum: "$token_usage" },
        success_rate: {
          $avg: { $cond: [{ $eq: ["$success", true] }, 1, 0] }
        }
      }
    },
    {
      $sort: { "_id.date": 1, "_id.feature_type": 1 }
    }
  ]);
};

usageLogSchema.statics.getUserUsageStats = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        user_id: userId,
        created_at: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: "$feature_type",
        total_requests: { $sum: 1 },
        average_response_time: { $avg: "$response_time" },
        total_tokens: { $sum: "$token_usage" },
        last_used: { $max: "$created_at" }
      }
    }
  ]);
};

export const UsageLog = mongoose.model('UsageLog', usageLogSchema);
export default UsageLog;