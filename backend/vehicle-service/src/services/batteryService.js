// src/services/batteryService.js
import db from '../models/index.js';
import { 
  logger, 
  AppError 
} from '@ev-coownership/shared';

export class BatteryService {
  async calculateBatteryHealth(vehicleId) {
    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      const chargingSessions = await db.ChargingSession.findAll({
        where: { 
          vehicleId,
          startTime: { 
            [db.Sequelize.Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days
          },
          energyConsumedKwh: { [db.Sequelize.Op.ne]: null },
          startBatteryLevel: { [db.Sequelize.Op.ne]: null },
          endBatteryLevel: { [db.Sequelize.Op.ne]: null }
        },
        order: [['startTime', 'ASC']]
      });

      if (chargingSessions.length < 5) {
        return { 
          health: 'unknown', 
          confidence: 'low',
          message: 'Insufficient data for battery health analysis',
          dataPoints: chargingSessions.length,
          minimumRequired: 5
        };
      }

      const efficiencyStats = this.calculateEfficiency(chargingSessions, vehicle.batteryCapacityKwh);
      const degradationRate = this.calculateDegradation(chargingSessions, vehicle.batteryCapacityKwh);
      const chargingBehavior = this.analyzeChargingBehavior(chargingSessions);

      const result = {
        health: this.getHealthStatus(degradationRate),
        confidence: this.getConfidenceLevel(chargingSessions.length),
        efficiency: {
          average: efficiencyStats.avgEfficiency,
          unit: 'km/kWh',
          trend: efficiencyStats.trend,
          min: efficiencyStats.minEfficiency,
          max: efficiencyStats.maxEfficiency
        },
        degradation: {
          rate: degradationRate,
          estimatedCapacity: vehicle.batteryCapacityKwh * (1 - degradationRate),
          originalCapacity: vehicle.batteryCapacityKwh,
          unit: 'kWh',
          status: degradationRate < 0.1 ? 'excellent' : 
                  degradationRate < 0.2 ? 'good' : 
                  degradationRate < 0.3 ? 'fair' : 'poor'
        },
        estimatedRange: this.calculateEstimatedRange(vehicle.batteryCapacityKwh, efficiencyStats.avgEfficiency, degradationRate),
        chargingBehavior,
        dataPoints: chargingSessions.length,
        analysisPeriod: {
          start: chargingSessions[0].startTime,
          end: chargingSessions[chargingSessions.length - 1].startTime,
          days: Math.ceil((new Date(chargingSessions[chargingSessions.length - 1].startTime) - new Date(chargingSessions[0].startTime)) / (1000 * 60 * 60 * 24))
        },
        recommendations: this.generateRecommendations(degradationRate, chargingBehavior),
        lastUpdated: new Date()
      };

      return result;
    } catch (error) {
      logger.error('Failed to calculate battery health', { error: error.message, vehicleId });
      throw error;
    }
  }

  calculateEfficiency(sessions, batteryCapacity) {
    const efficiencies = sessions
      .filter(session => 
        session.energyConsumedKwh && 
        session.endBatteryLevel && 
        session.startBatteryLevel &&
        session.energyConsumedKwh > 0
      )
      .map(session => {
        const batteryCapacityUsed = (session.endBatteryLevel - session.startBatteryLevel) * batteryCapacity / 100;
        const efficiency = batteryCapacityUsed / session.energyConsumedKwh; // km/kWh
        return efficiency;
      })
      .filter(efficiency => efficiency > 0 && efficiency < 10); // Reasonable range

    if (efficiencies.length === 0) {
      return {
        avgEfficiency: null,
        minEfficiency: null,
        maxEfficiency: null,
        trend: 'unknown'
      };
    }

    const avgEfficiency = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
    
    // Calculate trend (simple linear regression)
    const trend = this.calculateTrend(efficiencies);

    return {
      avgEfficiency: Math.round(avgEfficiency * 100) / 100,
      minEfficiency: Math.round(Math.min(...efficiencies) * 100) / 100,
      maxEfficiency: Math.round(Math.max(...efficiencies) * 100) / 100,
      trend,
      sampleSize: efficiencies.length
    };
  }

