/**
 * Unit Tests - Course Controller
 * اختبارات وحدة لـ controller الكورسات
 */
import { jest } from '@jest/globals';

// ============================================
// Mocks
// ============================================
const mockCourse = {
  _id: 'course123',
  title: 'كورس JavaScript',
  description: 'كورس شامل لتعلم أساسيات البرمجة بلغة جافاسكريبت من الصفر حتى الاحتراف',
  price: 299,
  thumbnail: 'https://example.com/thumb.jpg',
  category: 'programming',
  level: 'beginner',
  instructor: 'instructor123',
  isPublished: true,
  enrolledStudents: 10,
  rating: { average: 4.5, count: 5 },
  toObject: jest.fn(function () { return { ...this }; }),
  save: jest.fn(),
  deleteOne: jest.fn(),
};

const CourseMock = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
};

const VideoMock = {
  find: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn(),
};

jest.unstable_mockModule('../../../models/Course.js', () => ({
  default: CourseMock,
}));

jest.unstable_mockModule('../../../models/Video.js', () => ({
  default: VideoMock,
}));

jest.unstable_mockModule('../../../utils/pagination.js', () => ({
  paginateQuery: jest.fn(async (Model, filter, req, options) => {
    const data = await Model.find(filter);
    return {
      data,
      pagination: { page: 1, limit: 12, total: data.length, pages: 1 },
    };
  }),
}));

