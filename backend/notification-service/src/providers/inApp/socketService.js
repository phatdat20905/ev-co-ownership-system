// src/providers/inApp/socketService.js
import { Server } from 'socket.io';
import { logger } from '@ev-coownership/shared';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId[]
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      logger.info('User connected to socket', { socketId: socket.id });

      // User identifies themselves
      socket.on('identify', (userId) => {
        this.addUserConnection(userId, socket.id);
        logger.info('User identified for socket connection', { userId, socketId: socket.id });
      });

      socket.on('disconnect', () => {
        this.removeUserConnection(socket.id);
        logger.info('User disconnected from socket', { socketId: socket.id });
      });
    });

    logger.info('Socket service initialized successfully');
  }

  addUserConnection(userId, socketId) {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, []);
    }
    this.connectedUsers.get(userId).push(socketId);
  }

  removeUserConnection(socketId) {
    for (const [userId, socketIds] of this.connectedUsers.entries()) {
      const index = socketIds.indexOf(socketId);
      if (index > -1) {
        socketIds.splice(index, 1);
        if (socketIds.length === 0) {
          this.connectedUsers.delete(userId);
        }
        break;
      }
    }
  }

  sendToUser(userId, event, data) {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets && userSockets.length > 0) {
      userSockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
      logger.debug('In-app notification sent via socket', { userId, event, socketCount: userSockets.length });
      return true;
    }
    return false;
  }

  async healthCheck() {
    return {
      healthy: this.io !== null,
      provider: 'socket',
      connectedUsers: this.connectedUsers.size,
    };
  }
}

export default new SocketService();