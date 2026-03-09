import rateLimit from "express-rate-limit";

// Helper: normalize IP for both IPv4 and IPv6
const normalizeIp = (req) => {
  const ip = req.ip || "";
  // Strip IPv6-mapped-IPv4 prefix
  return ip.replace(/^::ffff:/, "");
};

/**
 * Rate Limiter للـ Login - منع Brute Force
 * 5 محاولات كل 15 دقيقة
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  // Key by IP + email (email comes from body) to prevent VPN bypass
  keyGenerator: (req) => {
    const email = (req.body?.email || "").toLowerCase().trim();
    return `${normalizeIp(req)}_${email}`;
  },
  message: {
    success: false,
    message:
      "تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. حاول مرة أخرى بعد 15 دقيقة",
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: true },
});

/**
 * Rate Limiter لـ Forgot Password - منع الإغراق
 * 3 محاولات كل ساعة
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => {
    const email = (req.body?.email || "").toLowerCase().trim();
    return `${normalizeIp(req)}_${email}`;
  },
  message: {
    success: false,
    message:
      "تم تجاوز الحد الأقصى لطلبات إعادة تعيين كلمة المرور. حاول مرة أخرى بعد ساعة",
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: true },
});

/**
 * Rate Limiter للتسجيل - منع إنشاء حسابات وهمية
 * 10 حسابات كل ساعة لكل IP
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 10, // 10 حسابات
  message: {
    success: false,
    message: "تم تجاوز الحد الأقصى لإنشاء الحسابات. حاول مرة أخرى بعد ساعة",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter عام للـ API
 * 300 طلب كل 15 دقيقة — مفتاح per-user (لو مسجل دخول) أو per-IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 300, // 300 طلب
  keyGenerator: (req) => {
    // لو المستخدم مسجل دخول، نستخدم ID بتاعه كمفتاح
    if (req.user?._id) return `user_${req.user._id}`;
    return normalizeIp(req);
  },
  message: {
    success: false,
    message: "تم تجاوز الحد الأقصى للطلبات. حاول مرة أخرى لاحقاً",
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: true },
});

/**
 * Rate Limiter لإنشاء الطلبات - منع هجوم DOS
 * 5 طلبات كل ساعة
 */
export const createOrderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 5, // 5 طلبات فقط
  message: {
    success: false,
    message: "تم تجاوز الحد الأقصى لإنشاء الطلبات. حاول مرة أخرى بعد ساعة",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // تخطي الحد للأدمن
    return req.user && req.user.role === "admin";
  },
});
