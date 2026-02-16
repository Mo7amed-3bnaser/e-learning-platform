import express from 'express';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// جميع المسارات محمية (تتطلب تسجيل دخول)
router.use(protect);

// الحصول على جميع الإشعارات
router.get('/', getMyNotifications);

// الحصول على عدد الإشعارات غير المقروءة
router.get('/unread-count', getUnreadCount);

// تحديد جميع الإشعارات كمقروءة
router.patch('/read-all', markAllAsRead);

// حذف جميع الإشعارات المقروءة
router.delete('/read', deleteAllRead);

// تحديد إشعار معين كمقروء
router.patch('/:id/read', markAsRead);

// حذف إشعار معين
router.delete('/:id', deleteNotification);

export default router;
