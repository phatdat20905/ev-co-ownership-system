import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.notificationSocket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const BOOKING_SERVICE_URL = import.meta.env.VITE_BOOKING_SERVICE_URL || 'http://localhost:3003';

    this.socket = io(BOOKING_SERVICE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('✅ Socket connected to booking service');
    });

    this.socket.on('connected', (data) => {
      console.log('📡 Connection confirmed:', data);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    // Auto-reconnect with fresh token
    this.socket.on('error', (error) => {
      if (error.message.includes('Authentication')) {
        console.warn('Socket authentication failed, reconnecting...');
        const newToken = localStorage.getItem('authToken');
        if (newToken) {
          this.disconnect();
          setTimeout(() => this.connect(newToken), 1000);
        }
      }
    });

    // Also connect to Notification Service (for in-app notifications)
    try {
      const NOTIFICATION_SERVICE_URL = import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:3008';
      this.notificationSocket = io(NOTIFICATION_SERVICE_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true
      });

      this.notificationSocket.on('connect', () => {
        console.log('✅ Notification socket connected');
        // Identify user to the notification service so it can route messages
        try {
          const userDataRaw = localStorage.getItem('userData');
          const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
          const userId = userData?.id || userData?.userId || null;
          if (userId) {
            this.notificationSocket.emit('identify', userId);
            console.log('📣 Sent identify to notification service for user', userId);
          }
        } catch (err) {
          console.warn('Failed to identify to notification service', err);
        }
      });

      this.notificationSocket.on('disconnect', (reason) => {
        console.log('❌ Notification socket disconnected', reason);
      });

      this.notificationSocket.on('connect_error', (err) => {
        console.error('Notification socket connect error', err?.message || err);
      });

      // Forward generic notification events
      this.notificationSocket.on('notification', (payload) => {
        // allow consumers to subscribe using on('notification', cb)
        if (this.listeners.has('notification')) {
          this.listeners.get('notification').forEach(cb => cb(payload));
        }
      });
    } catch (err) {
      console.warn('Failed to initialize notification socket', err);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('Socket disconnected manually');
    }
    if (this.notificationSocket) {
      this.notificationSocket.disconnect();
      this.notificationSocket = null;
      console.log('Notification socket disconnected manually');
    }
  }

  // Subscribe to calendar updates for a group
  subscribeToCalendar(groupId, callback) {
    if (!this.socket || !groupId) return;

    this.socket.emit('subscribe:calendar', groupId);
    
    // Listen for calendar events
    const events = [
      'calendar:updated',
      'booking:created',
      'booking:updated',
      'booking:cancelled',
      'availability:updated'
    ];

    events.forEach(event => {
      const handler = (data) => {
        if (data.groupId === groupId) {
          callback(event, data);
        }
      };
      this.socket.on(event, handler);
      
      // Store listener for cleanup
      if (!this.listeners.has(groupId)) {
        this.listeners.set(groupId, []);
      }
      this.listeners.get(groupId).push({ event, handler });
    });

    console.log(`📅 Subscribed to calendar updates for group: ${groupId}`);
  }

  // Unsubscribe from calendar updates
  unsubscribeFromCalendar(groupId) {
    if (!this.socket || !groupId) return;

    this.socket.emit('unsubscribe:calendar', groupId);

    // Remove all listeners for this group
    const groupListeners = this.listeners.get(groupId);
    if (groupListeners) {
      groupListeners.forEach(({ event, handler }) => {
        this.socket.off(event, handler);
      });
      this.listeners.delete(groupId);
    }

    console.log(`📅 Unsubscribed from calendar updates for group: ${groupId}`);
  }

  // Subscribe to specific booking updates
  subscribeToBooking(bookingId, callback) {
    if (!this.socket || !bookingId) return;

    this.socket.emit('subscribe:booking', bookingId);

    const handler = (data) => {
      if (data.bookingId === bookingId) {
        callback(data);
      }
    };

    this.socket.on('booking:status_changed', handler);
    
    // Store for cleanup
    if (!this.listeners.has(bookingId)) {
      this.listeners.set(bookingId, []);
    }
    this.listeners.get(bookingId).push({ event: 'booking:status_changed', handler });

    console.log(`🚗 Subscribed to booking updates: ${bookingId}`);
  }

  // Generic event listener
  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  // Subscribe to notification events from Notification Service
  onNotification(callback) {
    if (!this.notificationSocket) return;
    // store in listeners map under 'notification'
    if (!this.listeners.has('notification')) this.listeners.set('notification', []);
    this.listeners.get('notification').push(callback);
  }

  offNotification(callback) {
    if (!this.notificationSocket) return;
    const arr = this.listeners.get('notification') || [];
    const idx = arr.indexOf(callback);
    if (idx > -1) arr.splice(idx, 1);
    if (arr.length === 0) this.listeners.delete('notification');
  }

  // Generic event emitter
  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  // Remove specific listener
  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
export default socketClient;
