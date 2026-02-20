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
import { createCourseValidation, validate, validateIdParam } from '../middleware/validation.js';
import {
  instructorOrAdmin,
  isInstructorOfCourse,
} from '../middleware/instructorAuth.js';

const router = express.Router();

// ── Static routes FIRST (must come before /:id to avoid being consumed by the param) ──

// Public: list all courses
router.get('/', getCourses);

// Admin only: get all courses (admin panel)
router.get('/admin/all', protect, admin, getAllCoursesAdmin);

// Instructor: get my courses
router.get('/instructor/my-courses', protect, instructorOrAdmin, getInstructorCourses);

// Instructor: get stats for a specific course
router.get('/instructor/:id/stats', protect, validateIdParam, validate, isInstructorOfCourse, getCourseStats);

// ── Dynamic /:id routes AFTER static ones ──

// Public: get single course by id
router.get('/:id', validateIdParam, validate, optionalAuth, getCourseById);

// Instructor/Admin: create / update / delete
router.post('/', protect, instructorOrAdmin, createCourseValidation, validate, createCourse);
router.put('/:id', protect, validateIdParam, validate, isInstructorOfCourse, updateCourse);
router.delete('/:id', protect, validateIdParam, validate, isInstructorOfCourse, deleteCourse);

// Instructor (owner) / Admin: toggle publish
router.patch('/:id/publish', protect, validateIdParam, validate, isInstructorOfCourse, togglePublishCourse);

export default router;
