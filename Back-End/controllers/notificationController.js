import Notification from '../models/Notification.js';
import logger from '../config/logger.js';

/**
 * @desc    الحصول على جميع إشعارات المستخدم الحالي
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };

    // فلترة حسب الحالة (مقروء/غير مقروء)
    if (req.query.isRead !== undefined) {
      filter.isRead = req.query.isRead === 'true';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('metadata.courseId', 'title thumbnail')
        .populate('metadata.orderId', 'totalAmount')
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          hasMore: page * limit < total,
        },
        unreadCount,
      },
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    next(error);
  }
};

/**
 * @desc    الحصول على عدد الإشعارات غير المقروءة
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    logger.error('Error fetching unread count:', error);
    next(error);
  }
};

/**
 * @desc    تحديد إشعار معين كمقروء
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود',
      });
    }

    if (notification.isRead) {
      return res.status(200).json({
        success: true,
        message: 'الإشعار مقروء بالفعل',
        data: { notification },
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'تم تحديد الإشعار كمقروء',
      data: { notification },
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    next(error);
  }
};

/**
 * @desc    تحديد جميع الإشعارات كمقروءة
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.markAllAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: 'تم تحديد جميع الإشعارات كمقروءة',
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    next(error);
  }
};

/**
 * @desc    حذف إشعار معين
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود',
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف الإشعار بنجاح',
    });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    next(error);
  }
};

/**
 * @desc    حذف جميع الإشعارات المقروءة
 * @route   DELETE /api/notifications/read
 * @access  Private
 */
export const deleteAllRead = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({
      user: req.user._id,
      isRead: true,
    });

    res.status(200).json({
      success: true,
      message: 'تم حذف جميع الإشعارات المقروءة',
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    logger.error('Error deleting read notifications:', error);
    next(error);
  }
};

/**
 * Helper function لإنشاء إشعار جديد
 * يمكن استخدامها من Controllers أخرى
 */
export const createNotification = async (data) => {
  try {
    const notification = await Notification.createNotification(data);
    logger.info(`Notification created for user ${data.user}: ${data.type}`);
    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};
