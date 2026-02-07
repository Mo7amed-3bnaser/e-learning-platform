import express from 'express';
import {
  addComment,
  getVideoComments,
  deleteComment,
  updateComment
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/:videoId', getVideoComments);

// Protected routes (للمستخدمين المسجلين فقط)
router.post('/', protect, addComment);
router.put('/:commentId', protect, updateComment);
router.delete('/:commentId', protect, deleteComment);

export default router;
