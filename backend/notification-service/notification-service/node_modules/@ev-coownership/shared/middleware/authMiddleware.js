import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responseFormatter.js';
import { AuthenticationError, AuthorizationError } from '../utils/errorClasses.js';
import logger from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user to request
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };

      logger.debug('User authenticated', { userId: decoded.userId, role: decoded.role });
      next();
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      logger.debug('User authorized', { 
        userId: req.user.id, 
        role: req.user.role, 
        requiredRoles: allowedRoles 
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      // Token is invalid, but we don't throw error for optional auth
      logger.debug('Optional auth - invalid token', { error: error.message });
    }
  }

  next();
};