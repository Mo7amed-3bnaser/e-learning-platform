import ActiveSession from '../models/ActiveSession.js';
import DeviceLog from '../models/DeviceLog.js';
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';
import logger from '../config/logger.js';

// ===================== الإعدادات =====================
export const DEVICE_CONFIG = {
  MAX_ACTIVE_SESSIONS: 1,          // جهاز واحد بس في نفس الوقت
  MAX_UNIQUE_DEVICES_PER_MONTH: 2, // أقصى عدد أجهزة مختلفة في الشهر
  DEVICE_SWITCH_COOLDOWN_HOURS: 4, // لازم 4 ساعات بين تبديل الأجهزة
};

// ===================== توليد بصمة الجهاز =====================
export const generateDeviceFingerprint = (req) => {
  const ua = req.headers['user-agent'] || '';
  const clientFingerprint = req.headers['x-device-fingerprint'] || '';

  const raw = `${ua}|${clientFingerprint}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
};

// ===================== استخراج بيانات الجهاز =====================
const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();
  return {
    userAgent: req.headers['user-agent'],
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    ip: req.ip,
  };
};

// ===================== الطبقة الرئيسية: التحقق عند Login =====================
/**
 * بيتنفذ بعد التحقق من البيانات (email/password) وقبل إرسال الـ response
 * بيتحقق من كل الطبقات:
 *   1. حد الأجهزة الفريدة شهرياً
 *   2. Cooldown بين تبديل الأجهزة
 *   3. قفل الـ Sessions القديمة
 *
 * @param {ObjectId} userId - ID المستخدم
 * @param {string} token - الـ JWT token اللي اتولد
 * @param {Request} req - الـ Express request object
 * @returns {ActiveSession} الـ session الجديدة
 * @throws {Error} لو تجاوز حد الأجهزة أو في cooldown
 */
export const enforceDeviceProtection = async (userId, token, req) => {
  const deviceFingerprint = generateDeviceFingerprint(req);
  const deviceInfo = getDeviceInfo(req);

  // ───────── الطبقة 1: حد الأجهزة الفريدة شهرياً ─────────
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const uniqueDevicesThisMonth = await DeviceLog.find({
    userId,
    lastLoginAt: { $gte: monthAgo },
    isBlocked: false,
  });

  const isKnownDevice = uniqueDevicesThisMonth.some(
    (d) => d.deviceFingerprint === deviceFingerprint
  );

  if (!isKnownDevice && uniqueDevicesThisMonth.length >= DEVICE_CONFIG.MAX_UNIQUE_DEVICES_PER_MONTH) {
    logger.warn('Device limit exceeded', { userId, deviceFingerprint });
    const error = new Error(
      `تم تجاوز الحد الأقصى للأجهزة (${DEVICE_CONFIG.MAX_UNIQUE_DEVICES_PER_MONTH}) هذا الشهر. لا يمكن تسجيل الدخول من جهاز جديد حتى الشهر القادم.`
    );
    error.code = 'MAX_DEVICES_REACHED';
    error.statusCode = 403;
    throw error;
  }

  // ───────── الطبقة 2: Cooldown بين تبديل الأجهزة ─────────
  const lastSessionFromDifferentDevice = await ActiveSession.findOne({
    userId,
    deviceFingerprint: { $ne: deviceFingerprint },
  }).sort({ createdAt: -1 });

  if (lastSessionFromDifferentDevice) {
    const hoursSinceLastDevice =
      (Date.now() - lastSessionFromDifferentDevice.createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastDevice < DEVICE_CONFIG.DEVICE_SWITCH_COOLDOWN_HOURS) {
      const remainingHours = Math.ceil(
        DEVICE_CONFIG.DEVICE_SWITCH_COOLDOWN_HOURS - hoursSinceLastDevice
      );
      const remainingMinutes = Math.ceil(
        (DEVICE_CONFIG.DEVICE_SWITCH_COOLDOWN_HOURS - hoursSinceLastDevice) * 60
      );

      const timeMsg = remainingHours >= 1
        ? `${remainingHours} ساعة`
        : `${remainingMinutes} دقيقة`;

      logger.warn('Device switch cooldown active', {
        userId,
        deviceFingerprint,
        remainingHours,
      });

      const error = new Error(
        `تم تسجيل الدخول مؤخراً من جهاز آخر. يرجى الانتظار ${timeMsg} قبل تسجيل الدخول من جهاز مختلف.`
      );
      error.code = 'DEVICE_SWITCH_COOLDOWN';
      error.statusCode = 429;
      throw error;
    }
  }

  // ───────── الطبقة 3: قفل كل الـ Sessions القديمة ─────────
  await ActiveSession.updateMany(
    { userId, isActive: true },
    { isActive: false }
  );

  // ───────── تسجيل الجهاز والـ Session الجديدة ─────────
  await DeviceLog.findOneAndUpdate(
    { userId, deviceFingerprint },
    {
      $set: {
        deviceInfo,
        lastLoginAt: new Date(),
      },
      $inc: { loginCount: 1 },
      $setOnInsert: {
        firstLoginAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  const newSession = await ActiveSession.create({
    userId,
    token,
    deviceFingerprint,
    deviceInfo,
  });

  logger.info('New session created', {
    userId,
    sessionId: newSession._id,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
  });

  return newSession;
};

// ===================== التحقق إن الـ Session لسه نشطة =====================
/**
 * Middleware يتحط بعد authMiddleware (protect)
 * بيتحقق إن الـ token لسه نشط ومتبدلش من جهاز تاني
 *
 * لو الـ Session اتقفلت (لأن حد تاني دخل)، بيرجع 401
 * مع error code: SESSION_REVOKED
 */
export const validateActiveSession = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !req.user) {
      return next();
    }

    // الأدمن والمدرسين معفيين من تقييد الأجهزة
    if (req.user.role === 'admin' || req.user.role === 'instructor') {
      return next();
    }

    const session = await ActiveSession.findOne({
      token,
      userId: req.user._id,
      isActive: true,
    });

    if (!session) {
      res.status(401);
      const error = new Error(
        'تم تسجيل الدخول من جهاز آخر. يرجى تسجيل الدخول مرة أخرى.'
      );
      error.code = 'SESSION_REVOKED';
      return next(error);
    }

    // حدّث آخر نشاط (كل 5 دقايق بس عشان مش نضغط على الداتابيز)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (session.lastActivity < fiveMinutesAgo) {
      session.lastActivity = new Date();
      await session.save();
    }

    req.sessionId = session._id;
    next();
  } catch (error) {
    next(error);
  }
};

// ===================== Logout: قفل الـ Session =====================
/**
 * بيقفل الـ Active Session الحالية عند Logout
 *
 * @param {string} token - الـ JWT token
 * @param {ObjectId} userId - ID المستخدم
 */
export const deactivateSession = async (token, userId) => {
  await ActiveSession.findOneAndUpdate(
    { token, userId },
    { isActive: false }
  );
};
