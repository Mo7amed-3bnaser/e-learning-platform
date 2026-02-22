import asyncHandler from 'express-async-handler';
import ActiveSession from '../models/ActiveSession.js';
import DeviceLog from '../models/DeviceLog.js';
import { DEVICE_CONFIG } from '../middleware/deviceProtection.js';

/**
 * @desc    عرض الأجهزة النشطة للمستخدم
 * @route   GET /api/sessions/active
 * @access  Private
 */
export const getActiveSessions = asyncHandler(async (req, res) => {
  const sessions = await ActiveSession.find({
    userId: req.user._id,
    isActive: true,
  }).select('deviceInfo lastActivity createdAt');

  res.json({
    success: true,
    count: sessions.length,
    maxAllowed: DEVICE_CONFIG.MAX_ACTIVE_SESSIONS,
    sessions,
  });
});

/**
 * @desc    عرض سجل الأجهزة المستخدمة هذا الشهر
 * @route   GET /api/sessions/devices
 * @access  Private
 */
export const getDeviceHistory = asyncHandler(async (req, res) => {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const devices = await DeviceLog.find({
    userId: req.user._id,
    lastLoginAt: { $gte: monthAgo },
    isBlocked: false,
  }).select('deviceInfo firstLoginAt lastLoginAt loginCount');

  res.json({
    success: true,
    count: devices.length,
    maxAllowed: DEVICE_CONFIG.MAX_UNIQUE_DEVICES_PER_MONTH,
    remaining: Math.max(0, DEVICE_CONFIG.MAX_UNIQUE_DEVICES_PER_MONTH - devices.length),
    devices,
  });
});

/**
 * @desc    تسجيل خروج من جهاز معين (عن بُعد)
 * @route   DELETE /api/sessions/:sessionId
 * @access  Private
 */
export const revokeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await ActiveSession.findOneAndUpdate(
    { _id: sessionId, userId: req.user._id, isActive: true },
    { isActive: false },
    { new: true }
  );

  if (!session) {
    res.status(404);
    throw new Error('الجلسة غير موجودة أو منتهية بالفعل');
  }

  res.json({
    success: true,
    message: 'تم تسجيل الخروج من الجهاز بنجاح',
  });
});

/**
 * @desc    تسجيل خروج من كل الأجهزة
 * @route   DELETE /api/sessions/all
 * @access  Private
 */
export const revokeAllSessions = asyncHandler(async (req, res) => {
  const result = await ActiveSession.updateMany(
    { userId: req.user._id, isActive: true },
    { isActive: false }
  );

  res.json({
    success: true,
    message: `تم تسجيل الخروج من ${result.modifiedCount} جهاز`,
    count: result.modifiedCount,
  });
});

/**
 * @desc    عرض حدود الأجهزة والإعدادات
 * @route   GET /api/sessions/limits
 * @access  Public
 */
export const getDeviceLimits = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    limits: {
      maxActiveSessions: DEVICE_CONFIG.MAX_ACTIVE_SESSIONS,
      maxDevicesPerMonth: DEVICE_CONFIG.MAX_UNIQUE_DEVICES_PER_MONTH,
      switchCooldownHours: DEVICE_CONFIG.DEVICE_SWITCH_COOLDOWN_HOURS,
    },
    message: {
      ar: `يمكنك استخدام جهاز واحد في نفس الوقت، وحد أقصى ${DEVICE_CONFIG.MAX_UNIQUE_DEVICES_PER_MONTH} أجهزة مختلفة في الشهر، مع فترة انتظار ${DEVICE_CONFIG.DEVICE_SWITCH_COOLDOWN_HOURS} ساعات بين تبديل الأجهزة.`,
    },
  });
});

/**
 * @desc    الأدمن يشوف أجهزة مستخدم معين
 * @route   GET /api/admin/users/:userId/devices
 * @access  Admin
 */
export const adminGetUserDevices = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const [activeSessions, deviceLogs] = await Promise.all([
    ActiveSession.find({ userId, isActive: true }),
    DeviceLog.find({ userId }).sort({ lastLoginAt: -1 }),
  ]);

  res.json({
    success: true,
    activeSessions,
    deviceHistory: deviceLogs,
  });
});

/**
 * @desc    الأدمن يعمل reset لحد الأجهزة لمستخدم معين
 * @route   POST /api/admin/users/:userId/reset-devices
 * @access  Admin
 */
export const adminResetUserDevices = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await Promise.all([
    ActiveSession.updateMany({ userId }, { isActive: false }),
    DeviceLog.deleteMany({ userId }),
  ]);

  res.json({
    success: true,
    message: 'تم إعادة تعيين سجل الأجهزة بنجاح. المستخدم يمكنه تسجيل الدخول من أي جهاز.',
  });
});
