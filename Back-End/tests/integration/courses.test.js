/**
 * Integration Tests - Courses API
 * اختبارات تكامل لـ API الكورسات
 * 
 * ملاحظة: هذه الاختبارات تتطلب اتصال بقاعدة بيانات MongoDB
 */
import { jest } from '@jest/globals';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const describeIfDb = MONGODB_URI ? describe : describe.skip;

let request;
let app;
let mongoose;

describeIfDb('Courses API Integration Tests', () => {
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
  // Get Courses (Public)
  // ------------------------------------------
  describe('GET /api/courses', () => {
    it('should return courses list', async () => {
      const res = await request(app).get('/api/courses');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      const res = await request(app).get('/api/courses?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.currentPage).toBe(1);
    });

    it('should support search query', async () => {
      const res = await request(app).get('/api/courses?search=javascript');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support category filter', async () => {
      const res = await request(app).get('/api/courses?category=programming');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support level filter', async () => {
      const res = await request(app).get('/api/courses?level=beginner');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ------------------------------------------
  // Get Course by ID
  // ------------------------------------------
  describe('GET /api/courses/:id', () => {
    it('should return 404 for invalid course id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/courses/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should return 500 for malformed id', async () => {
      const res = await request(app).get('/api/courses/invalid-id');

      expect(res.status).toBe(500);
    });
  });

  // ------------------------------------------
  // Protected Course Routes
  // ------------------------------------------
  describe('POST /api/courses', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/courses')
        .send({
          title: 'Test Course',
          description: 'Test description for the course',
          price: 100,
          category: 'programming',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/courses/:id', () => {
    it('should return 401 without authentication', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/courses/${fakeId}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    it('should return 401 without authentication', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/courses/${fakeId}`);

      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------
  // Admin Course Routes
  // ------------------------------------------
  describe('GET /api/courses/admin/all', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/courses/admin/all');

      expect(res.status).toBe(401);
    });
  });
});
