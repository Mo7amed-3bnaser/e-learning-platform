import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  applyCoupon,
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createCouponValidation,
  applyCouponValidation,
  validate,
  validateIdParam,
} from '../middleware/validation.js';

const router = express.Router();

// ── Student routes ──────────────────────────────────────────────
router.post('/apply', protect, applyCouponValidation, validate, applyCoupon);

// ── Admin routes ────────────────────────────────────────────────
router.post('/', protect, admin, createCouponValidation, validate, createCoupon);
router.get('/', protect, admin, getAllCoupons);
router.get('/:id', protect, admin, validateIdParam, validate, getCouponById);
router.put('/:id', protect, admin, validateIdParam, validate, updateCoupon);
router.delete('/:id', protect, admin, validateIdParam, validate, deleteCoupon);
router.patch('/:id/toggle', protect, admin, validateIdParam, validate, toggleCoupon);

export default router;
