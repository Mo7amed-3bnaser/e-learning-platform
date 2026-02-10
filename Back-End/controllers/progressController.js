import User from "../models/User.js";
import Video from "../models/Video.js";
import Course from "../models/Course.js";
import { generateCertificateForStudent } from "./certificateController.js";

// @desc    Mark video as complete
// @route   POST /api/progress/mark-complete
// @access  Private
export const markVideoComplete = async (req, res) => {
  try {
    const { videoId, courseId, watchDuration } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!videoId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "videoId و courseId مطلوبان",
      });
    }

    // Check if video exists and belongs to course
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "الفيديو غير موجود",
      });
    }

    if (video.courseId.toString() !== courseId) {
      return res.status(400).json({
        success: false,
        message: "الفيديو لا ينتمي لهذا الكورس",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // Find enrollment - support both old and new formats
    const enrollmentIndex = user.enrolledCourses.findIndex((e) => {
      if (e.course) return e.course.toString() === courseId;
      return e.toString() === courseId;
    });

    if (enrollmentIndex === -1) {
      return res.status(403).json({
        success: false,
        message: "يجب التسجيل في الكورس أولاً",
      });
    }

    let enrollment = user.enrolledCourses[enrollmentIndex];

    // If old format (ObjectId), convert to new format
    if (!enrollment.course) {
      user.enrolledCourses[enrollmentIndex] = {
        course: courseId,
        enrolledAt: new Date(),
        videoProgress: [],
      };
      enrollment = user.enrolledCourses[enrollmentIndex];
    }

    // If no videoProgress array, initialize it
    if (!enrollment.videoProgress) {
      enrollment.videoProgress = [];
    }

    // Find or create video progress entry
    let videoProgress = enrollment.videoProgress.find(
      (vp) => vp.video && vp.video.toString() === videoId,
    );

    if (!videoProgress) {
      // Create new video progress entry
      enrollment.videoProgress.push({
        video: videoId,
        completed: true,
        completedAt: new Date(),
        watchDuration: watchDuration || 0,
        lastWatchedAt: new Date(),
      });
    } else {
      // Update existing entry
      videoProgress.completed = true;
      videoProgress.completedAt = new Date();
      if (watchDuration !== undefined) {
        videoProgress.watchDuration = watchDuration;
      }
      videoProgress.lastWatchedAt = new Date();
    }

    // Mark as modified for Mixed schema type
    user.markModified("enrolledCourses");

    // Save user
    await user.save();

    // Calculate overall course progress
    const totalVideos = await Video.countDocuments({ courseId });
    const completedVideos = enrollment.videoProgress.filter(
      (vp) => vp.completed,
    ).length;
    const overallProgress =
      totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

    // Check if course is 100% complete and certificate doesn't exist yet
    if (overallProgress === 100 && !enrollment.certificateUrl) {
      try {
        // Generate certificate asynchronously
        const certificateData = await generateCertificateForStudent(userId, courseId);
        console.log('Certificate generated:', certificateData.certificateId);

        // Refresh enrollment data from DB (it was updated in generateCertificateForStudent)
        const updatedUser = await User.findById(userId);
        const updatedEnrollment = updatedUser.enrolledCourses.find((e) => {
          if (e.course) return e.course.toString() === courseId;
          return e.toString() === courseId;
        });

        // Include certificate data in response
        return res.status(200).json({
          success: true,
          message: 'تم تحديد الفيديو كمكتمل',
          data: {
            videoId,
            completed: true,
            completedAt: new Date(),
            courseProgress: overallProgress,
            certificateGenerated: true,
            certificateId: updatedEnrollment.certificateId,
            certificateUrl: updatedEnrollment.certificateUrl,
          },
        });
      } catch (certError) {
        // Log error but don't fail the video completion
        console.error('Failed to generate certificate:', certError);
        // Continue with normal response
      }
    }

    res.status(200).json({
      success: true,
      message: "تم تحديد الفيديو كمكتمل",
      data: {
        videoId,
        completed: true,
        completedAt: new Date(),
        courseProgress: overallProgress,
      },
    });
  } catch (error) {
    console.error("Error in markVideoComplete:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث التقدم",
    });
  }
};

