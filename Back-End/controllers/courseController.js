import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import Video from '../models/Video.js';

/**
 * @desc    الحصول على كل الكورسات المنشورة (للطلاب)
 * @route   GET /api/courses
 * @access  Public
 */
export const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isPublished: true }).select(
    'title description price thumbnail category level rating enrolledStudents instructor'
  );

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
  const course = await Course.findById(req.params.id);

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
 * @desc    إنشاء كورس جديد (Admin فقط)
 * @route   POST /api/courses
 * @access  Private/Admin
 */
export const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    thumbnail,
    instructor,
    category,
    level,
    whatYouWillLearn,
    requirements
  } = req.body;

  const course = await Course.create({
    title,
    description,
    price,
    thumbnail,
    instructor,
    category,
    level,
    whatYouWillLearn,
    requirements
  });

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

  const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

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
  const courses = await Course.find({});

  res.json({
    success: true,
    message: 'تم جلب جميع الكورسات',
    data: courses
  });
});
