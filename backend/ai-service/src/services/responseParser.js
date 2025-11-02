import { logger } from '@ev-coownership/shared';

export class ResponseParser {
  static parseGeminiResponse(text, featureType) {
    try {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        logger.warn('No JSON found in Gemini response', { featureType });
        return this.getFallbackResponse(featureType);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields based on feature type
      return this.validateAndEnhanceResponse(parsed, featureType);
      
    } catch (error) {
      logger.error('Error parsing Gemini response', { 
        error: error.message, 
        featureType,
        responseText: text.substring(0, 200) // Log first 200 chars
      });
      
      return this.getFallbackResponse(featureType);
    }
  }

  static validateAndEnhanceResponse(response, featureType) {
    const enhanced = { ...response };
    
    switch (featureType) {
      case 'schedule':
        if (!enhanced.schedule) enhanced.schedule = [];
        if (!enhanced.fairness_metrics) enhanced.fairness_metrics = {};
        enhanced.fairness_metrics.overall_score = 
          enhanced.fairness_metrics.overall_score || 0.7;
        break;
        
      case 'cost':
        if (!enhanced.predictions) enhanced.predictions = {};
        if (!enhanced.anomaly_detection) enhanced.anomaly_detection = {};
        enhanced.anomaly_detection.is_anomaly = 
          enhanced.anomaly_detection.is_anomaly || false;
        break;
        
      case 'dispute':
        if (!enhanced.dispute_assessment) enhanced.dispute_assessment = {};
        if (!enhanced.resolution_suggestions) enhanced.resolution_suggestions = [];
        enhanced.dispute_assessment.severity_level = 
          enhanced.dispute_assessment.severity_level || 'medium';
        break;
        
      case 'analytics':
        if (!enhanced.usage_patterns) enhanced.usage_patterns = {};
        if (!enhanced.optimization_opportunities) enhanced.optimization_opportunities = [];
        break;
    }
    
    // Add metadata
    enhanced._metadata = {
      parsed_at: new Date().toISOString(),
      feature_type: featureType,
      version: 'v1'
    };
    
    return enhanced;
  }

  static getFallbackResponse(featureType) {
    const fallbacks = {
      schedule: {
        schedule: [],
        fairness_metrics: { overall_score: 0.7 },
        optimization_notes: ["Using basic fallback algorithm"],
        _metadata: { is_fallback: true }
      },
      cost: {
        predictions: { next_month: 0, confidence_level: 0.5 },
        anomaly_detection: { is_anomaly: false, confidence: 0.5 },
        trend_analysis: { direction: "stable" },
        _metadata: { is_fallback: true }
      },
      dispute: {
        dispute_assessment: { severity_level: "medium", urgency_score: 0.5 },
        resolution_suggestions: ["Please contact group admin for manual resolution"],
        _metadata: { is_fallback: true }
      },
      analytics: {
        usage_patterns: { peak_hours: ["07:00-09:00", "17:00-19:00"] },
        optimization_opportunities: ["Consider optimizing usage patterns"],
        _metadata: { is_fallback: true }
      }
    };
    
    return fallbacks[featureType] || { error: "Fallback not available", _metadata: { is_fallback: true } };
  }

  static calculateConfidenceScore(response, featureType) {
    try {
      let score = 0.7; // Base confidence
      
      switch (featureType) {
        case 'schedule':
          if (response.fairness_metrics?.overall_score) {
            score = response.fairness_metrics.overall_score;
          }
          if (response.schedule?.length > 0) {
            score = Math.min(0.95, score + 0.1);
          }
          break;
          
        case 'cost':
          if (response.anomaly_detection?.confidence) {
            score = response.anomaly_detection.confidence;
          }
          if (response.predictions?.confidence_level) {
            score = Math.max(score, response.predictions.confidence_level);
          }
          break;
          
        case 'dispute':
          if (response.dispute_assessment?.urgency_score) {
            score = response.dispute_assessment.urgency_score;
          }
          if (response.resolution_suggestions?.length > 0) {
            score = Math.min(0.9, score + 0.15);
          }
          break;
      }
      
      return Math.max(0.3, Math.min(0.95, score)); // Clamp between 0.3 and 0.95
      
    } catch (error) {
      logger.error('Error calculating confidence score', { error: error.message });
      return 0.5;
    }
  }
}

export default ResponseParser;