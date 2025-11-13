import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import authService from '../../src/services/authService.js';
import db from '../../src/models/index.js';
import { hashPassword } from '../../src/utils/bcrypt.js';

// Mock models
jest.mock('../../src/models/index.js', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn()
  },
  RefreshToken: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn()
  },
  PasswordReset: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn()
  },
  sequelize: {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn()
    }))
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'co_owner'
      };

      const mockUser = {
        id: '123',
        email: userData.email,
        role: userData.role,
        toJSON: () => ({ id: '123', email: userData.email, role: userData.role })
      };

      db.User.findOne.mockResolvedValue(null);
      db.User.create.mockResolvedValue(mockUser);
      db.RefreshToken.create.mockResolvedValue({});

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(db.User.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };

      db.User.findOne.mockResolvedValue({ id: '123', email: userData.email });

      await expect(authService.register(userData)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      const mockUser = {
        id: '123',
        email,
        role: 'co_owner',
        isActive: true,
        validatePassword: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ id: '123', email, role: 'co_owner' })
      };

      db.User.findOne.mockResolvedValue(mockUser);
      db.RefreshToken.create.mockResolvedValue({});

      const result = await authService.login(email, password);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUser.validatePassword).toHaveBeenCalledWith(password);
    });

    it('should throw error with invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      const mockUser = {
        id: '123',
        email,
        validatePassword: jest.fn().mockResolvedValue(false)
      };

      db.User.findOne.mockResolvedValue(mockUser);

      await expect(authService.login(email, password)).rejects.toThrow('Invalid email or password');
    });
  });
});s