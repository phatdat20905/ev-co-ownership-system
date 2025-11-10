# WebSocket Backend Implementation Guide

## Overview
This guide provides the complete implementation for the WebSocket server in the notification-service to enable real-time notifications.

**Status**: Frontend ready with auto-reconnect logic  
**Port**: 3007  
**Authentication**: JWT token-based

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [WebSocket Server Setup](#websocket-server-setup)
4. [Connection Management](#connection-management)
5. [Message Broadcasting](#message-broadcasting)
6. [Integration with Notification Service](#integration-with-notification-service)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## Prerequisites

### Required Packages
```bash
cd backend/notification-service
npm install ws
npm install jsonwebtoken  # If not already installed
```

### Environment Variables
Add to `.env`:
```env
WS_PORT=3007
JWT_SECRET=your-jwt-secret-here
WS_HEARTBEAT_INTERVAL=30000  # 30 seconds
WS_MAX_CONNECTIONS=1000
```

---

## WebSocket Server Setup

### File: `backend/notification-service/src/websocket/WebSocketServer.js`

```javascript
// src/websocket/WebSocketServer.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    // Store active connections: userId -> Set of WebSocket connections
    this.connections = new Map();

    // Store user metadata: WebSocket -> { userId, connectionTime, lastActivity }
    this.metadata = new WeakMap();

    this.setupWebSocketServer();
    this.startHeartbeat();
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      logger.error('WebSocket Server Error:', error);
    });

    logger.info(`WebSocket server initialized on path /ws`);
  }

  handleConnection(ws, req) {
    try {
      // Extract token from query string
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      const userId = url.searchParams.get('userId');

      if (!token || !userId) {
        ws.close(4001, 'Missing authentication credentials');
        logger.warn('WebSocket connection rejected: Missing token or userId');
        return;
      }

      // Verify JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        ws.close(4002, 'Invalid or expired token');
        logger.warn('WebSocket connection rejected: Invalid token');
        return;
      }

      // Verify userId matches token
      if (decoded.userId !== userId) {
        ws.close(4003, 'User ID mismatch');
        logger.warn('WebSocket connection rejected: User ID mismatch');
        return;
      }

      // Store connection
      this.addConnection(userId, ws);

      // Store metadata
      this.metadata.set(ws, {
        userId,
        connectionTime: Date.now(),
        lastActivity: Date.now()
      });

      // Send connection success message
      this.sendToClient(ws, {
        type: 'connected',
        userId,
        timestamp: new Date().toISOString()
      });

      logger.info(`WebSocket connected: User ${userId}`);

      // Handle incoming messages
      ws.on('message', (message) => {
        this.handleMessage(ws, message);
      });

      // Handle disconnection
      ws.on('close', (code, reason) => {
        this.handleDisconnection(ws, code, reason);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket connection error:', error);
      });

      // Keep connection alive
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

    } catch (error) {
      logger.error('Error handling WebSocket connection:', error);
      ws.close(4000, 'Internal server error');
    }
  }

  handleMessage(ws, message) {
    try {
      const metadata = this.metadata.get(ws);
      if (!metadata) {
        logger.warn('Received message from unknown connection');
        return;
      }

      // Update last activity
      metadata.lastActivity = Date.now();

      // Parse message
      const data = JSON.parse(message.toString());
      logger.debug(`Received message from user ${metadata.userId}:`, data);

      // Handle different message types
      switch (data.type) {
        case 'ping':
          this.sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() });
          break;

        case 'subscribe':
          this.handleSubscribe(ws, data.channel);
          break;

        case 'unsubscribe':
          this.handleUnsubscribe(ws, data.channel);
          break;

        case 'mark_read':
          this.handleMarkRead(metadata.userId, data.notificationId);
          break;

        default:
          logger.warn(`Unknown message type: ${data.type}`);
          this.sendToClient(ws, { 
            type: 'error', 
            message: 'Unknown message type' 
          });
      }

    } catch (error) {
      logger.error('Error handling message:', error);
      this.sendToClient(ws, { 
        type: 'error', 
        message: 'Failed to process message' 
      });
    }
  }

  handleDisconnection(ws, code, reason) {
    const metadata = this.metadata.get(ws);
    if (metadata) {
      this.removeConnection(metadata.userId, ws);
      logger.info(`WebSocket disconnected: User ${metadata.userId}, Code: ${code}, Reason: ${reason}`);
    }
  }

  handleSubscribe(ws, channel) {
    const metadata = this.metadata.get(ws);
    if (!metadata.channels) {
      metadata.channels = new Set();
    }
    metadata.channels.add(channel);
    this.sendToClient(ws, { 
      type: 'subscribed', 
      channel,
      timestamp: new Date().toISOString() 
    });
    logger.info(`User ${metadata.userId} subscribed to channel: ${channel}`);
  }

  handleUnsubscribe(ws, channel) {
    const metadata = this.metadata.get(ws);
    if (metadata.channels) {
      metadata.channels.delete(channel);
      this.sendToClient(ws, { 
        type: 'unsubscribed', 
        channel,
        timestamp: new Date().toISOString() 
      });
      logger.info(`User ${metadata.userId} unsubscribed from channel: ${channel}`);
    }
  }

  handleMarkRead(userId, notificationId) {
    // Emit event to mark notification as read
    // This will be handled by the notification service
    this.emit('notification:mark_read', { userId, notificationId });
  }

  addConnection(userId, ws) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId).add(ws);
  }

  removeConnection(userId, ws) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  sendToUser(userId, data) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.forEach((ws) => {
        this.sendToClient(ws, data);
      });
      logger.debug(`Sent message to user ${userId} (${userConnections.size} connections)`);
      return true;
    }
    return false;
  }

  sendToChannel(channel, data) {
    let count = 0;
    this.wss.clients.forEach((ws) => {
      const metadata = this.metadata.get(ws);
      if (metadata && metadata.channels && metadata.channels.has(channel)) {
        this.sendToClient(ws, data);
        count++;
      }
    });
    logger.debug(`Sent message to channel ${channel} (${count} clients)`);
    return count;
  }

  broadcast(data, excludeUserId = null) {
    let count = 0;
    this.wss.clients.forEach((ws) => {
      const metadata = this.metadata.get(ws);
      if (!excludeUserId || metadata.userId !== excludeUserId) {
        this.sendToClient(ws, data);
        count++;
      }
    });
    logger.debug(`Broadcast message to ${count} clients`);
    return count;
  }

  startHeartbeat() {
    const interval = parseInt(process.env.WS_HEARTBEAT_INTERVAL) || 30000;

    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          const metadata = this.metadata.get(ws);
          if (metadata) {
            logger.info(`Terminating inactive connection: User ${metadata.userId}`);
          }
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, interval);

    logger.info(`WebSocket heartbeat started (interval: ${interval}ms)`);
  }

  getStats() {
    const totalConnections = this.wss.clients.size;
    const totalUsers = this.connections.size;
    
    const channelCounts = {};
    this.wss.clients.forEach((ws) => {
      const metadata = this.metadata.get(ws);
      if (metadata && metadata.channels) {
        metadata.channels.forEach((channel) => {
          channelCounts[channel] = (channelCounts[channel] || 0) + 1;
        });
      }
    });

    return {
      totalConnections,
      totalUsers,
      channelCounts,
      timestamp: new Date().toISOString()
    };
  }

  close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss.close(() => {
      logger.info('WebSocket server closed');
    });
  }
}

// Make it an event emitter for integration with notification service
const EventEmitter = require('events');
Object.setPrototypeOf(WebSocketServer.prototype, EventEmitter.prototype);

module.exports = WebSocketServer;
```

---

## Integration with Server

### File: `backend/notification-service/src/server.js`

```javascript
// src/server.js
const http = require('http');
const app = require('./app');
const WebSocketServer = require('./websocket/WebSocketServer');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3007;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wsServer = new WebSocketServer(server);

// Make WebSocket server accessible in the app
app.set('wsServer', wsServer);

// Handle WebSocket events
wsServer.on('notification:mark_read', async ({ userId, notificationId }) => {
  try {
    // Call notification service to mark as read
    const notificationService = require('./services/notification.service');
    await notificationService.markAsRead(notificationId, userId);
    logger.info(`Notification ${notificationId} marked as read by user ${userId}`);
  } catch (error) {
    logger.error('Error marking notification as read:', error);
  }
});

// Start server
server.listen(PORT, () => {
  logger.info(`Notification service listening on port ${PORT}`);
  logger.info(`WebSocket server ready at ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  wsServer.close();
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
```

---

## Notification Service Integration

### File: `backend/notification-service/src/services/notification.service.js`

Add methods to broadcast notifications via WebSocket:

```javascript
// Add this method to notification.service.js

async createNotification(notificationData) {
  try {
    const notification = await Notification.create(notificationData);

    // Broadcast notification via WebSocket
    const wsServer = this.getWebSocketServer();
    if (wsServer) {
      wsServer.sendToUser(notificationData.user_id, {
        type: 'notification:new',
        notification: notification,
        timestamp: new Date().toISOString()
      });
    }

    // Send via email/SMS/push based on user preferences
    await this.sendMultiChannelNotification(notification);

    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
}

async markAsRead(notificationId, userId) {
  try {
    const notification = await Notification.findOne({
      where: { id: notificationId, user_id: userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.update({ is_read: true, read_at: new Date() });

    // Broadcast read status via WebSocket
    const wsServer = this.getWebSocketServer();
    if (wsServer) {
      wsServer.sendToUser(userId, {
        type: 'notification:read',
        notificationId,
        timestamp: new Date().toISOString()
      });
    }

    return notification;
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    throw error;
  }
}

getWebSocketServer() {
  // Get WebSocket server from app context
  const app = require('../app');
  return app.get('wsServer');
}
```

---

## Event-Based Broadcasting

### File: `backend/notification-service/src/events/notificationEvents.js`

```javascript
// src/events/notificationEvents.js
const { EventEmitter } = require('events');
const logger = require('../utils/logger');

class NotificationEventEmitter extends EventEmitter {}
const notificationEvents = new NotificationEventEmitter();

// Listen for various events and broadcast via WebSocket

notificationEvents.on('booking:confirmed', async (data) => {
  try {
    const notificationService = require('../services/notification.service');
    await notificationService.createNotification({
      user_id: data.userId,
      type: 'booking_confirmation',
      title: 'Booking Confirmed',
      message: `Your booking for ${data.vehicleName} has been confirmed.`,
      data: { booking_id: data.bookingId }
    });
  } catch (error) {
    logger.error('Error handling booking:confirmed event:', error);
  }
});

notificationEvents.on('payment:due', async (data) => {
  try {
    const notificationService = require('../services/notification.service');
    await notificationService.createNotification({
      user_id: data.userId,
      type: 'payment_due',
      title: 'Payment Due',
      message: `You have a payment of $${data.amount} due on ${data.dueDate}.`,
      data: { payment_id: data.paymentId }
    });
  } catch (error) {
    logger.error('Error handling payment:due event:', error);
  }
});

notificationEvents.on('contract:expiring', async (data) => {
  try {
    const notificationService = require('../services/notification.service');
    await notificationService.createNotification({
      user_id: data.userId,
      type: 'contract_expiry',
      title: 'Contract Expiring Soon',
      message: `Your contract "${data.contractName}" expires in ${data.daysRemaining} days.`,
      data: { contract_id: data.contractId }
    });
  } catch (error) {
    logger.error('Error handling contract:expiring event:', error);
  }
});

module.exports = notificationEvents;
```

---

## Testing

### Test WebSocket Connection

```bash
# Install wscat for testing
npm install -g wscat

# Connect to WebSocket server (replace TOKEN and USER_ID)
wscat -c "ws://localhost:3007/ws?token=YOUR_JWT_TOKEN&userId=YOUR_USER_ID"

# Expected response:
# > {"type":"connected","userId":"your-user-id","timestamp":"2025-11-10T..."}

# Send ping
# > {"type":"ping"}
# Expected: {"type":"pong","timestamp":"2025-11-10T..."}

# Subscribe to channel
# > {"type":"subscribe","channel":"notifications"}
# Expected: {"type":"subscribed","channel":"notifications","timestamp":"..."}
```

### Test from Frontend

1. Open browser console
2. Navigate to any page in the app
3. Check console logs for WebSocket connection
4. Should see: "WebSocket connected"
5. Create a notification (e.g., make a booking)
6. Should receive real-time notification in the browser

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Create test file: websocket-load-test.yml
# Run load test
artillery run websocket-load-test.yml
```

---

## WebSocket Message Types

### Client → Server

```javascript
// Ping
{ type: 'ping' }

// Subscribe to channel
{ type: 'subscribe', channel: 'notifications' }

// Unsubscribe from channel
{ type: 'unsubscribe', channel: 'notifications' }

// Mark notification as read
{ type: 'mark_read', notificationId: 'uuid' }
```

### Server → Client

```javascript
// Connection success
{ type: 'connected', userId: 'uuid', timestamp: '...' }

// Pong response
{ type: 'pong', timestamp: '...' }

// New notification
{ 
  type: 'notification:new',
  notification: { id, title, message, type, ... },
  timestamp: '...'
}

// Notification marked as read
{ type: 'notification:read', notificationId: 'uuid', timestamp: '...' }

// Subscription confirmed
{ type: 'subscribed', channel: 'notifications', timestamp: '...' }

// Error message
{ type: 'error', message: 'Error description' }
```

---

## Deployment Considerations

### 1. Scaling
- Use Redis for pub/sub between multiple WebSocket servers
- Implement sticky sessions for load balancer
- Consider using Socket.IO for automatic fallback

### 2. Monitoring
- Track connection count
- Monitor message throughput
- Log disconnection reasons
- Alert on high error rates

### 3. Security
- Always validate JWT tokens
- Implement rate limiting
- Use WSS (WebSocket Secure) in production
- Validate all incoming messages

### 4. Performance
- Use binary messages for large payloads
- Implement message queuing for high volume
- Add connection pooling
- Cache user preferences

---

## Status Codes

- `1000`: Normal closure
- `4000`: Internal server error
- `4001`: Missing authentication credentials
- `4002`: Invalid or expired token
- `4003`: User ID mismatch

---

## Next Steps

1. ✅ Create WebSocketServer class (DONE - code above)
2. ⏳ Integrate with server.js
3. ⏳ Update notification service methods
4. ⏳ Test with frontend
5. ⏳ Add Redis pub/sub for scaling
6. ⏳ Deploy to production

---

**Last Updated**: November 10, 2025  
**Version**: 1.0.0  
**Status**: Implementation Guide Ready
