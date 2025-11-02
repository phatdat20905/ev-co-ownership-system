// src/services/eventService.js
import { 
  createEventBus, 
  eventTypes,
  logger 
} from '@ev-coownership/shared';

class EventService {
  constructor() {
    this.eventBus = createEventBus('vehicle-service');
    this.isConnected = false;
    this.retryAttempts = 3;
    this.retryDelay = 500;
  }

  async initialize() {
    try {
      await this.eventBus.rabbitMQ.connect();
      this.isConnected = true;
      logger.info('Vehicle service event service initialized successfully');
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to initialize vehicle service event service', { error: error.message });
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
        logger.debug(`Event published: ${eventType}`, { 
          eventType,
          payloadKeys: Object.keys(payload) 
        });
        return;
      } catch (error) {
        logger.error(`Failed to publish event [Attempt ${attempt}]`, { eventType, error: error.message });
        if (attempt < this.retryAttempts) {
          await new Promise(res => setTimeout(res, this.retryDelay));
        }
      }
    }
  }

  // ---------------- Vehicle Events ----------------
  async publishVehicleCreated(vehicleData) {
    if (!vehicleData?.vehicleId) return;
    await this.publishEvent(eventTypes.VEHICLE_CREATED, {
      vehicleId: vehicleData.vehicleId,
      groupId: vehicleData.groupId,
      vehicleName: vehicleData.vehicleName,
      licensePlate: vehicleData.licensePlate,
      createdBy: vehicleData.createdBy,
      createdAt: new Date().toISOString()
    });
  }

  async publishVehicleUpdated(vehicleData) {
    if (!vehicleData?.vehicleId) return;
    await this.publishEvent(eventTypes.VEHICLE_UPDATED, {
      vehicleId: vehicleData.vehicleId,
      groupId: vehicleData.groupId,
      updates: vehicleData.updates,
      updatedBy: vehicleData.updatedBy,
      updatedAt: new Date().toISOString()
    });
  }

  async publishVehicleDeleted(vehicleData) {
    if (!vehicleData?.vehicleId) return;
    await this.publishEvent(eventTypes.VEHICLE_DELETED, {
      vehicleId: vehicleData.vehicleId,
      groupId: vehicleData.groupId,
      deletedBy: vehicleData.deletedBy,
      deletedAt: new Date().toISOString()
    });
  }

  async publishVehicleStatusChanged(vehicleData) {
    if (!vehicleData?.vehicleId) return;
    await this.publishEvent(eventTypes.VEHICLE_STATUS_CHANGED, {
      vehicleId: vehicleData.vehicleId,
      groupId: vehicleData.groupId,
      oldStatus: vehicleData.oldStatus,
      newStatus: vehicleData.newStatus,
      reason: vehicleData.reason,
      changedBy: vehicleData.changedBy,
      changedAt: new Date().toISOString()
    });
  }

  // ---------------- Maintenance Events ----------------
  async publishMaintenanceScheduled(maintenanceData) {
    if (!maintenanceData?.scheduleId) return;
    await this.publishEvent(eventTypes.MAINTENANCE_SCHEDULED, {
      scheduleId: maintenanceData.scheduleId,
      vehicleId: maintenanceData.vehicleId,
      groupId: maintenanceData.groupId,
      maintenanceType: maintenanceData.maintenanceType,
      scheduledDate: maintenanceData.scheduledDate,
      scheduledBy: maintenanceData.scheduledBy,
      scheduledAt: new Date().toISOString()
    });
  }

  async publishMaintenanceUpdated(maintenanceData) {
    if (!maintenanceData?.scheduleId) return;
    await this.publishEvent(eventTypes.MAINTENANCE_UPDATED, {
      scheduleId: maintenanceData.scheduleId,
      vehicleId: maintenanceData.vehicleId,
      groupId: maintenanceData.groupId,
      updates: maintenanceData.updates,
      updatedBy: maintenanceData.updatedBy,
      updatedAt: new Date().toISOString()
    });
  }

  async publishMaintenanceCompleted(maintenanceData) {
    if (!maintenanceData?.scheduleId) return;
    await this.publishEvent(eventTypes.MAINTENANCE_COMPLETED, {
      scheduleId: maintenanceData.scheduleId,
      historyId: maintenanceData.historyId,
      vehicleId: maintenanceData.vehicleId,
      groupId: maintenanceData.groupId,
      maintenanceType: maintenanceData.maintenanceType,
      cost: maintenanceData.cost,
      performedBy: maintenanceData.performedBy,
      completedAt: new Date().toISOString()
    });
  }

  async publishMaintenanceCancelled(maintenanceData) {
    if (!maintenanceData?.scheduleId) return;
    await this.publishEvent(eventTypes.MAINTENANCE_CANCELLED, {
      scheduleId: maintenanceData.scheduleId,
      vehicleId: maintenanceData.vehicleId,
      groupId: maintenanceData.groupId,
      cancelledBy: maintenanceData.cancelledBy,
      cancelledAt: new Date().toISOString()
    });
  }

  async publishMaintenanceReminder(maintenanceData) {
    if (!maintenanceData?.scheduleId) return;
    await this.publishEvent(eventTypes.MAINTENANCE_REMINDER, {
      scheduleId: maintenanceData.scheduleId,
      vehicleId: maintenanceData.vehicleId,
      groupId: maintenanceData.groupId,
      maintenanceType: maintenanceData.maintenanceType,
      scheduledDate: maintenanceData.scheduledDate,
      daysUntilDue: maintenanceData.daysUntilDue,
      remindedAt: new Date().toISOString()
    });
  }

  async publishMaintenanceCostRecorded(costData) {
    if (!costData?.costId) return;
    await this.publishEvent('cost.maintenance.recorded', { // Custom event for Cost Service
      costId: costData.costId,
      vehicleId: costData.vehicleId,
      groupId: costData.groupId,
      amount: costData.amount,
      category: costData.category,
      description: costData.description,
      date: costData.date,
      recordedAt: new Date().toISOString()
    });
  }

  // ---------------- Insurance Events ----------------
  async publishInsuranceAdded(insuranceData) {
    if (!insuranceData?.insuranceId) return;
    await this.publishEvent(eventTypes.INSURANCE_ADDED, {
      insuranceId: insuranceData.insuranceId,
      vehicleId: insuranceData.vehicleId,
      groupId: insuranceData.groupId,
      insuranceProvider: insuranceData.insuranceProvider,
      policyNumber: insuranceData.policyNumber,
      startDate: insuranceData.startDate,
      endDate: insuranceData.endDate,
      premiumAmount: insuranceData.premiumAmount,
      addedBy: insuranceData.addedBy,
      addedAt: new Date().toISOString()
    });
  }

  async publishInsuranceUpdated(insuranceData) {
    if (!insuranceData?.insuranceId) return;
    await this.publishEvent(eventTypes.INSURANCE_UPDATED, {
      insuranceId: insuranceData.insuranceId,
      vehicleId: insuranceData.vehicleId,
      groupId: insuranceData.groupId,
      updates: insuranceData.updates,
      updatedBy: insuranceData.updatedBy,
      updatedAt: new Date().toISOString()
    });
  }

  async publishInsuranceExpiring(insuranceData) {
    if (!insuranceData?.insuranceId) return;
    await this.publishEvent(eventTypes.INSURANCE_EXPIRING, {
      insuranceId: insuranceData.insuranceId,
      vehicleId: insuranceData.vehicleId,
      groupId: insuranceData.groupId,
      insuranceProvider: insuranceData.insuranceProvider,
      policyNumber: insuranceData.policyNumber,
      endDate: insuranceData.endDate,
      daysUntilExpiry: insuranceData.daysUntilExpiry,
      vehicleName: insuranceData.vehicleName,
      licensePlate: insuranceData.licensePlate,
      remindedAt: new Date().toISOString()
    });
  }

  // ---------------- Charging Events ----------------
  async publishChargingSessionStarted(chargingData) {
    if (!chargingData?.sessionId) return;
    await this.publishEvent(eventTypes.CHARGING_SESSION_STARTED, {
      sessionId: chargingData.sessionId,
      vehicleId: chargingData.vehicleId,
      groupId: chargingData.groupId,
      userId: chargingData.userId,
      startTime: chargingData.startTime,
      startBatteryLevel: chargingData.startBatteryLevel,
      startedAt: new Date().toISOString()
    });
  }

  async publishChargingSessionCompleted(chargingData) {
    if (!chargingData?.sessionId) return;
    await this.publishEvent(eventTypes.CHARGING_SESSION_COMPLETED, {
      sessionId: chargingData.sessionId,
      vehicleId: chargingData.vehicleId,
      groupId: chargingData.groupId,
      userId: chargingData.userId,
      endTime: chargingData.endTime,
      endBatteryLevel: chargingData.endBatteryLevel,
      energyConsumedKwh: chargingData.energyConsumedKwh,
      cost: chargingData.cost,
      completedAt: new Date().toISOString()
    });
  }

  async publishChargingCostRecorded(costData) {
    if (!costData?.sessionId) return;
    await this.publishEvent('cost.charging.recorded', { // Custom event for Cost Service
      sessionId: costData.sessionId,
      vehicleId: costData.vehicleId,
      groupId: costData.groupId,
      userId: costData.userId,
      amount: costData.amount,
      energyConsumedKwh: costData.energyConsumedKwh,
      date: costData.date,
      chargingStation: costData.chargingStation,
      recordedAt: new Date().toISOString()
    });
  }

  // ---------------- Analytics Events ----------------
  async publishBatteryHealthChecked(analyticsData) {
    if (!analyticsData?.vehicleId) return;
    await this.publishEvent(eventTypes.BATTERY_HEALTH_CHECKED, {
      vehicleId: analyticsData.vehicleId,
      groupId: analyticsData.groupId,
      healthStatus: analyticsData.healthStatus,
      efficiency: analyticsData.efficiency,
      degradationRate: analyticsData.degradationRate,
      checkedAt: analyticsData.checkedAt || new Date().toISOString()
    });
  }

  async publishVehicleUtilizationCalculated(analyticsData) {
    if (!analyticsData?.vehicleId) return;
    await this.publishEvent(eventTypes.VEHICLE_UTILIZATION_CALCULATED, {
      vehicleId: analyticsData.vehicleId,
      groupId: analyticsData.groupId,
      period: analyticsData.period,
      utilizationRate: analyticsData.utilizationRate,
      calculatedAt: analyticsData.calculatedAt || new Date().toISOString()
    });
  }

  async publishMaintenanceCostAnalyzed(analyticsData) {
    if (!analyticsData?.vehicleId) return;
    await this.publishEvent(eventTypes.MAINTENANCE_COST_ANALYZED, {
      vehicleId: analyticsData.vehicleId,
      groupId: analyticsData.groupId,
      year: analyticsData.year,
      totalCost: analyticsData.totalCost,
      maintenanceCount: analyticsData.maintenanceCount,
      analyzedAt: analyticsData.analyzedAt || new Date().toISOString()
    });
  }

  // ---------------- Event Consumers ----------------
  async startEventConsumers() {
    if (!this.isConnected) {
      logger.warn('Event service not connected, skipping event consumers');
      return;
    }

    try {
      // Subscribe to user events for group membership changes
      await this.eventBus.subscribe(eventTypes.MEMBER_ADDED, this.handleMemberAdded.bind(this));
      await this.eventBus.subscribe(eventTypes.MEMBER_REMOVED, this.handleMemberRemoved.bind(this));
      await this.eventBus.subscribe(eventTypes.GROUP_DELETED, this.handleGroupDeleted.bind(this));

      // Subscribe to booking events for vehicle status updates
      await this.eventBus.subscribe(eventTypes.BOOKING_CREATED, this.handleBookingCreated.bind(this));
      await this.eventBus.subscribe(eventTypes.BOOKING_COMPLETED, this.handleBookingCompleted.bind(this));

      logger.info('Vehicle service event consumers started successfully');
    } catch (error) {
      logger.error('Failed to start vehicle service event consumers', { error: error.message });
    }
  }

  // ---------------- Event Handlers ----------------
  async handleMemberAdded(memberData) {
    try {
      logger.info('Member added event received', { 
        groupId: memberData.groupId, 
        userId: memberData.userId 
      });
      // Could update cache or perform other actions when new members are added
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
      // Could update cache or perform cleanup when members are removed
    } catch (error) {
      logger.error('Error handling member removed event', { 
        error: error.message, 
        groupId: memberData.groupId 
      });
    }
  }

  async handleGroupDeleted(groupData) {
    try {
      logger.info('Group deleted event received', { groupId: groupData.groupId });
      // Handle group deletion - might want to archive or update vehicle records
    } catch (error) {
      logger.error('Error handling group deleted event', { 
        error: error.message, 
        groupId: groupData.groupId 
      });
    }
  }

  async handleBookingCreated(bookingData) {
    try {
      logger.info('Booking created event received', { 
        vehicleId: bookingData.vehicleId,
        bookingId: bookingData.bookingId
      });
      // Could update vehicle status or cache when booking is created
    } catch (error) {
      logger.error('Error handling booking created event', { 
        error: error.message, 
        vehicleId: bookingData.vehicleId 
      });
    }
  }

  async handleBookingCompleted(bookingData) {
    try {
      logger.info('Booking completed event received', { 
        vehicleId: bookingData.vehicleId,
        bookingId: bookingData.bookingId
      });
      // Could update vehicle status or perform cleanup when booking is completed
    } catch (error) {
      logger.error('Error handling booking completed event', { 
        error: error.message, 
        vehicleId: bookingData.vehicleId 
      });
    }
  }

  // ---------------- Health Check ----------------
  async healthCheck() {
    return await this.eventBus.healthCheck();
  }
}

export default new EventService();