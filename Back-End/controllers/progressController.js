import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Video from '../models/Video.js';
import Course from '../models/Course.js';
import { generateCertificateForStudent } from './certificateController.js';
import logger from '../config/logger.js';
import { findEnrollment, requireEnrollment, migrateEnrollmentFormat } from '../utils/enrollmentHelper.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

// @desc    Mark video as complete
// @route   POST /api/progress/mark-complete
// @access  Private
export const markVideoComplete = asyncHandler(async (req, res) => {
  const { videoId, courseId, watchDuration } = req.body;
  const userId = req.user._id;

  // Validate input
  if (!videoId || !courseId) {
    res.status(400);
    throw new Error('videoId و courseId مطلوبان');
  }

  // Check if video exists and belongs to course
  const video = await Video.findById(videoId);
  if (!video) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.VIDEO_NOT_FOUND);
  }

  if (video.courseId.toString() !== courseId) {
    res.status(400);
    throw new Error('الفيديو لا ينتمي لهذا الكورس');
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Find enrollment using helper
  let { enrollment, index: enrollmentIndex } = findEnrollment(user, courseId);

  if (enrollmentIndex === -1) {
    res.status(403);
    throw new Error(ERROR_MESSAGES.MUST_ENROLL);
  }

  // If old format (ObjectId), convert to new format
  if (!enrollment.course) {
    enrollment = migrateEnrollmentFormat(user, enrollmentIndex, courseId);
  }

  // If no videoProgress array, initialize it
  if (!enrollment.videoProgress) {
    enrollment.videoProgress = [];
  }

  // Find or create video progress entry
  let videoProgress = enrollment.videoProgress.find(
    (vp) => vp.video && vp.video.toString() === videoId,
  );

  if (!videoProgress) {
    // Create new video progress entry
    enrollment.videoProgress.push({
      video: videoId,
      completed: true,
      completedAt: new Date(),
      watchDuration: watchDuration || 0,
      lastWatchedAt: new Date(),
    });
  } else {
    // Update existing entry
    videoProgress.completed = true;
    videoProgress.completedAt = new Date();
    if (watchDuration !== undefined) {
      videoProgress.watchDuration = watchDuration;
    }
    videoProgress.lastWatchedAt = new Date();
  }

  // Mark as modified for Mixed schema type
  user.markModified('enrolledCourses');

  // Save user
  await user.save();

  // Calculate overall course progress
  const totalVideos = await Video.countDocuments({ courseId });
  const completedVideos = enrollment.videoProgress.filter(
    (vp) => vp.completed,
  ).length;
  const overallProgress =
    totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  // Check if course is 100% complete and certificate doesn't exist yet
  if (overallProgress === 100 && !enrollment.certificateUrl) {
    try {
      // Generate certificate asynchronously
      const certificateData = await generateCertificateForStudent(
        userId,
        courseId,
      );

      // Refresh enrollment data from DB (it was updated in generateCertificateForStudent)
      const updatedUser = await User.findById(userId);
      const { enrollment: updatedEnrollment } = findEnrollment(updatedUser, courseId);

      // Include certificate data in response
      return res.status(200).json({
        success: true,
        message: 'تم تحديد الفيديو كمكتمل',
        data: {
          videoId,
          completed: true,
          completedAt: new Date(),
          courseProgress: overallProgress,
          certificateGenerated: true,
          certificateId: updatedEnrollment.certificateId,
          certificateUrl: updatedEnrollment.certificateUrl,
        },
      });
    } catch (certError) {
      // Log error but don't fail the video completion
      logger.error('Failed to generate certificate:', certError);
      // Continue with normal response
    }
  }

  res.status(200).json({
    success: true,
    message: 'تم تحديد الفيديو كمكتمل',
    data: {
      videoId,
      completed: true,
      completedAt: new Date(),
      courseProgress: overallProgress,
    },
  });
});

