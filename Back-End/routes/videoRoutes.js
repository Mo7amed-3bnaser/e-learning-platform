import express from 'express';
import {
  addVideo,
  getCourseVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getInstructorCourseVideos,
} from '../controllers/videoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateActiveSession } from '../middleware/deviceProtection.js';
import { addVideoValidation, validate, validateIdParam, validateMongoId } from '../middleware/validation.js';
import {
  instructorOrAdmin,
  isInstructorOfCourse,
} from '../middleware/instructorAuth.js';

const router = express.Router();

// Static-prefix routes MUST come before dynamic /:courseId
router.get('/watch/:videoId', protect, validateActiveSession, validateMongoId('videoId'), validate, getVideoById);
router.get('/manage/:courseId', protect, validateMongoId('courseId'), validate, isInstructorOfCourse, getInstructorCourseVideos);

// Protected routes (للطلاب المسجلين)
router.get('/:courseId', protect, validateActiveSession, validateMongoId('courseId'), validate, getCourseVideos);

// Admin + Instructor (owner) routes
router.post('/', protect, instructorOrAdmin, addVideoValidation, validate, addVideo);
router.put('/:id', protect, instructorOrAdmin, validateIdParam, validate, updateVideo);
router.delete('/:id', protect, instructorOrAdmin, validateIdParam, validate, deleteVideo);

export default router;
