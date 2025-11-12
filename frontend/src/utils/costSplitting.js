// src/utils/costSplitting.js

/**
 * Auto Cost Splitting Utilities
 * Handles automatic cost distribution based on ownership % and usage
 */

/**
 * Split cost by ownership percentage only
 * @param {number} totalCost - Total cost amount
 * @param {Array} members - Array of members with ownershipPercentage
 * @returns {Array} Array of split amounts per member
 */
export function splitByOwnership(totalCost, members) {
  return members.map(member => ({
    userId: member.userId,
    userName: member.userName || member.name,
    ownershipPercentage: member.ownershipPercentage,
    splitAmount: (totalCost * member.ownershipPercentage) / 100,
    splitMethod: 'ownership'
  }));
}

/**
 * Split cost by actual usage
 * @param {number} totalCost - Total cost amount
 * @param {Array} usageData - Array of usage records with userId and hours/km
 * @param {string} usageMetric - 'hours' or 'kilometers'
 * @returns {Array} Array of split amounts per user
 */
export function splitByUsage(totalCost, usageData, usageMetric = 'hours') {
  const totalUsage = usageData.reduce((sum, record) => sum + (record[usageMetric] || 0), 0);
  
  if (totalUsage === 0) {
    // If no usage data, split equally
    const equalShare = totalCost / usageData.length;
    return usageData.map(record => ({
      userId: record.userId,
      userName: record.userName,
      usage: 0,
      splitAmount: equalShare,
      splitMethod: 'equal'
    }));
  }

  return usageData.map(record => {
    const usage = record[usageMetric] || 0;
    const usageRatio = usage / totalUsage;
    
    return {
      userId: record.userId,
      userName: record.userName,
      usage,
      usageRatio,
      splitAmount: totalCost * usageRatio,
      splitMethod: 'usage'
    };
  });
}

/**
 * Hybrid split: combine ownership % and usage
 * @param {number} totalCost - Total cost amount
 * @param {Array} members - Members with ownership %
 * @param {Array} usageData - Usage records
 * @param {Object} weights - { ownership: 0.5, usage: 0.5 } - must sum to 1
 * @param {string} usageMetric - 'hours' or 'kilometers'
 * @returns {Array} Array of split amounts per member
 */
export function splitHybrid(totalCost, members, usageData, weights = { ownership: 0.5, usage: 0.5 }, usageMetric = 'hours') {
  // Validate weights
  if (Math.abs(weights.ownership + weights.usage - 1) > 0.001) {
    throw new Error('Weights must sum to 1.0');
  }

  const ownershipSplits = splitByOwnership(totalCost * weights.ownership, members);
  const usageSplits = splitByUsage(totalCost * weights.usage, usageData, usageMetric);

  // Combine splits per user
  const userSplits = {};
  
  ownershipSplits.forEach(split => {
    userSplits[split.userId] = {
      userId: split.userId,
      userName: split.userName,
      ownershipPercentage: split.ownershipPercentage,
      ownershipAmount: split.splitAmount,
      usageAmount: 0,
      splitAmount: split.splitAmount
    };
  });

  usageSplits.forEach(split => {
    if (userSplits[split.userId]) {
      userSplits[split.userId].usageAmount = split.splitAmount;
      userSplits[split.userId].splitAmount += split.splitAmount;
      userSplits[split.userId].usage = split.usage;
    } else {
      // User not in ownership list (shouldn't happen normally)
      userSplits[split.userId] = {
        userId: split.userId,
        userName: split.userName,
        ownershipPercentage: 0,
        ownershipAmount: 0,
        usageAmount: split.splitAmount,
        splitAmount: split.splitAmount,
        usage: split.usage
      };
    }
  });

  return Object.values(userSplits);
}

/**
 * Split recurring costs (insurance, maintenance schedule) by ownership
 * @param {number} totalCost - Total cost
 * @param {Array} members - Members with ownership %
 * @param {string} period - 'monthly', 'quarterly', 'yearly'
 * @returns {Array} Split amounts with period info
 */
export function splitRecurringCost(totalCost, members, period = 'monthly') {
  const splits = splitByOwnership(totalCost, members);
  
  return splits.map(split => ({
    ...split,
    period,
    recurringAmount: split.splitAmount,
    costType: 'recurring'
  }));
}

/**
 * Split one-time costs (repairs, upgrades) with optional usage consideration
 * @param {number} totalCost - Total cost
 * @param {Array} members - Members with ownership %
 * @param {Array} beneficiaries - Optional: users who benefit (if not all)
 * @returns {Array} Split amounts
 */
