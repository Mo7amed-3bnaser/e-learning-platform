/**
 * Error Handler Middleware
 * يتعامل مع كل الأخطاء ويرجعها بالشكل الموحد
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

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
