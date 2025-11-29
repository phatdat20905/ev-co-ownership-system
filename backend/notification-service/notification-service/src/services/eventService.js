// src/services/eventService.js
import { createEventBus, eventTypes, logger } from '@ev-coownership/shared';
import userEventConsumer from '../events/consumers/userEventConsumer.js';
import bookingEventConsumer from '../events/consumers/bookingEventConsumer.js';
import paymentEventConsumer from '../events/consumers/paymentEventConsumer.js';
import disputeEventConsumer from '../events/consumers/disputeEventConsumer.js';
import notificationEventPublisher from '../events/publishers/notificationEventPublisher.js';

class EventService {
  constructor() {
    this.eventBus = createEventBus('notification-service');
    this.isConnected = false;
    this.retryAttempts = 3;
    this.retryDelay = 500;
  }

  async initialize() {
    try {
      await this.eventBus.rabbitMQ.connect();
      this.isConnected = true;
      
      // Initialize event publisher
      await notificationEventPublisher.initialize();
      
      logger.info('Notification service event service initialized successfully');
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to initialize notification service event service', { error: error.message });
    }
  }

  async startEventConsumers() {
    if (!this.isConnected) {
      logger.warn('Event service not connected, skipping event consumers');
      return;
    }

    try {
      // User events
      await this.eventBus.subscribe(eventTypes.USER_REGISTERED, userEventConsumer.handleUserRegistered.bind(userEventConsumer));
      await this.eventBus.subscribe(eventTypes.USER_VERIFIED, userEventConsumer.handleUserVerified.bind(userEventConsumer));
      await this.eventBus.subscribe(eventTypes.KYC_APPROVED, userEventConsumer.handleKYCApproved.bind(userEventConsumer));
      await this.eventBus.subscribe(eventTypes.KYC_REJECTED, userEventConsumer.handleKYCRejected.bind(userEventConsumer));

      // Booking events
      await this.eventBus.subscribe(eventTypes.BOOKING_CREATED, bookingEventConsumer.handleBookingCreated.bind(bookingEventConsumer));
      await this.eventBus.subscribe(eventTypes.BOOKING_CONFIRMED, bookingEventConsumer.handleBookingConfirmed.bind(bookingEventConsumer));
      await this.eventBus.subscribe(eventTypes.BOOKING_CANCELLED, bookingEventConsumer.handleBookingCancelled.bind(bookingEventConsumer));
      
      // Payment events
      await this.eventBus.subscribe(eventTypes.PAYMENT_COMPLETED, paymentEventConsumer.handlePaymentSuccess.bind(paymentEventConsumer));
      await this.eventBus.subscribe(eventTypes.PAYMENT_FAILED, paymentEventConsumer.handlePaymentFailed.bind(paymentEventConsumer));
      await this.eventBus.subscribe(eventTypes.INVOICE_GENERATED, paymentEventConsumer.handleInvoiceGenerated.bind(paymentEventConsumer));

      // Dispute events
      await this.eventBus.subscribe(eventTypes.DISPUTE_CREATED, disputeEventConsumer.handleDisputeCreated.bind(disputeEventConsumer));
      await this.eventBus.subscribe(eventTypes.DISPUTE_RESOLVED, disputeEventConsumer.handleDisputeResolved.bind(disputeEventConsumer));
      await this.eventBus.subscribe(eventTypes.DISPUTE_MESSAGE_ADDED, disputeEventConsumer.handleDisputeMessageAdded.bind(disputeEventConsumer));

      logger.info('Notification service event consumers started successfully');
    } catch (error) {
      logger.error('Failed to start notification service event consumers', { error: error.message });
    }
  }

  async healthCheck() {
    return await this.eventBus.healthCheck();
  }
}

export default new EventService();