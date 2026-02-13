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
import { addVideoValidation, validate } from '../middleware/validation.js';
import {
  instructorOrAdmin,
  isInstructorOfCourse,
} from '../middleware/instructorAuth.js';

const router = express.Router();

// Static-prefix routes MUST come before dynamic /:courseId
router.get('/watch/:videoId', protect, getVideoById);
router.get('/manage/:courseId', protect, isInstructorOfCourse, getInstructorCourseVideos);

// Protected routes (للطلاب المسجلين)
router.get('/:courseId', protect, getCourseVideos);

// Admin + Instructor (owner) routes
router.post('/', protect, instructorOrAdmin, addVideoValidation, validate, addVideo);
router.put('/:id', protect, instructorOrAdmin, updateVideo);
router.delete('/:id', protect, instructorOrAdmin, deleteVideo);

export default router;
