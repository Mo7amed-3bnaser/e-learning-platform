import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updateAvatar
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidation, loginValidation, validate } from '../middleware/validation.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);
router.post('/avatar', protect, upload.single('avatar'), updateAvatar);

export default router;
