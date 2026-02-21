import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';
import Course from '../models/Course.js';
import { paginateQuery } from '../utils/pagination.js';
import logger from '../config/logger.js';
import { ROLES, ERROR_MESSAGES } from '../utils/constants.js';

/**
 * @desc    إنشاء كوبون جديد (Admin)
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    applicableCourses,
    startDate,
    expiryDate,
    description,
  } = req.body;

  // التحقق من عدم تكرار الكود
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    res.status(400);
    throw new Error('كود الكوبون مستخدم بالفعل');
  }

  // التحقق من وجود الكورسات المحددة (لو موجودة)
  if (applicableCourses && applicableCourses.length > 0) {
    const coursesCount = await Course.countDocuments({
      _id: { $in: applicableCourses },
    });
    if (coursesCount !== applicableCourses.length) {
      res.status(400);
      throw new Error('بعض الكورسات المحددة غير موجودة');
    }
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minOrderAmount: minOrderAmount || 0,
    maxDiscountAmount: maxDiscountAmount || null,
    usageLimit: usageLimit || null,
    applicableCourses: applicableCourses || [],
    startDate: startDate || new Date(),
    expiryDate,
    description,
    createdBy: req.user._id,
  });

  logger.info(`Coupon created: ${coupon.code} by admin ${req.user._id}`);

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الكوبون بنجاح ✅',
    data: coupon,
  });
});

/**
 * @desc    جلب كل الكوبونات (Admin)
 * @route   GET /api/coupons
 * @access  Private/Admin
 * @query   page, limit, isActive
 */
export const getAllCoupons = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  const result = await paginateQuery(Coupon, filter, req, {
    populate: [
      { path: 'applicableCourses', select: 'title' },
      { path: 'createdBy', select: 'name' },
    ],
    sort: '-createdAt',
    defaultLimit: 20,
  });

  res.json({
    success: true,
    message: 'تم جلب الكوبونات بنجاح',
    ...result,
  });
});

/**
 * @desc    جلب كوبون بالمعرف (Admin)
 * @route   GET /api/coupons/:id
 * @access  Private/Admin
 */
export const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('applicableCourses', 'title price')
    .populate('createdBy', 'name')
    .populate('usedBy.user', 'name email');

  if (!coupon) {
    res.status(404);
    throw new Error('الكوبون غير موجود');
  }

  res.json({
    success: true,
    data: coupon,
  });
});

/**
 * @desc    تحديث كوبون (Admin)
 * @route   PUT /api/coupons/:id
 * @access  Private/Admin
 */
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('الكوبون غير موجود');
  }

  const {
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    applicableCourses,
    startDate,
    expiryDate,
    isActive,
    description,
  } = req.body;

  // لو الكود اتغير، تأكد إنه مش مستخدم
  if (code && code.toUpperCase() !== coupon.code) {
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      res.status(400);
      throw new Error('كود الكوبون مستخدم بالفعل');
    }
    coupon.code = code.toUpperCase();
  }

  if (discountType !== undefined) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = discountValue;
  if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
  if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount;
  if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
  if (applicableCourses !== undefined) coupon.applicableCourses = applicableCourses;
  if (startDate !== undefined) coupon.startDate = startDate;
  if (expiryDate !== undefined) coupon.expiryDate = expiryDate;
  if (isActive !== undefined) coupon.isActive = isActive;
  if (description !== undefined) coupon.description = description;

  await coupon.save();

  logger.info(`Coupon updated: ${coupon.code} by admin ${req.user._id}`);

  res.json({
    success: true,
    message: 'تم تحديث الكوبون بنجاح ✅',
    data: coupon,
  });
});

/**
 * @desc    حذف كوبون (Admin)
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('الكوبون غير موجود');
  }

  await coupon.deleteOne();

  logger.info(`Coupon deleted: ${coupon.code} by admin ${req.user._id}`);

  res.json({
    success: true,
    message: 'تم حذف الكوبون بنجاح',
  });
});

/**
 * @desc    تفعيل / تعطيل كوبون (Admin)
 * @route   PATCH /api/coupons/:id/toggle
 * @access  Private/Admin
 */
export const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('الكوبون غير موجود');
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  const statusText = coupon.isActive ? 'تم تفعيل' : 'تم تعطيل';

  res.json({
    success: true,
    message: `${statusText} الكوبون بنجاح`,
    data: coupon,
  });
});

/**
 * @desc    التحقق من كوبون وحساب الخصم (Student)
 * @route   POST /api/coupons/apply
 * @access  Private
 */
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, courseId } = req.body;

  if (!code || !courseId) {
    res.status(400);
    throw new Error('كود الكوبون ومعرف الكورس مطلوبان');
  }

  // جلب الكوبون
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    res.status(404);
    throw new Error('كود الكوبون غير صحيح');
  }

  // التحقق من صلاحية الكوبون
  const validity = coupon.isValid();
  if (!validity.valid) {
    res.status(400);
    throw new Error(validity.reason);
  }

  // التحقق من استخدام المستخدم سابقاً
  if (coupon.isUsedByUser(req.user._id)) {
    res.status(400);
    throw new Error('لقد استخدمت هذا الكوبون من قبل');
  }

  // التحقق من الكورس
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.COURSE_NOT_FOUND);
  }

  // التحقق من أن الكوبون ينطبق على هذا الكورس
  if (!coupon.isApplicableToCourse(courseId)) {
    res.status(400);
    throw new Error('هذا الكوبون لا ينطبق على هذا الكورس');
  }

  // التحقق من الحد الأدنى للطلب
  if (course.price < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`الحد الأدنى لاستخدام هذا الكوبون هو $${coupon.minOrderAmount}`);
  }

  // حساب الخصم
  const discount = coupon.calculateDiscount(course.price);
  const finalPrice = Math.round((course.price - discount) * 100) / 100;

  res.json({
    success: true,
    message: 'تم تطبيق الكوبون بنجاح! 🎉',
    data: {
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      originalPrice: course.price,
      finalPrice,
    },
  });
});
