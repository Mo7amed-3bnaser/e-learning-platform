/**
 * Integration Tests - Orders API
 * اختبارات تكامل لـ API الطلبات
 */
import { jest } from '@jest/globals';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const describeIfDb = MONGODB_URI ? describe : describe.skip;

let request;
let app;
let mongoose;

describeIfDb('Orders API Integration Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    
    const supertestModule = await import('supertest');
    request = supertestModule.default;
    
    mongoose = (await import('mongoose')).default;
    
    const appModule = await import('../../../server.js');
    app = appModule.default;
    
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
  // Protected Routes (require auth)
  // ------------------------------------------
  describe('POST /api/orders', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          courseId: '507f1f77bcf86cd799439011',
          paymentMethod: 'vodafone_cash',
          screenshotUrl: 'https://example.com/screenshot.jpg',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/orders/my-orders', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/orders/my-orders');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/orders/pending', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/orders/pending');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/orders', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/orders');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/orders/:id/approve', () => {
    it('should return 401 without authentication', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).patch(`/api/orders/${fakeId}/approve`);

      expect(res.status).toBe(401);
    });
  });
});
