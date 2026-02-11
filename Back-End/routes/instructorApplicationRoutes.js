import express from 'express';
import {
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
  deleteApplication,
} from '../controllers/instructorApplicationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { studentOnly } from '../middleware/instructorAuth.js';

const router = express.Router();

// Student routes
router.post('/', protect, studentOnly, submitApplication);
router.get('/my-application', protect, getMyApplication);

// Admin routes
router.get('/admin/all', protect, admin, getAllApplications);
router.patch('/admin/:id/review', protect, admin, reviewApplication);
router.delete('/admin/:id', protect, admin, deleteApplication);

export default router;
