import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * التوكن هيحتوي على (ID, Name, Phone, Role) عشان الفرونت يستخدمهم في العلامة المائية
 * 
 * ملاحظة أمنية: تم تقليل مدة الـ Token من 30 يوم إلى 1 ساعة
 * في المستقبل، يُنصح بتنفيذ نظام Refresh Token:
 * - Access Token: 1 ساعة (للطلبات العادية)
 * - Refresh Token: 7 أيام (لتجديد الـ Access Token)
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h' // تم التقليل من 30d إلى 1h للأمان
    }
  );
};

/**
 * Format response data for user
 */
export const formatUserResponse = (user, token) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    enrolledCourses: user.enrolledCourses,
    token
  };
};
