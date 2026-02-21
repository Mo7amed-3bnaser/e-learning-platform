import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updateAvatar,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshAccessToken,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidation, loginValidation, validate } from '../middleware/validation.js';
import { upload } from '../config/cloudinary.js';
import { loginLimiter, registerLimiter, forgotPasswordLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', registerLimiter, registerValidation, validate, register);
router.post('/login', loginLimiter, loginValidation, validate, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// Token management
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);
router.post('/avatar', protect, upload.single('avatar'), updateAvatar);

export default router;
