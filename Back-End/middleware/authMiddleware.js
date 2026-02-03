import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * Protect Routes - التأكد من وجود Token صحيح
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (without password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('المستخدم غير موجود');
      }

      // Check if user is blocked
      if (req.user.isBlocked) {
        res.status(403);
        throw new Error('تم حظر حسابك. تواصل مع الدعم الفني');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('غير مصرح لك بالدخول - التوكن غير صحيح');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('غير مصرح لك بالدخول - لا يوجد توكن');
  }
});

/**
 * Admin Middleware - التأكد من أن المستخدم أدمن
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('غير مصرح لك - هذه الصفحة للمشرفين فقط');
  }
};
