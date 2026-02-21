import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate short-lived Access Token (1 hour)
 * Payload contains only id and role — no personal data
 */
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Generate opaque Refresh Token (random 64-byte hex string)
 * Stored hashed in DB, sent as plain text to client
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Hash a refresh token before storing in DB
 */
export const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
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
