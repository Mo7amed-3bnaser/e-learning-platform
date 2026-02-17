/**
 * Unit Tests - Validation Middleware
 * اختبارات وحدة لـ middleware التحقق من البيانات
 */
import { jest } from '@jest/globals';
import { validationResult } from 'express-validator';

// Import directly (no need to mock)
import { validate, registerValidation, loginValidation, createCourseValidation } from '../../../middleware/validation.js';

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
 * Run express-validator chain and return validation errors
 */
const runValidation = async (validations, body) => {
  const req = {
    body,
    headers: { 'content-type': 'application/json' },
  };
  const res = createMockRes();

  // Run each validation
  for (const validation of validations) {
    await validation.run(req);
  }

  // Check result
  const errors = validationResult(req);
  return { req, res, errors: errors.array() };
};

// ============================================
// Tests
// ============================================
describe('Validation Middleware', () => {
  // ------------------------------------------
  // validate middleware
  // ------------------------------------------
  describe('validate', () => {
    it('should call next if no errors', () => {
      const req = { body: {} };
      const res = createMockRes();
      const next = jest.fn();

      // Mock empty validation result
      // Since there are no validation chains run, there are no errors
      validate(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  // ------------------------------------------
  // registerValidation
  // ------------------------------------------
  describe('registerValidation', () => {
    it('should fail if name is empty', async () => {
      const result = await runValidation(registerValidation, {
        name: '',
        email: 'test@test.com',
        phone: '01012345678',
        password: 'Test@12345!',
      });

      expect(result.errors.length).toBeGreaterThan(0);
      const nameErrors = result.errors.filter(e => e.path === 'name');
      expect(nameErrors.length).toBeGreaterThan(0);
    });

    it('should fail if name is too short', async () => {
      const result = await runValidation(registerValidation, {
        name: 'AB',
        email: 'test@test.com',
        phone: '01012345678',
        password: 'Test@12345!',
      });

      const nameErrors = result.errors.filter(e => e.path === 'name');
      expect(nameErrors.length).toBeGreaterThan(0);
    });

    it('should fail if email is invalid', async () => {
      const result = await runValidation(registerValidation, {
        name: 'أحمد محمد',
        email: 'invalid-email',
        phone: '01012345678',
        password: 'Test@12345!',
      });

      const emailErrors = result.errors.filter(e => e.path === 'email');
      expect(emailErrors.length).toBeGreaterThan(0);
    });

    it('should fail if phone is not valid Egyptian number', async () => {
      const result = await runValidation(registerValidation, {
        name: 'أحمد محمد',
        email: 'test@test.com',
        phone: '1234567890',
        password: 'Test@12345!',
      });

      const phoneErrors = result.errors.filter(e => e.path === 'phone');
      expect(phoneErrors.length).toBeGreaterThan(0);
    });

    it('should fail if password is less than 10 characters', async () => {
      const result = await runValidation(registerValidation, {
        name: 'أحمد محمد',
        email: 'test@test.com',
        phone: '01012345678',
        password: 'short',
      });

      const passErrors = result.errors.filter(e => e.path === 'password');
      expect(passErrors.length).toBeGreaterThan(0);
    });

    it('should fail if password lacks complexity', async () => {
      const result = await runValidation(registerValidation, {
        name: 'أحمد محمد',
        email: 'test@test.com',
        phone: '01012345678',
        password: 'simplepassword', // no uppercase, number, or special char
      });

      const passErrors = result.errors.filter(e => e.path === 'password');
      expect(passErrors.length).toBeGreaterThan(0);
    });

    it('should pass with valid data', async () => {
      const result = await runValidation(registerValidation, {
        name: 'أحمد محمد',
        email: 'ahmed@test.com',
        phone: '01012345678',
        password: 'Test@12345!',
      });

      expect(result.errors.length).toBe(0);
    });
  });

  // ------------------------------------------
  // loginValidation
  // ------------------------------------------
  describe('loginValidation', () => {
    it('should fail if email is empty', async () => {
      const result = await runValidation(loginValidation, {
        email: '',
        password: 'test',
      });

      const emailErrors = result.errors.filter(e => e.path === 'email');
      expect(emailErrors.length).toBeGreaterThan(0);
    });

    it('should fail if password is empty', async () => {
      const result = await runValidation(loginValidation, {
        email: 'test@test.com',
        password: '',
      });

      const passErrors = result.errors.filter(e => e.path === 'password');
      expect(passErrors.length).toBeGreaterThan(0);
    });

    it('should pass with valid data', async () => {
      const result = await runValidation(loginValidation, {
        email: 'test@test.com',
        password: 'anypassword',
      });

      expect(result.errors.length).toBe(0);
    });
  });

  // ------------------------------------------
  // createCourseValidation
  // ------------------------------------------
  describe('createCourseValidation', () => {
    it('should fail if title is too short', async () => {
      const result = await runValidation(createCourseValidation, {
        title: 'AB',
        description: 'وصف طويل كافي لإنشاء الكورس بنجاح',
        price: 299,
        thumbnail: 'https://example.com/img.jpg',
        category: 'programming',
      });

      const titleErrors = result.errors.filter(e => e.path === 'title');
      expect(titleErrors.length).toBeGreaterThan(0);
    });

    it('should fail if description is too short', async () => {
      const result = await runValidation(createCourseValidation, {
        title: 'كورس JavaScript',
        description: 'وصف قصير',
        price: 299,
        thumbnail: 'https://example.com/img.jpg',
        category: 'programming',
      });

      const descErrors = result.errors.filter(e => e.path === 'description');
      expect(descErrors.length).toBeGreaterThan(0);
    });

    it('should fail if price is negative', async () => {
      const result = await runValidation(createCourseValidation, {
        title: 'كورس JavaScript',
        description: 'وصف الكورس الشامل لتعلم البرمجة',
        price: -100,
        thumbnail: 'https://example.com/img.jpg',
        category: 'programming',
      });

      const priceErrors = result.errors.filter(e => e.path === 'price');
      expect(priceErrors.length).toBeGreaterThan(0);
    });

    it('should fail if thumbnail is not a URL', async () => {
      const result = await runValidation(createCourseValidation, {
        title: 'كورس JavaScript',
        description: 'وصف الكورس الشامل لتعلم البرمجة',
        price: 299,
        thumbnail: 'not-a-url',
        category: 'programming',
      });

      const thumbErrors = result.errors.filter(e => e.path === 'thumbnail');
      expect(thumbErrors.length).toBeGreaterThan(0);
    });

    it('should pass with valid data', async () => {
      const result = await runValidation(createCourseValidation, {
        title: 'كورس JavaScript للمبتدئين',
        description: 'وصف شامل لتعلم أساسيات البرمجة بلغة جافاسكريبت',
        price: 299,
        thumbnail: 'https://example.com/img.jpg',
        category: 'programming',
      });

      expect(result.errors.length).toBe(0);
    });
  });
});
