import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Order from '../models/Order.js';
import InstructorApplication from '../models/InstructorApplication.js';
import { paginateQuery } from '../utils/pagination.js';

/**
 * @desc    الحصول على إحصائيات الداشبورد
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  // إحصائيات عامة
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ isPublished: true });
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  const approvedOrders = await Order.countDocuments({ status: 'approved' });

  // إجمالي المبيعات (via aggregation — no need to load all orders into memory)
  const revenueResult = await Order.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // آخر الطلبات
  const recentOrders = await Order.find()
    .populate('userId', 'name email')
    .populate('courseId', 'title price')
    .sort('-createdAt')
    .limit(10);

  res.json({
    success: true,
    message: 'تم جلب الإحصائيات بنجاح',
    data: {
      stats: {
        totalStudents,
        totalCourses,
        publishedCourses,
        pendingOrders,
        approvedOrders,
        totalRevenue
      },
      recentOrders
    }
  });
});

/**
 * @desc    الحصول على كل الطلاب
 * @route   GET /api/admin/students
 * @access  Private/Admin
 * @query   page, limit, search
 */
export const getAllStudents = asyncHandler(async (req, res) => {
  // بناء الـ filter
  const filter = { role: 'student' };

  // البحث
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { phone: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // استخدام pagination helper
  const result = await paginateQuery(User, filter, req, {
    populate: { path: 'enrolledCourses', select: 'title thumbnail' },
    sort: '-createdAt',
    defaultLimit: 20
  });

  res.json({
    success: true,
    message: 'تم جلب الطلاب بنجاح',
    ...result
  });
});

/**
 * @desc    حظر/إلغاء حظر طالب
 * @route   PATCH /api/admin/students/:id/block
 * @access  Private/Admin
 */
export const toggleBlockStudent = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('الطالب غير موجود');
  }

  if (student.role === 'admin') {
    res.status(400);
    throw new Error('لا يمكن حظر مشرف');
  }

  student.isBlocked = !student.isBlocked;
  await student.save();

  res.json({
    success: true,
    message: student.isBlocked ? 'تم حظر الطالب' : 'تم إلغاء حظر الطالب',
    data: {
      id: student._id,
      name: student.name,
      isBlocked: student.isBlocked
    }
  });
});

/**
 * @desc    حذف طالب
 * @route   DELETE /api/admin/students/:id
 * @access  Private/Admin
 */
export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('الطالب غير موجود');
  }

  if (student.role === 'admin') {
    res.status(400);
    throw new Error('لا يمكن حذف مشرف');
  }

  // حذف كل طلبات الطالب
  await Order.deleteMany({ userId: student._id });

  await student.deleteOne();

  res.json({
    success: true,
    message: 'تم حذف الطالب وجميع طلباته'
  });
});

/**
 * @desc    البحث عن طالب
 * @route   GET /api/admin/students/search?q=
 * @access  Private/Admin
 * @query   q, page, limit
 */
export const searchStudents = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    res.status(400);
    throw new Error('برجاء إدخال كلمة البحث');
  }

  const filter = {
    role: 'student',
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } }
    ]
  };

  // استخدام pagination helper
  const result = await paginateQuery(User, filter, req, {
    populate: { path: 'enrolledCourses', select: 'title' },
    sort: '-createdAt',
    defaultLimit: 20
  });

  res.json({
    success: true,
    message: 'نتائج البحث',
    ...result
  });
});

/**
 * @desc    الحصول على كل المدربين
 * @route   GET /api/admin/instructors
 * @access  Private/Admin
 */
export const getInstructors = asyncHandler(async (req, res) => {
  const instructors = await User.find({ role: 'instructor' })
    .select('-password')
    .sort('-createdAt');

  // Get course count for each instructor
  const instructorsWithStats = await Promise.all(
    instructors.map(async (instructor) => {
      const coursesCount = await Course.countDocuments({
        instructor: instructor._id
      });
      return {
        ...instructor.toObject(),
        coursesCount
      };
    })
  );

  res.json({
    success: true,
    data: instructorsWithStats,
    count: instructorsWithStats.length
  });
});

/**
 * @desc    إزالة صلاحيات المدرب (تحويله لطالب)
 * @route   PATCH /api/admin/instructors/:id/demote
 * @access  Private/Admin
 */
export const demoteInstructor = asyncHandler(async (req, res) => {
  const instructor = await User.findById(req.params.id);

  if (!instructor) {
    res.status(404);
    throw new Error('المدرب غير موجود');
  }

  if (instructor.role !== 'instructor') {
    res.status(400);
    throw new Error('هذا المستخدم ليس مدرباً');
  }

  // Change role to student
  instructor.role = 'student';
  await instructor.save();

  // Optionally: unpublish all their courses
  await Course.updateMany(
    { instructor: instructor._id },
    { isPublished: false }
  );

  res.json({
    success: true,
    message: 'تم تحويل المدرب إلى طالب وإخفاء كورساته'
  });
});
