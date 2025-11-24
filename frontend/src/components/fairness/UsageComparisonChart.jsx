import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const UsageComparisonChart = ({ members = [] }) => {
  // Prepare data for chart
  const chartData = members.map((member, index) => ({
    name: `User ${index + 1}`,
    userId: member.userId.slice(0, 8),
    ownership: parseFloat(member.ownershipPercentage.toFixed(1)),
    usage: parseFloat(member.actualUsagePercentage.toFixed(1)),
    deviation: parseFloat(member.usageDeviation.toFixed(1)),
    status: member.status
  }));

  // Color by status
  const getBarColor = (status) => {
    if (status === 'overuse') return '#ef4444'; // red
    if (status === 'underuse') return '#3b82f6'; // blue
    return '#10b981'; // green for fair
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Tỷ lệ sở hữu:</span> {data.ownership}%
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Sử dụng thực tế:</span> {data.usage}%
          </p>
          <p className="text-sm mt-1" style={{
            color: data.deviation > 0 ? '#ef4444' : data.deviation < 0 ? '#3b82f6' : '#10b981'
          }}>
            <span className="font-medium">Chênh lệch:</span> {data.deviation > 0 ? '+' : ''}{data.deviation}%
          </p>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            Trạng thái: {data.status === 'overuse' ? 'Dùng quá mức' : data.status === 'underuse' ? 'Dùng dưới mức' : 'Công bằng'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'Tỷ lệ (%)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
            formatter={(value) => {
              if (value === 'ownership') return 'Tỷ lệ sở hữu';
              if (value === 'usage') return 'Sử dụng thực tế';
              return value;
            }}
          />
          <Bar dataKey="ownership" fill="#9ca3af" name="ownership" />
          <Bar dataKey="usage" fill="#3b82f6" name="usage">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend for status colors */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Dùng quá mức</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Công bằng</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Dùng dưới mức</span>
        </div>
      </div>
    </div>
  );
};

export default UsageComparisonChart;
