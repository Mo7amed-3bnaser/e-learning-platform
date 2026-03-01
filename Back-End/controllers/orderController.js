import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import { paginateQuery } from '../utils/pagination.js';
import { createNotification } from './notificationController.js';
import sendEmail, { getOrderApprovedTemplate, getOrderRejectedTemplate } from '../utils/sendEmail.js';
import logger from '../config/logger.js';
import { isUserEnrolled } from '../utils/enrollmentHelper.js';
import { ROLES, ORDER_STATUS, NOTIFICATION_TYPE, ERROR_MESSAGES } from '../utils/constants.js';

/**
 * @desc    إنشاء طلب شراء جديد
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { courseId, paymentMethod, screenshotUrl, couponCode } = req.body;

  // التحقق من البيانات
  if (!courseId || !paymentMethod || !screenshotUrl) {
    res.status(400);
    throw new Error("برجاء إدخال جميع البيانات المطلوبة");
  }

  // التحقق من وجود الكورس
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("الكورس غير موجود");
  }

  // منع الاشتراك في كورسات غير منشورة
  if (!course.isPublished) {
    res.status(400);
    throw new Error("هذا الكورس غير متاح للشراء حالياً");
  }

  // التحقق من عدم شراء الكورس مسبقاً
  const isAlreadyEnrolled = isUserEnrolled(req.user, courseId);

  if (isAlreadyEnrolled) {
    res.status(400);
    throw new Error("أنت مسجل في هذا الكورس بالفعل");
  }

  // التحقق من عدم وجود طلب معلق بالفعل
  const existingOrder = await Order.findOne({
    userId: req.user._id,
    courseId,
    status: "pending",
  });

  if (existingOrder) {
    res.status(400);
    throw new Error(
      "لديك طلب معلق بالفعل لهذا الكورس. انتظر مراجعة الطلب السابق",
    );
  }

  // حساب الخصم بالكوبون (لو موجود)
  let discount = 0;
  let appliedCouponCode = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
      res.status(404);
      throw new Error('كود الكوبون غير صحيح');
    }

    const validity = coupon.isValid();
    if (!validity.valid) {
      res.status(400);
      throw new Error(validity.reason);
    }

    if (coupon.isUsedByUser(req.user._id)) {
      res.status(400);
      throw new Error('لقد استخدمت هذا الكوبون من قبل');
    }

    if (!coupon.isApplicableToCourse(courseId)) {
      res.status(400);
      throw new Error('هذا الكوبون لا ينطبق على هذا الكورس');
    }

    if (course.price < coupon.minOrderAmount) {
      res.status(400);
      throw new Error(`الحد الأدنى لاستخدام هذا الكوبون هو $${coupon.minOrderAmount}`);
    }

    discount = coupon.calculateDiscount(course.price);
    appliedCouponCode = coupon.code;
  }

  const finalPrice = Math.round((course.price - discount) * 100) / 100;

  // إنشاء الطلب أولاً قبل تسجيل استخدام الكوبون
  const order = await Order.create({
    userId: req.user._id,
    courseId,
    paymentMethod,
    screenshotUrl,
    price: course.price,
    couponCode: appliedCouponCode,
    discount,
    finalPrice,
    status: "pending",
  });

  // تسجيل استخدام الكوبون بعد إنشاء الأوردر بنجاح (atomic update لمنع race condition)
  if (couponCode && appliedCouponCode) {
    const updatedCoupon = await Coupon.findOneAndUpdate(
      {
        code: appliedCouponCode,
        $or: [
          { usageLimit: null },
          { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
        ]
      },
      {
        $inc: { usedCount: 1 },
        $push: { usedBy: { user: req.user._id } }
      },
      { new: true }
    );

    if (!updatedCoupon) {
      // الكوبون وصل للحد الأقصى بين التحقق والاستخدام — حذف الطلب
      await order.deleteOne();
      res.status(400);
      throw new Error('تم استنفاد عدد الاستخدامات المتاحة للكوبون');
    }
  }

  res.status(201).json({
    success: true,
    message: "تم إرسال طلبك بنجاح! سيتم مراجعته قريباً ✅",
    data: order,
  });
});

/**
 * @desc    الحصول على طلبات المستخدم
 * @route   GET /api/orders/my-orders
 * @access  Private
 * @query   page, limit
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const result = await paginateQuery(Order, { userId: req.user._id }, req, {
    populate: { path: 'courseId', select: 'title thumbnail price' },
    sort: '-createdAt',
    defaultLimit: 10
  });

  res.json({
    success: true,
    message: 'تم جلب طلباتك بنجاح',
    ...result
  });
});

/**
 * @desc    الحصول على كل الطلبات المعلقة (Admin)
 * @route   GET /api/orders/pending
 * @access  Private/Admin
 * @query   page, limit
 */
export const getPendingOrders = asyncHandler(async (req, res) => {
  const result = await paginateQuery(Order, { status: "pending" }, req, {
    populate: [
      { path: 'userId', select: 'name email phone' },
      { path: 'courseId', select: 'title thumbnail price' }
    ],
    sort: '-createdAt',
    defaultLimit: 20
  });

  res.json({
    success: true,
    message: 'تم جلب الطلبات المعلقة',
    ...result
  });
});

