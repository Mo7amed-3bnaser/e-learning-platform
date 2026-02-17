/**
 * Unit Tests - Auth Controller
 * اختبارات وحدة لـ controller المصادقة
 */
import { jest } from '@jest/globals';

// ============================================
// Mocks
// ============================================

// Mock User model
const mockUser = {
  _id: 'user123',
  name: 'أحمد محمد',
  email: 'ahmed@test.com',
  phone: '01012345678',
  password: 'hashedPassword',
  role: 'student',
  avatar: null,
  isBlocked: false,
  isEmailVerified: true,
  enrolledCourses: [],
  loginAttempts: 0,
  isLocked: false,
  createdAt: new Date(),
  matchPassword: jest.fn(),
  getEmailVerificationToken: jest.fn(),
  getResetPasswordToken: jest.fn(),
  incLoginAttempts: jest.fn(),
  resetLoginAttempts: jest.fn(),
  save: jest.fn(),
  toObject: jest.fn(function () { return { ...this }; }),
};

const UserMock = {
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
};

jest.unstable_mockModule('../../../models/User.js', () => ({
  default: UserMock,
}));

jest.unstable_mockModule('../../../utils/authHelpers.js', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token'),
  formatUserResponse: jest.fn((user, token) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    enrolledCourses: user.enrolledCourses || [],
    token,
  })),
}));

jest.unstable_mockModule('../../../config/cloudinary.js', () => ({
  deleteImage: jest.fn(),
}));

jest.unstable_mockModule('../../../utils/sendEmail.js', () => ({
  default: jest.fn(),
  getResetPasswordTemplate: jest.fn(() => '<html>Reset Email</html>'),
  getEmailVerificationTemplate: jest.fn(() => '<html>Verify Email</html>'),
}));

// Import after mocking
const { register, login, getMe, updateProfile, forgotPassword, resetPassword } = await import('../../../controllers/authController.js');
const { generateToken, formatUserResponse } = await import('../../../utils/authHelpers.js');

// ============================================
// Helper: create mock req/res
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

