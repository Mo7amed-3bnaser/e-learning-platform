import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Order from '../models/Order.js';

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

  // إجمالي المبيعات
  const approvedOrdersData = await Order.find({ status: 'approved' });
  const totalRevenue = approvedOrdersData.reduce((sum, order) => sum + order.price, 0);

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
 */
export const getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' })
    .populate('enrolledCourses', 'title thumbnail')
    .sort('-createdAt');

  res.json({
    success: true,
    message: 'تم جلب الطلاب بنجاح',
    data: students
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
 */
export const searchStudents = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    res.status(400);
    throw new Error('برجاء إدخال كلمة البحث');
  }

  const students = await User.find({
    role: 'student',
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } }
    ]
  }).populate('enrolledCourses', 'title');

  res.json({
    success: true,
    message: 'نتائج البحث',
    data: students
  });
});
