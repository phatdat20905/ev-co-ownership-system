import { 
  createEventBus, 
  eventTypes,
  logger 
} from '@ev-coownership/shared';

class EventService {
  constructor() {
    this.eventBus = createEventBus('contract-service');
    this.isConnected = false;
    this.retryAttempts = 3;
    this.retryDelay = 500;
  }

  async initialize() {
    try {
      await this.eventBus.rabbitMQ.connect();
      this.isConnected = true;
      logger.info('Contract service event service initialized successfully');
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to initialize contract service event service', { error: error.message });
    }
  }

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
        logger.debug(`Event published: ${eventType}`, payload);
        return;
      } catch (error) {
        logger.error(`Failed to publish event [Attempt ${attempt}]`, { eventType, error: error.message });
        if (attempt < this.retryAttempts) {
          await new Promise(res => setTimeout(res, this.retryDelay));
        }
      }
    }
  }

  // Contract Events
  async publishContractCreated(contractData) {
    if (!contractData?.contractId) return;
    await this.publishEvent(eventTypes.CONTRACT_CREATED, {
      contractId: contractData.contractId,
      groupId: contractData.groupId,
      contractType: contractData.contractType,
      title: contractData.title,
      createdBy: contractData.createdBy,
      parties: contractData.parties,
      createdAt: new Date().toISOString()
    });
  }

  async publishContractSentForSignature(contractData) {
    if (!contractData?.contractId) return;
    await this.publishEvent(eventTypes.CONTRACT_SENT_FOR_SIGNATURE, {
      contractId: contractData.contractId,
      groupId: contractData.groupId,
      title: contractData.title,
      parties: contractData.parties,
      sentAt: new Date().toISOString()
    });
  }

  async publishContractSigned(signatureData) {
    if (!signatureData?.contractId || !signatureData?.userId) return;
    await this.publishEvent(eventTypes.CONTRACT_SIGNED, {
      contractId: signatureData.contractId,
      userId: signatureData.userId,
      groupId: signatureData.groupId,
      signedAt: new Date().toISOString(),
      contractStatus: signatureData.contractStatus
    });
  }

  async publishContractActivated(contractData) {
    if (!contractData?.contractId) return;
    await this.publishEvent(eventTypes.CONTRACT_ACTIVATED, {
      contractId: contractData.contractId,
      groupId: contractData.groupId,
      title: contractData.title,
      activatedAt: new Date().toISOString(),
      effectiveDate: contractData.effectiveDate
    });
  }

  async publishContractAmended(amendmentData) {
    if (!amendmentData?.originalContractId || !amendmentData?.amendmentContractId) return;
    await this.publishEvent(eventTypes.CONTRACT_AMENDED, {
      originalContractId: amendmentData.originalContractId,
      amendmentContractId: amendmentData.amendmentContractId,
      groupId: amendmentData.groupId,
      reason: amendmentData.reason,
      amendedAt: new Date().toISOString()
    });
  }

  async publishContractExpired(contractData) {
    if (!contractData?.contractId) return;
    await this.publishEvent(eventTypes.CONTRACT_EXPIRED, {
      contractId: contractData.contractId,
      groupId: contractData.groupId,
      title: contractData.title,
      expiredAt: new Date().toISOString()
    });
  }

  async publishSignatureReminderSent(reminderData) {
    if (!reminderData?.contractId || !reminderData?.userId) return;
    await this.publishEvent(eventTypes.SIGNATURE_REMINDER_SENT, {
      contractId: reminderData.contractId,
      userId: reminderData.userId,
      groupId: reminderData.groupId,
      reminderType: reminderData.reminderType,
      sentAt: new Date().toISOString()
    });
  }

  async publishContractExpiryReminderSent(reminderData) {
    if (!reminderData?.contractId) return;
    await this.publishEvent(eventTypes.CONTRACT_EXPIRY_REMINDER_SENT, {
      contractId: reminderData.contractId,
      groupId: reminderData.groupId,
      title: reminderData.title,
      expiryDate: reminderData.expiryDate,
      daysUntilExpiry: reminderData.daysUntilExpiry,
      sentAt: new Date().toISOString()
    });
  }

  async startEventConsumers() {
    if (!this.isConnected) {
      logger.warn('Event service not connected, skipping event consumers');
      return;
    }

    try {
      await this.eventBus.subscribe(eventTypes.USER_CREATED, this.handleUserCreated.bind(this));
      await this.eventBus.subscribe(eventTypes.USER_DELETED, this.handleUserDeleted.bind(this));
      await this.eventBus.subscribe(eventTypes.GROUP_CREATED, this.handleGroupCreated.bind(this));
      await this.eventBus.subscribe(eventTypes.GROUP_DELETED, this.handleGroupDeleted.bind(this));

      logger.info('Contract service event consumers started successfully');
    } catch (error) {
      logger.error('Failed to start contract service event consumers', { error: error.message });
    }
  }

  async handleUserCreated(userData) {
    try {
      logger.info('User created event received', { userId: userData.userId });
      // Xử lý khi user mới được tạo (nếu cần)
    } catch (error) {
      logger.error('Error handling user created event', { error: error.message, userId: userData.userId });
    }
  }

  async handleUserDeleted(userData) {
    try {
      logger.info('User deleted event received', { userId: userData.userId });
      // Xử lý xóa dữ liệu contract liên quan đến user
    } catch (error) {
      logger.error('Error handling user deleted event', { error: error.message, userId: userData.userId });
    }
  }

  async handleGroupCreated(groupData) {
    try {
      logger.info('Group created event received', { groupId: groupData.groupId });
      // Xử lý khi group mới được tạo (nếu cần)
    } catch (error) {
      logger.error('Error handling group created event', { error: error.message, groupId: groupData.groupId });
    }
  }

  async handleGroupDeleted(groupData) {
    try {
      logger.info('Group deleted event received', { groupId: groupData.groupId });
      // Xử lý xóa dữ liệu contract khi group bị xóa
    } catch (error) {
      logger.error('Error handling group deleted event', { error: error.message, groupId: groupData.groupId });
    }
  }

  async healthCheck() {
    return await this.eventBus.healthCheck();
  }
}

export default new EventService();