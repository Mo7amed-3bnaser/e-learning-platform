import express from 'express';
import {
  addVideo,
  getCourseVideos,
  getVideoById,
  updateVideo,
  deleteVideo
} from '../controllers/videoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { addVideoValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// Protected routes (للطلاب المسجلين)
router.get('/:courseId', protect, getCourseVideos);
router.get('/watch/:videoId', protect, getVideoById);

// Admin routes
router.post('/', protect, admin, addVideoValidation, validate, addVideo);
router.put('/:id', protect, admin, updateVideo);
router.delete('/:id', protect, admin, deleteVideo);

export default router;
