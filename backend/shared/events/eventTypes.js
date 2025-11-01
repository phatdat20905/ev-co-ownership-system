// backend/shared/events/eventTypes.js
// Authentication Events
export const AUTH_EVENTS = {
  USER_REGISTERED: 'auth.user.registered',
  USER_LOGGED_IN: 'auth.user.logged_in',
  USER_LOGGED_OUT: 'auth.user.logged_out',
  USER_VERIFIED: 'auth.user.verified',
  PASSWORD_RESET_REQUESTED: 'auth.password.reset_requested',
  PASSWORD_RESET: 'auth.password.reset'
};

// User Events
export const USER_EVENTS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  PROFILE_UPDATED: 'user.profile.updated',
  PROFILE_CREATED: 'user.profile.created'
};

// Group Events
export const GROUP_EVENTS = {
  GROUP_CREATED: 'group.created',
  GROUP_UPDATED: 'group.updated',
  GROUP_DELETED: 'group.deleted',
  MEMBER_ADDED: 'group.member.added',
  MEMBER_REMOVED: 'group.member.removed',
  MEMBER_UPDATED: 'group.member.updated',
  OWNERSHIP_UPDATED: 'group.ownership.updated'
};

// Voting Events
export const VOTE_EVENTS = {
  VOTE_CREATED: 'vote.created',
  VOTE_CAST: 'vote.cast',
  VOTE_CLOSED: 'vote.closed',
  VOTE_UPDATED: 'vote.updated'
};

// Fund Events
export const FUND_EVENTS = {
  FUND_DEPOSIT: 'fund.deposit',
  FUND_WITHDRAWAL: 'fund.withdrawal',
  FUND_ALLOCATION: 'fund.allocation',
  FUND_BALANCE_UPDATED: 'fund.balance.updated'
};

// KYC Events
export const KYC_EVENTS = {
  KYC_SUBMITTED: 'kyc.submitted',
  KYC_APPROVED: 'kyc.approved',
  KYC_REJECTED: 'kyc.rejected',
  KYC_PENDING: 'kyc.pending'
};

// Booking Events
export const BOOKING_EVENTS = {
  BOOKING_CREATED: 'booking.created',
  BOOKING_UPDATED: 'booking.updated',
  BOOKING_CANCELLED: 'booking.cancelled',
  BOOKING_CONFIRMED: 'booking.confirmed',
  BOOKING_COMPLETED: 'booking.completed',
  BOOKING_CONFLICT_DETECTED: 'booking.conflict.detected',
  BOOKING_CONFLICT_RESOLVED: 'booking.conflict.resolved',
  CHECK_IN_SUCCESS: 'booking.checkin.success',
  CHECK_OUT_SUCCESS: 'booking.checkout.success',
  QR_CODE_GENERATED: 'booking.qr.generated',
  QR_CODE_VALIDATED: 'booking.qr.validated'
};

// Vehicle Events
export const VEHICLE_EVENTS = {
  VEHICLE_CREATED: 'vehicle.created',
  VEHICLE_UPDATED: 'vehicle.updated',
  VEHICLE_DELETED: 'vehicle.deleted',
  VEHICLE_STATUS_CHANGED: 'vehicle.status.changed',
  MAINTENANCE_SCHEDULED: 'vehicle.maintenance.scheduled',
  MAINTENANCE_UPDATED: 'vehicle.maintenance.updated',
  MAINTENANCE_COMPLETED: 'vehicle.maintenance.completed',
  MAINTENANCE_CANCELLED: 'vehicle.maintenance.cancelled',
  MAINTENANCE_REMINDER: 'vehicle.maintenance.reminder',
  INSURANCE_ADDED: 'vehicle.insurance.added',
  INSURANCE_UPDATED: 'vehicle.insurance.updated',
  INSURANCE_EXPIRING: 'vehicle.insurance.expiring',
  INSURANCE_EXPIRED: 'vehicle.insurance.expired',
  CHARGING_SESSION_STARTED: 'vehicle.charging.started',
  CHARGING_SESSION_COMPLETED: 'vehicle.charging.completed',
  CHARGING_COST_RECORDED: 'vehicle.charging.cost.recorded',
  BATTERY_HEALTH_CHECKED: 'vehicle.battery.health.checked',
  VEHICLE_UTILIZATION_CALCULATED: 'vehicle.utilization.calculated',
  MAINTENANCE_COST_ANALYZED: 'vehicle.maintenance.cost.analyzed'
};

