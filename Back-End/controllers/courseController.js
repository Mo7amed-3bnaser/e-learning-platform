import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import Video from '../models/Video.js';

/**
 * @desc    الحصول على كل الكورسات المنشورة (للطلاب)
 * @route   GET /api/courses
 * @access  Public
 */
export const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isPublished: true })
    .populate('instructor', 'name email avatar instructorProfile')
    .select('title description price thumbnail category level rating enrolledStudents instructor');

  res.json({
    success: true,
    message: 'تم جلب الكورسات بنجاح',
    data: courses,
    pagination: {
      total: courses.length
    }
  });
});

/**
 * @desc    الحصول على تفاصيل كورس معين
 * @route   GET /api/courses/:id
 * @access  Public
 */
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate(
    'instructor',
    'name email avatar instructorProfile'
  );

  if (!course) {
    res.status(404);
    throw new Error('الكورس غير موجود');
  }

  // جلب الفيديوهات (بدون Bunny IDs للأمان)
  const videos = await Video.find({ courseId: course._id })
    .select('title description duration order isFreePreview thumbnail youtubeVideoId')
    .sort('order');

  // التحقق من تسجيل الطالب
  let isEnrolled = false;
  if (req.user && req.user.enrolledCourses) {
    isEnrolled = req.user.enrolledCourses.some(
      (courseId) => courseId.toString() === course._id.toString()
    );
  }

  res.json({
    success: true,
    message: 'تم جلب بيانات الكورس بنجاح',
    data: {
      ...course.toObject(),
      videos: videos.map((v) => ({
        _id: v._id,
        title: v.title,
        description: v.description,
        duration: v.duration,
        order: v.order,
        isFreePreview: v.isFreePreview,
        thumbnail: v.thumbnail,
        // إرسال youtubeVideoId للفيديوهات المجانية فقط
        ...(v.isFreePreview ? { youtubeVideoId: v.youtubeVideoId } : {})
      })),
      isEnrolled
    }
  });
});

/**
 * @desc    إنشاء كورس جديد (Instructor/Admin)
 * @route   POST /api/courses
 * @access  Private/Instructor/Admin
 */
export const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    thumbnail,
    category,
    level,
    whatYouWillLearn,
    requirements
  } = req.body;

  // Auto-assign instructor based on user role
  let instructorId;
  if (req.user.role === 'admin' && req.body.instructor) {
    // Admin can assign any instructor
    instructorId = req.body.instructor;
  } else {
    // Instructor creates their own course
    instructorId = req.user.id;
  }

  const course = await Course.create({
    title,
    description,
    price,
    thumbnail,
    instructor: instructorId,
    category,
    level,
    whatYouWillLearn,
    requirements
  });

  await course.populate('instructor', 'name email avatar instructorProfile');

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الكورس بنجاح',
    data: course
  });
});

/**
 * @desc    تحديث كورس (Admin فقط)
 * @route   PUT /api/courses/:id
 * @access  Private/Admin
 */
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('الكورس غير موجود');
  }

  // Whitelist - الحقول المسموح تعديلها فقط (منع Mass Assignment)
  const allowedFields = [
    'title',
    'description',
    'price',
    'thumbnail',
    'category',
    'level',
    'whatYouWillLearn',
    'requirements'
  ];

  // تصفية البيانات المرسلة
  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Admin يمكنه تعديل instructor
  if (req.user.role === 'admin' && req.body.instructor) {
    updates.instructor = req.body.instructor;
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    message: 'تم تحديث الكورس بنجاح',
    data: updatedCourse
  });
});

/**
 * @desc    حذف كورس (Admin فقط)
 * @route   DELETE /api/courses/:id
 * @access  Private/Admin
 */
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('الكورس غير موجود');
  }

  // حذف كل الفيديوهات التابعة للكورس
  await Video.deleteMany({ courseId: course._id });

  await course.deleteOne();

  res.json({
    success: true,
    message: 'تم حذف الكورس وجميع الفيديوهات التابعة له'
  });
});

/**
 * @desc    نشر/إخفاء كورس (Admin فقط)
 * @route   PATCH /api/courses/:id/publish
 * @access  Private/Admin
 */
export const togglePublishCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('الكورس غير موجود');
  }

  course.isPublished = !course.isPublished;
  await course.save();

  res.json({
    success: true,
    message: course.isPublished ? 'تم نشر الكورس بنجاح' : 'تم إخفاء الكورس',
    data: { isPublished: course.isPublished }
  });
});

/**
 * @desc    الحصول على كل الكورسات (Admin - بما فيها غير المنشورة)
 * @route   GET /api/courses/admin/all
 * @access  Private/Admin
 */
export const getAllCoursesAdmin = asyncHandler(async (req, res) => {
  const courses = await Course.find({})
    .populate('instructor', 'name email avatar instructorProfile');

  res.json({
    success: true,
    message: 'تم جلب جميع الكورسات',
    data: courses
  });
});

/**
 * @desc    الحصول على كورسات المدرب الحالي
 * @route   GET /api/courses/instructor/my-courses
 * @access  Private/Instructor
 */
export const getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user.id })
    .populate('instructor', 'name email avatar instructorProfile')
    .sort('-createdAt');

  res.json({
    success: true,
    message: 'تم جلب كورساتك بنجاح',
    data: courses,
    count: courses.length
  });
});

/**
 * @desc    إحصائيات كورس معين للمدرب
 * @route   GET /api/courses/instructor/:id/stats
 * @access  Private/Instructor (Owner)
 */
export const getCourseStats = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email');

  if (!course) {
    res.status(404);
    throw new Error('الكورس غير موجود');
  }

  // Verify ownership (middleware already checks this)
  const videos = await Video.find({ courseId: course._id });

  res.json({
    success: true,
    data: {
      course: {
        title: course.title,
        enrolledStudents: course.enrolledStudents,
        rating: course.rating,
        isPublished: course.isPublished,
        price: course.price
      },
      videosCount: videos.length,
      totalDuration: videos.reduce((sum, v) => sum + (v.duration || 0), 0)
    }
  });
});
