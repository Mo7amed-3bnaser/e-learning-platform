import Comment from '../models/Comment.js';
import Video from '../models/Video.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { paginateQuery } from '../utils/pagination.js';
import logger from '../config/logger.js';
import xss from 'xss';

/**
 * @desc    إضافة تعليق جديد على فيديو
 * @route   POST /api/comments
 * @access  Private (للمستخدمين المسجلين فقط)
 */
export const addComment = async (req, res) => {
  try {
    const { videoId, content } = req.body;
    const userId = req.user._id;

    // Sanitize content to prevent XSS
    const sanitizedContent = xss(content, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'],
    });

    if (!sanitizedContent || sanitizedContent.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'محتوى التعليق لا يمكن أن يكون فارغاً' });
    }

    // التحقق من وجود الفيديو
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'الفيديو غير موجود'
      });
    }

    // Enrollment check: user must be enrolled in the course (admin/instructor exempt)
    if (req.user.role === 'student') {
      const course = await Course.findById(video.courseId).select('instructor');
      const isEnrolled = req.user.enrolledCourses.some((e) => {
        const id = e.course ? e.course.toString() : e.toString();
        return id === video.courseId.toString();
      });
      const isCourseInstructor = course && course.instructor.toString() === userId.toString();

      if (!isEnrolled && !isCourseInstructor) {
        return res.status(403).json({
          success: false,
          message: 'يجب شراء الكورس أولاً لإضافة تعليق'
        });
      }
    }

    // الحصول على بيانات المستخدم
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // إنشاء التعليق
    const comment = await Comment.create({
      videoId,
      userId,
      content: sanitizedContent,
      userName: user.name,
      userAvatar: user.avatar
    });

    res.status(201).json({
      success: true,
      message: 'تم إضافة التعليق بنجاح',
      data: comment
    });
  } catch (error) {
    logger.error('خطأ في إضافة التعليق:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة التعليق',
      error: error.message
    });
  }
};

/**
 * @desc    الحصول على تعليقات فيديو معين
 * @route   GET /api/comments/:videoId
 * @access  Public (يمكن لأي شخص رؤية التعليقات)
 * @query   page, limit
 */
export const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;

    // التحقق من وجود الفيديو
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'الفيديو غير موجود'
      });
    }

    // استخدام pagination helper
    const result = await paginateQuery(Comment, { videoId }, req, {
      populate: { path: 'userId', select: 'name avatar' },
      sort: '-createdAt',
      defaultLimit: 20
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('خطأ في جلب التعليقات:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التعليقات',
      error: error.message
    });
  }
};

/**
 * @desc    حذف تعليق
 * @route   DELETE /api/comments/:commentId
 * @access  Private (صاحب التعليق أو الأدمن فقط)
 */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'التعليق غير موجود'
      });
    }

    // التحقق من أن المستخدم هو صاحب التعليق أو أدمن
    if (comment.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بحذف هذا التعليق'
      });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: 'تم حذف التعليق بنجاح'
    });
  } catch (error) {
    logger.error('خطأ في حذف التعليق:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف التعليق',
      error: error.message
    });
  }
};

/**
 * @desc    تحديث تعليق
 * @route   PUT /api/comments/:commentId
 * @access  Private (صاحب التعليق فقط)
 */
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'التعليق غير موجود'
      });
    }

    // التحقق من أن المستخدم هو صاحب التعليق
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل هذا التعليق'
      });
    }

    comment.content = content;
    await comment.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث التعليق بنجاح',
      data: comment
    });
  } catch (error) {
    logger.error('خطأ في تحديث التعليق:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث التعليق',
      error: error.message
    });
  }
};
