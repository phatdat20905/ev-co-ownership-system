import { logger } from '@ev-coownership/shared';

export class FallbackService {
  static getScheduleFallback(groupData) {
    const members = groupData.members || [];
    const schedule = [];
    
    // Simple round-robin based on ownership percentage
    members.forEach(member => {
      const hours = Math.floor((member.ownership_percentage || 0.25) * 20); // Max 20h/week
      if (hours > 0) {
        schedule.push({
          user_id: member.user_id,
          time_slot: `${hours}h weekly`,
          purpose: "Basic allocation",
          priority_reason: `Ownership: ${(member.ownership_percentage * 100).toFixed(1)}%`
        });
      }
    });
    
    return {
      schedule: [{
        date: new Date().toISOString().split('T')[0],
        slots: schedule
      }],
      fairness_metrics: {
        overall_score: 0.7,
        ownership_vs_usage_correlation: 0.8,
        weekly_balance_score: 0.6
      },
      optimization_notes: [
        "Using basic ownership-based allocation",
        "Consider manual optimization for better fairness"
      ],
      _metadata: {
        is_fallback: true,
        fallback_reason: "AI service unavailable"
      }
    };
  }

  static getCostAnalysisFallback(costData) {
    const history = costData.history || [];
    const total = history.reduce((sum, item) => sum + (item.amount || 0), 0);
    const average = history.length > 0 ? total / history.length : 0;
    
    return {
      predictions: {
        next_month: average,
        next_quarter: average * 3,
        confidence_level: 0.5
      },
      anomaly_detection: {
        is_anomaly: false,
        anomaly_score: 0.3,
        reasons: ["Insufficient data for anomaly detection"],
        severity: "low"
      },
      trend_analysis: {
        direction: "stable",
        rate_of_change: "0%",
        seasonal_patterns: []
      },
      cost_optimization: {
        savings_opportunities: ["Review historical data manually"],
        budget_recommendations: [`Suggested budget: ${Math.round(average)} VND/month`]
      },
      _metadata: {
        is_fallback: true,
        fallback_reason: "AI service unavailable"
      }
    };
  }

  static getDisputeAnalysisFallback(disputeData) {
    return {
      dispute_assessment: {
        severity_level: "medium",
        urgency_score: 0.5,
        category: "general_conflict",
        complexity: "medium"
      },
      sentiment_analysis: {
        party_a_sentiment: "neutral",
        party_b_sentiment: "neutral",
        overall_tone: "neutral",
        escalation_risk: 0.4
      },
      resolution_suggestions: [
        {
          suggestion: "Schedule a group meeting to discuss concerns",
          success_probability: 0.7,
          implementation_time: "3-5 days",
          required_resources: ["Group admin mediation"]
        }
      ],
      preventive_measures: [
        "Establish clearer group communication guidelines"
      ],
      _metadata: {
        is_fallback: true,
        fallback_reason: "AI service unavailable"
      }
    };
  }

  static getUsageAnalyticsFallback(usageData) {
    return {
      usage_patterns: {
        peak_hours: ["07:00-09:00", "17:00-19:00"],
        peak_days: ["Monday", "Friday"],
        average_session_length: "2.0 hours",
        utilization_rate: 0.6
      },
      efficiency_metrics: {
        cost_per_km: 3000,
        energy_efficiency: "4.5 km/kWh",
        time_utilization_score: 0.65,
        fairness_index: 0.7
      },
      optimization_opportunities: [
        "Consider carpooling for similar routes",
        "Schedule charging during off-peak hours"
      ],
      user_behavior_insights: [
        "Standard usage patterns detected"
      ],
      _metadata: {
        is_fallback: true,
        fallback_reason: "AI service unavailable"
      }
    };
  }

  static getFallbackByFeatureType(featureType, inputData) {
    try {
      switch (featureType) {
        case 'schedule':
          return this.getScheduleFallback(inputData);
        case 'cost':
          return this.getCostAnalysisFallback(inputData);
        case 'dispute':
          return this.getDisputeAnalysisFallback(inputData);
        case 'analytics':
          return this.getUsageAnalyticsFallback(inputData);
        default:
          logger.warn('Unknown feature type for fallback', { featureType });
          return { error: "Fallback not available for this feature type" };
      }
    } catch (error) {
      logger.error('Error generating fallback response', { 
        error: error.message, 
        featureType 
      });
      return { error: "Fallback generation failed" };
    }
  }
}

export default FallbackService;