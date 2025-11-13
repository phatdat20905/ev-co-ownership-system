import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/responseFormatter.js';
import db from '../models/index.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, {
        code: 'UNAUTHORIZED',
        message: 'Access token is required'
      }, 401);
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verifyAccessToken(token);
      const user = await db.User.findByPk(decoded.userId, {
        attributes: { exclude: ['passwordHash'] }
      });

      if (!user || !user.isActive) {
        return errorResponse(res, {
          code: 'UNAUTHORIZED',
          message: 'User not found or inactive'
        }, 401);
      }

      req.user = user;
      next();
    } catch (error) {
      return errorResponse(res, {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }, 401);
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }, 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, {
        code: 'FORBIDDEN',
        message: 'Insufficient permissions'
      }, 403);
    }

    next();
  };
};