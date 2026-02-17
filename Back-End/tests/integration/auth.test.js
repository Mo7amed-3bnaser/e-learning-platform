/**
 * Integration Tests - Auth API
 * اختبارات تكامل لـ API المصادقة
 * 
 * ملاحظة: هذه الاختبارات تتطلب اتصال بقاعدة بيانات MongoDB
 * يتم تشغيلها فقط إذا كان MONGODB_URI متاح في البيئة
 */
import { jest } from '@jest/globals';
import dotenv from 'dotenv';
dotenv.config();

// Skip if no MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const describeIfDb = MONGODB_URI ? describe : describe.skip;

let request;
let app;
let mongoose;

describeIfDb('Auth API Integration Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    
    const supertestModule = await import('supertest');
    request = supertestModule.default;
    
    mongoose = (await import('mongoose')).default;
    
    // Import app (this connects to DB)
    const appModule = await import('../../../server.js');
    app = appModule.default;
    
    // Wait for DB connection
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('connected', resolve);
      }
    });
  }, 30000);

  afterAll(async () => {
    if (mongoose && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }, 10000);

  // ------------------------------------------
  // Welcome Route
  // ------------------------------------------
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.endpoints).toBeDefined();
    });
  });

  // ------------------------------------------
  // Register
  // ------------------------------------------
  describe('POST /api/auth/register', () => {
    const testEmail = `test_${Date.now()}@example.com`;
    const testPhone = `010${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          phone: testPhone,
          password: 'Test@12345!',
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: testEmail,
          phone: testPhone,
          password: 'short',
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid phone number', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: testEmail,
          phone: '123456',
          password: 'Test@12345!',
        });

      expect(res.status).toBe(400);
    });
  });

  // ------------------------------------------
  // Login
  // ------------------------------------------
  describe('POST /api/auth/login', () => {
    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'test' });

      expect(res.status).toBe(400);
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Test@12345!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ------------------------------------------
  // Protected Routes
  // ------------------------------------------
  describe('GET /api/auth/me', () => {
    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------
  // Forgot Password
  // ------------------------------------------
  describe('POST /api/auth/forgot-password', () => {
    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should return generic message for any email (prevents enumeration)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@test.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('إذا كان البريد الإلكتروني مسجلاً');
    });
  });

  // ------------------------------------------
  // Reset Password
  // ------------------------------------------
  describe('POST /api/auth/reset-password', () => {
    it('should return 400 if token or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid/expired token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'invalid-token', password: 'NewTest@123!' });

      expect(res.status).toBe(400);
    });
  });

  // ------------------------------------------
  // 404 Route
  // ------------------------------------------
  describe('GET /api/nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent');

      expect(res.status).toBe(404);
    });
  });
});
