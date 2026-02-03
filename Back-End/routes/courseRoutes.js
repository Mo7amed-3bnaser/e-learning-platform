import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  getAllCoursesAdmin
} from '../controllers/courseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { createCourseValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', optionalAuth, getCourseById);

// Admin routes
router.post('/', protect, admin, createCourseValidation, validate, createCourse);
router.put('/:id', protect, admin, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);
router.patch('/:id/publish', protect, admin, togglePublishCourse);
router.get('/admin/all', protect, admin, getAllCoursesAdmin);

export default router;
