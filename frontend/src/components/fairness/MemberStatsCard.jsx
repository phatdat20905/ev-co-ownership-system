import React from 'react';
import { User, Clock, Calendar } from 'lucide-react';

const MemberStatsCard = ({ members = [] }) => {
  const getStatusColor = (status) => {
    if (status === 'overuse') return 'text-red-600 bg-red-50';
    if (status === 'underuse') return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusLabel = (status) => {
    if (status === 'overuse') return 'Dùng quá mức';
    if (status === 'underuse') return 'Dùng dưới mức';
    return 'Công bằng';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member, index) => (
        <div
          key={member.userId}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-gray-800">
                Thành viên {index + 1}
              </span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(member.status)}`}>
              {getStatusLabel(member.status)}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Tỷ lệ sở hữu:</span>
              <span className="font-semibold text-gray-800">{member.ownershipPercentage}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Sử dụng thực tế:</span>
              <span className="font-semibold text-gray-800">{member.actualUsagePercentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Chênh lệch:</span>
              <span className={`font-semibold ${
                member.usageDeviation > 0 ? 'text-red-600' : member.usageDeviation < 0 ? 'text-blue-600' : 'text-green-600'
              }`}>
                {member.usageDeviation > 0 ? '+' : ''}{member.usageDeviation.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-3"></div>

          {/* Usage Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{member.totalBookingHours.toFixed(1)} giờ</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{member.totalBookingDays} ngày</span>
            </div>
          </div>

          {/* Fairness Score */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Điểm công bằng</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      member.fairnessScore >= 80 ? 'bg-green-500' :
                      member.fairnessScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${member.fairnessScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {member.fairnessScore}
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Hours */}
          {member.recommendedHours > 0 && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
              <span className="font-medium">Đề xuất:</span> {member.recommendedHours.toFixed(1)}h cho kỳ tiếp theo
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MemberStatsCard;
