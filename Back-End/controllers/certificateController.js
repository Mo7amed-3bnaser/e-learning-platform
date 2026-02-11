import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Course from "../models/Course.js";
import {
  generateCertificateId,
  generateCertificatePDF,
  uploadCertificateToCloudinary,
} from "../utils/certificateGenerator.js";

/**
 * @desc    Download certificate (if student has one)
 * @route   GET /api/certificates/:courseId
 * @access  Private
 */
export const downloadCertificate = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("المستخدم غير موجود");
  }

  // Find enrollment
  const enrollment = user.enrolledCourses.find((e) => {
    if (e.course) return e.course.toString() === courseId;
    return e.toString() === courseId;
  });

  if (!enrollment) {
    res.status(403);
    throw new Error("يجب التسجيل في الكورس أولاً");
  }

  // Check if certificate exists
  if (!enrollment.certificateUrl || !enrollment.certificateId) {
    res.status(404);
    throw new Error("لم يتم إنشاء الشهادة بعد. يجب إتمام الكورس بنسبة 100%");
  }

  res.json({
    success: true,
    message: "تم جلب الشهادة بنجاح",
    data: {
      certificateUrl: enrollment.certificateUrl,
      certificateId: enrollment.certificateId,
      completedAt: enrollment.completedAt,
    },
  });
});

/**
 * @desc    Verify certificate by ID
 * @route   GET /api/certificates/verify/:certificateId
 * @access  Public
 */
export const verifyCertificate = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;

  // Find user with this certificate
  const user = await User.findOne({
    "enrolledCourses.certificateId": certificateId,
  }).populate("enrolledCourses.course", "title");

  if (!user) {
    res.status(404);
    throw new Error("الشهادة غير موجودة");
  }

  // Find the specific enrollment with this certificate
  const enrollment = user.enrolledCourses.find(
    (e) => e.certificateId === certificateId,
  );

  if (!enrollment) {
    res.status(404);
    throw new Error("الشهادة غير موجودة");
  }

  // Get course details
  const course = await Course.findById(enrollment.course);

  res.json({
    success: true,
    message: "الشهادة صحيحة",
    data: {
      certificateId,
      studentName: user.name,
      courseName: course.title,
      completedAt: enrollment.completedAt,
      certificateUrl: enrollment.certificateUrl,
      isValid: true,
    },
  });
});

/**
 * Internal helper: Generate certificate after course completion
 * This is called from progressController when overallProgress reaches 100%
 */
export const generateCertificateForStudent = async (userId, courseId) => {
  try {
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      throw new Error("User or Course not found");
    }

    // Generate unique certificate ID
    const certificateId = generateCertificateId();

    // Generate PDF
    const pdfBuffer = await generateCertificatePDF({
      studentName: user.name,
      courseName: course.title,
      completionDate: new Date(),
      certificateId,
    });

    // Upload to Cloudinary
    const certificateUrl = await uploadCertificateToCloudinary(
      pdfBuffer,
      certificateId,
    );

    // Update user enrollment with certificate data
    const enrollmentIndex = user.enrolledCourses.findIndex((e) => {
      if (e.course) return e.course.toString() === courseId;
      return e.toString() === courseId;
    });

    if (enrollmentIndex !== -1) {
      user.enrolledCourses[enrollmentIndex].certificateId = certificateId;
      user.enrolledCourses[enrollmentIndex].certificateUrl = certificateUrl;
      user.enrolledCourses[enrollmentIndex].completedAt = new Date();

      user.markModified("enrolledCourses");
      await user.save();
    }

    return {
      certificateId,
      certificateUrl,
    };
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
};
