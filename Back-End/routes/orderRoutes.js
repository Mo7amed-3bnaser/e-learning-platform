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
import { protect, admin } from '../middleware/authMiddleware.js';
import { createOrderValidation, validate } from '../middleware/validation.js';

const router = express.Router();

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