// @desc    Update watch duration
// @route   POST /api/progress/update-watch-duration
// @access  Private
export const updateWatchDuration = async (req, res) => {
  try {
    const { videoId, courseId, watchDuration } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!videoId || !courseId || watchDuration === undefined) {
      return res.status(400).json({
        success: false,
        message: "videoId, courseId, و watchDuration مطلوبان",
      });
    }

    // Validate watchDuration
    if (typeof watchDuration !== "number" || watchDuration < 0) {
      return res.status(400).json({
        success: false,
        message: "watchDuration يجب أن يكون رقم موجب",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // Find enrollment - support both old and new formats
    const enrollmentIndex = user.enrolledCourses.findIndex((e) => {
      if (e.course) return e.course.toString() === courseId;
      return e.toString() === courseId;
    });

    if (enrollmentIndex === -1) {
      return res.status(403).json({
        success: false,
        message: "يجب التسجيل في الكورس أولاً",
      });
    }

    let enrollment = user.enrolledCourses[enrollmentIndex];

    // If old format (ObjectId), convert to new format
    if (!enrollment.course) {
      user.enrolledCourses[enrollmentIndex] = {
        course: courseId,
        enrolledAt: new Date(),
        videoProgress: [],
      };
      enrollment = user.enrolledCourses[enrollmentIndex];
    }

    // If no videoProgress array, initialize it
    if (!enrollment.videoProgress) {
      enrollment.videoProgress = [];
    }

    // Find or create video progress entry
    let videoProgress = enrollment.videoProgress.find(
      (vp) => vp.video && vp.video.toString() === videoId,
    );

    if (!videoProgress) {
      // Create new video progress entry
      enrollment.videoProgress.push({
        video: videoId,
        completed: false,
        watchDuration,
        lastWatchedAt: new Date(),
      });
    } else {
      // Update existing entry
      videoProgress.watchDuration = watchDuration;
      videoProgress.lastWatchedAt = new Date();
    }

    // Mark as modified for Mixed schema type
    user.markModified("enrolledCourses");

    // Save user
    await user.save();

    res.status(200).json({
      success: true,
      data: { updated: true },
    });
  } catch (error) {
    console.error("Error in updateWatchDuration:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث مدة المشاهدة",
    });
  }
};

// @desc    Get course progress
// @route   GET /api/progress/course/:courseId
// @access  Private
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "الكورس غير موجود",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // Find enrollment - support both old and new formats
    const enrollment = user.enrolledCourses.find((e) => {
      if (e.course) return e.course.toString() === courseId;
      return e.toString() === courseId;
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "يجب التسجيل في الكورس أولاً",
      });
    }

    // Get total videos count
    const totalVideos = await Video.countDocuments({ courseId });

    // If old format, return empty progress - will be populated on first mark complete
    if (!enrollment.videoProgress) {
      return res.status(200).json({
        success: true,
        data: {
          courseId,
          overallProgress: 0,
          lastWatchedVideo: null,
          lastWatchedAt: null,
          totalVideos,
          completedVideos: 0,
          videoProgress: {},
        },
      });
    }

    // Calculate completed videos
    const completedVideos = enrollment.videoProgress.filter(
      (vp) => vp.completed,
    ).length;

    // Calculate overall progress
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

    res.status(200).json({
      success: true,
      data: {
        courseId,
        overallProgress,
        lastWatchedVideo: enrollment.lastWatchedVideo,
        lastWatchedAt: enrollment.lastWatchedAt,
        totalVideos,
        completedVideos,
        videoProgress: videoProgressMap,
      },
    });
  } catch (error) {
    console.error("Error in getCourseProgress:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب تقدم الكورس",
    });
  }
};

// @desc    Update last watched video
// @route   POST /api/progress/update-last-watched
// @access  Private
export const updateLastWatched = async (req, res) => {
  try {
    const { courseId, videoId } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!courseId || !videoId) {
      return res.status(400).json({
        success: false,
        message: "courseId و videoId مطلوبان",
      });
    }

    // Check if video exists and belongs to course
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "الفيديو غير موجود",
      });
    }

    if (video.courseId.toString() !== courseId) {
      return res.status(400).json({
        success: false,
        message: "الفيديو لا ينتمي لهذا الكورس",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // Find enrollment - support both old and new formats
    const enrollment = user.enrolledCourses.find((e) => {
      if (e.course) return e.course.toString() === courseId;
      return e.toString() === courseId;
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "يجب التسجيل في الكورس أولاً",
      });
    }

    // If old format, convert to new format
    if (!enrollment.videoProgress) {
      // Convert old format ObjectId to new format
      const oldCourseId = enrollment.toString
        ? enrollment.toString()
        : enrollment;
      const enrollmentIndex = user.enrolledCourses.findIndex((e) => {
        if (e.course) return e.course.toString() === courseId;
        return e.toString() === courseId;
      });

      if (enrollmentIndex !== -1) {
        user.enrolledCourses[enrollmentIndex] = {
          course: courseId,
          enrolledAt: new Date(),
          lastWatchedVideo: videoId,
          lastWatchedAt: new Date(),
          videoProgress: [],
        };
      }
    } else {
      // Update last watched video for new format
      enrollment.lastWatchedVideo = videoId;
      enrollment.lastWatchedAt = new Date();
    }

    // Mark as modified for Mixed schema type
    user.markModified("enrolledCourses");

    // Save user
    await user.save();

    res.status(200).json({
      success: true,
      data: { updated: true },
    });
  } catch (error) {
    console.error("Error in updateLastWatched:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث آخر فيديو تمت مشاهدته",
    });
  }
};
