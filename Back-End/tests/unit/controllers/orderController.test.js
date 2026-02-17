/**
 * Unit Tests - Order Controller
 * اختبارات وحدة لـ controller الطلبات
 */
import { jest } from '@jest/globals';

// ============================================
// Mocks
// ============================================
const OrderMock = {
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
};

const CourseMock = {
  findById: jest.fn(),
};

const UserMock = {
  findById: jest.fn(),
};

jest.unstable_mockModule('../../../models/Order.js', () => ({
  default: OrderMock,
}));

jest.unstable_mockModule('../../../models/Course.js', () => ({
  default: CourseMock,
}));

jest.unstable_mockModule('../../../models/User.js', () => ({
  default: UserMock,
}));

jest.unstable_mockModule('../../../utils/pagination.js', () => ({
  paginateQuery: jest.fn(async (Model, filter, req, options) => {
    const data = await Model.find(filter);
    return {
      data,
      pagination: { page: 1, limit: 10, total: data.length, pages: 1 },
    };
  }),
}));

jest.unstable_mockModule('../../../controllers/notificationController.js', () => ({
  createNotification: jest.fn(),
}));

jest.unstable_mockModule('../../../utils/sendEmail.js', () => ({
  default: jest.fn(),
  getOrderApprovedTemplate: jest.fn(() => '<html>Approved</html>'),
  getOrderRejectedTemplate: jest.fn(() => '<html>Rejected</html>'),
}));

// Import after mocking
const { createOrder, getMyOrders, approveOrder, rejectOrder } = await import('../../../controllers/orderController.js');

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

// ============================================
// Tests
// ============================================
describe('Order Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------
  // createOrder
  // ------------------------------------------
  describe('createOrder', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = {
        body: { courseId: 'course123' },
        user: { _id: 'user123', enrolledCourses: [] },
      };
      const res = createMockRes();

      await expect(createOrder(req, res)).rejects.toThrow('برجاء إدخال جميع البيانات المطلوبة');
    });

    it('should return 404 if course not found', async () => {
      const req = {
        body: {
          courseId: 'nonexistent',
          paymentMethod: 'vodafone_cash',
          screenshotUrl: 'https://example.com/screenshot.jpg',
        },
        user: { _id: 'user123', enrolledCourses: [] },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue(null);

      await expect(createOrder(req, res)).rejects.toThrow('الكورس غير موجود');
    });

    it('should return 400 if already enrolled', async () => {
      const req = {
        body: {
          courseId: 'course123',
          paymentMethod: 'vodafone_cash',
          screenshotUrl: 'https://example.com/screenshot.jpg',
        },
        user: {
          _id: 'user123',
          enrolledCourses: [{ toString: () => 'course123' }],
        },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue({ _id: 'course123', price: 299 });

      await expect(createOrder(req, res)).rejects.toThrow('أنت مسجل في هذا الكورس بالفعل');
    });

    it('should return 400 if pending order exists', async () => {
      const req = {
        body: {
          courseId: 'course123',
          paymentMethod: 'vodafone_cash',
          screenshotUrl: 'https://example.com/screenshot.jpg',
        },
        user: { _id: 'user123', enrolledCourses: [] },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue({ _id: 'course123', price: 299 });
      OrderMock.findOne.mockResolvedValue({ _id: 'existingOrder', status: 'pending' });

      await expect(createOrder(req, res)).rejects.toThrow('لديك طلب معلق بالفعل');
    });

    it('should create order successfully', async () => {
      const req = {
        body: {
          courseId: 'course123',
          paymentMethod: 'vodafone_cash',
          screenshotUrl: 'https://example.com/screenshot.jpg',
        },
        user: { _id: 'user123', enrolledCourses: [] },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue({ _id: 'course123', price: 299 });
      OrderMock.findOne.mockResolvedValue(null);
      OrderMock.create.mockResolvedValue({
        _id: 'order123',
        userId: 'user123',
        courseId: 'course123',
        status: 'pending',
        price: 299,
      });

      await createOrder(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._json.success).toBe(true);
      expect(OrderMock.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
        courseId: 'course123',
        paymentMethod: 'vodafone_cash',
        price: 299,
        status: 'pending',
      }));
    });
  });

  // ------------------------------------------
  // getMyOrders
  // ------------------------------------------
  describe('getMyOrders', () => {
    it('should return user orders', async () => {
      const req = {
        user: { _id: 'user123' },
        query: {},
      };
      const res = createMockRes();

      OrderMock.find.mockResolvedValue([
        { _id: 'order1', status: 'approved' },
        { _id: 'order2', status: 'pending' },
      ]);

      await getMyOrders(req, res);

      expect(res._json.success).toBe(true);
    });
  });

  // ------------------------------------------
  // approveOrder
  // ------------------------------------------
  describe('approveOrder', () => {
    it('should return 404 if order not found', async () => {
      const req = {
        params: { id: 'nonexistent' },
        user: { _id: 'admin123' },
      };
      const res = createMockRes();

      OrderMock.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(approveOrder(req, res)).rejects.toThrow('الطلب غير موجود');
    });

    it('should return 400 if order is already processed', async () => {
      const req = {
        params: { id: 'order123' },
        user: { _id: 'admin123' },
      };
      const res = createMockRes();

      OrderMock.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'order123',
          status: 'approved',
          userId: { _id: 'user123' },
          courseId: { _id: 'course123' },
        }),
      });

      await expect(approveOrder(req, res)).rejects.toThrow('هذا الطلب تم معالجته بالفعل');
    });
  });
});
