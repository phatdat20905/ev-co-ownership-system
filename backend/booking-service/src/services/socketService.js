// booking-service/src/services/socketService.js
import { logger, redisClient } from '@ev-coownership/shared';
import jwt from 'jsonwebtoken';

export class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Map<userId, socketId[]>
    this.groupSubscriptions = new Map(); // Map<groupId, socketId[]>
  }

  initialize(io) {
    this.io = io;
    
    // Socket middleware for authentication
    io.use(this.authenticateSocket.bind(this));
    
    // Connection handler
    io.on('connection', this.handleConnection.bind(this));
    
    logger.info('Socket service initialized');
  }

  // Middleware xác thực JWT
  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      
      next();
    } catch (error) {
      logger.error('Socket authentication failed', { error: error.message });
      next(new Error('Authentication error: Invalid token'));
    }
  }

  async handleConnection(socket) {
    const { userId } = socket;
    
    logger.info('User connected via socket', { userId, socketId: socket.id });

    // Lưu thông tin kết nối
    this.addUserConnection(userId, socket.id);

    // Join user room để gửi thông báo cá nhân
    socket.join(`user:${userId}`);

    // Xử lý các events từ client
    this.setupSocketHandlers(socket);

    // Xử lý ngắt kết nối
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Gửi confirmation
    socket.emit('connected', { 
      message: 'Connected to booking service',
      userId,
      timestamp: new Date().toISOString()
    });
  }

  setupSocketHandlers(socket) {
    const { userId } = socket;

    // Subscribe to group calendar updates
    socket.on('subscribe:calendar', (groupId) => {
      this.subscribeToGroupCalendar(socket, groupId);
    });

    // Unsubscribe from group calendar
    socket.on('unsubscribe:calendar', (groupId) => {
      this.unsubscribeFromGroupCalendar(socket, groupId);
    });

    // Subscribe to booking updates
    socket.on('subscribe:booking', (bookingId) => {
      this.subscribeToBooking(socket, bookingId);
    });

    // Real-time booking creation
    socket.on('booking:create', async (bookingData) => {
      await this.handleBookingCreation(socket, bookingData);
    });

    // Real-time booking update
    socket.on('booking:update', async (updateData) => {
      await this.handleBookingUpdate(socket, updateData);
    });

    // Check-in/out notifications
    socket.on('checkin:notify', (data) => {
      this.handleCheckInNotification(socket, data);
    });

    // Ping/Pong for connection health
    socket.on('ping', (callback) => {
      if (typeof callback === 'function') {
        callback({ timestamp: new Date().toISOString() });
      }
    });
  }

  // ========== SUBSCRIPTION MANAGEMENT ==========

  subscribeToGroupCalendar(socket, groupId) {
    const roomName = `group:calendar:${groupId}`;
    socket.join(roomName);
    
    // Lưu subscription
    if (!this.groupSubscriptions.has(groupId)) {
      this.groupSubscriptions.set(groupId, new Set());
    }
    this.groupSubscriptions.get(groupId).add(socket.id);

    logger.debug('User subscribed to group calendar', {
      userId: socket.userId,
      groupId,
      socketId: socket.id
    });

    socket.emit('subscription:confirmed', {
      type: 'calendar',
      groupId,
      message: 'Subscribed to calendar updates'
    });
  }

  unsubscribeFromGroupCalendar(socket, groupId) {
    const roomName = `group:calendar:${groupId}`;
    socket.leave(roomName);
    
    if (this.groupSubscriptions.has(groupId)) {
      this.groupSubscriptions.get(groupId).delete(socket.id);
      if (this.groupSubscriptions.get(groupId).size === 0) {
        this.groupSubscriptions.delete(groupId);
      }
    }

    logger.debug('User unsubscribed from group calendar', {
      userId: socket.userId,
      groupId
    });
  }

  subscribeToBooking(socket, bookingId) {
    const roomName = `booking:${bookingId}`;
    socket.join(roomName);

    socket.emit('subscription:confirmed', {
      type: 'booking',
      bookingId,
      message: 'Subscribed to booking updates'
    });
  }

  // ========== REAL-TIME EVENT HANDLERS ==========

  async handleBookingCreation(socket, bookingData) {
    try {
      // Validate data
      if (!bookingData.vehicleId || !bookingData.startTime || !bookingData.endTime) {
        socket.emit('booking:create:error', {
          error: 'Missing required booking data'
        });
        return;
      }

      // Gửi real-time confirmation
      socket.emit('booking:create:processing', {
        message: 'Creating booking...',
        timestamp: new Date().toISOString()
      });

      // Note: Actual booking creation sẽ qua REST API
      // Đây chỉ là real-time notification

    } catch (error) {
      logger.error('Error handling real-time booking creation', {
        error: error.message,
        userId: socket.userId
      });
      
      socket.emit('booking:create:error', {
        error: 'Failed to process booking creation'
      });
    }
  }

  async handleBookingUpdate(socket, updateData) {
    try {
      // Real-time update processing
      socket.emit('booking:update:processing', {
        message: 'Updating booking...',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error handling real-time booking update', {
        error: error.message,
        userId: socket.userId
      });
    }
  }

  handleCheckInNotification(socket, data) {
    // Broadcast check-in notification to relevant users
    const { bookingId, vehicleId, groupId } = data;
    
    this.io.to(`group:${groupId}`).emit('checkin:notification', {
      bookingId,
      vehicleId,
      userId: socket.userId,
      timestamp: new Date().toISOString(),
      type: 'check_in'
    });
  }

  // ========== REAL-TIME EVENT PUBLISHING ==========

  // Khi có booking mới
  publishBookingCreated(booking) {
    const { groupId, vehicleId, id: bookingId } = booking;
    
    // Gửi đến group calendar room
    this.io.to(`group:calendar:${groupId}`).emit('calendar:updated', {
      type: 'booking_created',
      bookingId,
      vehicleId,
      groupId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      timestamp: new Date().toISOString()
    });

    // Gửi đến user room
    this.io.to(`user:${booking.userId}`).emit('booking:created', {
      bookingId,
      vehicleId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status
    });

    logger.debug('Published booking created event via socket', { bookingId });
  }

  // Khi booking được cập nhật
  publishBookingUpdated(booking, oldData = {}) {
    const { groupId, vehicleId, id: bookingId } = booking;
    
    this.io.to(`group:calendar:${groupId}`).emit('calendar:updated', {
      type: 'booking_updated',
      bookingId,
      vehicleId,
      groupId,
      updates: this.getChangedFields(oldData, booking),
      timestamp: new Date().toISOString()
    });

    this.io.to(`booking:${bookingId}`).emit('booking:updated', {
      bookingId,
      updates: this.getChangedFields(oldData, booking),
      timestamp: new Date().toISOString()
    });

    logger.debug('Published booking updated event via socket', { bookingId });
  }

  // Khi booking bị hủy
  publishBookingCancelled(booking) {
    const { groupId, vehicleId, id: bookingId } = booking;
    
    this.io.to(`group:calendar:${groupId}`).emit('calendar:updated', {
      type: 'booking_cancelled',
      bookingId,
      vehicleId,
      groupId,
      timestamp: new Date().toISOString()
    });

    this.io.to(`booking:${bookingId}`).emit('booking:cancelled', {
      bookingId,
      reason: booking.cancellationReason,
      timestamp: new Date().toISOString()
    });

    logger.debug('Published booking cancelled event via socket', { bookingId });
  }

  // Khi có conflict
  publishBookingConflict(conflict) {
    const { bookingId_1, bookingId_2, conflictType } = conflict;
    
    // Thông báo cho cả 2 users có booking conflict
    [bookingId_1, bookingId_2].filter(Boolean).forEach(bookingId => {
      this.io.to(`booking:${bookingId}`).emit('booking:conflict', {
        conflictId: conflict.id,
        bookingId,
        conflictType,
        timestamp: new Date().toISOString()
      });
    });

    logger.debug('Published booking conflict event via socket', { 
      conflictId: conflict.id 
    });
  }

  // Real-time calendar availability update
  publishCalendarAvailability(vehicleId, date, timeSlots) {
    this.io.to(`vehicle:calendar:${vehicleId}`).emit('availability:updated', {
      vehicleId,
      date,
      timeSlots,
      timestamp: new Date().toISOString()
    });
  }

  // ========== CONNECTION MANAGEMENT ==========

  addUserConnection(userId, socketId) {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId).add(socketId);
  }

  removeUserConnection(userId, socketId) {
    if (this.connectedUsers.has(userId)) {
      this.connectedUsers.get(userId).delete(socketId);
      if (this.connectedUsers.get(userId).size === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }

  handleDisconnection(socket) {
    const { userId, id: socketId } = socket;
    
    this.removeUserConnection(userId, socketId);
    
    // Remove from all group subscriptions
    for (const [groupId, sockets] of this.groupSubscriptions.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.groupSubscriptions.delete(groupId);
        }
      }
    }

    logger.info('User disconnected from socket', { userId, socketId });
  }

  // ========== UTILITY METHODS ==========

  getChangedFields(oldData, newData) {
    const changes = {};
    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          from: oldData[key],
          to: newData[key]
        };
      }
    }
    return changes;
  }

  // Get all connected users (for admin purposes)
  getConnectedUsers() {
    return Array.from(this.connectedUsers.entries()).map(([userId, sockets]) => ({
      userId,
      connectionCount: sockets.size
    }));
  }

  // Get group subscriptions (for admin purposes)
  getGroupSubscriptions() {
    return Array.from(this.groupSubscriptions.entries()).map(([groupId, sockets]) => ({
      groupId,
      subscriberCount: sockets.size
    }));
  }

  // Health check
  getHealthStatus() {
    return {
      connectedUsers: this.connectedUsers.size,
      groupSubscriptions: this.groupSubscriptions.size,
      totalConnections: Array.from(this.connectedUsers.values()).reduce(
        (total, sockets) => total + sockets.size, 0
      )
    };
  }
}

export default new SocketService();