// src/utils/constants.js
export const NOTIFICATION_TYPES = {
  AUTH: 'auth',
  BOOKING: 'booking',
  PAYMENT: 'payment',
  VEHICLE: 'vehicle',
  CONTRACT: 'contract',
  ADMIN: 'admin',
  SYSTEM: 'system',
};

export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  QUEUED: 'queued',
  SENT: 'sent',
  FAILED: 'failed',
  READ: 'read',
};

export const CHANNELS = {
  EMAIL: 'email',
  PUSH: 'push',
  SMS: 'sms',
  IN_APP: 'in_app',
};

export const PROVIDER_NAMES = {
  EMAIL: 'email',
  PUSH: 'push',
  SMS: 'sms',
  IN_APP: 'in_app',
};

export const DEFAULT_PREFERENCES = {
  email: true,
  push: true,
  sms: false,
  in_app: true,
};

export const RATE_LIMITS = {
  EMAIL: {
    WINDOW_MS: 3600000, // 1 hour
    MAX_REQUESTS: 100,
  },
  SMS: {
    WINDOW_MS: 86400000, // 24 hours
    MAX_REQUESTS: 10,
  },
  PUSH: {
    WINDOW_MS: 60000, // 1 minute
    MAX_REQUESTS: 50,
  },
};