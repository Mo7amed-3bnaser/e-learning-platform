/**
 * Centralized Constants — replaces magic strings across the codebase
 */

// ── User Roles ──────────────────────────────────────────────────────
export const ROLES = Object.freeze({
    STUDENT: 'student',
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
});

// ── Order Statuses ──────────────────────────────────────────────────
export const ORDER_STATUS = Object.freeze({
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
});

// ── Instructor Application Statuses ─────────────────────────────────
export const APPLICATION_STATUS = Object.freeze({
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
});

// ── Video Providers ─────────────────────────────────────────────────
export const VIDEO_PROVIDER = Object.freeze({
    YOUTUBE: 'youtube',
    BUNNY: 'bunny',
});

// ── Payment Methods ─────────────────────────────────────────────────
export const PAYMENT_METHOD = Object.freeze({
    VODAFONE_CASH: 'vodafone_cash',
    INSTAPAY: 'instapay',
    BANK_TRANSFER: 'bank_transfer',
    SANDBOX: 'sandbox',
});

// ── Notification Types ──────────────────────────────────────────────
export const NOTIFICATION_TYPE = Object.freeze({
    ORDER_APPROVED: 'order_approved',
    ORDER_REJECTED: 'order_rejected',
    CERTIFICATE_ISSUED: 'certificate_issued',
});

// ── Pagination Defaults ─────────────────────────────────────────────
export const PAGINATION = Object.freeze({
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    COURSES_LIMIT: 12,
    ORDERS_LIMIT: 10,
});
// ── Coupon Discount Types ───────────────────────────────────────
export const DISCOUNT_TYPE = Object.freeze({
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
});
// ── Common Error Messages ───────────────────────────────────────────
export const ERROR_MESSAGES = Object.freeze({
    USER_NOT_FOUND: 'المستخدم غير موجود',
    COURSE_NOT_FOUND: 'الكورس غير موجود',
    VIDEO_NOT_FOUND: 'الفيديو غير موجود',
    ORDER_NOT_FOUND: 'الطلب غير موجود',
    COMMENT_NOT_FOUND: 'التعليق غير موجود',
    NOTIFICATION_NOT_FOUND: 'الإشعار غير موجود',
    REVIEW_NOT_FOUND: 'التقييم غير موجود',
    CERTIFICATE_NOT_FOUND: 'الشهادة غير موجودة',
    APPLICATION_NOT_FOUND: 'الطلب غير موجود',
    MUST_ENROLL: 'يجب التسجيل في الكورس أولاً',
    MUST_BUY_COURSE: 'يجب شراء الكورس أولاً',
    UNAUTHORIZED: 'غير مصرح لك بهذا الإجراء',
    ALREADY_ENROLLED: 'أنت مسجل في هذا الكورس بالفعل',
    INVALID_MONGO_ID: 'المعرف غير صحيح',
    SERVER_ERROR: 'حدث خطأ في الخادم',
});
