import asyncHandler from 'express-async-handler';
import Comment from '../models/Comment.js';
import Video from '../models/Video.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { paginateQuery } from '../utils/pagination.js';
import { isUserEnrolled } from '../utils/enrollmentHelper.js';
import { ROLES, ERROR_MESSAGES } from '../utils/constants.js';

/**
 * @desc    إضافة تعليق جديد على فيديو
 * @route   POST /api/comments
 * @access  Private (للمستخدمين المسجلين فقط)
 */
export const addComment = asyncHandler(async (req, res) => {
  const { videoId, content } = req.body;
  const userId = req.user._id;

  if (!content || content.trim().length === 0) {
    res.status(400);
    throw new Error('محتوى التعليق لا يمكن أن يكون فارغاً');
  }

  // التحقق من وجود الفيديو
  const video = await Video.findById(videoId);
  if (!video) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.VIDEO_NOT_FOUND);
  }

  // Enrollment check: user must be enrolled in the course (admin/instructor exempt)
  if (req.user.role === ROLES.STUDENT) {
    const course = await Course.findById(video.courseId).select('instructor');
    const isEnrolled = isUserEnrolled(req.user, video.courseId.toString());
    const isCourseInstructor = course && course.instructor.toString() === userId.toString();

    if (!isEnrolled && !isCourseInstructor) {
      res.status(403);
      throw new Error('يجب شراء الكورس أولاً لإضافة تعليق');
    }
  }

  // الحصول على بيانات المستخدم
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
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
});

/**
 * @desc    الحصول على تعليقات فيديو معين
 * @route   GET /api/comments/:videoId
 * @access  Public (يمكن لأي شخص رؤية التعليقات)
 * @query   page, limit
 */
export const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // التحقق من وجود الفيديو
  const video = await Video.findById(videoId);
  if (!video) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.VIDEO_NOT_FOUND);
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
});

/**
 * @desc    حذف تعليق
 * @route   DELETE /api/comments/:commentId
 * @access  Private (صاحب التعليق أو الأدمن فقط)
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.COMMENT_NOT_FOUND);
  }

  // التحقق من أن المستخدم هو صاحب التعليق أو أدمن
  if (comment.userId.toString() !== userId.toString() && req.user.role !== ROLES.ADMIN) {
    res.status(403);
    throw new Error('غير مصرح لك بحذف هذا التعليق');
  }

  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({
    success: true,
    message: 'تم حذف التعليق بنجاح'
  });
});

/**
 * @desc    تحديث تعليق
 * @route   PUT /api/comments/:commentId
 * @access  Private (صاحب التعليق فقط)
 */
export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.COMMENT_NOT_FOUND);
  }

  // التحقق من أن المستخدم هو صاحب التعليق
  if (comment.userId.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('غير مصرح لك بتعديل هذا التعليق');
  }

  comment.content = content;
  await comment.save();

  res.status(200).json({
    success: true,
    message: 'تم تحديث التعليق بنجاح',
    data: comment
  });
});
