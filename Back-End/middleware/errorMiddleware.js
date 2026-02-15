import logger from '../config/logger.js';

/**
 * Error Handler Middleware
 * يتعامل مع كل الأخطاء ويرجعها بالشكل الموحد
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log error with appropriate level
  if (statusCode >= 500) {
    logger.error(`${err.message}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id,
      stack: err.stack,
    });
  } else if (statusCode >= 400) {
    logger.warn(`${err.message}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'حدث خطأ في الخادم',
    errorCode: err.code || 'SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Not Found Middleware
 * للروابط اللي مش موجودة
 */
export const notFound = (req, res, next) => {
  const error = new Error(`الرابط غير موجود - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
