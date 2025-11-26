import axios from 'axios';
import { logger } from '@ev-coownership/shared';
import FairnessRecord from '../models/FairnessRecord.js';
import geminiCoreService from './geminiCoreService.js';

export class FairnessService {
  constructor() {
    this.bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://booking-service:3003';
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3002';
  }

  /**
   * Analyze fairness for a group
   */
  async analyzeFairness({ groupId, timeRange = 'month', startDate, endDate }) {
    try {
      const start = Date.now();
      
      // Calculate period dates
      const { periodStart, periodEnd } = this.calculatePeriod(timeRange, startDate, endDate);

      // First fetch group members to get vehicleId
      const groupData = await this.fetchGroupMembers(groupId);

      if (!groupData || !groupData.members || groupData.members.length === 0) {
        throw new Error('Group not found or has no members');
      }

      // Then fetch booking history using the vehicleId from group data
      const bookingsData = await this.fetchBookingHistoryByVehicle(
        groupData.vehicleId, 
        periodStart, 
        periodEnd
      );

      // Ensure bookings is an array
      const bookings = Array.isArray(bookingsData?.bookings) 
        ? bookingsData.bookings 
        : [];

      logger.debug('Bookings fetched for fairness analysis', {
        groupId,
        vehicleId: groupData.vehicleId,
        bookingCount: bookings.length
      });

      // Calculate usage statistics
      const usageStats = this.calculateUsageStats(bookings, groupData.members);

      // Calculate fairness scores
      const fairnessAnalysis = this.calculateFairnessScores(usageStats, groupData.members);

      // Generate AI recommendations using Gemini
      const aiRecommendations = await this.generateAIRecommendations(
        fairnessAnalysis,
        groupData,
        bookingsData
      );

      // Build fairness record
      const fairnessRecord = await this.buildFairnessRecord({
        groupId,
        vehicleId: groupData.vehicleId,
        periodStart,
        periodEnd,
        timeRange,
        fairnessAnalysis,
        aiRecommendations,
        bookingsData,
        processingTime: Date.now() - start
      });

      // Save to database
      const savedRecord = await FairnessRecord.create(fairnessRecord);

      logger.info('Fairness analysis completed', {
        groupId,
        recordId: savedRecord._id,
        overallScore: savedRecord.overallFairnessScore
      });

      return this.formatResponse(savedRecord);
      
    } catch (error) {
      logger.error('Fairness analysis failed', {
        groupId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Calculate period start and end dates based on timeRange
   */
  calculatePeriod(timeRange, startDate, endDate) {
    if (startDate && endDate) {
      return {
        periodStart: new Date(startDate),
        periodEnd: new Date(endDate)
      };
    }

    const now = new Date();
    let periodStart = new Date(now);

    switch (timeRange) {
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        periodStart.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
      default:
        periodStart.setMonth(now.getMonth() - 1);
    }

    return {
      periodStart,
      periodEnd: now
    };
  }

  /**
   * Fetch booking history from booking service by vehicleId
   */
  async fetchBookingHistoryByVehicle(vehicleId, startDate, endDate) {
    try {
      if (!vehicleId) {
        logger.warn('No vehicleId provided, cannot fetch bookings');
        return { bookings: [], conflicts: 0 };
      }

      const headers = {};
      if (process.env.INTERNAL_API_TOKEN) {
        headers['x-internal-token'] = process.env.INTERNAL_API_TOKEN;
      }

      // Query bookings using vehicleId
      const response = await axios.get(`${this.bookingServiceUrl}/api/v1/bookings`, {
        params: {
          vehicleId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: 'completed',
          limit: 1000 // Get more bookings for analysis
        },
        timeout: 10000,
        headers
      });

      return {
        bookings: response.data.data || response.data.bookings || [],
        conflicts: response.data.conflicts || 0
      };
    } catch (error) {
      logger.error('Failed to fetch booking history', {
        vehicleId,
        error: error.message,
        status: error.response?.status
      });
      // Return empty data instead of throwing
      return { bookings: [], conflicts: 0 };
    }
  }

  /**
   * Fetch group members with ownership percentages
   */
  async fetchGroupMembers(groupId) {
    try {
      const url = `${this.userServiceUrl}/api/v1/groups/${groupId}/members`;
      const response = await axios.get(url, { timeout: 10000 });

      const data = response.data.data || response.data;
      const members = data.members || data.groupMembers || [];

      // If endpoint exists but returned empty, we'll still return (caller may handle)
      if (response.status === 200 && members.length > 0) {
        return {
          groupId,
          vehicleId: data.vehicleId || data.group?.vehicleId,
          members
        };
      }

      // If we got a non-200 or empty members list, fall through to try the internal API
      logger.info('Public group members endpoint returned no members or unexpected result, trying internal endpoint', { groupId, url, status: response.status });
    } catch (error) {
      // If the call failed with a 404 or other status, log and try internal endpoint below
      logger.warn('Public group members endpoint failed', {
        groupId,
        message: error.message,
        code: error.code,
        status: error.response?.status
      });
      // continue to internal attempt
    }

    // Try internal API route as a fallback (requires INTERNAL_API_TOKEN to be set in env)
    try {
      const internalToken = process.env.INTERNAL_API_TOKEN || process.env.INTERNAL_SERVICE_TOKEN;
      if (!internalToken) {
        logger.error('No INTERNAL_API_TOKEN found - cannot call internal user-service endpoint', { groupId });
        throw new Error('Could not fetch group members');
      }

      const internalUrl = `${this.userServiceUrl}/api/v1/internal/groups/${groupId}/members`;
      logger.info('Attempting internal group members endpoint', { groupId, internalUrl });

      const internalResp = await axios.get(internalUrl, {
        timeout: 10000,
        headers: {
          'x-internal-token': internalToken
        }
      });

      const internalData = internalResp.data.data || internalResp.data;
      const internalMembers = internalData.members || internalData.groupMembers || [];

      if (internalResp.status === 200 && internalMembers.length > 0) {
        return {
          groupId,
          vehicleId: internalData.vehicleId || internalData.group?.vehicleId,
          members: internalMembers
        };
      }

      logger.error('Internal group members endpoint returned no members', { groupId, internalUrl, status: internalResp.status });
      throw new Error('Could not fetch group members');
    } catch (err) {
      logger.error('Failed to fetch group members (internal fallback)', {
        groupId,
        error: err.message,
        status: err.response?.status
      });
      throw new Error('Could not fetch group members');
    }
  }

  /**
   * Calculate usage statistics for each member
   */
  calculateUsageStats(bookings, members) {
    // Safety check: ensure bookings is an array
    if (!Array.isArray(bookings)) {
      logger.warn('calculateUsageStats called with non-array bookings', {
        bookingsType: typeof bookings,
        bookings: bookings
      });
      bookings = [];
    }

    const stats = {};
    const totalHours = bookings.reduce((sum, booking) => {
      const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    // Initialize stats for each member
    members.forEach(member => {
      stats[member.userId] = {
        userId: member.userId,
        ownershipPercentage: parseFloat(member.ownershipPercentage || member.ownership_percentage || 0),
        totalBookingHours: 0,
        totalBookingDays: 0,
        bookingCount: 0
      };
    });

    // Calculate actual usage
    bookings.forEach(booking => {
      if (stats[booking.userId]) {
        const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
        const days = Math.ceil(hours / 24);
        
        stats[booking.userId].totalBookingHours += hours;
        stats[booking.userId].totalBookingDays += days;
        stats[booking.userId].bookingCount += 1;
      }
    });

    // Calculate percentages
    Object.keys(stats).forEach(userId => {
      const member = stats[userId];
      member.actualUsagePercentage = totalHours > 0 
        ? (member.totalBookingHours / totalHours) * 100 
        : 0;
      member.usageDeviation = member.actualUsagePercentage - member.ownershipPercentage;
    });

    return { stats, totalHours, totalBookings: bookings.length };
  }

  /**
   * Calculate fairness scores
   */
  calculateFairnessScores(usageStats, members) {
    const memberScores = [];
    let totalDeviation = 0;

    Object.values(usageStats.stats).forEach(member => {
      const absDeviation = Math.abs(member.usageDeviation);
      totalDeviation += absDeviation;

      // Calculate individual fairness score (100 = perfect, 0 = very unfair)
      const fairnessScore = Math.max(0, 100 - (absDeviation * 2));

      // Determine status
      let status = 'fair';
      if (member.usageDeviation > 15) status = 'overuse';
      else if (member.usageDeviation < -15) status = 'underuse';

      // Calculate recommended hours for next period
      const recommendedHours = usageStats.totalHours > 0
        ? (usageStats.totalHours * member.ownershipPercentage / 100)
        : 0;

      memberScores.push({
        ...member,
        fairnessScore: Math.round(fairnessScore),
        status,
        recommendedHours: Math.round(recommendedHours * 10) / 10
      });
    });

    // Calculate overall fairness score
    const avgDeviation = memberScores.length > 0 ? totalDeviation / memberScores.length : 0;
    const overallFairnessScore = Math.max(0, 100 - (avgDeviation * 2));

    // Determine fairness level
    let fairnessLevel = 'excellent';
    if (overallFairnessScore < 90) fairnessLevel = 'good';
    if (overallFairnessScore < 75) fairnessLevel = 'fair';
    if (overallFairnessScore < 60) fairnessLevel = 'needs_improvement';
    if (overallFairnessScore < 40) fairnessLevel = 'poor';

    return {
      members: memberScores,
      overallFairnessScore: Math.round(overallFairnessScore),
      fairnessLevel,
      totalHours: usageStats.totalHours,
      totalBookings: usageStats.totalBookings
    };
  }

  /**
   * Generate AI recommendations using Gemini
   */
  async generateAIRecommendations(fairnessAnalysis, groupData, bookingsData) {
    try {
      const prompt = this.buildFairnessPrompt(fairnessAnalysis, groupData, bookingsData);

      const aiResponse = await geminiCoreService.generateAIResponse(
        prompt,
        {
          groupId: groupData.groupId,
          memberCount: groupData.members.length,
          overallScore: fairnessAnalysis.overallFairnessScore
        },
        'fairness_analysis'
      );

      return this.parseAIRecommendations(aiResponse, fairnessAnalysis);
      
    } catch (error) {
      logger.warn('AI recommendations generation failed, using fallback', {
        error: error.message
      });
      return this.generateFallbackRecommendations(fairnessAnalysis);
    }
  }

  /**
   * Build prompt for Gemini AI
   */
  buildFairnessPrompt(fairnessAnalysis, groupData, bookingsData) {
    return {
      system: `You are an AI assistant specialized in analyzing vehicle co-ownership fairness and usage patterns. 
Your task is to analyze the usage data and provide actionable recommendations to improve fairness among group members.
Be specific, practical, and consider cultural context (Vietnamese co-ownership groups).`,
      
      user: `Analyze this co-ownership group's fairness:

**Overall Fairness Score:** ${fairnessAnalysis.overallFairnessScore}/100 (${fairnessAnalysis.fairnessLevel})
**Period:** Last ${fairnessAnalysis.totalBookings} bookings, ${Math.round(fairnessAnalysis.totalHours)} total hours

**Members Usage:**
${fairnessAnalysis.members.map(m => `
- Member ${m.userId.slice(0, 8)}:
  - Ownership: ${m.ownershipPercentage}%
  - Actual Usage: ${m.actualUsagePercentage.toFixed(1)}%
  - Deviation: ${m.usageDeviation > 0 ? '+' : ''}${m.usageDeviation.toFixed(1)}%
  - Status: ${m.status}
  - Hours Used: ${m.totalBookingHours.toFixed(1)}h
`).join('')}

**Task:**
1. Identify key fairness issues and patterns
2. Provide specific recommendations for each member who has significant deviation (>10%)
3. Suggest time slots or days for underused members to book
4. Recommend conflict resolution strategies if needed
5. Give practical tips to improve overall fairness

**Response Format (JSON):**
{
  "recommendations": [
    {
      "userId": "user-id",
      "priority": "high|medium|low",
      "message": "Specific actionable recommendation",
      "suggestedTimeSlots": [
        {
          "dayOfWeek": "monday",
          "startHour": 9,
          "endHour": 17,
          "reason": "Why this time slot is good"
        }
      ]
    }
  ],
  "insights": [
    {
      "category": "usage_pattern|fairness|conflict|recommendation",
      "severity": "info|warning|critical",
      "message": "Key insight or observation",
      "affectedUsers": ["user-id"]
    }
  ]
}

Provide your analysis in valid JSON format.`
    };
  }

  /**
   * Parse AI response and extract recommendations
   */
  parseAIRecommendations(aiResponse, fairnessAnalysis) {
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiResponse.text?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          recommendations: parsed.recommendations || [],
          insights: parsed.insights || []
        };
      }
    } catch (error) {
      logger.warn('Failed to parse AI recommendations JSON', { error: error.message });
    }

    // Fallback to rule-based recommendations
    return this.generateFallbackRecommendations(fairnessAnalysis);
  }

  /**
   * Generate fallback recommendations using rules
   */
  generateFallbackRecommendations(fairnessAnalysis) {
    const recommendations = [];
    const insights = [];

    fairnessAnalysis.members.forEach(member => {
      if (member.status === 'overuse') {
        recommendations.push({
          userId: member.userId,
          priority: 'high',
          message: `Bạn đã sử dụng xe ${member.actualUsagePercentage.toFixed(1)}% so với mức sở hữu ${member.ownershipPercentage}%. Hãy cân nhắc giảm bớt lượt đặt xe để công bằng hơn cho các thành viên khác.`,
          suggestedTimeSlots: []
        });
      } else if (member.status === 'underuse') {
        recommendations.push({
          userId: member.userId,
          priority: 'medium',
          message: `Bạn mới chỉ sử dụng ${member.actualUsagePercentage.toFixed(1)}% so với mức sở hữu ${member.ownershipPercentage}%. Bạn có thể đặt thêm khoảng ${member.recommendedHours}h trong kỳ tới.`,
          suggestedTimeSlots: [
            { dayOfWeek: 'monday', startHour: 8, endHour: 12, reason: 'Thời gian ít xung đột' },
            { dayOfWeek: 'wednesday', startHour: 14, endHour: 18, reason: 'Thời gian khả dụng cao' }
          ]
        });
      }
    });

    // Add overall insights
    if (fairnessAnalysis.overallFairnessScore < 60) {
      insights.push({
        category: 'fairness',
        severity: 'warning',
        message: 'Mức độ công bằng trong nhóm đang ở mức thấp. Cần có thỏa thuận rõ ràng hơn về lịch sử dụng.',
        affectedUsers: fairnessAnalysis.members.map(m => m.userId)
      });
    }

    return { recommendations, insights };
  }

  /**
   * Build complete fairness record
   */
  async buildFairnessRecord({
    groupId,
    vehicleId,
    periodStart,
    periodEnd,
    timeRange,
    fairnessAnalysis,
    aiRecommendations,
    bookingsData,
    processingTime
  }) {
    return {
      groupId,
      vehicleId,
      analysisDate: new Date(),
      periodStart,
      periodEnd,
      timeRange,
      overallFairnessScore: fairnessAnalysis.overallFairnessScore,
      fairnessLevel: fairnessAnalysis.fairnessLevel,
      totalBookings: fairnessAnalysis.totalBookings,
      totalUsageHours: Math.round(fairnessAnalysis.totalHours * 10) / 10,
      members: fairnessAnalysis.members,
      conflicts: bookingsData.conflicts || 0,
      recommendations: aiRecommendations.recommendations,
      insights: aiRecommendations.insights,
      aiMetadata: {
        modelUsed: 'gemini-2.5-flash',
        confidenceScore: 0.85,
        processingTime,
        version: '1.0.0'
      }
    };
  }

  /**
   * Format response for API
   */
  formatResponse(record) {
    return {
      success: true,
      data: {
        recordId: record._id,
        groupId: record.groupId,
        vehicleId: record.vehicleId,
        analysisDate: record.analysisDate,
        period: {
          start: record.periodStart,
          end: record.periodEnd,
          range: record.timeRange,
          durationDays: Math.ceil((record.periodEnd - record.periodStart) / (1000 * 60 * 60 * 24))
        },
        fairness: {
          overallScore: record.overallFairnessScore,
          level: record.fairnessLevel,
          totalBookings: record.totalBookings,
          totalUsageHours: record.totalUsageHours,
          conflicts: record.conflicts
        },
        members: record.members,
        recommendations: record.recommendations,
        insights: record.insights,
        metadata: record.aiMetadata
      }
    };
  }

  /**
   * Get historical fairness records
   */
  async getHistory({ groupId, limit = 10 }) {
    try {
      const records = await FairnessRecord.find({ groupId })
        .sort({ analysisDate: -1 })
        .limit(limit)
        .lean();

      return {
        success: true,
        data: records.map(r => this.formatResponse(r).data)
      };
    } catch (error) {
      logger.error('Failed to fetch fairness history', { groupId, error: error.message });
      throw error;
    }
  }
}

export default new FairnessService();
