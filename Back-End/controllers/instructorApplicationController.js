import asyncHandler from 'express-async-handler';
import InstructorApplication from '../models/InstructorApplication.js';
import User from '../models/User.js';

/**
 * @desc    تقديم طلب انضمام كمدرب
 * @route   POST /api/instructor-applications
 * @access  Private/Student
 */
export const submitApplication = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    specialization,
    yearsOfExperience,
    bio,
    qualifications,
    linkedin,
    website,
    whyInstructor,
    courseTopics,
  } = req.body;

  // Check if user already has a pending or approved application
  const existingApplication = await InstructorApplication.findOne({
    userId: req.user.id,
    status: { $in: ['pending', 'approved'] },
  });

  if (existingApplication) {
    res.status(400);
    throw new Error(
      existingApplication.status === 'approved'
        ? 'لديك طلب مقبول بالفعل'
        : 'لديك طلب قيد المراجعة'
    );
  }

  const application = await InstructorApplication.create({
    userId: req.user.id,
    firstName,
    lastName,
    email,
    phone,
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
    data: application,
  });
});

/**
 * @desc    الحصول على طلب المستخدم الحالي
 * @route   GET /api/instructor-applications/my-application
 * @access  Private
 */
export const getMyApplication = asyncHandler(async (req, res) => {
  const application = await InstructorApplication.findOne({
    userId: req.user.id,
  }).sort('-createdAt');

  if (!application) {
    res.status(404);
    throw new Error('لا يوجد طلب');
  }

  res.json({
    success: true,
    data: application,
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

  const applications = await InstructorApplication.find(filter)
    .populate('userId', 'name email phone')
    .populate('reviewedBy', 'name')
    .sort('-createdAt');

  res.json({
    success: true,
    data: applications,
    count: applications.length,
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

  const application = await InstructorApplication.findById(req.params.id);

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

  // If approved, update user role to instructor
  if (status === 'approved') {
    const user = await User.findById(application.userId);
    
    if (!user) {
      res.status(404);
      throw new Error('المستخدم غير موجود');
    }

    user.role = 'instructor';
    user.instructorProfile = {
      bio: application.bio,
      specialization: application.specialization,
      yearsOfExperience: application.yearsOfExperience,
      linkedin: application.linkedin || '',
      website: application.website || '',
    };

    await user.save();
  }

  res.json({
    success: true,
    message:
      status === 'approved'
        ? 'تم قبول الطلب وترقية المستخدم إلى مدرب'
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
