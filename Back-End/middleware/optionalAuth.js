import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Optional Auth - يحاول يجيب المستخدم من التوكن لكن مش إجباري
 * (للـ endpoints اللي public لكن بتختلف بناءً على login)
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // إذا فشل التوكن، نكمل بدون user (مش هنرمي error)
      req.user = null;
    }
  }

  next();
};