// Import after mocking
const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, togglePublishCourse } = await import('../../../controllers/courseController.js');

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
describe('Course Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------
  // getCourses
  // ------------------------------------------
  describe('getCourses', () => {
    it('should return published courses', async () => {
      const req = { query: {} };
      const res = createMockRes();

      CourseMock.find.mockResolvedValue([mockCourse]);

      await getCourses(req, res);

      expect(res._json.success).toBe(true);
    });

    it('should filter by category', async () => {
      const req = { query: { category: 'programming' } };
      const res = createMockRes();

      CourseMock.find.mockResolvedValue([mockCourse]);

      await getCourses(req, res);

      expect(res._json.success).toBe(true);
    });

    it('should filter by search query', async () => {
      const req = { query: { search: 'JavaScript' } };
      const res = createMockRes();

      CourseMock.find.mockResolvedValue([mockCourse]);

      await getCourses(req, res);

      expect(res._json.success).toBe(true);
    });

    it('should filter by level', async () => {
      const req = { query: { level: 'beginner' } };
      const res = createMockRes();

      CourseMock.find.mockResolvedValue([mockCourse]);

      await getCourses(req, res);

      expect(res._json.success).toBe(true);
    });
  });

  // ------------------------------------------
  // getCourseById
  // ------------------------------------------
  describe('getCourseById', () => {
    it('should return 404 if course not found', async () => {
      const req = { params: { id: 'nonexistent' }, user: null };
      const res = createMockRes();

      CourseMock.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(getCourseById(req, res)).rejects.toThrow('الكورس غير موجود');
      expect(res.statusCode).toBe(404);
    });

    it('should return course details with videos', async () => {
      const req = {
        params: { id: 'course123' },
        user: null,
      };
      const res = createMockRes();

      const course = {
        ...mockCourse,
        _id: 'course123',
        toObject: jest.fn(() => ({ ...mockCourse, _id: 'course123' })),
      };

      CourseMock.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(course),
      });

      VideoMock.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([
            {
              _id: 'video1',
              title: 'مقدمة',
              description: 'وصف',
              duration: 600,
              order: 1,
              isFreePreview: true,
              thumbnail: null,
              youtubeVideoId: 'abc123',
            },
          ]),
        }),
      });

      await getCourseById(req, res);

      expect(res._json.success).toBe(true);
      expect(res._json.data).toBeDefined();
      expect(res._json.data.videos).toBeDefined();
    });

    it('should include youtubeVideoId only for free preview videos', async () => {
      const req = {
        params: { id: 'course123' },
        user: null,
      };
      const res = createMockRes();

      const course = {
        ...mockCourse,
        toObject: jest.fn(() => ({ ...mockCourse })),
      };

      CourseMock.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(course),
      });

      const freeVideo = {
        _id: 'video1',
        title: 'مقدمة',
        description: 'وصف',
        duration: 600,
        order: 1,
        isFreePreview: true,
        thumbnail: null,
        youtubeVideoId: 'abc123',
      };
      const paidVideo = {
        _id: 'video2',
        title: 'الدرس الأول',
        description: 'وصف',
        duration: 900,
        order: 2,
        isFreePreview: false,
        thumbnail: null,
        youtubeVideoId: 'xyz789',
      };

      VideoMock.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([freeVideo, paidVideo]),
        }),
      });

      await getCourseById(req, res);

      const videos = res._json.data.videos;
      expect(videos[0].youtubeVideoId).toBe('abc123'); // Free preview shows ID
      expect(videos[1].youtubeVideoId).toBeUndefined(); // Paid hides ID
    });

    it('should detect enrolled status for logged-in user', async () => {
      const req = {
        params: { id: 'course123' },
        user: {
          enrolledCourses: ['course123'],
        },
      };
      const res = createMockRes();

      const course = {
        ...mockCourse,
        toObject: jest.fn(() => ({ ...mockCourse })),
      };

      CourseMock.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(course),
      });

      VideoMock.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([]),
        }),
      });

      await getCourseById(req, res);

      expect(res._json.data.isEnrolled).toBe(true);
    });
  });

  // ------------------------------------------
  // createCourse
  // ------------------------------------------
  describe('createCourse', () => {
    it('should create course for instructor', async () => {
      const req = {
        body: {
          title: 'كورس جديد',
          description: 'وصف الكورس الشامل لتعلم البرمجة',
          price: 199,
          thumbnail: 'https://example.com/thumb.jpg',
          category: 'programming',
          level: 'beginner',
        },
        user: { id: 'instructor123', role: 'instructor' },
      };
      const res = createMockRes();

      const createdCourse = {
        ...req.body,
        _id: 'new-course',
        instructor: 'instructor123',
        populate: jest.fn().mockResolvedValue(true),
      };
      CourseMock.create.mockResolvedValue(createdCourse);

      await createCourse(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._json.success).toBe(true);
      expect(CourseMock.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'كورس جديد',
        instructor: 'instructor123',
      }));
    });

    it('should allow admin to assign different instructor', async () => {
      const req = {
        body: {
          title: 'كورس جديد',
          description: 'وصف الكورس الشامل لتعلم البرمجة',
          price: 199,
          thumbnail: 'https://example.com/thumb.jpg',
          category: 'programming',
          instructor: 'other-instructor',
        },
        user: { id: 'admin123', role: 'admin' },
      };
      const res = createMockRes();

      const createdCourse = {
        ...req.body,
        _id: 'new-course',
        populate: jest.fn().mockResolvedValue(true),
      };
      CourseMock.create.mockResolvedValue(createdCourse);

      await createCourse(req, res);

      expect(CourseMock.create).toHaveBeenCalledWith(expect.objectContaining({
        instructor: 'other-instructor',
      }));
    });
  });

  // ------------------------------------------
  // updateCourse
  // ------------------------------------------
  describe('updateCourse', () => {
    it('should return 404 if course not found', async () => {
      const req = {
        params: { id: 'nonexistent' },
        body: { title: 'Updated' },
        user: { role: 'admin' },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue(null);

      await expect(updateCourse(req, res)).rejects.toThrow('الكورس غير موجود');
    });

    it('should only update allowed fields (whitelist)', async () => {
      const req = {
        params: { id: 'course123' },
        body: {
          title: 'عنوان محدث',
          isPublished: true,  // Should NOT be updated
          enrolledStudents: 999,  // Should NOT be updated
        },
        user: { role: 'instructor' },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue(mockCourse);
      CourseMock.findByIdAndUpdate.mockResolvedValue({
        ...mockCourse,
        title: 'عنوان محدث',
      });

      await updateCourse(req, res);

      // Verify only allowed fields are in the update
      const updateCall = CourseMock.findByIdAndUpdate.mock.calls[0];
      const updates = updateCall[1];
      expect(updates.title).toBe('عنوان محدث');
      expect(updates.isPublished).toBeUndefined();
      expect(updates.enrolledStudents).toBeUndefined();
    });
  });

  // ------------------------------------------
  // deleteCourse
  // ------------------------------------------
  describe('deleteCourse', () => {
    it('should return 404 if course not found', async () => {
      const req = { params: { id: 'nonexistent' } };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue(null);

      await expect(deleteCourse(req, res)).rejects.toThrow('الكورس غير موجود');
    });

    it('should delete course and its videos', async () => {
      const req = { params: { id: 'course123' } };
      const res = createMockRes();

      const course = {
        ...mockCourse,
        deleteOne: jest.fn(),
      };
      CourseMock.findById.mockResolvedValue(course);
      VideoMock.deleteMany.mockResolvedValue({ deletedCount: 5 });

      await deleteCourse(req, res);

      expect(VideoMock.deleteMany).toHaveBeenCalledWith({ courseId: 'course123' });
      expect(course.deleteOne).toHaveBeenCalled();
      expect(res._json.success).toBe(true);
    });
  });

  // ------------------------------------------
  // togglePublishCourse
  // ------------------------------------------
  describe('togglePublishCourse', () => {
    it('should return 404 if course not found', async () => {
      const req = { params: { id: 'nonexistent' } };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue(null);

      await expect(togglePublishCourse(req, res)).rejects.toThrow('الكورس غير موجود');
    });

    it('should toggle publish status from false to true', async () => {
      const req = { params: { id: 'course123' } };
      const res = createMockRes();

      const course = {
        ...mockCourse,
        isPublished: false,
        save: jest.fn(),
      };
      CourseMock.findById.mockResolvedValue(course);

      await togglePublishCourse(req, res);

      expect(course.isPublished).toBe(true);
      expect(course.save).toHaveBeenCalled();
      expect(res._json.data.isPublished).toBe(true);
    });

    it('should toggle publish status from true to false', async () => {
      const req = { params: { id: 'course123' } };
      const res = createMockRes();

      const course = {
        ...mockCourse,
        isPublished: true,
        save: jest.fn(),
      };
      CourseMock.findById.mockResolvedValue(course);

      await togglePublishCourse(req, res);

      expect(course.isPublished).toBe(false);
      expect(course.save).toHaveBeenCalled();
    });
  });
});
