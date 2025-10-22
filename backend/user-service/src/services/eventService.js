import { 
  createEventBus, 
  eventTypes,
  logger 
} from '@ev-coownership/shared';

class EventService {
  constructor() {
    this.eventBus = createEventBus('user-service');
    this.isConnected = false;
    this.retryAttempts = 3;
    this.retryDelay = 500;
  }

  async initialize() {
    try {
      await this.eventBus.rabbitMQ.connect();
      this.isConnected = true;
      logger.info('User service event service initialized successfully');
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to initialize user service event service', { error: error.message });
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

  // User Events
  async publishUserProfileCreated(profileData) {
    if (!profileData?.userId) return;
    await this.publishEvent(eventTypes.USER_PROFILE_CREATED, {
      userId: profileData.userId,
      profile: profileData.profile,
      createdAt: new Date().toISOString()
    });
  }

  async publishUserProfileUpdated(profileData) {
    if (!profileData?.userId) return;
    await this.publishEvent(eventTypes.USER_PROFILE_UPDATED, {
      userId: profileData.userId,
      profile: profileData.profile,
      updatedAt: new Date().toISOString()
    });
  }

  // Group Events
  async publishGroupCreated(groupData) {
    if (!groupData?.groupId) return;
    await this.publishEvent(eventTypes.GROUP_CREATED, {
      groupId: groupData.groupId,
      createdBy: groupData.createdBy,
      groupName: groupData.groupName,
      createdAt: new Date().toISOString()
    });
  }

  async publishGroupUpdated(groupData) {
    if (!groupData?.groupId) return;
    await this.publishEvent(eventTypes.GROUP_UPDATED, {
      groupId: groupData.groupId,
      updatedBy: groupData.updatedBy,
      updates: groupData.updates,
      updatedAt: new Date().toISOString()
    });
  }

  async publishGroupDeleted(groupData) {
    if (!groupData?.groupId) return;
    await this.publishEvent(eventTypes.GROUP_DELETED, {
      groupId: groupData.groupId,
      deletedBy: groupData.deletedBy,
      deletedAt: new Date().toISOString()
    });
  }

  async publishMemberAdded(memberData) {
    if (!memberData?.groupId || !memberData?.userId) return;
    await this.publishEvent(eventTypes.MEMBER_ADDED, {
      groupId: memberData.groupId,
      userId: memberData.userId,
      addedBy: memberData.addedBy,
      role: memberData.role,
      ownershipPercentage: memberData.ownershipPercentage,
      addedAt: new Date().toISOString()
    });
  }

  async publishMemberRemoved(memberData) {
    if (!memberData?.groupId || !memberData?.userId) return;
    await this.publishEvent(eventTypes.MEMBER_REMOVED, {
      groupId: memberData.groupId,
      userId: memberData.userId,
      removedBy: memberData.removedBy,
      removedAt: new Date().toISOString()
    });
  }

  async publishOwnershipUpdated(ownershipData) {
    if (!ownershipData?.groupId || !ownershipData?.userId) return;
    await this.publishEvent(eventTypes.OWNERSHIP_UPDATED, {
      groupId: ownershipData.groupId,
      userId: ownershipData.userId,
      newPercentage: ownershipData.newPercentage,
      updatedBy: ownershipData.updatedBy,
      updatedAt: new Date().toISOString()
    });
  }

  // Vote Events
  async publishVoteCreated(voteData) {
    if (!voteData?.voteId) return;
    await this.publishEvent(eventTypes.VOTE_CREATED, {
      voteId: voteData.voteId,
      groupId: voteData.groupId,
      createdBy: voteData.createdBy,
      voteType: voteData.voteType,
      title: voteData.title,
      deadline: voteData.deadline,
      createdAt: new Date().toISOString()
    });
  }

  async publishVoteCast(voteData) {
    if (!voteData?.voteId || !voteData?.userId) return;
    await this.publishEvent(eventTypes.VOTE_CAST, {
      voteId: voteData.voteId,
      userId: voteData.userId,
      optionId: voteData.optionId,
      groupId: voteData.groupId,
      voteType: voteData.voteType,
      votedAt: new Date().toISOString()
    });
  }

  async publishVoteClosed(voteData) {
    if (!voteData?.voteId) return;
    await this.publishEvent(eventTypes.VOTE_CLOSED, {
      voteId: voteData.voteId,
      closedBy: voteData.closedBy,
      groupId: voteData.groupId,
      voteType: voteData.voteType,
      closedAt: voteData.closedAt || new Date().toISOString()
    });
  }

  // Fund Events
  async publishFundDeposit(fundData) {
    if (!fundData?.groupId || !fundData?.userId) return;
    await this.publishEvent(eventTypes.FUND_DEPOSIT, {
      groupId: fundData.groupId,
      userId: fundData.userId,
      amount: fundData.amount,
      transactionId: fundData.transactionId,
      newBalance: fundData.newBalance,
      description: fundData.description,
      depositedAt: new Date().toISOString()
    });
  }

  async publishFundWithdrawal(fundData) {
    if (!fundData?.groupId || !fundData?.userId) return;
    await this.publishEvent(eventTypes.FUND_WITHDRAWAL, {
      groupId: fundData.groupId,
      userId: fundData.userId,
      amount: fundData.amount,
      transactionId: fundData.transactionId,
      newBalance: fundData.newBalance,
      description: fundData.description,
      withdrawnAt: new Date().toISOString()
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

      logger.info('User service event consumers started successfully');
    } catch (error) {
      logger.error('Failed to start user service event consumers', { error: error.message });
    }
  }

  async handleUserCreated(userData) {
    try {
      logger.info('User created event received', { userId: userData.userId });
      // Auto-create user profile when user is created in auth service
    } catch (error) {
      logger.error('Error handling user created event', { error: error.message, userId: userData.userId });
    }
  }

  async handleUserDeleted(userData) {
    try {
      logger.info('User deleted event received', { userId: userData.userId });
      // Handle user deletion - cleanup related data
    } catch (error) {
      logger.error('Error handling user deleted event', { error: error.message, userId: userData.userId });
    }
  }

  async healthCheck() {
    return await this.eventBus.healthCheck();
  }
}

export default new EventService();