export function splitOneTimeCost(totalCost, members, beneficiaries = null) {
  if (beneficiaries && beneficiaries.length > 0) {
    // Only split among beneficiaries
    const relevantMembers = members.filter(m => beneficiaries.includes(m.userId));
    // Normalize ownership percentages for beneficiaries only
    const totalOwnership = relevantMembers.reduce((sum, m) => sum + m.ownershipPercentage, 0);
    const normalizedMembers = relevantMembers.map(m => ({
      ...m,
      ownershipPercentage: (m.ownershipPercentage / totalOwnership) * 100
    }));
    
    return splitByOwnership(totalCost, normalizedMembers).map(split => ({
      ...split,
      costType: 'one-time',
      beneficiary: true
    }));
  }

  // Split among all members
  return splitByOwnership(totalCost, members).map(split => ({
    ...split,
    costType: 'one-time'
  }));
}

/**
 * Calculate cost split for charging/energy costs (usage-based)
 * @param {number} totalCost - Total charging cost
 * @param {Array} chargingSessions - Charging session records
 * @returns {Array} Split by kWh consumed
 */
export function splitChargingCost(totalCost, chargingSessions) {
  const totalKWh = chargingSessions.reduce((sum, session) => sum + (session.energyConsumed || 0), 0);
  
  if (totalKWh === 0) {
    return [];
  }

  const userCharging = {};
  
  chargingSessions.forEach(session => {
    if (!userCharging[session.userId]) {
      userCharging[session.userId] = {
        userId: session.userId,
        userName: session.userName,
        totalKWh: 0,
        sessions: []
      };
    }
    
    userCharging[session.userId].totalKWh += session.energyConsumed || 0;
    userCharging[session.userId].sessions.push(session);
  });

  return Object.values(userCharging).map(user => ({
    userId: user.userId,
    userName: user.userName,
    energyConsumed: user.totalKWh,
    energyRatio: user.totalKWh / totalKWh,
    splitAmount: (totalCost * user.totalKWh) / totalKWh,
    splitMethod: 'charging',
    sessions: user.sessions
  }));
}

/**
 * Generate monthly cost report for a group
 * @param {Object} groupData - Group information
 * @param {Array} costs - All costs for the period
 * @param {Array} members - Group members
 * @param {Array} usageData - Usage data for period
 * @returns {Object} Comprehensive cost report
 */
export function generateMonthlyCostReport(groupData, costs, members, usageData) {
  const report = {
    groupId: groupData.id,
    groupName: groupData.name,
    period: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    },
    summary: {
      totalCosts: 0,
      recurringCosts: 0,
      oneTimeCosts: 0,
      chargingCosts: 0,
      maintenanceCosts: 0,
      insuranceCosts: 0,
      otherCosts: 0
    },
    memberSummaries: {},
    costBreakdown: []
  };

  // Initialize member summaries
  members.forEach(member => {
    report.memberSummaries[member.userId] = {
      userId: member.userId,
      userName: member.userName || member.name,
      ownershipPercentage: member.ownershipPercentage,
      totalOwed: 0,
      totalPaid: 0,
      balance: 0,
      costs: []
    };
  });

  // Process each cost
  costs.forEach(cost => {
    report.summary.totalCosts += cost.amount;
    
    // Categorize cost
    switch (cost.category) {
      case 'charging':
        report.summary.chargingCosts += cost.amount;
        break;
      case 'maintenance':
        report.summary.maintenanceCosts += cost.amount;
        break;
      case 'insurance':
        report.summary.insuranceCosts += cost.amount;
        break;
      default:
        report.summary.otherCosts += cost.amount;
    }

    if (cost.isRecurring) {
      report.summary.recurringCosts += cost.amount;
    } else {
      report.summary.oneTimeCosts += cost.amount;
    }

    // Calculate splits for this cost
    let splits = [];
    
    if (cost.category === 'charging' && cost.chargingSessions) {
      splits = splitChargingCost(cost.amount, cost.chargingSessions);
    } else if (cost.splitMethod === 'usage' && usageData) {
      splits = splitByUsage(cost.amount, usageData);
    } else if (cost.splitMethod === 'hybrid' && usageData) {
      splits = splitHybrid(cost.amount, members, usageData);
    } else {
      // Default to ownership split
      splits = splitByOwnership(cost.amount, members);
    }

    // Add to breakdown
    report.costBreakdown.push({
      costId: cost.id,
      description: cost.description,
      amount: cost.amount,
      category: cost.category,
      date: cost.date,
      splits
    });

    // Update member summaries
    splits.forEach(split => {
      if (report.memberSummaries[split.userId]) {
        report.memberSummaries[split.userId].totalOwed += split.splitAmount;
        report.memberSummaries[split.userId].costs.push({
          costId: cost.id,
          description: cost.description,
          amount: split.splitAmount,
          category: cost.category,
          date: cost.date
        });
      }
    });
  });

  // Calculate balances
  Object.values(report.memberSummaries).forEach(member => {
    member.balance = member.totalPaid - member.totalOwed;
  });

  return report;
}

export default {
  splitByOwnership,
  splitByUsage,
  splitHybrid,
  splitRecurringCost,
  splitOneTimeCost,
  splitChargingCost,
  generateMonthlyCostReport
};
