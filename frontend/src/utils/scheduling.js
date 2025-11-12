// src/utils/scheduling.js

/**
 * Fair Scheduling Algorithm
 * Calculates booking priority based on ownership percentage and usage history
 */

/**
 * Calculate fair scheduling priority score
 * @param {Object} params - Parameters for priority calculation
 * @param {number} params.ownershipPercentage - Member's ownership percentage (0-100)
 * @param {number} params.totalBookings - Total bookings made by this member
 * @param {number} params.totalHoursUsed - Total hours the member has used the vehicle
 * @param {number} params.groupTotalBookings - Total bookings across all group members
 * @param {number} params.groupTotalHours - Total hours used across all group members
 * @param {number} params.monthlyTarget - Target usage based on ownership %
 * @returns {number} Priority score (higher = higher priority)
 */
export function calculatePriorityScore({
  ownershipPercentage,
  totalBookings,
  totalHoursUsed,
  groupTotalBookings,
  groupTotalHours,
  monthlyTarget
}) {
  // Expected usage ratio based on ownership
  const expectedRatio = ownershipPercentage / 100;
  
  // Actual usage ratio
  const actualBookingRatio = groupTotalBookings > 0 
    ? totalBookings / groupTotalBookings 
    : 0;
  const actualHoursRatio = groupTotalHours > 0 
    ? totalHoursUsed / groupTotalHours 
    : 0;

  // Usage deficit (positive means under-utilized, negative means over-utilized)
  const bookingDeficit = expectedRatio - actualBookingRatio;
  const hoursDeficit = expectedRatio - actualHoursRatio;

  // Combined deficit (70% hours, 30% booking count)
  const combinedDeficit = (hoursDeficit * 0.7) + (bookingDeficit * 0.3);

  // Base priority from ownership percentage (0-40 points)
  const ownershipPoints = ownershipPercentage * 0.4;

  // Deficit points (0-60 points) - more under-utilized = higher priority
  const deficitPoints = Math.max(0, Math.min(60, combinedDeficit * 100));

  // Total priority score (0-100)
  const priorityScore = ownershipPoints + deficitPoints;

  return Math.round(priorityScore * 100) / 100;
}

/**
 * Sort members by booking priority
 * @param {Array} members - Array of member objects with usage data
 * @param {Object} groupStats - Overall group statistics
 * @returns {Array} Sorted array of members with priority scores
 */
export function sortMembersByPriority(members, groupStats) {
  return members
    .map(member => ({
      ...member,
      priorityScore: calculatePriorityScore({
        ownershipPercentage: member.ownershipPercentage,
        totalBookings: member.totalBookings || 0,
        totalHoursUsed: member.totalHoursUsed || 0,
        groupTotalBookings: groupStats.totalBookings || 0,
        groupTotalHours: groupStats.totalHours || 0,
        monthlyTarget: member.monthlyTarget || 0
      })
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Check if a member is allowed to book based on fair usage rules
 * @param {Object} member - Member data with usage stats
 * @param {Object} groupStats - Group statistics
 * @param {number} requestedHours - Hours requested for new booking
 * @returns {Object} { allowed: boolean, reason: string, priorityScore: number }
 */
export function checkBookingEligibility(member, groupStats, requestedHours = 0) {
  const priorityScore = calculatePriorityScore({
    ownershipPercentage: member.ownershipPercentage,
    totalBookings: member.totalBookings || 0,
    totalHoursUsed: member.totalHoursUsed || 0,
    groupTotalBookings: groupStats.totalBookings || 0,
    groupTotalHours: groupStats.totalHours || 0,
    monthlyTarget: member.monthlyTarget || 0
  });

  const expectedRatio = member.ownershipPercentage / 100;
  const currentRatio = groupStats.totalHours > 0 
    ? (member.totalHoursUsed || 0) / groupStats.totalHours 
    : 0;

  // Calculate overuse percentage
  const overusePercentage = ((currentRatio - expectedRatio) / expectedRatio) * 100;

  // Block if severely over-using (> 150% of fair share)
  if (overusePercentage > 50) {
    return {
      allowed: false,
      reason: `Bạn đã sử dụng vượt quá ${overusePercentage.toFixed(1)}% so với tỷ lệ sở hữu. Vui lòng chờ các thành viên khác sử dụng.`,
      priorityScore
    };
  }

  // Warn if moderately over-using (> 120%)
  if (overusePercentage > 20) {
    return {
      allowed: true,
      reason: `Lưu ý: Bạn đang sử dụng vượt ${overusePercentage.toFixed(1)}% so với tỷ lệ sở hữu.`,
      priorityScore,
      warning: true
    };
  }

  return {
    allowed: true,
    reason: 'Đủ điều kiện đặt xe',
    priorityScore
  };
}

/**
 * Resolve booking conflicts based on priority
 * @param {Array} conflictingBookings - Array of conflicting booking requests
 * @param {Array} members - All group members with stats
 * @param {Object} groupStats - Group statistics
 * @returns {Object} Recommended booking to approve
 */
export function resolveBookingConflict(conflictingBookings, members, groupStats) {
  const bookingsWithPriority = conflictingBookings.map(booking => {
    const member = members.find(m => m.userId === booking.userId);
    if (!member) return { ...booking, priorityScore: 0 };

    const priorityScore = calculatePriorityScore({
      ownershipPercentage: member.ownershipPercentage,
      totalBookings: member.totalBookings || 0,
      totalHoursUsed: member.totalHoursUsed || 0,
      groupTotalBookings: groupStats.totalBookings || 0,
      groupTotalHours: groupStats.totalHours || 0,
      monthlyTarget: member.monthlyTarget || 0
    });

    return {
      ...booking,
      member,
      priorityScore
    };
  });

  // Sort by priority (highest first), then by booking creation time
  bookingsWithPriority.sort((a, b) => {
    if (Math.abs(a.priorityScore - b.priorityScore) < 1) {
      // If priorities are very close, first-come-first-served
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return b.priorityScore - a.priorityScore;
  });

  return bookingsWithPriority[0];
}

/**
 * Calculate recommended monthly usage hours for a member
 * @param {number} ownershipPercentage - Member's ownership percentage
 * @param {number} totalMonthlyHours - Total available hours in month (e.g., 720)
 * @returns {number} Recommended hours
 */
export function calculateMonthlyTarget(ownershipPercentage, totalMonthlyHours = 720) {
  return Math.round((ownershipPercentage / 100) * totalMonthlyHours);
}

export default {
  calculatePriorityScore,
  sortMembersByPriority,
  checkBookingEligibility,
  resolveBookingConflict,
  calculateMonthlyTarget
};
