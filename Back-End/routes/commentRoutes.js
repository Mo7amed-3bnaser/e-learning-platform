import express from 'express';
import {
  addComment,
  getVideoComments,
  deleteComment,
  updateComment
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, validateMongoId } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/:videoId', validateMongoId('videoId'), validate, getVideoComments);

// Protected routes (للمستخدمين المسجلين فقط)
router.post('/', protect, addComment);
router.put('/:commentId', protect, validateMongoId('commentId'), validate, updateComment);
router.delete('/:commentId', protect, validateMongoId('commentId'), validate, deleteComment);

export default router;
