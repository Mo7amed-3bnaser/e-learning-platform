import asyncHandler from 'express-async-handler';
import Video from '../models/Video.js';
import Course from '../models/Course.js';

/**
 * @desc    إضافة فيديو لكورس (Admin فقط)
 * @route   POST /api/videos
 * @access  Private/Admin
 */
export const addVideo = asyncHandler(async (req, res) => {
  const { 
    courseId, 
    title, 
    description, 
    videoProvider = 'youtube', 
    youtubeVideoId, 
    bunnyVideoId, 
    duration, 
    order, 
    isFreePreview, 
    thumbnail 
  } = req.body;

  // التحقق من وجود الكورس
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('الكورس غير موجود');
  }

  // التحقق من وجود Video ID حسب النوع
  if (videoProvider === 'youtube' && !youtubeVideoId) {
    res.status(400);
    throw new Error('معرف فيديو YouTube مطلوب');
  }
  if (videoProvider === 'bunny' && !bunnyVideoId) {
    res.status(400);
    throw new Error('معرف فيديو Bunny مطلوب');
  }

  const video = await Video.create({
    courseId,
    title,
    description,
    videoProvider,
    youtubeVideoId,
    bunnyVideoId,
    duration,
    order,
    isFreePreview,
    thumbnail
  });

  res.status(201).json({
    success: true,
    message: 'تم إضافة الفيديو بنجاح',
    data: video
  });
});

/**
 * @desc    الحصول على فيديوهات كورس (للطالب المسجل)
 * @route   GET /api/videos/:courseId
 * @access  Private
 */
export const getCourseVideos = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // التحقق من وجود الكورس
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('الكورس غير موجود');
  }

  // التحقق من تسجيل الطالب
  const isEnrolled = req.user.enrolledCourses.some(
    (id) => id.toString() === courseId.toString()
  );

  if (!isEnrolled && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('يجب شراء الكورس أولاً لمشاهدة الفيديوهات');
  }

  // جلب الفيديوهات (YouTube أو Bunny)
  const videos = await Video.find({ courseId }).sort('order');

  res.json({
    success: true,
    message: 'تم جلب فيديوهات الكورس بنجاح',
    data: videos.map(v => ({
      _id: v._id,
      title: v.title,
      description: v.description,
      videoProvider: v.videoProvider,
      youtubeVideoId: v.youtubeVideoId,
      bunnyVideoId: v.bunnyVideoId,
      duration: v.duration,
      order: v.order,
      isFreePreview: v.isFreePreview,
      thumbnail: v.thumbnail
    }))
  });
});

/**
 * @desc    الحصول على فيديو واحد (للتشغيل)
 * @route   GET /api/videos/watch/:videoId
 * @access  Private
 */
export const getVideoById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.videoId);

  if (!video) {
    res.status(404);
    throw new Error('الفيديو غير موجود');
  }

  // التحقق من تسجيل الطالب أو أنه فيديو مجاني
  const isEnrolled = req.user.enrolledCourses.some(
    (id) => id.toString() === video.courseId.toString()
  );

  if (!isEnrolled && !video.isFreePreview && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('يجب شراء الكورس لمشاهدة هذا الفيديو');
  }

  res.json({
    success: true,
    message: 'تم جلب بيانات الفيديو بنجاح',
    data: video
  });
});

/**
 * @desc    تحديث فيديو (Admin فقط)
 * @route   PUT /api/videos/:id
 * @access  Private/Admin
 */
export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error('الفيديو غير موجود');
  }

  const updatedVideo = await Video.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    message: 'تم تحديث الفيديو بنجاح',
    data: updatedVideo
  });
});

/**
 * @desc    حذف فيديو (Admin فقط)
 * @route   DELETE /api/videos/:id
 * @access  Private/Admin
 */
export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error('الفيديو غير موجود');
  }

  await video.deleteOne();

  res.json({
    success: true,
    message: 'تم حذف الفيديو بنجاح'
  });
});
