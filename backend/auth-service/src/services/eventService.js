import { 
  createEventBus, 
  eventTypes,
  logger 
} from '@ev-coownership/shared';

class EventService {
  constructor() {
    this.eventBus = createEventBus('auth-service');
    this.isConnected = false;
    this.retryAttempts = 3; // số lần retry khi publish fail
    this.retryDelay = 500; // ms
  }

  async initialize() {
    try {
      await this.eventBus.rabbitMQ.connect();
      this.isConnected = true;
      logger.info('Event service initialized successfully');
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to initialize event service', { error: error.message });
      // Cân nhắc throw error nếu muốn service không khởi động khi fail
      // throw error;
    }
  }

  // ---------------- Helper publish event ----------------
  async publishEvent(eventType, payload) {
    if (!this.isConnected) {
      logger.warn('Event service not connected, skipping publish', { eventType });
      return;
    }

    if (!payload || Object.keys(payload).length === 0) {
      logger.warn('Empty payload, skipping publish', { eventType });
      return;
    }

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        await this.eventBus.publish(eventType, payload);
        logger.info(`Event published: ${eventType}`, payload);
        return;
      } catch (error) {
        logger.error(`Failed to publish event [Attempt ${attempt}]`, { eventType, error: error.message });
        if (attempt < this.retryAttempts) {
          await new Promise(res => setTimeout(res, this.retryDelay));
        }
      }
    }
  }

  // ---------------- Publish events ----------------
  async publishUserRegistered(user) {
    if (!user?.id || !user?.email) return;
    await this.publishEvent(eventTypes.USER_REGISTERED, {
      userId: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      registeredAt: new Date().toISOString()
    });
  }

  async publishUserLoggedIn(user) {
    if (!user?.id || !user?.email) return;
    await this.publishEvent(eventTypes.USER_LOGGED_IN, {
      userId: user.id,
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString()
    });
  }

  async publishUserVerified(userId) {
    if (!userId) return;
    await this.publishEvent(eventTypes.USER_VERIFIED, {
      userId,
      verifiedAt: new Date().toISOString()
    });
  }

  async publishKYCSubmitted(kycData) {
    if (!kycData?.id || !kycData?.userId) return;
    await this.publishEvent(eventTypes.KYC_SUBMITTED, {
      kycId: kycData.id,
      userId: kycData.userId,
      submittedAt: new Date().toISOString()
    });
  }

  async publishKYCVerified(kycData) {
    if (!kycData?.id || !kycData?.userId) return;
    const eventType = kycData.verificationStatus === 'approved' 
      ? eventTypes.KYC_APPROVED 
      : eventTypes.KYC_REJECTED;

    await this.publishEvent(eventType, {
      kycId: kycData.id,
      userId: kycData.userId,
      status: kycData.verificationStatus,
      verifiedBy: kycData.verifiedBy,
      verifiedAt: kycData.verifiedAt || new Date().toISOString(),
      rejectionReason: kycData.rejectionReason || null
    });
  }

  async publishPasswordResetRequested(user) {
    if (!user?.id || !user?.email) return;
    await this.publishEvent(eventTypes.PASSWORD_RESET_REQUESTED, {
      userId: user.id,
      email: user.email,
      requestedAt: new Date().toISOString()
    });
  }

  async publishPasswordReset(userId) {
    if (!userId) return;
    await this.publishEvent(eventTypes.PASSWORD_RESET, {
      userId,
      resetAt: new Date().toISOString()
    });
  }

  // ---------------- Subscribe / Event Consumers ----------------
  async startEventConsumers() {
    if (!this.isConnected) {
      logger.warn('Event service not connected, skipping event consumers');
      return;
    }

    try {
      await this.eventBus.subscribe(eventTypes.USER_UPDATED, this.handleUserUpdated.bind(this));
      await this.eventBus.subscribe(eventTypes.USER_DELETED, this.handleUserDeleted.bind(this));
      await this.eventBus.subscribe(eventTypes.PROFILE_UPDATED, this.handleProfileUpdated.bind(this));

      logger.info('Auth service event consumers started successfully');
    } catch (error) {
      logger.error('Failed to start event consumers', { error: error.message });
    }
  }

  // ---------------- Event handlers ----------------
  async handleUserUpdated(userData) {
    try {
      logger.info('User updated event received', { userId: userData.userId, updates: userData.updates });
      // Xử lý cập nhật dữ liệu (cache, DB, etc)
    } catch (error) {
      logger.error('Error handling user updated event', { error: error.message, userId: userData.userId });
    }
  }

  async handleUserDeleted(userData) {
    try {
      logger.info('User deleted event received', { userId: userData.userId });
      // Xử lý xóa dữ liệu liên quan
    } catch (error) {
      logger.error('Error handling user deleted event', { error: error.message, userId: userData.userId });
    }
  }

  async handleProfileUpdated(profileData) {
    try {
      logger.info('Profile updated event received', { userId: profileData.userId });
      // Xử lý cập nhật profile
    } catch (error) {
      logger.error('Error handling profile updated event', { error: error.message, userId: profileData.userId });
    }
  }

  // ---------------- Health check ----------------
  async healthCheck() {
    return await this.eventBus.healthCheck();
  }
}

export default new EventService();
