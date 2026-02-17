/**
 * Integration Tests - Admin API
 * اختبارات تكامل لـ API الأدمن
 */
import { jest } from '@jest/globals';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const describeIfDb = MONGODB_URI ? describe : describe.skip;

let request;
let app;
let mongoose;

describeIfDb('Admin API Integration Tests', () => {
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
  // All Admin routes require authentication + admin role
  // ------------------------------------------
  describe('GET /api/admin/stats', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/admin/stats');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/students', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/admin/students');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/admin/students/:id/block', () => {
    it('should return 401 without authentication', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).patch(`/api/admin/students/${fakeId}/block`);

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/admin/students/:id', () => {
    it('should return 401 without authentication', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/admin/students/${fakeId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/students/search', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/admin/students/search?q=test');

      expect(res.status).toBe(401);
    });
  });
});
