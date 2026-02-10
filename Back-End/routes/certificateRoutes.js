import express from 'express';
import { downloadCertificate, verifyCertificate } from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public - Verify certificate by ID (must come BEFORE /:courseId)
router.get('/verify/:certificateId', verifyCertificate);

// Protected - Download certificate for enrolled course
router.get('/:courseId', protect, downloadCertificate);

export default router;
