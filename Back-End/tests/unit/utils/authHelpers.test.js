/**
 * Unit Tests - Auth Helpers
 * اختبارات وحدة لـ utility المصادقة
 */
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Set JWT secret for testing
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing';

import { generateToken, formatUserResponse } from '../../../utils/authHelpers.js';

describe('Auth Helpers', () => {
  // ------------------------------------------
  // generateToken
  // ------------------------------------------
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = {
        _id: 'user123',
        name: 'أحمد',
        phone: '01012345678',
        role: 'student',
      };

      const token = generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify the token is valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('user123');
      expect(decoded.name).toBe('أحمد');
      expect(decoded.phone).toBe('01012345678');
      expect(decoded.role).toBe('student');
    });

    it('should set token expiry to 1 hour', () => {
      const user = {
        _id: 'user123',
        name: 'أحمد',
        phone: '01012345678',
        role: 'student',
      };

      const token = generateToken(user);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Token should expire in approximately 1 hour (3600 seconds)
      const expiresIn = decoded.exp - decoded.iat;
      expect(expiresIn).toBe(3600);
    });

    it('should include all required fields in token payload', () => {
      const user = {
        _id: 'admin123',
        name: 'مدير النظام',
        phone: '01198765432',
        role: 'admin',
      };

      const token = generateToken(user);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('name');
      expect(decoded).toHaveProperty('phone');
      expect(decoded).toHaveProperty('role');
    });
  });

  // ------------------------------------------
  // formatUserResponse
  // ------------------------------------------
  describe('formatUserResponse', () => {
    it('should format user data correctly', () => {
      const user = {
        _id: 'user123',
        name: 'أحمد',
        email: 'ahmed@test.com',
        phone: '01012345678',
        role: 'student',
        avatar: 'https://example.com/avatar.jpg',
        enrolledCourses: ['course1', 'course2'],
      };

      const result = formatUserResponse(user, 'test-token');

      expect(result.id).toBe('user123');
      expect(result.name).toBe('أحمد');
      expect(result.email).toBe('ahmed@test.com');
      expect(result.phone).toBe('01012345678');
      expect(result.role).toBe('student');
      expect(result.avatar).toBe('https://example.com/avatar.jpg');
      expect(result.enrolledCourses).toHaveLength(2);
      expect(result.token).toBe('test-token');
    });

    it('should include token in response', () => {
      const user = {
        _id: 'user123',
        name: 'أحمد',
        email: 'ahmed@test.com',
        phone: '01012345678',
        role: 'student',
        avatar: null,
        enrolledCourses: [],
      };

      const result = formatUserResponse(user, 'jwt-token-123');

      expect(result.token).toBe('jwt-token-123');
    });

    it('should handle empty enrolledCourses', () => {
      const user = {
        _id: 'user123',
        name: 'أحمد',
        email: 'ahmed@test.com',
        phone: '01012345678',
        role: 'student',
        avatar: null,
        enrolledCourses: [],
      };

      const result = formatUserResponse(user, 'token');

      expect(result.enrolledCourses).toEqual([]);
    });
  });
});
