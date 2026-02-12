import express from 'express';
import {
  submitApplication,
  getAllApplications,
  reviewApplication,
  deleteApplication,
} from '../controllers/instructorApplicationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - instructor application submission
router.post('/', submitApplication);

// Admin routes
router.get('/admin/all', protect, admin, getAllApplications);
router.patch('/admin/:id/review', protect, admin, reviewApplication);
router.delete('/admin/:id', protect, admin, deleteApplication);

export default router;
