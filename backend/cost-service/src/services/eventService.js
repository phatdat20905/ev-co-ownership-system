// src/services/eventService.js
import { 
  createEventBus, 
  eventTypes,
  logger 
} from '@ev-coownership/shared';

class EventService {
  constructor() {
    this.eventBus = createEventBus('cost-service');
    this.isConnected = false;
    this.retryAttempts = 3;
    this.retryDelay = 500;
  }

  async initialize() {
    try {
      await this.eventBus.rabbitMQ.connect();
      this.isConnected = true;
      logger.info('Cost service event service initialized successfully');
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to initialize cost service event service', { error: error.message });
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

  // ---------------- Cost Events ----------------
  async publishCostCreated(costData) {
    if (!costData?.costId || !costData?.groupId) return;
    await this.publishEvent(eventTypes.COST_CREATED, {
      costId: costData.costId,
      groupId: costData.groupId,
      vehicleId: costData.vehicleId,
      totalAmount: costData.totalAmount,
      createdBy: costData.createdBy,
      splitsCount: costData.splitsCount,
      createdAt: new Date().toISOString()
    });
  }

  async publishCostUpdated(costData) {
    if (!costData?.costId || !costData?.groupId) return;
    await this.publishEvent(eventTypes.COST_UPDATED, {
      costId: costData.costId,
      groupId: costData.groupId,
      updatedBy: costData.updatedBy,
      updates: costData.updates,
      updatedAt: new Date().toISOString()
    });
  }

  async publishCostDeleted(costData) {
    if (!costData?.costId) return;
    await this.publishEvent(eventTypes.COST_DELETED, {
      costId: costData.costId,
      deletedBy: costData.deletedBy,
      deletedAt: new Date().toISOString()
    });
  }

  async publishCostSplitUpdated(splitData) {
    if (!splitData?.splitId || !splitData?.costId) return;
    await this.publishEvent(eventTypes.COST_SPLIT_UPDATED, {
      splitId: splitData.splitId,
      costId: splitData.costId,
      userId: splitData.userId,
      amount: splitData.amount,
      status: splitData.status,
      updatedAt: new Date().toISOString()
    });
  }

  async publishCostOverdue(overdueData) {
    if (!overdueData?.splitId || !overdueData?.userId) return;
    await this.publishEvent(eventTypes.COST_OVERDUE, {
      splitId: overdueData.splitId,
      userId: overdueData.userId,
      costId: overdueData.costId,
      amount: overdueData.amount,
      dueDate: overdueData.dueDate,
      notifiedAt: new Date().toISOString()
    });
  }

  // ---------------- Payment Events ----------------
  async publishPaymentInitiated(paymentData) {
    if (!paymentData?.paymentId || !paymentData?.userId) return;
    await this.publishEvent(eventTypes.PAYMENT_INITIATED, {
      paymentId: paymentData.paymentId,
      userId: paymentData.userId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      costSplitId: paymentData.costSplitId,
      initiatedAt: new Date().toISOString()
    });
  }

  async publishPaymentProcessing(paymentData) {
    if (!paymentData?.paymentId) return;
    await this.publishEvent(eventTypes.PAYMENT_PROCESSING, {
      paymentId: paymentData.paymentId,
      transactionId: paymentData.transactionId,
      provider: paymentData.provider,
      processedAt: new Date().toISOString()
    });
  }

  async publishPaymentCompleted(paymentData) {
    if (!paymentData?.paymentId || !paymentData?.userId) return;
    await this.publishEvent(eventTypes.PAYMENT_COMPLETED, {
      paymentId: paymentData.paymentId,
      userId: paymentData.userId,
      amount: paymentData.amount,
      costSplitId: paymentData.costSplitId,
      completedAt: new Date().toISOString()
    });
  }

  async publishPaymentFailed(paymentData) {
    if (!paymentData?.paymentId) return;
    await this.publishEvent(eventTypes.PAYMENT_FAILED, {
      paymentId: paymentData.paymentId,
      userId: paymentData.userId,
      amount: paymentData.amount,
      error: paymentData.error,
      failedAt: new Date().toISOString()
    });
  }

  async publishPaymentRefunded(paymentData) {
    if (!paymentData?.paymentId) return;
    await this.publishEvent(eventTypes.PAYMENT_REFUNDED, {
      paymentId: paymentData.paymentId,
      userId: paymentData.userId,
      amount: paymentData.amount,
      refundReason: paymentData.refundReason,
      refundedAt: new Date().toISOString()
    });
  }

  async publishPaymentWebhookReceived(webhookData) {
    if (!webhookData?.provider) return;
    await this.publishEvent(eventTypes.PAYMENT_WEBHOOK_RECEIVED, {
      provider: webhookData.provider,
      transactionId: webhookData.transactionId,
      success: webhookData.success,
      amount: webhookData.amount,
      receivedAt: new Date().toISOString()
    });
  }

  // ---------------- Wallet Events ----------------
  async publishWalletCreated(walletData) {
    if (!walletData?.walletId || !walletData?.userId) return;
    await this.publishEvent(eventTypes.WALLET_CREATED, {
      walletId: walletData.walletId,
      userId: walletData.userId,
      balance: walletData.balance,
      currency: walletData.currency,
      createdAt: new Date().toISOString()
    });
  }

  async publishWalletBalanceUpdated(walletData) {
    if (!walletData?.walletId) return;
    await this.publishEvent(eventTypes.WALLET_BALANCE_UPDATED, {
      walletId: walletData.walletId,
      userId: walletData.userId,
      groupId: walletData.groupId,
      balance: walletData.balance,
      currency: walletData.currency,
      updatedAt: new Date().toISOString()
    });
  }

  async publishWalletDeposit(walletData) {
    if (!walletData?.walletId || !walletData?.userId) return;
    await this.publishEvent(eventTypes.WALLET_DEPOSIT, {
      walletId: walletData.walletId,
      userId: walletData.userId,
      amount: walletData.amount,
      transactionId: walletData.transactionId,
      newBalance: walletData.newBalance,
      depositedAt: new Date().toISOString()
    });
  }

  async publishWalletWithdrawal(walletData) {
    if (!walletData?.walletId || !walletData?.userId) return;
    await this.publishEvent(eventTypes.WALLET_WITHDRAWAL, {
      walletId: walletData.walletId,
      userId: walletData.userId,
      amount: walletData.amount,
      transactionId: walletData.transactionId,
      newBalance: walletData.newBalance,
      withdrawnAt: new Date().toISOString()
    });
  }

  // ---------------- Invoice Events ----------------
  async publishInvoiceGenerated(invoiceData) {
    if (!invoiceData?.invoiceId || !invoiceData?.groupId) return;
    await this.publishEvent(eventTypes.INVOICE_GENERATED, {
      invoiceId: invoiceData.invoiceId,
      groupId: invoiceData.groupId,
      invoiceNumber: invoiceData.invoiceNumber,
      totalAmount: invoiceData.totalAmount,
      periodStart: invoiceData.periodStart,
      periodEnd: invoiceData.periodEnd,
      generatedBy: invoiceData.generatedBy,
      generatedAt: new Date().toISOString()
    });
  }

  async publishInvoiceSent(invoiceData) {
    if (!invoiceData?.invoiceId) return;
    await this.publishEvent(eventTypes.INVOICE_SENT, {
      invoiceId: invoiceData.invoiceId,
      sentTo: invoiceData.sentTo,
      sentBy: invoiceData.sentBy,
      sentAt: new Date().toISOString()
    });
  }

  async publishInvoicePaid(invoiceData) {
    if (!invoiceData?.invoiceId) return;
    await this.publishEvent(eventTypes.INVOICE_PAID, {
      invoiceId: invoiceData.invoiceId,
      groupId: invoiceData.groupId,
      invoiceNumber: invoiceData.invoiceNumber,
      totalAmount: invoiceData.totalAmount,
      paidBy: invoiceData.paidBy,
      paidAt: new Date().toISOString()
    });
  }

  async publishInvoiceOverdue(invoiceData) {
    if (!invoiceData?.invoiceId) return;
    await this.publishEvent(eventTypes.INVOICE_OVERDUE, {
      invoiceId: invoiceData.invoiceId,
      groupId: invoiceData.groupId,
      invoiceNumber: invoiceData.invoiceNumber,
      dueDate: invoiceData.dueDate,
      totalAmount: invoiceData.totalAmount,
      notifiedAt: new Date().toISOString()
    });
  }

  async publishInvoiceReminder(invoiceData) {
    if (!invoiceData?.invoiceId) return;
    await this.publishEvent(eventTypes.INVOICE_REMINDER, {
      invoiceId: invoiceData.invoiceId,
      groupId: invoiceData.groupId,
      invoiceNumber: invoiceData.invoiceNumber,
      dueDate: invoiceData.dueDate,
      totalAmount: invoiceData.totalAmount,
      sentBy: invoiceData.sentBy,
      sentAt: new Date().toISOString()
    });
  }

  async publishInvoiceDownloaded(invoiceData) {
    if (!invoiceData?.invoiceId) return;
    await this.publishEvent(eventTypes.INVOICE_DOWNLOADED, {
      invoiceId: invoiceData.invoiceId,
      groupId: invoiceData.groupId,
      downloadedBy: invoiceData.downloadedBy,
      downloadedAt: new Date().toISOString()
    });
  }

  // ---------------- Report Events ----------------
  async publishReportGenerated(reportData) {
    if (!reportData?.reportId) return;
    await this.publishEvent(eventTypes.REPORT_GENERATED, {
      reportId: reportData.reportId,
      type: reportData.type,
      groupId: reportData.groupId,
      period: reportData.period,
      generatedBy: reportData.generatedBy,
      generatedAt: new Date().toISOString()
    });
  }

  async publishUsageAnalysisCompleted(analysisData) {
    if (!analysisData?.groupId) return;
    await this.publishEvent(eventTypes.USAGE_ANALYSIS_COMPLETED, {
      groupId: analysisData.groupId,
      period: analysisData.period,
      totalUsage: analysisData.totalUsage,
      averageUsage: analysisData.averageUsage,
      analyzedAt: new Date().toISOString()
    });
  }

  // ---------------- Event Consumers ----------------
  async startEventConsumers() {
    if (!this.isConnected) {
      logger.warn('Event service not connected, skipping event consumers');
      return;
    }

    try {
      // Subscribe to booking events for usage-based costs
      await this.eventBus.subscribe(eventTypes.BOOKING_COMPLETED, this.handleBookingCompleted.bind(this));
      
      // Subscribe to vehicle events for maintenance costs
      await this.eventBus.subscribe(eventTypes.MAINTENANCE_COMPLETED, this.handleMaintenanceCompleted.bind(this));
      
      // Subscribe to user events for group membership changes
      await this.eventBus.subscribe(eventTypes.MEMBER_ADDED, this.handleMemberAdded.bind(this));
      await this.eventBus.subscribe(eventTypes.MEMBER_REMOVED, this.handleMemberRemoved.bind(this));
      await this.eventBus.subscribe(eventTypes.OWNERSHIP_UPDATED, this.handleOwnershipUpdated.bind(this));

      logger.info('Cost service event consumers started successfully');
    } catch (error) {
      logger.error('Failed to start cost service event consumers', { error: error.message });
    }
  }

  // ---------------- Event Handlers ----------------
  async handleBookingCompleted(bookingData) {
    try {
      logger.info('Booking completed event received', { 
        bookingId: bookingData.bookingId,
        vehicleId: bookingData.vehicleId,
        userId: bookingData.userId
      });

      // Calculate usage-based costs from booking
      // This would call a service to create cost based on booking usage
      // await costService.createUsageCostFromBooking(bookingData);

    } catch (error) {
      logger.error('Error handling booking completed event', { 
        error: error.message, 
        bookingId: bookingData.bookingId 
      });
    }
  }

  async handleMaintenanceCompleted(maintenanceData) {
    try {
      logger.info('Maintenance completed event received', { 
        maintenanceId: maintenanceData.maintenanceId,
        vehicleId: maintenanceData.vehicleId,
        cost: maintenanceData.cost
      });

      // Create maintenance cost
      // await costService.createMaintenanceCost(maintenanceData);

    } catch (error) {
      logger.error('Error handling maintenance completed event', { 
        error: error.message, 
        maintenanceId: maintenanceData.maintenanceId 
      });
    }
  }

  async handleMemberAdded(memberData) {
    try {
      logger.info('Member added event received', { 
        groupId: memberData.groupId,
        userId: memberData.userId
      });

      // Recalculate cost splits for the group
      // await splitService.recalculateGroupSplits(memberData.groupId);

    } catch (error) {
      logger.error('Error handling member added event', { 
        error: error.message, 
        groupId: memberData.groupId 
      });
    }
  }

  async handleMemberRemoved(memberData) {
    try {
      logger.info('Member removed event received', { 
        groupId: memberData.groupId,
        userId: memberData.userId
      });

      // Handle member removal - adjust splits, etc.
      // await splitService.handleMemberRemoval(memberData.groupId, memberData.userId);

    } catch (error) {
      logger.error('Error handling member removed event', { 
        error: error.message, 
        groupId: memberData.groupId 
      });
    }
  }

  async handleOwnershipUpdated(ownershipData) {
    try {
      logger.info('Ownership updated event received', { 
        groupId: ownershipData.groupId,
        userId: ownershipData.userId,
        newPercentage: ownershipData.newPercentage
      });

      // Recalculate cost splits based on new ownership percentages
      // await splitService.recalculateGroupSplits(ownershipData.groupId);

    } catch (error) {
      logger.error('Error handling ownership updated event', { 
        error: error.message, 
        groupId: ownershipData.groupId 
      });
    }
  }

  // ---------------- Health check ----------------
  async healthCheck() {
    return await this.eventBus.healthCheck();
  }
}

export default new EventService();