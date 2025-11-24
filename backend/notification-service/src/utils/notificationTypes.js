// src/utils/notificationTypes.js

export const NOTIFICATION_TYPES = {
  // Booking related
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_UPDATED: 'booking_updated',
  BOOKING_REMINDER: 'booking_reminder',
  BOOKING_COMPLETED: 'booking_completed',
  
  // Cost related
  COST_ADDED: 'cost_added',
  COST_UPDATED: 'cost_updated',
  COST_REPORT_GENERATED: 'cost_report_generated',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_REQUIRED: 'payment_required',
  PAYMENT_OVERDUE: 'payment_overdue',
  
  // Contract related
  CONTRACT_CREATED: 'contract_created',
  CONTRACT_SIGNED: 'contract_signed',
  CONTRACT_APPROVED: 'contract_approved',
  CONTRACT_REJECTED: 'contract_rejected',
  CONTRACT_UPDATED: 'contract_updated',
  CONTRACT_EXPIRES_SOON: 'contract_expires_soon',
  
  // Group/Vote related
  VOTE_CREATED: 'vote_created',
  VOTE_REMINDER: 'vote_reminder',
  VOTE_CLOSED: 'vote_closed',
  VOTE_RESULT: 'vote_result',
  GROUP_INVITATION: 'group_invitation',
  GROUP_MEMBER_JOINED: 'group_member_joined',
  GROUP_MEMBER_LEFT: 'group_member_left',
  
  // AI related
  AI_FAIRNESS_ANALYSIS: 'ai_fairness_analysis',
  AI_RECOMMENDATION: 'ai_recommendation',
  AI_SCHEDULE_SUGGESTION: 'ai_schedule_suggestion',
  
  // Dispute related
  DISPUTE_CREATED: 'dispute_created',
  DISPUTE_UPDATED: 'dispute_updated',
  DISPUTE_RESOLVED: 'dispute_resolved',
  DISPUTE_ESCALATED: 'dispute_escalated',
  
  // Admin/System related
  ADMIN_ANNOUNCEMENT: 'admin_announcement',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_UPDATE: 'system_update',
  ACCOUNT_VERIFIED: 'account_verified',
  PASSWORD_CHANGED: 'password_changed',
};

export const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.BOOKING_CREATED]: {
    title: 'Đặt lịch xe thành công',
    body: 'Bạn đã đặt lịch xe {{vehicleName}} từ {{startTime}} đến {{endTime}}',
    channels: ['in_app', 'push', 'email']
  },
  
  [NOTIFICATION_TYPES.BOOKING_CANCELLED]: {
    title: 'Lịch xe đã bị hủy',
    body: 'Lịch đặt xe {{vehicleName}} vào {{startTime}} đã bị hủy',
    channels: ['in_app', 'push', 'email']
  },
  
  [NOTIFICATION_TYPES.COST_ADDED]: {
    title: 'Chi phí mới được thêm',
    body: 'Chi phí {{costType}} trị giá {{amount}} đã được thêm vào nhóm',
    channels: ['in_app', 'push']
  },
  
  [NOTIFICATION_TYPES.PAYMENT_REQUIRED]: {
    title: 'Yêu cầu thanh toán',
    body: 'Bạn cần thanh toán {{amount}} cho {{description}}',
    channels: ['in_app', 'push', 'email']
  },
  
  [NOTIFICATION_TYPES.CONTRACT_SIGNED]: {
    title: 'Hợp đồng đã được ký',
    body: 'Hợp đồng {{contractName}} đã được ký thành công',
    channels: ['in_app', 'push', 'email']
  },
  
  [NOTIFICATION_TYPES.VOTE_CREATED]: {
    title: 'Bỏ phiếu mới',
    body: 'Nhóm có bỏ phiếu mới: {{voteTitle}}. Hãy tham gia bỏ phiếu!',
    channels: ['in_app', 'push']
  },
  
  [NOTIFICATION_TYPES.VOTE_RESULT]: {
    title: 'Kết quả bỏ phiếu',
    body: 'Bỏ phiếu "{{voteTitle}}" đã kết thúc. Kết quả: {{result}}',
    channels: ['in_app', 'push']
  },
  
  [NOTIFICATION_TYPES.AI_FAIRNESS_ANALYSIS]: {
    title: 'Phân tích công bằng AI',
    body: 'AI đã hoàn thành phân tích công bằng cho nhóm. Điểm số: {{fairnessScore}}',
    channels: ['in_app', 'push']
  },
  
  [NOTIFICATION_TYPES.AI_RECOMMENDATION]: {
    title: 'Đề xuất từ AI',
    body: '{{recommendation}}',
    channels: ['in_app', 'push']
  },
  
  [NOTIFICATION_TYPES.DISPUTE_UPDATED]: {
    title: 'Cập nhật tranh chấp',
    body: 'Tranh chấp #{{disputeId}} đã được cập nhật: {{status}}',
    channels: ['in_app', 'push', 'email']
  },
  
  [NOTIFICATION_TYPES.GROUP_INVITATION]: {
    title: 'Lời mời tham gia nhóm',
    body: 'Bạn được mời tham gia nhóm {{groupName}}',
    channels: ['in_app', 'push', 'email']
  },
};

/**
 * Get template for notification type
 * @param {string} type - Notification type
 * @returns {Object} Template with title, body, and channels
 */
export function getNotificationTemplate(type) {
  return NOTIFICATION_TEMPLATES[type] || {
    title: 'Thông báo mới',
    body: 'Bạn có một thông báo mới',
    channels: ['in_app']
  };
}

/**
 * Replace template variables with actual values
 * @param {string} template - Template string with {{variables}}
 * @param {Object} variables - Key-value pairs to replace
 * @returns {string} Replaced string
 */
export function replaceTemplateVariables(template, variables) {
  if (!template || !variables) return template;
  
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

export default {
  NOTIFICATION_TYPES,
  NOTIFICATION_TEMPLATES,
  getNotificationTemplate,
  replaceTemplateVariables
};