// ============================================
// Tests
// ============================================
describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------
  // Register
  // ------------------------------------------
  describe('register', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { body: { name: 'Test' } };
      const res = createMockRes();

      await expect(register(req, res)).rejects.toThrow('برجاء إدخال جميع البيانات المطلوبة');
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 if user already exists', async () => {
      const req = {
        body: {
          name: 'أحمد',
          email: 'ahmed@test.com',
          phone: '01012345678',
          password: 'Test@12345!',
        },
      };
      const res = createMockRes();

      UserMock.findOne.mockResolvedValue({ email: 'ahmed@test.com' });

      await expect(register(req, res)).rejects.toThrow('البريد الإلكتروني أو رقم الهاتف مستخدم من قبل');
      expect(res.statusCode).toBe(400);
    });

    it('should create user successfully and send verification email', async () => {
      const req = {
        body: {
          name: 'أحمد',
          email: 'new@test.com',
          phone: '01098765432',
          password: 'Test@12345!',
        },
      };
      const res = createMockRes();

      UserMock.findOne.mockResolvedValue(null);

      const createdUser = {
        ...mockUser,
        _id: 'newuser123',
        email: 'new@test.com',
        getEmailVerificationToken: jest.fn(() => 'verification-token'),
        save: jest.fn(),
      };
      UserMock.create.mockResolvedValue(createdUser);

      const sendEmail = (await import('../../../utils/sendEmail.js')).default;
      sendEmail.mockResolvedValue(true);

      await register(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._json.success).toBe(true);
      expect(res._json.requiresVerification).toBe(true);
      expect(UserMock.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'أحمد',
        email: 'new@test.com',
      }));
    });
  });

  // ------------------------------------------
  // Login
  // ------------------------------------------
  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      const req = { body: { email: 'test@test.com' } };
      const res = createMockRes();

      await expect(login(req, res)).rejects.toThrow('برجاء إدخال البريد الإلكتروني وكلمة المرور');
      expect(res.statusCode).toBe(400);
    });

    it('should return 401 if user not found', async () => {
      const req = {
        body: { email: 'nonexistent@test.com', password: 'Test@12345!' },
      };
      const res = createMockRes();

      UserMock.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(login(req, res)).rejects.toThrow('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      expect(res.statusCode).toBe(401);
    });

    it('should return 403 if user is blocked', async () => {
      const req = {
        body: { email: 'blocked@test.com', password: 'Test@12345!' },
      };
      const res = createMockRes();

      const blockedUser = { ...mockUser, isBlocked: true };
      UserMock.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(blockedUser),
      });

      await expect(login(req, res)).rejects.toThrow('تم حظر حسابك');
      expect(res.statusCode).toBe(403);
    });

    it('should return 403 if account is locked', async () => {
      const req = {
        body: { email: 'locked@test.com', password: 'Test@12345!' },
      };
      const res = createMockRes();

      const lockedUser = { ...mockUser, isLocked: true, isBlocked: false };
      UserMock.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(lockedUser),
      });

      await expect(login(req, res)).rejects.toThrow('تم قفل حسابك مؤقتاً');
      expect(res.statusCode).toBe(403);
    });

    it('should return 401 and increment login attempts if password is wrong', async () => {
      const req = {
        body: { email: 'ahmed@test.com', password: 'wrongpassword' },
      };
      const res = createMockRes();

      const user = {
        ...mockUser,
        isBlocked: false,
        isLocked: false,
        matchPassword: jest.fn().mockResolvedValue(false),
        incLoginAttempts: jest.fn(),
      };
      UserMock.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      await expect(login(req, res)).rejects.toThrow('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      expect(user.incLoginAttempts).toHaveBeenCalled();
    });

    it('should login successfully with valid credentials', async () => {
      const req = {
        body: { email: 'ahmed@test.com', password: 'Test@12345!' },
      };
      const res = createMockRes();

      const user = {
        ...mockUser,
        isBlocked: false,
        isLocked: false,
        isEmailVerified: true,
        loginAttempts: 0,
        matchPassword: jest.fn().mockResolvedValue(true),
        resetLoginAttempts: jest.fn(),
      };
      UserMock.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      await login(req, res);

      expect(res._json.success).toBe(true);
      expect(res._json.message).toContain('تم تسجيل الدخول بنجاح');
      expect(generateToken).toHaveBeenCalledWith(user);
    });

    it('should return 403 if email not verified (non-admin)', async () => {
      const req = {
        body: { email: 'unverified@test.com', password: 'Test@12345!' },
      };
      const res = createMockRes();

      const user = {
        ...mockUser,
        isBlocked: false,
        isLocked: false,
        isEmailVerified: false,
        role: 'student',
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      UserMock.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      await expect(login(req, res)).rejects.toThrow('EMAIL_NOT_VERIFIED');
      expect(res.statusCode).toBe(403);
    });
  });

  // ------------------------------------------
  // getMe
  // ------------------------------------------
  describe('getMe', () => {
    it('should return current user data', async () => {
      const req = { user: { _id: 'user123' } };
      const res = createMockRes();

      const foundUser = {
        _id: 'user123',
        name: 'أحمد',
        email: 'ahmed@test.com',
        phone: '01012345678',
        role: 'student',
        avatar: null,
        enrolledCourses: [],
        createdAt: new Date(),
      };

      UserMock.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(foundUser),
      });

      await getMe(req, res);

      expect(res._json.success).toBe(true);
      expect(res._json.data.email).toBe('ahmed@test.com');
    });
  });

  // ------------------------------------------
  // Forgot Password
  // ------------------------------------------
  describe('forgotPassword', () => {
    it('should return 400 if email is missing', async () => {
      const req = { body: {} };
      const res = createMockRes();

      await expect(forgotPassword(req, res)).rejects.toThrow('برجاء إدخال البريد الإلكتروني');
    });

    it('should return generic message even if user not found (prevents user enumeration)', async () => {
      const req = { body: { email: 'nonexistent@test.com' } };
      const res = createMockRes();

      UserMock.findOne.mockResolvedValue(null);

      await forgotPassword(req, res);

      expect(res._json.success).toBe(true);
      expect(res._json.message).toContain('إذا كان البريد الإلكتروني مسجلاً');
    });

    it('should return generic message for blocked users', async () => {
      const req = { body: { email: 'blocked@test.com' } };
      const res = createMockRes();

      UserMock.findOne.mockResolvedValue({ ...mockUser, isBlocked: true });

      await forgotPassword(req, res);

      expect(res._json.success).toBe(true);
      expect(res._json.message).toContain('إذا كان البريد الإلكتروني مسجلاً');
    });
  });

  // ------------------------------------------
  // Update Profile
  // ------------------------------------------
  describe('updateProfile', () => {
    it('should update user name successfully', async () => {
      const req = {
        user: { _id: 'user123' },
        body: { name: 'اسم جديد' },
      };
      const res = createMockRes();

      const user = {
        ...mockUser,
        name: 'أحمد',
        save: jest.fn().mockResolvedValue({
          ...mockUser,
          name: 'اسم جديد',
        }),
      };

      UserMock.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      await updateProfile(req, res);

      expect(res._json.success).toBe(true);
      expect(user.name).toBe('اسم جديد');
    });

    it('should require current password when changing password', async () => {
      const req = {
        user: { _id: 'user123' },
        body: { newPassword: 'NewPass@123!' },
      };
      const res = createMockRes();

      const user = { ...mockUser };
      UserMock.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      await expect(updateProfile(req, res)).rejects.toThrow('برجاء إدخال كلمة المرور الحالية');
    });

    it('should reject wrong current password', async () => {
      const req = {
        user: { _id: 'user123' },
        body: { currentPassword: 'wrong', newPassword: 'NewPass@123!' },
      };
      const res = createMockRes();

      const user = {
        ...mockUser,
        matchPassword: jest.fn().mockResolvedValue(false),
      };
      UserMock.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      await expect(updateProfile(req, res)).rejects.toThrow('كلمة المرور الحالية غير صحيحة');
    });
  });
});
