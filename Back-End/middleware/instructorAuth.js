import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';

/**
 * Middleware: التأكد من أن المستخدم مدرب أو أدمن
 */
export const instructorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'instructor')) {
    next();
  } else {
    res.status(403);
    throw new Error('غير مصرح لك - هذه الصفحة للمدربين والمشرفين فقط');
  }
};

/**
 * Middleware: التأكد من أن المستخدم هو مدرب الكورس أو أدمن
 */
export const isInstructorOfCourse = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id || req.params.courseId;
  
  if (!courseId) {
    res.status(400);
    throw new Error('معرف الكورس مطلوب');
  }

  const course = await Course.findById(courseId);

  if (!course) {
    res.status(404);
    throw new Error('الكورس غير موجود');
  }

  // Admin has full access
  if (req.user.role === 'admin') {
    req.course = course; // Attach course to request for later use
    return next();
  }

  // Check if user is the instructor of this course
  if (
    req.user.role === 'instructor' &&
    course.instructor.toString() === req.user.id.toString()
  ) {
    req.course = course; // Attach course to request
    return next();
  }

  res.status(403);
  throw new Error('غير مصرح لك - لا تملك صلاحية لتعديل هذا الكورس');
});

/**
 * Middleware: التأكد من أن المستخدم طالب فقط (لتقديم طلب مدرب)
 */
export const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403);
    throw new Error('يمكن للطلاب فقط تقديم طلبات الانضمام كمدرب');
  }
};
