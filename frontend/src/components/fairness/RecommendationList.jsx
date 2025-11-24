import React from 'react';
import { CheckCircle, AlertTriangle, Info, Clock, Calendar } from 'lucide-react';

const RecommendationList = ({ recommendations = [], insights = [] }) => {
  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'text-red-600 bg-red-50 border-red-200';
    if (priority === 'medium') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getPriorityLabel = (priority) => {
    if (priority === 'high') return 'Ưu tiên cao';
    if (priority === 'medium') return 'Ưu tiên trung bình';
    return 'Ưu tiên thấp';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (severity === 'warning') return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  const getDayLabel = (dayOfWeek) => {
    const days = {
      monday: 'Thứ 2',
      tuesday: 'Thứ 3',
      wednesday: 'Thứ 4',
      thursday: 'Thứ 5',
      friday: 'Thứ 6',
      saturday: 'Thứ 7',
      sunday: 'Chủ nhật'
    };
    return days[dayOfWeek] || dayOfWeek;
  };

  return (
    <div className="space-y-6">
      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Đề xuất cải thiện
          </h3>
          
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {getPriorityLabel(rec.priority)}
                    </span>
                    <p className="text-sm mt-1 text-gray-700">
                      {rec.message}
                    </p>
                  </div>
                </div>

                {/* Suggested Time Slots */}
                {rec.suggestedTimeSlots && rec.suggestedTimeSlots.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      Thời gian đề xuất:
                    </div>
                    <div className="space-y-2">
                      {rec.suggestedTimeSlots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 text-sm bg-white p-2 rounded border border-gray-200"
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <span className="font-medium">{getDayLabel(slot.dayOfWeek)}</span>
                            <span className="text-gray-600 ml-2">
                              {slot.startHour}:00 - {slot.endHour}:00
                            </span>
                            {slot.reason && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({slot.reason})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights Section */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-500" />
            Phân tích chi tiết
          </h3>
          
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(insight.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {insight.category === 'usage_pattern' && 'Mẫu sử dụng'}
                        {insight.category === 'fairness' && 'Công bằng'}
                        {insight.category === 'conflict' && 'Xung đột'}
                        {insight.category === 'recommendation' && 'Gợi ý'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {insight.message}
                    </p>
                    {insight.affectedUsers && insight.affectedUsers.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Ảnh hưởng: {insight.affectedUsers.length} thành viên
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && insights.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Info className="w-12 h-12 mx-auto mb-3" />
          <p>Không có đề xuất hoặc phân tích nào</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationList;