// @desc    Update watch duration
// @route   POST /api/progress/update-watch-duration
// @access  Private
export const updateWatchDuration = asyncHandler(async (req, res) => {
  const { videoId, courseId, watchDuration } = req.body;
  const userId = req.user._id;

  // Validate input
  if (!videoId || !courseId || watchDuration === undefined) {
    res.status(400);
    throw new Error('videoId, courseId, و watchDuration مطلوبان');
  }

  // Validate watchDuration
  if (typeof watchDuration !== 'number' || watchDuration < 0) {
    res.status(400);
    throw new Error('watchDuration يجب أن يكون رقم موجب');
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Find enrollment using helper
  let { enrollment, index: enrollmentIndex } = findEnrollment(user, courseId);

  if (enrollmentIndex === -1) {
    res.status(403);
    throw new Error(ERROR_MESSAGES.MUST_ENROLL);
  }

  // If old format (ObjectId), convert to new format
  if (!enrollment.course) {
    enrollment = migrateEnrollmentFormat(user, enrollmentIndex, courseId);
  }

  // If no videoProgress array, initialize it
  if (!enrollment.videoProgress) {
    enrollment.videoProgress = [];
  }

  // Find or create video progress entry
  let videoProgress = enrollment.videoProgress.find(
    (vp) => vp.video && vp.video.toString() === videoId,
  );

  if (!videoProgress) {
    // Create new video progress entry
    enrollment.videoProgress.push({
      video: videoId,
      completed: false,
      watchDuration,
      lastWatchedAt: new Date(),
    });
  } else {
    // Update existing entry
    videoProgress.watchDuration = watchDuration;
    videoProgress.lastWatchedAt = new Date();
  }

  // Mark as modified for Mixed schema type
  user.markModified('enrolledCourses');

  // Save user
  await user.save();

  res.status(200).json({
    success: true,
    data: { updated: true },
  });
});

// @desc    Get course progress
// @route   GET /api/progress/course/:courseId
// @access  Private
export const getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.COURSE_NOT_FOUND);
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Find enrollment using helper
  const { enrollment } = findEnrollment(user, courseId);

  if (!enrollment) {
    res.status(403);
    throw new Error(ERROR_MESSAGES.MUST_ENROLL);
  }

  // Get total videos count
  const totalVideos = await Video.countDocuments({ courseId });

  // If old format, return empty progress - will be populated on first mark complete
  if (!enrollment.videoProgress) {
    return res.status(200).json({
      success: true,
      data: {
        courseId,
        overallProgress: 0,
        lastWatchedVideo: null,
        lastWatchedAt: null,
        totalVideos,
        completedVideos: 0,
        videoProgress: {},
      },
    });
  }

  // Calculate completed videos
  const completedVideos = enrollment.videoProgress.filter(
    (vp) => vp.completed,
  ).length;

  // Calculate overall progress
  const overallProgress =
    totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  // Transform video progress to object for easy lookup
  const videoProgressMap = {};
  enrollment.videoProgress.forEach((vp) => {
    if (vp.video) {
      videoProgressMap[vp.video.toString()] = {
        completed: vp.completed,
        completedAt: vp.completedAt,
        watchDuration: vp.watchDuration,
        lastWatchedAt: vp.lastWatchedAt,
      };
    }
  });

  res.status(200).json({
    success: true,
    data: {
      courseId,
      overallProgress,
      lastWatchedVideo: enrollment.lastWatchedVideo,
      lastWatchedAt: enrollment.lastWatchedAt,
      totalVideos,
      completedVideos,
      videoProgress: videoProgressMap,
    },
  });
});

// @desc    Update last watched video
// @route   POST /api/progress/update-last-watched
// @access  Private
export const updateLastWatched = asyncHandler(async (req, res) => {
  const { courseId, videoId } = req.body;
  const userId = req.user._id;

  // Validate input
  if (!courseId || !videoId) {
    res.status(400);
    throw new Error('courseId و videoId مطلوبان');
  }

  // Check if video exists and belongs to course
  const video = await Video.findById(videoId);
  if (!video) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.VIDEO_NOT_FOUND);
  }

  if (video.courseId.toString() !== courseId) {
    res.status(400);
    throw new Error('الفيديو لا ينتمي لهذا الكورس');
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Find enrollment using helper
  const { enrollment, index: enrollmentIndex } = findEnrollment(user, courseId);

  if (!enrollment) {
    res.status(403);
    throw new Error(ERROR_MESSAGES.MUST_ENROLL);
  }

  // If old format, convert to new format
  if (!enrollment.videoProgress) {
    migrateEnrollmentFormat(user, enrollmentIndex, courseId, {
      lastWatchedVideo: videoId,
      lastWatchedAt: new Date(),
    });
  } else {
    // Update last watched video for new format
    enrollment.lastWatchedVideo = videoId;
    enrollment.lastWatchedAt = new Date();
  }

  // Mark as modified for Mixed schema type
  user.markModified('enrolledCourses');

  // Save user
  await user.save();

  res.status(200).json({
    success: true,
    data: { updated: true },
  });
});
