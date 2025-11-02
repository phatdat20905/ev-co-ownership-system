// src/utils/splitCalculator.js
import { AppError, logger } from '@ev-coownership/shared';

class SplitCalculator {
  async calculateSplits(cost) {
    try {
      const { splitType, groupId, totalAmount } = cost;

      switch (splitType) {
        case 'ownership_ratio':
          return await this.calculateByOwnershipRatio(cost);
        
        case 'usage_based':
          return await this.calculateByUsage(cost);
        
        case 'equal':
          return await this.calculateEqualSplit(cost);
        
        case 'custom':
          return await this.calculateCustomSplit(cost);
        
        default:
          throw new AppError('Unsupported split type', 400, 'UNSUPPORTED_SPLIT_TYPE');
      }
    } catch (error) {
      logger.error('SplitCalculator.calculateSplits - Error:', error);
      throw error;
    }
  }

  async calculateByOwnershipRatio(cost) {
    // This would call User Service to get group members and their ownership percentages
    // For now, we'll return a mock implementation
    
    const mockMembers = [
      { userId: '11111111-1111-1111-1111-111111111111', ownershipPercentage: 40 },
      { userId: '22222222-2222-2222-2222-222222222222', ownershipPercentage: 30 },
      { userId: '33333333-3333-3333-3333-333333333333', ownershipPercentage: 30 }
    ];

    return mockMembers.map(member => ({
      userId: member.userId,
      splitAmount: (cost.totalAmount * member.ownershipPercentage) / 100,
      paymentStatus: 'pending'
    }));
  }

  async calculateByUsage(cost) {
    // This would calculate based on actual usage data from bookings
    // For now, return equal split as fallback
    return this.calculateEqualSplit(cost);
  }

  async calculateEqualSplit(cost) {
    // This would call User Service to get number of group members
    // For now, use 3 members as example
    const memberCount = 3;
    const splitAmount = cost.totalAmount / memberCount;

    const mockMembers = [
      { userId: '11111111-1111-1111-1111-111111111111' },
      { userId: '22222222-2222-2222-2222-222222222222' },
      { userId: '33333333-3333-3333-3333-333333333333' }
    ];

    return mockMembers.map(member => ({
      userId: member.userId,
      splitAmount: splitAmount,
      paymentStatus: 'pending'
    }));
  }

  async calculateCustomSplit(cost) {
    // Custom split would require specific split data in the cost
    // For now, return ownership ratio as fallback
    return this.calculateByOwnershipRatio(cost);
  }

  validateSplitCalculation(splits, totalAmount) {
    const calculatedTotal = splits.reduce((sum, split) => sum + split.splitAmount, 0);
    
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      throw new AppError(
        `Split calculation error: splits total (${calculatedTotal}) doesn't match cost total (${totalAmount})`,
        400,
        'SPLIT_CALCULATION_ERROR'
      );
    }

    return true;
  }
}

export default new SplitCalculator();