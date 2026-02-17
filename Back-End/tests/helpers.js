/**
 * Helper utilities for tests
 * يوفر دوال مساعدة لاختبارات الـ Backend
 */
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing';

/**
 * Generate a valid MongoDB ObjectId
 */
export const generateObjectId = () => new mongoose.Types.ObjectId();

/**
 * Generate a JWT token for testing
 */
export const generateTestToken = (userData = {}) => {
  const defaultUser = {
    id: generateObjectId(),
    name: 'Test User',
    phone: '01012345678',
    role: 'student',
    ...userData,
  };

  return jwt.sign(
    {
      id: defaultUser.id,
      name: defaultUser.name,
      phone: defaultUser.phone,
      role: defaultUser.role,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Create a mock request object
 */
export const mockRequest = (overrides = {}) => {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    file: null,
    ...overrides,
  };
  return req;
};

/**
 * Create a mock response object
 */
export const mockResponse = () => {
  const res = {
    statusCode: 200,
    _jsonData: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(data) {
      res._jsonData = data;
      return res;
    },
  };
  return res;
};

/**
 * Create a mock next function
 */
export const mockNext = () => jest.fn();

/**
 * Sample test data
 */
export const testData = {
  validUser: {
    name: 'أحمد محمد',
    email: 'ahmed@test.com',
    phone: '01012345678',
    password: 'Test@12345!',
  },
  validCourse: {
    title: 'كورس تعلم البرمجة بلغة JavaScript',
    description: 'كورس شامل لتعلم أساسيات البرمجة بلغة جافاسكريبت من الصفر حتى الاحتراف',
    price: 299,
    thumbnail: 'https://example.com/thumbnail.jpg',
    category: 'programming',
    level: 'beginner',
  },
  validVideo: {
    title: 'مقدمة في JavaScript',
    description: 'الدرس الأول - مقدمة عن لغة جافاسكريبت',
    videoProvider: 'youtube',
    youtubeVideoId: 'dQw4w9WgXcQ',
    duration: 600,
    order: 1,
    isFreePreview: true,
  },
  validOrder: {
    paymentMethod: 'vodafone_cash',
    screenshotUrl: 'https://example.com/screenshot.jpg',
  },
  validReview: {
    rating: 5,
    comment: 'كورس ممتاز جداً',
  },
};
