import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Course from '../models/Course.js';

/**
 * @desc    الحصول على قائمة الرغبات للمستخدم
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'title description price thumbnail category level rating enrolledStudents instructor',
    populate: {
      path: 'instructor',
      select: 'name avatar'
    }
  });

  if (!user) {
    res.status(404);
    throw new Error('المستخدم غير موجود');
  }

  res.json({
    success: true,
    message: 'تم جلب قائمة الرغبات بنجاح',
    data: user.wishlist || []
  });
});

/**
 * @desc    إضافة كورس لقائمة الرغبات
 * @route   POST /api/wishlist/:courseId
 * @access  Private
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // التحقق من وجود الكورس
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('الكورس غير موجود');
  }

  // جلب المستخدم
  const user = await User.findById(req.user._id);

  // التحقق من أن الكورس ليس في قائمة الرغبات بالفعل
  if (user.wishlist.includes(courseId)) {
    res.status(400);
    throw new Error('الكورس موجود في قائمة الرغبات بالفعل');
  }

  // إضافة الكورس لقائمة الرغبات
  user.wishlist.push(courseId);
  await user.save();

  res.json({
    success: true,
    message: 'تمت إضافة الكورس لقائمة الرغبات بنجاح',
    data: user.wishlist
  });
});

/**
 * @desc    إزالة كورس من قائمة الرغبات
 * @route   DELETE /api/wishlist/:courseId
 * @access  Private
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // جلب المستخدم
  const user = await User.findById(req.user._id);

  // التحقق من وجود الكورس في قائمة الرغبات
  if (!user.wishlist.includes(courseId)) {
    res.status(400);
    throw new Error('الكورس غير موجود في قائمة الرغبات');
  }

  // إزالة الكورس من قائمة الرغبات
  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== courseId.toString()
  );
  await user.save();

  res.json({
    success: true,
    message: 'تمت إزالة الكورس من قائمة الرغبات بنجاح',
    data: user.wishlist
  });
});

/**
 * @desc    التحقق من وجود كورس في قائمة الرغبات
 * @route   GET /api/wishlist/check/:courseId
 * @access  Private
 */
export const checkWishlist = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const user = await User.findById(req.user._id);

  const isInWishlist = user.wishlist.includes(courseId);

  res.json({
    success: true,
    data: { isInWishlist }
  });
});
