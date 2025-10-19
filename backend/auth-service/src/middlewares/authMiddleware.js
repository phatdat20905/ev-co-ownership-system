import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responseFormatter.js';
import { User } from '../models/index.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return errorResponse(res, { 
        code: 'ACCESS_TOKEN_REQUIRED', 
        message: 'Access token is required' 
      }, 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return errorResponse(res, { 
        code: 'USER_NOT_FOUND', 
        message: 'User not found or inactive' 
      }, 401);
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, { 
        code: 'TOKEN_EXPIRED', 
        message: 'Access token has expired' 
      }, 401);
    }
    
    return errorResponse(res, { 
      code: 'INVALID_TOKEN', 
      message: 'Invalid access token' 
    }, 401);
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, { 
        code: 'INSUFFICIENT_PERMISSIONS', 
        message: 'Insufficient permissions' 
      }, 403);
    }
    next();
  };
};

export const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return errorResponse(res, { 
      code: 'EMAIL_NOT_VERIFIED', 
      message: 'Email verification required' 
    }, 403);
  }
  next();
};