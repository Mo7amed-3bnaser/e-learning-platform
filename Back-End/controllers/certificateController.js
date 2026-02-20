import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Course from "../models/Course.js";
import {
  generateCertificateId,
  generateCertificatePDF,
  uploadCertificateToCloudinary,
} from "../utils/certificateGenerator.js";
import { createNotification } from './notificationController.js';
import sendEmail, { getCertificateIssuedTemplate } from '../utils/sendEmail.js';
import logger from '../config/logger.js';
import { findEnrollment } from '../utils/enrollmentHelper.js';
import { ERROR_MESSAGES, NOTIFICATION_TYPE } from '../utils/constants.js';

/**
 * @desc    Get certificate for a course (if student has completed it)
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

  const { enrollment } = findEnrollment(user, courseId);

  if (!enrollment) {
    res.status(403);
    throw new Error("يجب التسجيل في الكورس أولاً");
  }

  // Must have at least a certificate ID (URL is optional — frontend renders the certificate)
  if (!enrollment.certificateId) {
    res.status(404);
    throw new Error("لم يتم إنشاء الشهادة بعد. يجب إتمام الكورس بنسبة 100%");
  }

  res.json({
    success: true,
    message: "تم جلب الشهادة بنجاح",
    data: {
      certificateId: enrollment.certificateId,
      certificateUrl: enrollment.certificateUrl || null,
      completedAt: enrollment.completedAt,
      studentName: user.name,
    },
  });
});

/**
 * @desc    Generate (or re-generate) certificate for a completed course
 * @route   POST /api/certificates/generate/:courseId
 * @access  Private
 */
export const generateCertificate = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  const course = await Course.findById(courseId);

  if (!user || !course) {
    res.status(404);
    throw new Error("المستخدم أو الكورس غير موجود");
  }

  const { enrollment, index: enrollmentIndex } = findEnrollment(user, courseId);

  if (enrollmentIndex === -1) {
    res.status(403);
    throw new Error("يجب التسجيل في الكورس أولاً");
  }

  // The enrollment reference is from the helper

  // Return existing certificate if already generated
  if (enrollment.certificateId) {
    return res.json({
      success: true,
      message: "الشهادة موجودة بالفعل",
      data: {
        certificateId: enrollment.certificateId,
        certificateUrl: enrollment.certificateUrl || null,
        completedAt: enrollment.completedAt,
        studentName: user.name,
      },
    });
  }

  // Generate new certificate
  const certificateId = generateCertificateId();
  const completedAt = new Date();

  // Try PDF generation + Cloudinary upload (optional — don't fail if it doesn't work)
  let certificateUrl = null;
  try {
    const pdfBuffer = await generateCertificatePDF({
      studentName: user.name,
      courseName: course.title,
      completionDate: completedAt,
      certificateId,
    });
    certificateUrl = await uploadCertificateToCloudinary(pdfBuffer, certificateId);
  } catch (pdfError) {
    logger.error("PDF generation failed (non-fatal):", pdfError.message);
  }

  // Save certificate data regardless of PDF success
  user.enrolledCourses[enrollmentIndex].certificateId = certificateId;
  user.enrolledCourses[enrollmentIndex].completedAt = completedAt;
  if (certificateUrl) {
    user.enrolledCourses[enrollmentIndex].certificateUrl = certificateUrl;
  }
  user.markModified("enrolledCourses");
  await user.save();

  res.json({
    success: true,
    message: "تم إنشاء الشهادة بنجاح",
    data: {
      certificateId,
      certificateUrl,
      completedAt,
      studentName: user.name,
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

    const completedAt = new Date();

    // Try PDF + Cloudinary (non-fatal if fails)
    let certificateUrl = null;
    try {
      const pdfBuffer = await generateCertificatePDF({
        studentName: user.name,
        courseName: course.title,
        completionDate: completedAt,
        certificateId,
      });
      certificateUrl = await uploadCertificateToCloudinary(pdfBuffer, certificateId);
    } catch (pdfError) {
      logger.error("PDF/Cloudinary failed (non-fatal):", pdfError.message);
    }

    // Save certificate data regardless of PDF success
    const { index: enrollmentIndex } = findEnrollment(user, courseId);

    if (enrollmentIndex !== -1) {
      user.enrolledCourses[enrollmentIndex].certificateId = certificateId;
      user.enrolledCourses[enrollmentIndex].completedAt = completedAt;
      if (certificateUrl) {
        user.enrolledCourses[enrollmentIndex].certificateUrl = certificateUrl;
      }
      user.markModified("enrolledCourses");
      await user.save();
    }

    // إنشاء إشعار للطالب
    await createNotification({
      user: userId,
      type: 'certificate_issued',
      title: 'مبروك! تم إصدار شهادتك 🎓',
      message: `أحسنت! لقد أتممت كورس "${course.title}" بنجاح وتم إصدار شهادتك`,
      link: `/certificates/${courseId}`,
      metadata: {
        courseId,
        certificateId,
      },
    });

    // إرسال إيميل للطالب
    try {
      await sendEmail({
        to: user.email,
        subject: '🎓 مبروك! تم إصدار شهادتك - مسار',
        html: getCertificateIssuedTemplate(user.name, course.title, certificateUrl),
      });
    } catch (emailError) {
      logger.error('خطأ في إرسال الإيميل:', emailError);
    }

    return {
      certificateId,
      certificateUrl: certificateUrl || null,
      completedAt,
    };
  } catch (error) {
    logger.error("Error generating certificate:", error);
    throw error;
  }
};
