import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const FairnessScoreGauge = ({ score = 0, level = 'fair' }) => {
  // Color mapping
  const getColorByScore = (score) => {
    if (score >= 90) return '#10b981'; // green - excellent
    if (score >= 75) return '#3b82f6'; // blue - good
    if (score >= 60) return '#f59e0b'; // orange - fair
    if (score >= 40) return '#f97316'; // dark orange - needs improvement
    return '#ef4444'; // red - poor
  };

  const getLevelText = (level) => {
    const levelMap = {
      excellent: 'Xuất sắc',
      good: 'Tốt',
      fair: 'Khá',
      needs_improvement: 'Cần cải thiện',
      poor: 'Kém'
    };
    return levelMap[level] || level;
  };

  const color = getColorByScore(score);
  
  // Data for pie chart (score vs remaining)
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score }
  ];

  const COLORS = [color, '#e5e7eb']; // score color and gray

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-[-80px] text-center">
        <div className="text-4xl font-bold" style={{ color }}>
          {score}
        </div>
        <div className="text-sm text-gray-500 mt-1">/ 100</div>
      </div>

      <div className="mt-16 text-center">
        <div className="text-lg font-semibold" style={{ color }}>
          {getLevelText(level)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Mức độ công bằng
        </div>
      </div>
    </div>
  );
};

export default FairnessScoreGauge;
