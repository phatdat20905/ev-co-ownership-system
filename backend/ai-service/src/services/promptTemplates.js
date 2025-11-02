import { logger } from '@ev-coownership/shared';

export class PromptTemplates {
  static getScheduleOptimizationPrompt(groupData) {
    // Giới hạn dữ liệu để tránh token overflow
    const limitedMembers = groupData.members?.map(m => ({
      user_id: m.user_id,
      ownership_percentage: m.ownership_percentage,
      recent_usage_hours: m.recent_usage_hours
    })) || [];

    const limitedHistory = groupData.usage_history?.slice(-10) || []; // Last 10 records

    return {
      system: "Bạn là chuyên gia tối ưu lịch trình xe điện đồng sở hữu. TRẢ LỜI CHỈ BẰNG JSON.",
      user: `
        TỐI ƯU LỊCH TRÌNH SỬ DỤNG XE ĐIỆN - DỮ LIỆU RÚT GỌN:

        THÀNH VIÊN NHÓM:
        ${JSON.stringify(limitedMembers, null, 2)}

        LỊCH SỬ SỬ DỤNG (10 lần gần nhất):
        ${JSON.stringify(limitedHistory, null, 2)}

        RÀNG BUỘC & ƯU TIÊN:
        - Khung giờ hoạt động: ${groupData.operating_hours || '06:00-22:00'}
        - Ngày cần lịch: ${groupData.date_range || '7 ngày tới'}
        - Ưu tiên đặc biệt: ${groupData.special_requests || 'Không có'}

        YÊU CẦU OUTPUT JSON:
        {
          "schedule": [
            {
              "date": "2024-01-15",
              "slots": [
                {
                  "user_id": "user-uuid",
                  "time_slot": "08:00-12:00",
                  "purpose": "Đi làm",
                  "priority_reason": "Ít sử dụng tuần trước"
                }
              ]
            }
          ],
          "fairness_metrics": {
            "overall_score": 0.85,
            "ownership_vs_usage_correlation": 0.92,
            "weekly_balance_score": 0.78
          },
          "optimization_notes": [
            "User A được ưu tiên sáng thứ 2 do ít sử dụng tuần trước"
          ]
        }

        CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN.
      `
    };
  }

  static getCostAnalysisPrompt(costData) {
    const limitedHistory = costData.history?.slice(-6) || []; // Last 6 months

    return {
      system: "Bạn là chuyên gia phân tích chi phí xe điện. TRẢ LỜI CHỈ BẰNG JSON.",
      user: `
        PHÂN TÍCH CHI PHÍ XE ĐIỆN - DỮ LIỆU RÚT GỌN:

        LỊCH SỬ CHI PHÍ (6 tháng gần nhất):
        ${JSON.stringify(limitedHistory, null, 2)}

        CHI PHÍ HIỆN TẠI:
        ${JSON.stringify(costData.current, null, 2)}

        PHÂN LOẠI: ${costData.category || 'Chung'}
        THÔNG TIN XE: ${costData.vehicle_info || 'Không có'}

        YÊU CẦU OUTPUT JSON:
        {
          "predictions": {
            "next_month": 1500000,
            "next_quarter": 4200000,
            "confidence_level": 0.85
          },
          "anomaly_detection": {
            "is_anomaly": false,
            "anomaly_score": 0.75,
            "reasons": ["Chi phí cao hơn 25% so với trung bình"],
            "severity": "medium"
          },
          "trend_analysis": {
            "direction": "increasing",
            "rate_of_change": "+15% monthly"
          },
          "cost_optimization": {
            "savings_opportunities": ["Giảm 10% chi phí sạc bằng sạc đêm"]
          }
        }

        CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN.
      `
    };
  }

  static getDisputeAnalysisPrompt(disputeData) {
    const limitedMessages = disputeData.messages?.slice(-20) || []; // Last 20 messages

    return {
      system: "Bạn là chuyên gia phân tích và giải quyết tranh chấp. TRẢ LỜI CHỈ BẰNG JSON.",
      user: `
        PHÂN TÍCH TRANH CHẤP ĐỒNG SỞ HỮU XE:

        LOẠI TRANH CHẤP: ${disputeData.type}
        
        TIN NHẮN GIỮA CÁC BÊN (20 tin gần nhất):
        ${JSON.stringify(limitedMessages, null, 2)}

        NGỮ CẢNH TRANH CHẤP:
        ${JSON.stringify(disputeData.context, null, 2)}

        YÊU CẦU OUTPUT JSON:
        {
          "dispute_assessment": {
            "severity_level": "medium",
            "urgency_score": 0.75,
            "category": "scheduling_conflict"
          },
          "sentiment_analysis": {
            "party_a_sentiment": "frustrated",
            "party_b_sentiment": "defensive",
            "escalation_risk": 0.65
          },
          "resolution_suggestions": [
            {
              "suggestion": "Phân bổ lại thời gian sử dụng",
              "success_probability": 0.85,
              "implementation_time": "2-3 days"
            }
          ]
        }

        CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN.
      `
    };
  }

  static getUsageAnalyticsPrompt(usageData) {
    const limitedBookings = usageData.booking_history?.slice(-50) || []; // Last 50 bookings

    return {
      system: "Bạn là chuyên gia phân tích hành vi sử dụng xe điện. TRẢ LỜI CHỈ BẰNG JSON.",
      user: `
        PHÂN TÍCH XU HƯỚNG SỬ DỤNG XE ĐIỆN:

        LỊCH SỬ ĐẶT XE (50 lần gần nhất):
        ${JSON.stringify(limitedBookings, null, 2)}

        CHI PHÍ SỬ DỤNG:
        ${JSON.stringify(usageData.cost_data, null, 2)}

        THỜI GIAN PHÂN TÍCH: ${usageData.period || '30 ngày gần nhất'}

        YÊU CẦU OUTPUT JSON:
        {
          "usage_patterns": {
            "peak_hours": ["07:00-09:00", "17:00-19:00"],
            "peak_days": ["Monday", "Friday"],
            "average_session_length": "2.5 hours",
            "utilization_rate": 0.68
          },
          "efficiency_metrics": {
            "cost_per_km": 2500,
            "time_utilization_score": 0.72
          },
          "optimization_opportunities": [
            "Giảm 15% chi phí bằng sạc giờ thấp điểm"
          ]
        }

        CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN.
      `
    };
  }

  static buildFullPrompt(promptTemplate, context = {}) {
    try {
      const { system, user } = promptTemplate;
      
      // Replace template variables with actual context
      let processedUser = user;
      Object.keys(context).forEach(key => {
        const placeholder = `\${${key}}`;
        processedUser = processedUser.replace(new RegExp(placeholder, 'g'), context[key]);
      });

      return `${system}\n\n${processedUser}`;
    } catch (error) {
      logger.error('Error building prompt template', { error: error.message });
      return promptTemplate.user; // Fallback to raw user prompt
    }
  }
}

export default PromptTemplates;