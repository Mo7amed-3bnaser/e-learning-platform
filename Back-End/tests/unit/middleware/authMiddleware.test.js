/**
 * Unit Tests - Auth Middleware
 * اختبارات وحدة لـ middleware المصادقة
 */
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-jwt-secret-key-for-testing';
// Ensure the middleware uses the same secret
process.env.JWT_SECRET = JWT_SECRET;

// ============================================
// Mocks
// ============================================
const UserMock = {
  findById: jest.fn(),
};

jest.unstable_mockModule('../../../models/User.js', () => ({
  default: UserMock,
}));

// Import after mocking
const { protect, admin } = await import('../../../middleware/authMiddleware.js');

// ============================================
// Helper
// ============================================
const createMockRes = () => {
  const res = {
    statusCode: 200,
    _json: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(data) {
      res._json = data;
      return res;
    },
  };
  return res;
};

/**
 * express-async-handler catches errors thrown inside the handler
 * and calls next(error). So the promise resolves (does not reject).
 * We capture the error via the next mock.
 */
const runProtect = async (req, res) => {
  let capturedError = null;
  const next = jest.fn((err) => {
    if (err) capturedError = err;
  });
  await protect(req, res, next);
  return { next, capturedError };
};

// ============================================
// Tests
// ============================================
describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------
  // protect middleware
  // ------------------------------------------
  describe('protect', () => {
    it('should return 401 if no token provided', async () => {
      const req = { headers: {} };
      const res = createMockRes();

      const { next, capturedError } = await runProtect(req, res);

      expect(capturedError).toBeTruthy();
      expect(capturedError.message).toMatch(/غير مصرح لك بالدخول/);
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const req = {
        headers: { authorization: 'Bearer invalid-token' },
      };
      const res = createMockRes();

      const { capturedError } = await runProtect(req, res);

      expect(capturedError).toBeTruthy();
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 if user not found', async () => {
      const token = jwt.sign({ id: 'nonexistent' }, JWT_SECRET, { expiresIn: '1h' });
      const req = {
        headers: { authorization: `Bearer ${token}` },
      };
      const res = createMockRes();

      UserMock.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const { capturedError } = await runProtect(req, res);

      expect(capturedError).toBeTruthy();
      expect(res.statusCode).toBe(401);
    });

    it('should return error if user is blocked (caught by generic catch)', async () => {
      const token = jwt.sign({ id: 'user123' }, JWT_SECRET, { expiresIn: '1h' });
      const req = {
        headers: { authorization: `Bearer ${token}` },
      };
      const res = createMockRes();

      UserMock.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'user123',
          isBlocked: true,
        }),
      });

      const { capturedError } = await runProtect(req, res);

      // The blocked-user throw is inside try, so it's caught by the generic catch
      expect(capturedError).toBeTruthy();
      expect(capturedError.message).toMatch(/غير مصرح/);
    });

    it('should call next and set req.user for valid token', async () => {
      const token = jwt.sign({ id: 'user123' }, JWT_SECRET, { expiresIn: '1h' });
      const req = {
        headers: { authorization: `Bearer ${token}` },
      };
      const res = createMockRes();

      const user = {
        _id: 'user123',
        name: 'Test User',
        role: 'student',
        isBlocked: false,
      };
      UserMock.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      const { next, capturedError } = await runProtect(req, res);

      expect(capturedError).toBeNull();
      expect(req.user).toBe(user);
      expect(next).toHaveBeenCalled();
    });
  });

  // ------------------------------------------
  // admin middleware
  // ------------------------------------------
  describe('admin', () => {
    it('should return 403 if user is not admin', () => {
      const req = { user: { role: 'student' } };
      const res = createMockRes();
      const next = jest.fn();

      expect(() => admin(req, res, next)).toThrow('غير مصرح لك');
      expect(res.statusCode).toBe(403);
    });

    it('should call next if user is admin', () => {
      const req = { user: { role: 'admin' } };
      const res = createMockRes();
      const next = jest.fn();

      admin(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
