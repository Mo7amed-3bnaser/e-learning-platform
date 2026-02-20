import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, validateMongoId } from '../middleware/validation.js';

const router = express.Router();

// جميع routes محمية — يجب تسجيل الدخول
router.get('/', protect, getWishlist);
router.post('/:courseId', protect, validateMongoId('courseId'), validate, addToWishlist);
router.delete('/:courseId', protect, validateMongoId('courseId'), validate, removeFromWishlist);
router.get('/check/:courseId', protect, validateMongoId('courseId'), validate, checkWishlist);

export default router;
