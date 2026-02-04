import express from 'express';
import {
  createOrder,
  getMyOrders,
  getPendingOrders,
  getAllOrders,
  approveOrder,
  rejectOrder,
  deleteOrder
} from '../controllers/orderController.js';
import { sandboxPayment, checkEnrollment } from '../controllers/sandboxController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { createOrderValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// 🎮 Sandbox/Simulation routes (للتجربة فقط)
router.post('/sandbox/pay', protect, sandboxPayment);
router.get('/enrollment/:courseId', protect, checkEnrollment);

// Student routes
router.post('/', protect, createOrderValidation, validate, createOrder);
router.get('/my-orders', protect, getMyOrders);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.get('/pending', protect, admin, getPendingOrders);
router.patch('/:id/approve', protect, admin, approveOrder);
router.patch('/:id/reject', protect, admin, rejectOrder);
router.delete('/:id', protect, admin, deleteOrder);

export default router;