  calculateDegradation(sessions, batteryCapacity) {
    // Simple degradation calculation based on charging efficiency over time
    // This is a simplified model - real degradation analysis would be more complex
    
    const recentSessions = sessions.slice(-10); // Last 10 sessions
    if (recentSessions.length < 3) return 0;

    const recentEfficiency = this.calculateEfficiency(recentSessions, batteryCapacity).avgEfficiency;
    const allEfficiency = this.calculateEfficiency(sessions, batteryCapacity).avgEfficiency;

    if (!recentEfficiency || !allEfficiency) return 0;

    // Assume 5% efficiency drop corresponds to 10% capacity degradation
    const efficiencyDrop = Math.max(0, (allEfficiency - recentEfficiency) / allEfficiency);
    const estimatedDegradation = efficiencyDrop * 2; // Simplified conversion factor

    return Math.min(estimatedDegradation, 0.5); // Cap at 50% degradation
  }

  analyzeChargingBehavior(sessions) {
    const behavior = {
      averageSessionDuration: 0,
      preferredChargingTimes: {},
      chargingFrequency: 'unknown',
      deepCycles: 0,
      shallowCycles: 0
    };

    if (sessions.length === 0) return behavior;

    // Calculate average session duration
    const durations = sessions
      .filter(session => session.startTime && session.endTime)
      .map(session => (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60)); // minutes

    if (durations.length > 0) {
      behavior.averageSessionDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    }

    // Analyze charging times
    const timeSlots = {
      morning: 0, // 6-12
      afternoon: 0, // 12-18
      evening: 0, // 18-24
      night: 0 // 0-6
    };

    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
      else if (hour >= 18 && hour < 24) timeSlots.evening++;
      else timeSlots.night++;
    });

    behavior.preferredChargingTimes = timeSlots;

    // Analyze charging frequency
    const totalDays = (new Date(sessions[sessions.length - 1].startTime) - new Date(sessions[0].startTime)) / (1000 * 60 * 60 * 24);
    behavior.chargingFrequency = sessions.length / Math.max(totalDays, 1);

    // Analyze charge cycles
    sessions.forEach(session => {
      if (session.startBatteryLevel && session.endBatteryLevel) {
        const depthOfDischarge = session.endBatteryLevel - session.startBatteryLevel;
        if (depthOfDischarge > 50) behavior.deepCycles++;
        else if (depthOfDischarge > 20) behavior.shallowCycles++;
      }
    });

    return behavior;
  }

  calculateEstimatedRange(batteryCapacity, efficiency, degradationRate = 0) {
    if (!efficiency) return null;

    const effectiveCapacity = batteryCapacity * (1 - degradationRate);
    const estimatedRange = effectiveCapacity * efficiency;

    return {
      estimated: Math.round(estimatedRange),
      original: Math.round(batteryCapacity * efficiency),
      unit: 'km',
      capacityLoss: Math.round(degradationRate * 100)
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    if (slope > 0.01) return 'improving';
    if (slope < -0.01) return 'declining';
    return 'stable';
  }

  getHealthStatus(degradationRate) {
    if (degradationRate < 0.05) return 'excellent';
    if (degradationRate < 0.1) return 'very good';
    if (degradationRate < 0.15) return 'good';
    if (degradationRate < 0.2) return 'fair';
    if (degradationRate < 0.3) return 'poor';
    return 'critical';
  }

  getConfidenceLevel(dataPoints) {
    if (dataPoints >= 20) return 'high';
    if (dataPoints >= 10) return 'medium';
    if (dataPoints >= 5) return 'low';
    return 'very low';
  }

  generateRecommendations(degradationRate, chargingBehavior) {
    const recommendations = [];

    if (degradationRate > 0.2) {
      recommendations.push({
        priority: 'high',
        type: 'battery_health',
        message: 'Battery shows significant degradation. Consider professional inspection.',
        action: 'schedule_inspection'
      });
    }

    if (chargingBehavior.deepCycles > chargingBehavior.shallowCycles * 2) {
      recommendations.push({
        priority: 'medium',
        type: 'charging_habit',
        message: 'Frequent deep discharge cycles can accelerate battery degradation. Try to charge more frequently.',
        action: 'adjust_charging_habits'
      });
    }

    if (chargingBehavior.averageSessionDuration > 480) { // 8 hours
      recommendations.push({
        priority: 'low',
        type: 'charging_duration',
        message: 'Long charging sessions detected. Consider using faster charging stations when possible.',
        action: 'optimize_charging_times'
      });
    }

    if (degradationRate < 0.1) {
      recommendations.push({
        priority: 'low',
        type: 'maintenance',
        message: 'Battery health is excellent. Continue current maintenance practices.',
        action: 'continue_current_practices'
      });
    }

    return recommendations;
  }
}

export default new BatteryService();