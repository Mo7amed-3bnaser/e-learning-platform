import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * التوكن هيحتوي على (ID, Name, Phone, Role) عشان الفرونت يستخدمهم في العلامة المائية
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
      expiresIn: process.env.JWT_EXPIRE || '30d'
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