/**
 * @desc    الحصول على كل الطلبات (Admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 * @query   status, page, limit
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = status ? { status } : {};

  const result = await paginateQuery(Order, filter, req, {
    populate: [
      { path: 'userId', select: 'name email phone' },
      { path: 'courseId', select: 'title thumbnail price' },
      { path: 'approvedBy', select: 'name' }
    ],
    sort: '-createdAt',
    defaultLimit: 20
  });

  res.json({
    success: true,
    message: 'تم جلب جميع الطلبات',
    ...result
  });
});

/**
 * @desc    الموافقة على طلب (Admin) - وإضافة الكورس للطالب
 * @route   PATCH /api/orders/:id/approve
 * @access  Private/Admin
 */
export const approveOrder = asyncHandler(async (req, res) => {
  // Atomic update: only transitions from 'pending' → 'approved' to prevent race conditions
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, status: "pending" },
    { status: "approved", approvedBy: req.user._id, approvedAt: Date.now() },
    { new: true }
  ).populate("userId courseId");

  if (!order) {
    // Either order doesn't exist or was already processed by another admin
    const exists = await Order.findById(req.params.id);
    if (!exists) {
      res.status(404);
      throw new Error("الطلب غير موجود");
    }
    res.status(400);
    throw new Error("هذا الطلب تم معالجته بالفعل");
  }

  // إضافة الكورس لقائمة الطالب (atomic push with $addToSet to prevent duplicates)
  await User.findByIdAndUpdate(
    order.userId._id,
    {
      $addToSet: {
        enrolledCourses: {
          course: order.courseId._id,
          enrolledAt: new Date(),
          videoProgress: [],
        },
      },
    }
  );

  // زيادة عدد الطلاب المسجلين
  await Course.findByIdAndUpdate(order.courseId._id, { $inc: { enrolledStudents: 1 } });

  // إنشاء إشعار للطالب
  await createNotification({
    user: order.userId._id,
    type: 'order_approved',
    title: 'تمت الموافقة على طلبك! 🎉',
    message: `تم قبول طلب شراء كورس "${order.courseId.title}" ويمكنك الآن البدء في التعلم`,
    link: `/courses/${order.courseId._id}`,
    metadata: {
      orderId: order._id,
      courseId: order.courseId._id,
    },
  });

  // إرسال إيميل للطالب
  try {
    const courseUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/courses/${order.courseId._id}`;
    await sendEmail({
      to: order.userId.email,
      subject: '🎉 تمت الموافقة على طلبك - مسار',
      html: getOrderApprovedTemplate(order.userId.name, order.courseId.title, courseUrl),
    });
  } catch (emailError) {
    logger.error('خطأ في إرسال الإيميل:', emailError);
    // لا نرمي خطأ لأن العملية الأساسية نجحت
  }

  res.json({
    success: true,
    message: "تم الموافقة على الطلب وإضافة الكورس للطالب بنجاح ✅",
    data: order,
  });
});

/**
 * @desc    رفض طلب (Admin)
 * @route   PATCH /api/orders/:id/reject
 * @access  Private/Admin
 */
export const rejectOrder = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("الطلب غير موجود");
  }

  if (order.status !== "pending") {
    res.status(400);
    throw new Error("هذا الطلب تم معالجته بالفعل");
  }

  order.status = "rejected";
  order.rejectionReason = rejectionReason || "لم يتم تحديد سبب";
  order.approvedBy = req.user._id;
  await order.save();

  // استرجاع استخدام الكوبون لو كان مستخدم
  if (order.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: order.couponCode },
      {
        $inc: { usedCount: -1 },
        $pull: { usedBy: { user: order.userId } }
      }
    );
  }

  // إنشاء إشعار للطالب
  await createNotification({
    user: order.userId,
    type: 'order_rejected',
    title: 'تم رفض طلبك',
    message: `تم رفض طلب شراء الكورس. السبب: ${order.rejectionReason}`,
    link: '/orders',
    metadata: {
      orderId: order._id,
    },
  });

  // إرسال إيميل للطالب
  try {
    const user = await User.findById(order.userId);
    const course = await Course.findById(order.courseId);

    if (user && course) {
      await sendEmail({
        to: user.email,
        subject: 'تحديث بشأن طلبك - مسار',
        html: getOrderRejectedTemplate(user.name, course.title, order.rejectionReason),
      });
    }
  } catch (emailError) {
    logger.error('خطأ في إرسال الإيميل:', emailError);
  }

  res.json({
    success: true,
    message: "تم رفض الطلب",
    data: order,
  });
});

/**
 * @desc    حذف طلب (Admin)
 * @route   DELETE /api/orders/:id
 * @access  Private/Admin
 */
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("الطلب غير موجود");
  }

  // لو الطلب كان معتمد، لازم نعكس التسجيل
  if (order.status === 'approved') {
    // إزالة الطالب من الكورس
    await User.findByIdAndUpdate(order.userId, {
      $pull: { enrolledCourses: { course: order.courseId } }
    });

    // تنقيص عدد الطلاب المسجلين
    await Course.findByIdAndUpdate(order.courseId, {
      $inc: { enrolledStudents: -1 }
    });
  }

  // استرجاع استخدام الكوبون لو كان مستخدم
  if (order.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: order.couponCode },
      {
        $inc: { usedCount: -1 },
        $pull: { usedBy: { user: order.userId } }
      }
    );
  }

  await order.deleteOne();

  res.json({
    success: true,
    message: "تم حذف الطلب بنجاح",
  });
});
