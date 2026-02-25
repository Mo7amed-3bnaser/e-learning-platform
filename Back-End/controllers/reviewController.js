import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Video from "../models/Video.js";

/**
 * Helper: Check if user completed 100% of course
 */
const checkCourseCompletion = async (userId, courseId) => {
  const user = await User.findById(userId);
  if (!user) return false;

  const enrollment = user.enrolledCourses.find((e) => {
    if (e.course) return e.course.toString() === courseId;
    return e.toString() === courseId;
  });

  if (!enrollment || !enrollment.videoProgress) {
    return false;
  }

  // Calculate completion
  const totalVideos = await Video.countDocuments({ courseId });
  const completedVideos = enrollment.videoProgress.filter(
    (vp) => vp.completed,
  ).length;
  const progress =
    totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  return progress === 100;
};

/**
 * Helper: Recalculate and update course rating
 */
const updateCourseRating = async (courseId) => {
  const reviews = await Review.find({ courseId });

  if (reviews.length === 0) {
    await Course.findByIdAndUpdate(courseId, {
      "rating.average": 0,
      "rating.count": 0,
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = totalRating / reviews.length;

  await Course.findByIdAndUpdate(courseId, {
    "rating.average": Math.round(average * 10) / 10, // Round to 1 decimal
    "rating.count": reviews.length,
  });
};

/**
 * @desc    Add or update review
 * @route   POST /api/reviews
 * @access  Private
 */
export const addOrUpdateReview = asyncHandler(async (req, res) => {
  const { courseId, rating, comment } = req.body;
  const userId = req.user._id;

  // Validate input
  if (!courseId || !rating) {
    res.status(400);
    throw new Error("courseId و rating مطلوبان");
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("التقييم يجب أن يكون بين 1 و 5");
  }

  if (comment && comment.length > 500) {
    res.status(400);
    throw new Error("التعليق يجب أن لا يتجاوز 500 حرف");
  }

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("الكورس غير موجود");
  }

  // Check if user completed the course (100%)
  const isCompleted = await checkCourseCompletion(userId, courseId);
  if (!isCompleted) {
    res.status(403);
    throw new Error("يجب إتمام الكورس بنسبة 100% قبل إضافة تقييم");
  }

  // Get user data
  const user = await User.findById(userId);

  // Check if review already exists
  let review = await Review.findOne({ userId, courseId });

  if (review) {
    // Update existing review
    review.rating = rating;
    review.comment = comment || review.comment;
    review.userName = user.name; // Update in case name changed
    review.userAvatar = user.avatar; // Update in case avatar changed
    await review.save();

    // Recalculate course rating
    await updateCourseRating(courseId);

    res.json({
      success: true,
      message: "تم تحديث التقييم بنجاح",
      data: review,
    });
  } else {
    // Create new review
    review = await Review.create({
      courseId,
      userId,
      rating,
      comment,
      userName: user.name,
      userAvatar: user.avatar,
    });

    // Recalculate course rating
    await updateCourseRating(courseId);

    res.status(201).json({
      success: true,
      message: "تم إضافة التقييم بنجاح",
      data: review,
    });
  }
});

/**
 * @desc    Get reviews for a course
 * @route   GET /api/reviews/:courseId
 * @access  Public
 */
export const getCourseReviews = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("الكورس غير موجود");
  }

  // Get reviews for this course (with pagination)
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const [reviews, totalReviews] = await Promise.all([
    Review.find({ courseId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name avatar"),
    Review.countDocuments({ courseId })
  ]);

  res.json({
    success: true,
    data: {
      reviews,
      averageRating: course.rating.average,
      totalReviews: course.rating.count,
      pagination: {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit)
      }
    },
  });
});

/**
 * @desc    Get user's review for a course
 * @route   GET /api/reviews/my-review/:courseId
 * @access  Private
 */
export const getMyReview = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const review = await Review.findOne({ userId, courseId });

  if (!review) {
    return res.json({
      success: true,
      data: null,
    });
  }

  res.json({
    success: true,
    data: review,
  });
});

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error("التقييم غير موجود");
  }

  // Check if user owns this review or is admin
  if (
    review.userId.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("غير مصرح لك بحذف هذا التقييم");
  }

  const courseId = review.courseId;

  await Review.findByIdAndDelete(reviewId);

  // Recalculate course rating
  await updateCourseRating(courseId);

  res.json({
    success: true,
    message: "تم حذف التقييم بنجاح",
  });
});

/**
 * @desc    Check if user can review (completed course)
 * @route   GET /api/reviews/can-review/:courseId
 * @access  Private
 */
export const canReview = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const isCompleted = await checkCourseCompletion(userId, courseId);

  res.json({
    success: true,
    data: {
      canReview: isCompleted,
    },
  });
});
