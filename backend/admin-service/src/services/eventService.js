// src/services/eventService.js
import { 
  createEventBus, 
  eventTypes,
  logger 
} from '@ev-coownership/shared';

class EventService {
  constructor() {
    this.eventBus = createEventBus('admin-service');
    this.isConnected = false;
    this.retryAttempts = 3;
    this.retryDelay = 500;
  }

  async initialize() {
    try {
      await this.eventBus.rabbitMQ.connect();
      this.isConnected = true;
      logger.info('Admin service event service initialized successfully');
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to initialize admin service event service', { 
        error: error.message,
        stack: error.stack 
      });
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
        logger.debug(`Event published: ${eventType}`, { 
          eventType,
          payloadSize: Object.keys(payload).length 
        });
        return;
      } catch (error) {
        logger.error(`Failed to publish event [Attempt ${attempt}]`, { 
          eventType, 
          error: error.message,
          stack: error.stack 
        });
        if (attempt < this.retryAttempts) {
          await new Promise(res => setTimeout(res, this.retryDelay));
        }
      }
    }
  }

  // Staff Events - SỬA: Sử dụng ADMIN_EVENTS
  async publishStaffCreated(staffData) {
    if (!staffData?.staffId) return;
    await this.publishEvent(eventTypes.STAFF_CREATED, {
      staffId: staffData.staffId,
      userId: staffData.userId,
      employeeId: staffData.employeeId,
      department: staffData.department,
      position: staffData.position,
      createdAt: new Date().toISOString()
    });
  }

  async publishStaffUpdated(staffData) {
    if (!staffData?.staffId) return;
    await this.publishEvent(eventTypes.STAFF_UPDATED, {
      staffId: staffData.staffId,
      updates: staffData.updates,
      updatedAt: new Date().toISOString()
    });
  }

  async publishStaffPermissionsUpdated(staffData) {
    if (!staffData?.staffId) return;
    await this.publishEvent(eventTypes.STAFF_PERMISSIONS_UPDATED, {
      staffId: staffData.staffId,
      permissions: staffData.permissions,
      updatedAt: new Date().toISOString()
    });
  }

  async publishStaffDeactivated(staffData) {
    if (!staffData?.staffId) return;
    await this.publishEvent(eventTypes.STAFF_DEACTIVATED, {
      staffId: staffData.staffId,
      deactivatedAt: new Date().toISOString()
    });
  }

  // Dispute Events - SỬA: Sử dụng ADMIN_EVENTS
  async publishDisputeCreated(disputeData) {
    if (!disputeData?.disputeId) return;
    await this.publishEvent(eventTypes.DISPUTE_CREATED, {
      disputeId: disputeData.disputeId,
      disputeNumber: disputeData.disputeNumber,
      type: disputeData.type,
      filedBy: disputeData.filedBy,
      groupId: disputeData.groupId,
      createdAt: new Date().toISOString()
    });
  }

  async publishDisputeAssigned(disputeData) {
    if (!disputeData?.disputeId) return;
    await this.publishEvent(eventTypes.DISPUTE_ASSIGNED, {
      disputeId: disputeData.disputeId,
      disputeNumber: disputeData.disputeNumber,
      assignedTo: disputeData.assignedTo,
      assignedBy: disputeData.assignedBy,
      assignedAt: new Date().toISOString()
    });
  }

  async publishDisputeMessageAdded(disputeData) {
    if (!disputeData?.disputeId) return;
    await this.publishEvent(eventTypes.DISPUTE_MESSAGE_ADDED, {
      disputeId: disputeData.disputeId,
      messageId: disputeData.messageId,
      senderId: disputeData.senderId,
      messageType: disputeData.messageType,
      addedAt: new Date().toISOString()
    });
  }

  async publishDisputeResolved(disputeData) {
    if (!disputeData?.disputeId) return;
    await this.publishEvent(eventTypes.DISPUTE_RESOLVED, {
      disputeId: disputeData.disputeId,
      disputeNumber: disputeData.disputeNumber,
      resolution: disputeData.resolution,
      resolvedBy: disputeData.resolvedBy,
      resolvedAt: new Date().toISOString()
    });
  }

  async publishDisputeEscalated(disputeData) {
    if (!disputeData?.disputeId) return;
    await this.publishEvent(eventTypes.DISPUTE_ESCALATED, {
      disputeId: disputeData.disputeId,
      disputeNumber: disputeData.disputeNumber,
      newPriority: disputeData.newPriority,
      escalatedBy: disputeData.escalatedBy,
      escalatedAt: new Date().toISOString()
    });
  }

  // KYC Events - SỬA: Sử dụng KYC_EVENTS
  async publishKYCSubmitted(kycData) {
    if (!kycData?.kycId) return;
    await this.publishEvent(eventTypes.KYC_SUBMITTED, {
      kycId: kycData.kycId,
      userId: kycData.userId,
      submittedAt: kycData.submittedAt || new Date().toISOString()
    });
  }

  async publishKYCApproved(kycData) {
    if (!kycData?.kycId) return;
    await this.publishEvent(eventTypes.KYC_APPROVED, {
      kycId: kycData.kycId,
      userId: kycData.userId,
      approvedBy: kycData.approvedBy,
      approvedAt: kycData.approvedAt || new Date().toISOString()
    });
  }

  async publishKYCRejected(kycData) {
    if (!kycData?.kycId) return;
    await this.publishEvent(eventTypes.KYC_REJECTED, {
      kycId: kycData.kycId,
      userId: kycData.userId,
      rejectedBy: kycData.rejectedBy,
      rejectionReason: kycData.rejectionReason,
      rejectedAt: kycData.rejectedAt || new Date().toISOString()
    });
  }

  // System Settings Events - SỬA: Sử dụng ADMIN_EVENTS
  async publishSystemSettingCreated(settingData) {
    if (!settingData?.key) return;
    await this.publishEvent(eventTypes.SYSTEM_SETTING_CREATED, {
      key: settingData.key,
      value: settingData.value,
      dataType: settingData.dataType,
      category: settingData.category,
      createdBy: settingData.createdBy,
      createdAt: new Date().toISOString()
    });
  }

  async publishSystemSettingUpdated(settingData) {
    if (!settingData?.key) return;
    await this.publishEvent(eventTypes.SYSTEM_SETTING_UPDATED, {
      key: settingData.key,
      oldValue: settingData.oldValue,
      newValue: settingData.newValue,
      dataType: settingData.dataType,
      updatedBy: settingData.updatedBy,
      updatedAt: new Date().toISOString()
    });
  }

  async publishSystemSettingsBatchUpdated(settingData) {
    if (!settingData?.updates?.length) return;
    await this.publishEvent(eventTypes.SYSTEM_SETTINGS_BATCH_UPDATED, {
      updates: settingData.updates,
      updatedBy: settingData.updatedBy,
      updatedAt: new Date().toISOString()
    });
  }

  // Analytics Events - SỬA: Sử dụng ADMIN_EVENTS
  async publishAnalyticsGenerated(analyticsData) {
    if (!analyticsData?.type) return;
    await this.publishEvent(eventTypes.ANALYTICS_GENERATED, {
      type: analyticsData.type,
      period: analyticsData.period,
      generatedAt: new Date().toISOString()
    });
  }

  async startEventConsumers() {
    if (!this.isConnected) {
      logger.warn('Event service not connected, skipping event consumers');
      return;
    }

    try {
      // Subscribe to user events for KYC auto-creation
      await this.eventBus.subscribe(eventTypes.USER_CREATED, this.handleUserCreated.bind(this));
      
      // Subscribe to system events for monitoring
      await this.eventBus.subscribe(eventTypes.SERVICE_HEALTHY, this.handleServiceHealthy.bind(this));
      await this.eventBus.subscribe(eventTypes.SERVICE_ERROR, this.handleServiceError.bind(this));


      logger.info('Admin service event consumers started successfully');
    } catch (error) {
      logger.error('Failed to start admin service event consumers', { 
        error: error.message,
        stack: error.stack 
      });
      throw error; // Thêm throw để thấy lỗi rõ hơn
    }
  }

  async handleUserCreated(userData) {
    try {
      logger.info('User created event received', { userId: userData.userId });
      
      // Auto-create KYC record when user is created
      const { KYCVerification } = await import('../models/index.js');
      await KYCVerification.create({
        userId: userData.userId,
        verificationStatus: 'pending'
      });

      logger.debug('Auto-created KYC record for new user', { userId: userData.userId });
    } catch (error) {
      logger.error('Error handling user created event', { 
        error: error.message, 
        userId: userData.userId,
        stack: error.stack 
      });
    }
  }

  async handleServiceHealthy(serviceData) {
    try {
      logger.info('Service healthy event received', { 
        service: serviceData.service,
        timestamp: serviceData.timestamp 
      });

      // Log to analytics
      const analyticsRepository = (await import('../repositories/analyticsRepository.js')).default;
      await analyticsRepository.logAnalyticsEvent({
        event_type: 'system.service.healthy',
        service: serviceData.service,
        action: 'health_check',
        metadata: serviceData,
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      logger.error('Error handling service healthy event', { 
        error: error.message,
        stack: error.stack 
      });
    }
  }

  async handleServiceError(serviceData) {
    try {
      logger.error('Service error event received', { 
        service: serviceData.service,
        error: serviceData.error 
      });

      // Log to analytics and system logs
      const analyticsRepository = (await import('../repositories/analyticsRepository.js')).default;
      await analyticsRepository.logSystemLog({
        service_name: serviceData.service,
        log_level: 'error',
        message: `Service error: ${serviceData.error}`,
        metadata: serviceData,
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development'
      });

      // TODO: Send alert to admin (email, Slack, etc.)
    } catch (error) {
      logger.error('Error handling service error event', { 
        error: error.message,
        stack: error.stack 
      });
    }
  }

  async healthCheck() {
    try {
      return await this.eventBus.healthCheck();
    } catch (error) {
      return { 
        healthy: false, 
        service: 'event-service', 
        error: error.message 
      };
    }
  }
}

export default new EventService();