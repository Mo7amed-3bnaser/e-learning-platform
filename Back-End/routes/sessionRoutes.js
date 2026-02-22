import express from 'express';
import {
  getActiveSessions,
  getDeviceHistory,
  revokeSession,
  revokeAllSessions,
  getDeviceLimits,
} from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public - لعرض الحدود في صفحة التسجيل
router.get('/limits', getDeviceLimits);

// Protected
router.get('/active', protect, getActiveSessions);
router.get('/devices', protect, getDeviceHistory);
router.delete('/all', protect, revokeAllSessions);
router.delete('/:sessionId', protect, revokeSession);

export default router;
