// src/utils/dataAggregator.js
import { logger } from '@ev-coownership/shared';

export class DataAggregator {
  static aggregateByTimePeriod(data, period = 'daily') {
    const aggregated = {};

    data.forEach(item => {
      let periodKey;
      
      switch (period) {
        case 'hourly':
          periodKey = new Date(item.timestamp).toISOString().slice(0, 13) + ':00:00Z';
          break;
        case 'daily':
          periodKey = new Date(item.timestamp).toISOString().slice(0, 10);
          break;
        case 'weekly':
          const date = new Date(item.timestamp);
          const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
          periodKey = startOfWeek.toISOString().slice(0, 10);
          break;
        case 'monthly':
          periodKey = new Date(item.timestamp).toISOString().slice(0, 7);
          break;
        default:
          periodKey = new Date(item.timestamp).toISOString().slice(0, 10);
      }

      if (!aggregated[periodKey]) {
        aggregated[periodKey] = {
          period: periodKey,
          count: 0,
          items: []
        };
      }

      aggregated[periodKey].count += item.count || 1;
      aggregated[periodKey].items.push(item);
    });

    return Object.values(aggregated).sort((a, b) => a.period.localeCompare(b.period));
  }

  static calculateTrends(data, key = 'count') {
    if (data.length < 2) {
      return { trend: 'stable', percentage: 0 };
    }

    const first = data[0][key] || 0;
    const last = data[data.length - 1][key] || 0;

    if (first === 0) {
      return { trend: last > 0 ? 'growing' : 'stable', percentage: last > 0 ? 100 : 0 };
    }

    const percentage = ((last - first) / first) * 100;
    
    let trend;
    if (percentage > 10) trend = 'growing';
    else if (percentage < -10) trend = 'declining';
    else trend = 'stable';

    return { trend, percentage: Math.round(percentage * 100) / 100 };
  }

  static groupByProperty(data, property) {
    const grouped = {};

    data.forEach(item => {
      const value = item[property];
      if (!grouped[value]) {
        grouped[value] = {
          [property]: value,
          count: 0,
          items: []
        };
      }

      grouped[value].count += item.count || 1;
      grouped[value].items.push(item);
    });

    return Object.values(grouped);
  }

  static calculatePercentages(data, totalKey = 'total') {
    const total = data.reduce((sum, item) => sum + (item[totalKey] || item.count || 0), 0);
    
    if (total === 0) return data;

    return data.map(item => ({
      ...item,
      percentage: Math.round(((item[totalKey] || item.count || 0) / total) * 10000) / 100
    }));
  }

  static normalizeData(data, fields) {
    return data.map(item => {
      const normalized = {};
      
      fields.forEach(field => {
        if (item[field] !== undefined) {
          normalized[field] = item[field];
        }
      });

      return normalized;
    });
  }

  static fillMissingPeriods(data, period, startDate, endDate, fillWith = { count: 0 }) {
    const filledData = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      let periodKey;
      
      switch (period) {
        case 'daily':
          periodKey = currentDate.toISOString().slice(0, 10);
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          periodKey = currentDate.toISOString().slice(0, 10);
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          periodKey = currentDate.toISOString().slice(0, 7);
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        default:
          periodKey = currentDate.toISOString().slice(0, 10);
          currentDate.setDate(currentDate.getDate() + 1);
      }

      const existingData = data.find(d => d.period === periodKey);
      filledData.push(existingData || { period: periodKey, ...fillWith });
    }

    return filledData;
  }
}

export default DataAggregator;