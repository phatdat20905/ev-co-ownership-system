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
  PROFILE_UPDATED: 'user.profile.updated'
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
  KYC: 'kyc',
  BOOKING: 'booking',
  VEHICLE: 'vehicle',
  PAYMENT: 'payment',
  SYSTEM: 'system'
};