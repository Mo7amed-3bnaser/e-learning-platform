import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  getAllCoursesAdmin,
  getInstructorCourses,
  getCourseStats,
} from '../controllers/courseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { createCourseValidation, validate } from '../middleware/validation.js';
import {
  instructorOrAdmin,
  isInstructorOfCourse,
} from '../middleware/instructorAuth.js';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', optionalAuth, getCourseById);

// Instructor routes
router.get('/instructor/my-courses', protect, instructorOrAdmin, getInstructorCourses);
router.get('/instructor/:id/stats', protect, isInstructorOfCourse, getCourseStats);

// Instructor/Admin routes
router.post('/', protect, instructorOrAdmin, createCourseValidation, validate, createCourse);
router.put('/:id', protect, isInstructorOfCourse, updateCourse);
router.delete('/:id', protect, isInstructorOfCourse, deleteCourse);

// Instructor (owner) / Admin routes
router.patch('/:id/publish', protect, isInstructorOfCourse, togglePublishCourse);

// Admin only routes
router.get('/admin/all', protect, admin, getAllCoursesAdmin);

export default router;
