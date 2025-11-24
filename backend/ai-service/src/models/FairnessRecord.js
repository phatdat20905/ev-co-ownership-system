import mongoose from 'mongoose';

const fairnessMemberSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  ownershipPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  actualUsagePercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalBookingHours: {
    type: Number,
    required: true,
    default: 0
  },
  totalBookingDays: {
    type: Number,
    required: true,
    default: 0
  },
  usageDeviation: {
    type: Number,
    required: true,
    comment: 'Deviation from ownership percentage (positive = overuse, negative = underuse)'
  },
  fairnessScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    comment: 'Individual fairness score (0-100, higher is better)'
  },
  status: {
    type: String,
    enum: ['overuse', 'fair', 'underuse'],
    required: true
  },
  recommendedHours: {
    type: Number,
    required: true,
    comment: 'Recommended hours for next period to balance usage'
  }
}, { _id: false });

const fairnessRecordSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    index: true
  },
  vehicleId: {
    type: String,
    required: true,
    index: true
  },
  analysisDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  timeRange: {
    type: String,
    enum: ['week', 'month', 'quarter', 'year'],
    required: true,
    default: 'month'
  },
  overallFairnessScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    comment: 'Overall group fairness score (0-100)'
  },
  fairnessLevel: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'needs_improvement', 'poor'],
    required: true
  },
  totalBookings: {
    type: Number,
    required: true,
    default: 0
  },
  totalUsageHours: {
    type: Number,
    required: true,
    default: 0
  },
  members: [fairnessMemberSchema],
  conflicts: {
    type: Number,
    default: 0,
    comment: 'Number of booking conflicts in the period'
  },
  recommendations: [{
    userId: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    message: {
      type: String,
      required: true
    },
    suggestedTimeSlots: [{
      dayOfWeek: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startHour: Number,
      endHour: Number,
      reason: String
    }]
  }],
  insights: [{
    category: {
      type: String,
      enum: ['usage_pattern', 'fairness', 'conflict', 'recommendation'],
      required: true
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info'
    },
    message: {
      type: String,
      required: true
    },
    affectedUsers: [String]
  }],
  aiMetadata: {
    modelUsed: String,
    confidenceScore: Number,
    processingTime: Number,
    version: {
      type: String,
      default: '1.0.0'
    }
  }
}, {
  timestamps: true,
  collection: 'fairness_records'
});

// Indexes for efficient queries
fairnessRecordSchema.index({ groupId: 1, analysisDate: -1 });
fairnessRecordSchema.index({ groupId: 1, periodStart: 1, periodEnd: 1 });
fairnessRecordSchema.index({ vehicleId: 1, analysisDate: -1 });

// Virtual for period duration in days
fairnessRecordSchema.virtual('periodDurationDays').get(function() {
  return Math.ceil((this.periodEnd - this.periodStart) / (1000 * 60 * 60 * 24));
});

export const FairnessRecord = mongoose.model('FairnessRecord', fairnessRecordSchema);
export default FairnessRecord;
