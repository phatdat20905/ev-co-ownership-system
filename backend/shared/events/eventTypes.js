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

// Group Events (NEW - for User Service)
export const GROUP_EVENTS = {
  GROUP_CREATED: 'group.created',
  GROUP_UPDATED: 'group.updated',
  GROUP_DELETED: 'group.deleted',
  MEMBER_ADDED: 'group.member.added',
  MEMBER_REMOVED: 'group.member.removed',
  MEMBER_UPDATED: 'group.member.updated',
  OWNERSHIP_UPDATED: 'group.ownership.updated'
};

// Voting Events (NEW - for User Service)
export const VOTE_EVENTS = {
  VOTE_CREATED: 'vote.created',
  VOTE_CAST: 'vote.cast',
  VOTE_CLOSED: 'vote.closed',
  VOTE_UPDATED: 'vote.updated'
};

// Fund Events (NEW - for User Service)
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
  BOOKING_CONFIRMED: 'booking.confirmed'
};

// Vehicle Events
export const VEHICLE_EVENTS = {
  VEHICLE_ADDED: 'vehicle.added',
  VEHICLE_UPDATED: 'vehicle.updated',
  VEHICLE_MAINTENANCE: 'vehicle.maintenance',
  VEHICLE_INSURANCE: 'vehicle.insurance'
};

// Payment Events
export const PAYMENT_EVENTS = {
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  INVOICE_GENERATED: 'payment.invoice.generated'
};

// System Events
export const SYSTEM_EVENTS = {
  SERVICE_STARTED: 'system.service.started',
  SERVICE_HEALTHY: 'system.service.healthy',
  SERVICE_ERROR: 'system.service.error'
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
  ...SYSTEM_EVENTS
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
  SYSTEM: 'system'
};