/**
 * Unit Tests - Video Controller
 * اختبارات وحدة لـ controller الفيديوهات
 */
import { jest } from '@jest/globals';

// ============================================
// Mocks
// ============================================
const CourseMock = {
  findById: jest.fn(),
};

const VideoMock = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn(),
  deleteMany: jest.fn(),
};

jest.unstable_mockModule('../../../models/Course.js', () => ({
  default: CourseMock,
}));

jest.unstable_mockModule('../../../models/Video.js', () => ({
  default: VideoMock,
}));

// Import after mocking
const { addVideo, getCourseVideos, getVideoById, updateVideo } = await import('../../../controllers/videoController.js');

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
describe('Video Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------
  // addVideo
  // ------------------------------------------
  describe('addVideo', () => {
    it('should return 404 if course not found', async () => {
      const req = {
        body: {
          courseId: 'nonexistent',
          title: 'فيديو جديد',
          youtubeVideoId: 'abc123',
          duration: 600,
          order: 1,
        },
        user: { id: 'admin123', role: 'admin' },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue(null);

      await expect(addVideo(req, res)).rejects.toThrow('الكورس غير موجود');
    });

    it('should return 403 if user is not admin or course owner', async () => {
      const req = {
        body: {
          courseId: 'course123',
          title: 'فيديو',
          youtubeVideoId: 'abc123',
          duration: 600,
          order: 1,
        },
        user: { id: 'other-user', role: 'instructor' },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue({
        _id: 'course123',
        instructor: { toString: () => 'instructor123' },
      });

      await expect(addVideo(req, res)).rejects.toThrow('غير مصرح لك');
    });

    it('should require youtubeVideoId for YouTube videos', async () => {
      const req = {
        body: {
          courseId: 'course123',
          title: 'فيديو',
          videoProvider: 'youtube',
          // youtubeVideoId missing
          duration: 600,
          order: 1,
        },
        user: { id: 'admin123', role: 'admin' },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue({
        _id: 'course123',
        instructor: { toString: () => 'admin123' },
      });

      await expect(addVideo(req, res)).rejects.toThrow('معرف فيديو YouTube مطلوب');
    });

    it('should create video successfully', async () => {
      const req = {
        body: {
          courseId: 'course123',
          title: 'مقدمة JavaScript',
          videoProvider: 'youtube',
          youtubeVideoId: 'dQw4w9WgXcQ',
          duration: 600,
          order: 1,
          isFreePreview: true,
        },
        user: { id: 'admin123', role: 'admin' },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue({
        _id: 'course123',
        instructor: { toString: () => 'instructor123' },
      });

      VideoMock.create.mockResolvedValue({
        _id: 'video123',
        ...req.body,
      });

      await addVideo(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._json.success).toBe(true);
      expect(VideoMock.create).toHaveBeenCalled();
    });
  });

  // ------------------------------------------
  // getCourseVideos
  // ------------------------------------------
  describe('getCourseVideos', () => {
    it('should return 404 if course not found', async () => {
      const req = {
        params: { courseId: 'nonexistent' },
        user: { enrolledCourses: [], role: 'student' },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue(null);

      await expect(getCourseVideos(req, res)).rejects.toThrow('الكورس غير موجود');
    });

    it('should return 403 if student is not enrolled', async () => {
      const req = {
        params: { courseId: 'course123' },
        user: { enrolledCourses: [], role: 'student' },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue({ _id: 'course123' });

      await expect(getCourseVideos(req, res)).rejects.toThrow('يجب شراء الكورس أولاً');
    });

    it('should allow admin to access any course videos', async () => {
      const req = {
        params: { courseId: 'course123' },
        user: { enrolledCourses: [], role: 'admin' },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue({ _id: 'course123' });
      VideoMock.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          {
            _id: 'video1',
            title: 'مقدمة',
            videoProvider: 'youtube',
            youtubeVideoId: 'abc',
            duration: 600,
            order: 1,
            isFreePreview: true,
            thumbnail: null,
          },
        ]),
      });

      await getCourseVideos(req, res);

      expect(res._json.success).toBe(true);
      expect(res._json.data.videos).toHaveLength(1);
    });

    it('should return progress data for enrolled students', async () => {
      const enrollment = {
        course: { toString: () => 'course123' },
        videoProgress: [
          { video: { toString: () => 'video1' }, completed: true, completedAt: new Date(), watchDuration: 600, lastWatchedAt: new Date() },
        ],
        lastWatchedVideo: 'video1',
        lastWatchedAt: new Date(),
      };

      const req = {
        params: { courseId: 'course123' },
        user: { enrolledCourses: [enrollment], role: 'student' },
      };
      const res = createMockRes();

      CourseMock.findById.mockResolvedValue({ _id: 'course123' });
      VideoMock.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          {
            _id: 'video1',
            title: 'مقدمة',
            videoProvider: 'youtube',
            youtubeVideoId: 'abc',
            duration: 600,
            order: 1,
            isFreePreview: true,
            thumbnail: null,
          },
        ]),
      });

      await getCourseVideos(req, res);

      expect(res._json.data.progress).toBeDefined();
      expect(res._json.data.progress.overallProgress).toBe(100);
      expect(res._json.data.progress.completedVideos).toBe(1);
    });
  });

  // ------------------------------------------
  // getVideoById
  // ------------------------------------------
  describe('getVideoById', () => {
    it('should return 404 if video not found', async () => {
      const req = { params: { videoId: 'nonexistent' } };
      const res = createMockRes();

      VideoMock.findById.mockResolvedValue(null);

      await expect(getVideoById(req, res)).rejects.toThrow('الفيديو غير موجود');
    });

    it('should return 403 if user is not enrolled and video is not free', async () => {
      const req = {
        params: { videoId: 'video1' },
        user: {
          enrolledCourses: [],
          role: 'student',
        },
      };
      const res = createMockRes();

      VideoMock.findById.mockResolvedValue({
        _id: 'video1',
        courseId: { toString: () => 'course123' },
        isFreePreview: false,
      });

      await expect(getVideoById(req, res)).rejects.toThrow('يجب شراء الكورس');
    });

    it('should allow access to free preview videos', async () => {
      const req = {
        params: { videoId: 'video1' },
        user: {
          enrolledCourses: [],
          role: 'student',
        },
      };
      const res = createMockRes();

      const video = {
        _id: 'video1',
        courseId: { toString: () => 'course123' },
        isFreePreview: true,
        title: 'مقدمة',
      };
      VideoMock.findById.mockResolvedValue(video);

      await getVideoById(req, res);

      expect(res._json.success).toBe(true);
      expect(res._json.data).toBe(video);
    });
  });
});
