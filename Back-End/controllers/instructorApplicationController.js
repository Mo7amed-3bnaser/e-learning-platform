import asyncHandler from 'express-async-handler';
import InstructorApplication from '../models/InstructorApplication.js';
import User from '../models/User.js';

/**
 * @desc    تقديم طلب انضمام كمدرب (عام - بدون تسجيل دخول)
 * @route   POST /api/instructor-applications
 * @access  Public
 */
export const submitApplication = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    specialization,
    yearsOfExperience,
    bio,
    qualifications,
    linkedin,
    website,
    whyInstructor,
    courseTopics,
  } = req.body;

  // التحقق من البيانات الأساسية
  if (!firstName || !lastName || !email || !phone || !password) {
    res.status(400);
    throw new Error('برجاء إدخال جميع البيانات المطلوبة');
  }

  // التحقق من طول كلمة المرور
  if (password.length < 6) {
    res.status(400);
    throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
  }

  // التحقق من عدم وجود حساب مستخدم بنفس الإيميل أو الهاتف
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    res.status(400);
    throw new Error('البريد الإلكتروني أو رقم الهاتف مسجل بالفعل في حساب آخر');
  }

  // التحقق من عدم وجود طلب معلق أو مقبول بنفس الإيميل
  const existingApplication = await InstructorApplication.findOne({
    email: email.toLowerCase(),
    status: { $in: ['pending', 'approved'] },
  });

  if (existingApplication) {
    res.status(400);
    throw new Error(
      existingApplication.status === 'approved'
        ? 'هذا البريد الإلكتروني لديه طلب مقبول بالفعل'
        : 'هذا البريد الإلكتروني لديه طلب قيد المراجعة'
    );
  }

  const application = await InstructorApplication.create({
    firstName,
    lastName,
    email,
    phone,
    password, // will be hashed by pre-save hook
    specialization,
    yearsOfExperience,
    bio,
    qualifications,
    linkedin: linkedin || '',
    website: website || '',
    whyInstructor,
    courseTopics,
  });

  res.status(201).json({
    success: true,
    message: 'تم إرسال طلبك بنجاح! سيتم مراجعته خلال 48 ساعة',
    data: {
      id: application._id,
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      status: application.status,
    },
  });
});

/**
 * @desc    الحصول على كل الطلبات (Admin)
 * @route   GET /api/instructor-applications/admin/all
 * @access  Private/Admin
 */
export const getAllApplications = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = {};
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    filter.status = status;
  }

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const [applications, totalApplications] = await Promise.all([
    InstructorApplication.find(filter)
      .populate('reviewedBy', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    InstructorApplication.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: applications,
    count: applications.length,
    pagination: {
      page,
      limit,
      total: totalApplications,
      pages: Math.ceil(totalApplications / limit)
    },
  });
});

/**
 * @desc    مراجعة طلب (قبول/رفض)
 * @route   PATCH /api/instructor-applications/admin/:id/review
 * @access  Private/Admin
 */
export const reviewApplication = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('الحالة يجب أن تكون approved أو rejected');
  }

  const application = await InstructorApplication.findById(req.params.id).select('+password');

  if (!application) {
    res.status(404);
    throw new Error('الطلب غير موجود');
  }

  if (application.status !== 'pending') {
    res.status(400);
    throw new Error('هذا الطلب تمت مراجعته بالفعل');
  }

  application.status = status;
  application.reviewedBy = req.user.id;
  application.reviewedAt = new Date();

  if (status === 'rejected') {
    if (!rejectionReason) {
      res.status(400);
      throw new Error('سبب الرفض مطلوب');
    }
    application.rejectionReason = rejectionReason;
  }

  await application.save();

  // If approved, create a new instructor user account
  if (status === 'approved') {
    // التحقق من عدم وجود حساب بنفس الإيميل أو الهاتف
    const existingUser = await User.findOne({
      $or: [{ email: application.email }, { phone: application.phone }],
    });

    if (existingUser) {
      res.status(400);
      throw new Error('البريد الإلكتروني أو رقم الهاتف مسجل بالفعل. لا يمكن إنشاء حساب المدرب');
    }

    // إنشاء حساب المدرب - الباسورد محفوظ مهاش مسبقاً
    const newUser = new User({
      name: `${application.firstName} ${application.lastName}`,
      email: application.email,
      phone: application.phone,
      password: 'temp', // placeholder
      role: 'instructor',
      instructorProfile: {
        bio: application.bio,
        specialization: application.specialization,
        yearsOfExperience: application.yearsOfExperience,
        linkedin: application.linkedin || '',
        website: application.website || '',
      },
    });

    // Create via Mongoose then immediately overwrite with already-hashed password
    // to avoid double-hashing by pre-save hook
    const createdUser = await User.create({
      name: `${application.firstName} ${application.lastName}`,
      email: application.email,
      phone: application.phone,
      password: 'placeholder_replaced_below',
      role: 'instructor',
      isEmailVerified: true,
      instructorProfile: newUser.instructorProfile,
    });

    await User.findByIdAndUpdate(createdUser._id, {
      $set: { password: application.password }
    });
  }

  res.json({
    success: true,
    message:
      status === 'approved'
        ? 'تم قبول الطلب وإنشاء حساب المدرب بنجاح'
        : 'تم رفض الطلب',
    data: application,
  });
});

/**
 * @desc    حذف طلب (Admin)
 * @route   DELETE /api/instructor-applications/admin/:id
 * @access  Private/Admin
 */
export const deleteApplication = asyncHandler(async (req, res) => {
  const application = await InstructorApplication.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('الطلب غير موجود');
  }

  await application.deleteOne();

  res.json({
    success: true,
    message: 'تم حذف الطلب بنجاح',
  });
});