export const COST_EVENTS = {
  COST_CREATED: 'cost.created',
  COST_UPDATED: 'cost.updated',
  COST_DELETED: 'cost.deleted',
  COST_SPLIT_CALCULATED: 'cost.split.calculated',
  COST_SPLIT_UPDATED: 'cost.split.updated',
  COST_OVERDUE: 'cost.overdue',
  COST_CATEGORY_CREATED: 'cost.category.created',
  COST_CATEGORY_UPDATED: 'cost.category.updated',
  
  // Payment Events (mở rộng)
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_PROCESSING: 'payment.processing',
  PAYMENT_REFUNDED: 'payment.refunded',
  PAYMENT_WEBHOOK_RECEIVED: 'payment.webhook.received',
  
  // Wallet Events
  WALLET_CREATED: 'wallet.created',
  WALLET_BALANCE_UPDATED: 'wallet.balance.updated',
  WALLET_DEPOSIT: 'wallet.deposit',
  WALLET_WITHDRAWAL: 'wallet.withdrawal',
  WALLET_TRANSFER: 'wallet.transfer',
  
  // Invoice Events
  INVOICE_GENERATED: 'invoice.generated',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',
  INVOICE_REMINDER: 'invoice.reminder',
  
  // Report Events
  REPORT_GENERATED: 'report.generated',
  USAGE_ANALYSIS_COMPLETED: 'usage.analysis.completed'
};

// Payment Events
export const PAYMENT_EVENTS = {
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  INVOICE_GENERATED: 'payment.invoice.generated'
};

// Contract Events
export const CONTRACT_EVENTS = {
  CONTRACT_CREATED: 'contract.created',
  CONTRACT_UPDATED: 'contract.updated',
  CONTRACT_SENT_FOR_SIGNATURE: 'contract.sent_for_signature',
  CONTRACT_SIGNED: 'contract.signed',
  CONTRACT_ACTIVATED: 'contract.activated',
  CONTRACT_EXPIRED: 'contract.expired',
  CONTRACT_TERMINATED: 'contract.terminated',
  CONTRACT_AMENDED: 'contract.amended',
  CONTRACT_RENEWED: 'contract.renewed',
  CONTRACT_DOWNLOADED: 'contract.downloaded',
  SIGNATURE_REMINDER_SENT: 'contract.signature_reminder_sent',
  CONTRACT_EXPIRY_REMINDER_SENT: 'contract.expiry_reminder_sent'
};

// System Events
export const SYSTEM_EVENTS = {
  SERVICE_STARTED: 'system.service.started',
  SERVICE_HEALTHY: 'system.service.healthy',
  SERVICE_ERROR: 'system.service.error'
};

// Admin Events (THÊM MỚI - cho Admin Service)
export const ADMIN_EVENTS = {
  STAFF_CREATED: 'admin.staff.created',
  STAFF_UPDATED: 'admin.staff.updated',
  STAFF_PERMISSIONS_UPDATED: 'admin.staff.permissions_updated',
  STAFF_DEACTIVATED: 'admin.staff.deactivated',
  DISPUTE_CREATED: 'admin.dispute.created',
  DISPUTE_ASSIGNED: 'admin.dispute.assigned',
  DISPUTE_MESSAGE_ADDED: 'admin.dispute.message_added',
  DISPUTE_RESOLVED: 'admin.dispute.resolved',
  DISPUTE_ESCALATED: 'admin.dispute.escalated',
  SYSTEM_SETTING_CREATED: 'admin.system_setting.created',
  SYSTEM_SETTING_UPDATED: 'admin.system_setting.updated',
  SYSTEM_SETTINGS_BATCH_UPDATED: 'admin.system_settings.batch_updated',
  ANALYTICS_GENERATED: 'admin.analytics.generated'
};

// Combine all event types
export const eventTypes = {
  ...AUTH_EVENTS,
  ...USER_EVENTS,
  ...GROUP_EVENTS,
  ...VOTE_EVENTS,
  ...FUND_EVENTS,
  ...KYC_EVENTS,
  ...BOOKING_EVENTS,
  ...VEHICLE_EVENTS,
  ...PAYMENT_EVENTS,
  ...CONTRACT_EVENTS,
  ...SYSTEM_EVENTS,
  ...ADMIN_EVENTS,
  ...COST_EVENTS,
};

// Event categories for routing
export const EVENT_CATEGORIES = {
  AUTH: 'auth',
  USER: 'user',
  GROUP: 'group',
  VOTE: 'vote',
  FUND: 'fund',
  KYC: 'kyc',
  BOOKING: 'booking',
  VEHICLE: 'vehicle',
  PAYMENT: 'payment',
  CONTRACT: 'contract',
  SYSTEM: 'system',
  ADMIN: 'admin',
  COST: 'cost'
};
export default eventTypes;