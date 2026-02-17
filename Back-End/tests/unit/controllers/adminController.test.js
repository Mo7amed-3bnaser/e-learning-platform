/**
 * Unit Tests - Admin Controller
 * اختبارات وحدة لـ controller الأدمن
 */
import { jest } from '@jest/globals';

// ============================================
// Mocks
// ============================================
const UserMock = {
  find: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn(),
};

const CourseMock = {
  find: jest.fn(),
  countDocuments: jest.fn(),
};

const OrderMock = {
  find: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn(),
  deleteMany: jest.fn(),
};

const InstructorApplicationMock = {
  find: jest.fn(),
  countDocuments: jest.fn(),
};

jest.unstable_mockModule('../../../models/User.js', () => ({
  default: UserMock,
}));

jest.unstable_mockModule('../../../models/Course.js', () => ({
  default: CourseMock,
}));

jest.unstable_mockModule('../../../models/Order.js', () => ({
  default: OrderMock,
}));

jest.unstable_mockModule('../../../models/InstructorApplication.js', () => ({
  default: InstructorApplicationMock,
}));

jest.unstable_mockModule('../../../utils/pagination.js', () => ({
  paginateQuery: jest.fn(async (Model, filter, req, options) => {
    const data = await Model.find(filter);
    return {
      data,
      pagination: { page: 1, limit: 20, total: data.length, pages: 1 },
    };
  }),
}));

// Import after mocking
const { getDashboardStats, getAllStudents, toggleBlockStudent, deleteStudent, searchStudents } = await import('../../../controllers/adminController.js');

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
describe('Admin Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------
  // getDashboardStats
  // ------------------------------------------
  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const req = {};
      const res = createMockRes();

      UserMock.countDocuments.mockResolvedValue(50);
      CourseMock.countDocuments
        .mockResolvedValueOnce(20) // total courses
        .mockResolvedValueOnce(15); // published courses
      OrderMock.countDocuments
        .mockResolvedValueOnce(5) // pending
        .mockResolvedValueOnce(30); // approved
      OrderMock.find.mockImplementation((filter) => {
        if (filter && filter.status === 'approved') {
          return [
            { price: 299 },
            { price: 199 },
            { price: 399 },
          ];
        }
        return {
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        };
      });

      await getDashboardStats(req, res);

      expect(res._json.success).toBe(true);
      expect(res._json.data.stats).toBeDefined();
      expect(res._json.data.stats.totalStudents).toBe(50);
    });
  });

  // ------------------------------------------
  // getAllStudents
  // ------------------------------------------
  describe('getAllStudents', () => {
    it('should return paginated students', async () => {
      const req = { query: {} };
      const res = createMockRes();

      UserMock.find.mockResolvedValue([
        { _id: 'user1', name: 'طالب 1', role: 'student' },
        { _id: 'user2', name: 'طالب 2', role: 'student' },
      ]);

      await getAllStudents(req, res);

      expect(res._json.success).toBe(true);
    });

    it('should handle search query', async () => {
      const req = { query: { search: 'أحمد' } };
      const res = createMockRes();

      UserMock.find.mockResolvedValue([
        { _id: 'user1', name: 'أحمد محمد', role: 'student' },
      ]);

      await getAllStudents(req, res);

      expect(res._json.success).toBe(true);
    });
  });

  // ------------------------------------------
  // toggleBlockStudent
  // ------------------------------------------
  describe('toggleBlockStudent', () => {
    it('should return 404 if student not found', async () => {
      const req = { params: { id: 'nonexistent' } };
      const res = createMockRes();

      UserMock.findById.mockResolvedValue(null);

      await expect(toggleBlockStudent(req, res)).rejects.toThrow('الطالب غير موجود');
    });

    it('should not allow blocking admin', async () => {
      const req = { params: { id: 'admin123' } };
      const res = createMockRes();

      UserMock.findById.mockResolvedValue({
        _id: 'admin123',
        role: 'admin',
        isBlocked: false,
      });

      await expect(toggleBlockStudent(req, res)).rejects.toThrow('لا يمكن حظر مشرف');
    });

    it('should toggle block status', async () => {
      const req = { params: { id: 'user123' } };
      const res = createMockRes();

      const student = {
        _id: 'user123',
        name: 'طالب',
        role: 'student',
        isBlocked: false,
        save: jest.fn(),
      };
      UserMock.findById.mockResolvedValue(student);

      await toggleBlockStudent(req, res);

      expect(student.isBlocked).toBe(true);
      expect(student.save).toHaveBeenCalled();
      expect(res._json.success).toBe(true);
      expect(res._json.data.isBlocked).toBe(true);
    });

    it('should unblock blocked student', async () => {
      const req = { params: { id: 'user123' } };
      const res = createMockRes();

      const student = {
        _id: 'user123',
        name: 'طالب',
        role: 'student',
        isBlocked: true,
        save: jest.fn(),
      };
      UserMock.findById.mockResolvedValue(student);

      await toggleBlockStudent(req, res);

      expect(student.isBlocked).toBe(false);
    });
  });

  // ------------------------------------------
  // deleteStudent
  // ------------------------------------------
  describe('deleteStudent', () => {
    it('should return 404 if student not found', async () => {
      const req = { params: { id: 'nonexistent' } };
      const res = createMockRes();

      UserMock.findById.mockResolvedValue(null);

      await expect(deleteStudent(req, res)).rejects.toThrow('الطالب غير موجود');
    });

    it('should not allow deleting admin', async () => {
      const req = { params: { id: 'admin123' } };
      const res = createMockRes();

      UserMock.findById.mockResolvedValue({
        _id: 'admin123',
        role: 'admin',
      });

      await expect(deleteStudent(req, res)).rejects.toThrow('لا يمكن حذف مشرف');
    });

    it('should delete student and their orders', async () => {
      const req = { params: { id: 'user123' } };
      const res = createMockRes();

      const student = {
        _id: 'user123',
        role: 'student',
        deleteOne: jest.fn(),
      };
      UserMock.findById.mockResolvedValue(student);
      OrderMock.deleteMany.mockResolvedValue({ deletedCount: 3 });

      await deleteStudent(req, res);

      expect(OrderMock.deleteMany).toHaveBeenCalledWith({ userId: 'user123' });
      expect(student.deleteOne).toHaveBeenCalled();
      expect(res._json.success).toBe(true);
    });
  });

  // ------------------------------------------
  // searchStudents
  // ------------------------------------------
  describe('searchStudents', () => {
    it('should return 400 if search query is missing', async () => {
      const req = { query: {} };
      const res = createMockRes();

      await expect(searchStudents(req, res)).rejects.toThrow('برجاء إدخال كلمة البحث');
    });

    it('should return search results', async () => {
      const req = { query: { q: 'أحمد' } };
      const res = createMockRes();

      UserMock.find.mockResolvedValue([
        { _id: 'user1', name: 'أحمد محمد' },
      ]);

      await searchStudents(req, res);

      expect(res._json.success).toBe(true);
    });
  });
});
