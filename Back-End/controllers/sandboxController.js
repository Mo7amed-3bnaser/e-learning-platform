import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";

/**
 * @desc    محاكاة دفع فوري (Sandbox Payment Gateway)
 * @route   POST /api/orders/sandbox/pay
 * @access  Private
 * @note    هذا الـ endpoint للتجربة فقط - يقبل الدفع تلقائياً بدون تحقق حقيقي
 */
export const sandboxPayment = asyncHandler(async (req, res) => {
  // Sandbox only allowed in development/test environments
  if (process.env.NODE_ENV === 'production') {
    res.status(403);
    throw new Error('Sandbox payment is disabled in production');
  }

  const { courseId, paymentMethod = "sandbox", couponCode } = req.body;

  // التحقق من وجود الكورس
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("الكورس غير موجود");
  }

  // التحقق من عدم التسجيل المسبق
  const user = await User.findById(req.user._id);

  // Support both old format (ObjectId array) and new format (objects array)
  const isAlreadyEnrolled = user.enrolledCourses.some((enrollment) => {
    // New format: { course: ObjectId, ... }
    if (enrollment.course) {
      return enrollment.course.toString() === courseId.toString();
    }
    // Old format: ObjectId directly
    return enrollment.toString() === courseId.toString();
  });

  if (isAlreadyEnrolled) {
    res.status(400);
    throw new Error("أنت مسجل في هذا الكورس بالفعل");
  }

  // حساب الخصم بالكوبون (لو موجود)
  let discount = 0;
  let appliedCouponCode = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validity = coupon.isValid();
      if (validity.valid && !coupon.isUsedByUser(req.user._id) && coupon.isApplicableToCourse(courseId)) {
        if (course.price >= (coupon.minOrderAmount || 0)) {
          discount = coupon.calculateDiscount(course.price);
          appliedCouponCode = coupon.code;
          coupon.usedCount += 1;
          coupon.usedBy.push({ user: req.user._id });
          await coupon.save();
        }
      }
    }
  }

  const finalPrice = Math.round((course.price - discount) * 100) / 100;

  // إنشاء Order وهمي مع الموافقة التلقائية
  const order = await Order.create({
    userId: req.user._id,
    courseId,
    paymentMethod: "sandbox", // تحديد أنه sandbox
    screenshotUrl: "https://placehold.co/600x400/png?text=Sandbox+Payment", // صورة وهمية
    status: "approved", // موافقة تلقائية
    price: course.price,
    couponCode: appliedCouponCode,
    discount,
    finalPrice,
    approvedBy: req.user._id, // المستخدم نفسه (simulation)
    approvedAt: new Date(),
  });

  // إضافة الكورس للمستخدم
  user.enrolledCourses.push({
    course: courseId,
    enrolledAt: new Date(),
    videoProgress: [],
  });
  await user.save();

  // تحديث عدد الطلاب
  course.enrolledStudents += 1;
  await course.save();

  res.status(201).json({
    success: true,
    message: "✅ تم التسجيل في الكورس بنجاح (Sandbox Mode)",
    data: {
      order,
      isEnrolled: true,
      sandboxMode: true,
      note: "هذا دفع تجريبي - لن يتم خصم أي مبلغ حقيقي",
    },
  });
});

/**
 * @desc    الحصول على حالة التسجيل في الكورس
 * @route   GET /api/orders/enrollment/:courseId
 * @access  Private
 */
export const checkEnrollment = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const user = await User.findById(req.user._id);

  // Support both old format (ObjectId array) and new format (objects array)
  const isEnrolled = user.enrolledCourses.some((enrollment) => {
    // New format: { course: ObjectId, ... }
    if (enrollment.course) {
      return enrollment.course.toString() === courseId.toString();
    }
    // Old format: ObjectId directly
    return enrollment.toString() === courseId.toString();
  });

  res.json({
    success: true,
    data: {
      isEnrolled,
      courseId,
    },
  });
});

export default { sandboxPayment, checkEnrollment };
