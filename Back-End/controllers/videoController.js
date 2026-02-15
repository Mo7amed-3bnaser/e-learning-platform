import asyncHandler from "express-async-handler";
import Video from "../models/Video.js";
import Course from "../models/Course.js";

/**
 * @desc    إضافة فيديو لكورس (Admin أو المدرب صاحب الكورس)
 * @route   POST /api/videos
 * @access  Private/Admin/Instructor(Owner)
 */
export const addVideo = asyncHandler(async (req, res) => {
  const {
    courseId,
    title,
    description,
    videoProvider = "youtube",
    youtubeVideoId,
    bunnyVideoId,
    duration,
    order,
    isFreePreview,
    thumbnail,
  } = req.body;

  // التحقق من وجود الكورس
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("الكورس غير موجود");
  }

  // التحقق من الصلاحية: أدمن أو صاحب الكورس
  if (
    req.user.role !== 'admin' &&
    course.instructor.toString() !== req.user.id.toString()
  ) {
    res.status(403);
    throw new Error('غير مصرح لك - لا تملك صلاحية إضافة فيديو لهذا الكورس');
  }

  // التحقق من وجود Video ID حسب النوع
  if (videoProvider === "youtube" && !youtubeVideoId) {
    res.status(400);
    throw new Error("معرف فيديو YouTube مطلوب");
  }
  if (videoProvider === "bunny" && !bunnyVideoId) {
    res.status(400);
    throw new Error("معرف فيديو Bunny مطلوب");
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
    thumbnail,
  });

  res.status(201).json({
    success: true,
    message: "تم إضافة الفيديو بنجاح",
    data: video,
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
    throw new Error("الكورس غير موجود");
  }

  // التحقق من تسجيل الطالب
  // Support both old format (ObjectId) and new format (object with course property)
  const enrollment = req.user.enrolledCourses.find((e) => {
    // New format: { course: ObjectId, videoProgress: [...] }
    if (e.course) {
      return e.course.toString() === courseId.toString();
    }
    // Old format: ObjectId directly
    return e.toString() === courseId.toString();
  });

  const isEnrolled = !!enrollment;

  if (!isEnrolled && req.user.role !== "admin") {
    res.status(403);
    throw new Error("يجب شراء الكورس أولاً لمشاهدة الفيديوهات");
  }

  // جلب الفيديوهات (YouTube أو Bunny)
  const videos = await Video.find({ courseId }).sort("order");

  // إعداد progress data
  let progressData = null;
  // Only process progress if enrollment is in new format (has videoProgress)
  if (isEnrolled && enrollment && enrollment.videoProgress) {
    const totalVideos = videos.length;
    const completedVideos = enrollment.videoProgress.filter(
      (vp) => vp.completed,
    ).length;
    const overallProgress =
      totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

    // Transform video progress to object for easy lookup
    const videoProgressMap = {};
    enrollment.videoProgress.forEach((vp) => {
      if (vp.video) {
        videoProgressMap[vp.video.toString()] = {
          completed: vp.completed,
          completedAt: vp.completedAt,
          watchDuration: vp.watchDuration,
          lastWatchedAt: vp.lastWatchedAt,
        };
      }
    });

    progressData = {
      overallProgress,
      lastWatchedVideo: enrollment.lastWatchedVideo,
      lastWatchedAt: enrollment.lastWatchedAt,
      totalVideos,
      completedVideos,
      videoProgress: videoProgressMap,
    };
  }

  res.json({
    success: true,
    message: "تم جلب فيديوهات الكورس بنجاح",
    data: {
      videos: videos.map((v) => ({
        _id: v._id,
        title: v.title,
        description: v.description,
        videoProvider: v.videoProvider,
        youtubeVideoId: v.youtubeVideoId,
        bunnyVideoId: v.bunnyVideoId,
        duration: v.duration,
        order: v.order,
        isFreePreview: v.isFreePreview,
        thumbnail: v.thumbnail,
      })),
      progress: progressData,
    },
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
    throw new Error("الفيديو غير موجود");
  }

  // التحقق من تسجيل الطالب أو أنه فيديو مجاني
  const isEnrolled = req.user.enrolledCourses.some(
    (id) => id.toString() === video.courseId.toString(),
  );

  if (!isEnrolled && !video.isFreePreview && req.user.role !== "admin") {
    res.status(403);
    throw new Error("يجب شراء الكورس لمشاهدة هذا الفيديو");
  }

  res.json({
    success: true,
    message: "تم جلب بيانات الفيديو بنجاح",
    data: video,
  });
});

/**
 * @desc    تحديث فيديو (Admin أو المدرب صاحب الكورس)
 * @route   PUT /api/videos/:id
 * @access  Private/Admin/Instructor(Owner)
 */
export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error("الفيديو غير موجود");
  }

  // التحقق من الصلاحية: أدمن أو صاحب الكورس
  if (req.user.role !== 'admin') {
    const course = await Course.findById(video.courseId);
    if (!course || course.instructor.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('غير مصرح لك - لا تملك صلاحية تعديل هذا الفيديو');
    }
  }

  // Whitelist - الحقول المسموح تعديلها فقط (منع Mass Assignment)
  const allowedFields = [
    'title',
    'description',
    'videoProvider',
    'youtubeVideoId',
    'bunnyVideoId',
    'duration',
    'order',
    'isFreePreview',
    'thumbnail'
  ];

  // تصفية البيانات المرسلة
  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // منع تعديل courseId (حماية من نقل الفيديو لكورس آخر)
  if (req.body.courseId) {
    res.status(400);
    throw new Error('لا يمكن تغيير الكورس المرتبط بالفيديو');
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  res.json({
    success: true,
    message: "تم تحديث الفيديو بنجاح",
    data: updatedVideo,
  });
});

/**
 * @desc    حذف فيديو (Admin أو المدرب صاحب الكورس)
 * @route   DELETE /api/videos/:id
 * @access  Private/Admin/Instructor(Owner)
 */
export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error("الفيديو غير موجود");
  }

  // التحقق من الصلاحية: أدمن أو صاحب الكورس
  if (req.user.role !== 'admin') {
    const course = await Course.findById(video.courseId);
    if (!course || course.instructor.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('غير مصرح لك - لا تملك صلاحية حذف هذا الفيديو');
    }
  }

  await video.deleteOne();

  res.json({
    success: true,
    message: "تم حذف الفيديو بنجاح",
  });
});

/**
 * @desc    الحصول على فيديوهات كورس للإدارة (المدرب صاحب الكورس أو Admin)
 * @route   GET /api/videos/manage/:courseId
 * @access  Private/Instructor(Owner)/Admin
 */
export const getInstructorCourseVideos = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // isInstructorOfCourse middleware already verified ownership
  const videos = await Video.find({ courseId }).sort('order');

  res.json({
    success: true,
    message: 'تم جلب فيديوهات الكورس بنجاح',
    data: videos,
  });
});
