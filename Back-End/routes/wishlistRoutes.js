import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// جميع routes محمية — يجب تسجيل الدخول
router.get('/', protect, getWishlist);
router.post('/:courseId', protect, addToWishlist);
router.delete('/:courseId', protect, removeFromWishlist);
router.get('/check/:courseId', protect, checkWishlist);

export default router;
