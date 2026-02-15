import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { paginateQuery } from '../utils/pagination.js';

/**
 * @desc    إنشاء طلب شراء جديد
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { courseId, paymentMethod, screenshotUrl } = req.body;

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

  // التحقق من عدم شراء الكورس مسبقاً
  const isAlreadyEnrolled = req.user.enrolledCourses.some(
    (id) => id.toString() === courseId.toString(),
  );

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

  // إنشاء الطلب
  const order = await Order.create({
    userId: req.user._id,
    courseId,
    paymentMethod,
    screenshotUrl,
    price: course.price,
    status: "pending",
  });

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
  const order = await Order.findById(req.params.id).populate("userId courseId");

  if (!order) {
    res.status(404);
    throw new Error("الطلب غير موجود");
  }

  if (order.status !== "pending") {
    res.status(400);
    throw new Error("هذا الطلب تم معالجته بالفعل");
  }

  // تحديث حالة الطلب
  order.status = "approved";
  order.approvedBy = req.user._id;
  order.approvedAt = Date.now();
  await order.save();

  // إضافة الكورس لقائمة الطالب
  const user = await User.findById(order.userId._id);
  const isAlreadyEnrolled = user.enrolledCourses.some(
    (enrollment) =>
      enrollment.course &&
      enrollment.course.toString() === order.courseId._id.toString(),
  );

  if (!isAlreadyEnrolled) {
    user.enrolledCourses.push({
      course: order.courseId._id,
      enrolledAt: new Date(),
      videoProgress: [],
    });
    await user.save();
  }

  // زيادة عدد الطلاب المسجلين
  const course = await Course.findById(order.courseId._id);
  course.enrolledStudents += 1;
  await course.save();

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

  await order.deleteOne();

  res.json({
    success: true,
    message: "تم حذف الطلب بنجاح",
  });
});
