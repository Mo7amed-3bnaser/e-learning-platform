import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken, generateRefreshToken, hashRefreshToken, formatUserResponse, ACCESS_TOKEN_COOKIE_OPTIONS } from '../utils/authHelpers.js';
import { deleteImage } from '../config/cloudinary.js';
import sendEmail, { getResetPasswordTemplate, getEmailVerificationTemplate } from '../utils/sendEmail.js';
import logger from '../config/logger.js';
import { enforceDeviceProtection, deactivateSession } from '../middleware/deviceProtection.js';

/**
 * @desc    تسجيل مستخدم جديد (مع إرسال إيميل تأكيد)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, deviceAgreement } = req.body;

  // التحقق من وجود جميع البيانات
  if (!name || !email || !phone || !password) {
    res.status(400);
    throw new Error('برجاء إدخال جميع البيانات المطلوبة');
  }

  // التحقق من الموافقة على شروط الأجهزة
  if (!deviceAgreement) {
    res.status(400);
    throw new Error('يجب الموافقة على شروط استخدام الأجهزة والحساب قبل التسجيل');
  }

  // التحقق من وجود المستخدم مسبقاً
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });

  if (userExists) {
    res.status(400);
    throw new Error('البريد الإلكتروني أو رقم الهاتف مستخدم من قبل');
  }

  // إنشاء المستخدم
  const user = await User.create({
    name,
    email,
    phone,
    password, // will be hashed automatically by pre-save hook
    deviceAgreement: {
      agreed: true,
      agreedAt: new Date(),
      agreedFromIP: req.ip,
    },
  });

  if (user) {
    // إنشاء توكن التأكيد
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // إنشاء رابط التأكيد
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

    try {
      // إرسال إيميل التأكيد
      await sendEmail({
        to: user.email,
        subject: '✅ تأكيد البريد الإلكتروني - E-Learning Platform',
        html: getEmailVerificationTemplate(user.name, verificationUrl),
      });

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح! تم إرسال رابط تأكيد البريد الإلكتروني إلى بريدك 📧',
        requiresVerification: true,
      });
    } catch (error) {
      // في حالة فشل إرسال الإيميل، نحذف التوكن لكن لا نحذف اليوزر
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error('Email send error:', error);
      res.status(500);
      throw new Error('تم إنشاء الحساب لكن فشل إرسال البريد الإلكتروني. حاول إعادة إرسال رابط التأكيد');
    }
  } else {
    res.status(400);
    throw new Error('فشل إنشاء الحساب. حاول مرة أخرى');
  }
});

/**
 * @desc    تأكيد البريد الإلكتروني
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error('رابط التأكيد غير صالح');
  }

  // تشفير التوكن المرسل ومقارنته بالمحفوظ في الداتابيز
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // البحث عن المستخدم بالتوكن المشفر والتأكد من أن التوكن لم ينتهي
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('رابط التأكيد غير صالح أو منتهي الصلاحية. اطلب رابط جديد');
  }

  // تأكيد البريد الإلكتروني
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'تم تأكيد البريد الإلكتروني بنجاح! يمكنك تسجيل الدخول الآن 🎉',
  });
});

/**
 * @desc    إعادة إرسال رابط تأكيد البريد الإلكتروني
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('برجاء إدخال البريد الإلكتروني');
  }

  // البحث عن المستخدم
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('لا يوجد حساب مرتبط بهذا البريد الإلكتروني');
  }

  // التحقق إذا كان البريد مؤكد بالفعل
  if (user.isEmailVerified) {
    res.status(400);
    throw new Error('البريد الإلكتروني مؤكد بالفعل. يمكنك تسجيل الدخول');
  }

  // التحقق من حالة الحظر
  if (user.isBlocked) {
    res.status(403);
    throw new Error('تم حظر حسابك. تواصل مع الدعم الفني');
  }

  // إنشاء توكن تأكيد جديد
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // إنشاء رابط التأكيد
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

  try {
    // إرسال إيميل التأكيد
    await sendEmail({
      to: user.email,
      subject: '✅ تأكيد البريد الإلكتروني - E-Learning Platform',
      html: getEmailVerificationTemplate(user.name, verificationUrl),
    });

    res.json({
      success: true,
      message: 'تم إرسال رابط تأكيد البريد الإلكتروني إلى بريدك 📧',
    });
  } catch (error) {
    // في حالة فشل إرسال الإيميل، نحذف التوكن
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error('Email send error:', error);
    res.status(500);
    throw new Error('فشل إرسال البريد الإلكتروني. حاول مرة أخرى لاحقاً');
  }
});

/**
 * @desc    تسجيل الدخول
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // التحقق من وجود البيانات
  if (!email || !password) {
    res.status(400);
    throw new Error('برجاء إدخال البريد الإلكتروني وكلمة المرور');
  }

  // البحث عن المستخدم (مع إرجاع الباسورد هذه المرة)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // التحقق من حالة الحظر
  if (user.isBlocked) {
    res.status(403);
    throw new Error('تم حظر حسابك. تواصل مع الدعم الفني');
  }

  // التحقق من Account Lockout
  if (user.isLocked) {
    res.status(403);
    throw new Error('تم قفل حسابك مؤقتاً بسبب محاولات تسجيل دخول فاشلة متعددة. حاول مرة أخرى بعد 30 دقيقة');
  }

  // التحقق من كلمة المرور
  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    // زيادة عدد المحاولات الفاشلة
    await user.incLoginAttempts();
    res.status(401);
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // التحقق من تأكيد البريد الإلكتروني (الأدمن معفي)
  if (!user.isEmailVerified && user.role !== 'admin') {
    res.status(403);
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  // إعادة تعيين محاولات تسجيل الدخول عند النجاح
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Generate access token + refresh token
  const token = generateToken(user);
  const refreshToken = generateRefreshToken();

  // فرض حماية الأجهزة (للطلاب فقط)
  if (user.role === 'student') {
    try {
      await enforceDeviceProtection(user._id, token, req);
    } catch (error) {
      return res.status(error.statusCode || 403).json({
        success: false,
        message: error.message,
        errorCode: error.code,
      });
    }
  }

  // Store hashed refresh token in DB
  user.refreshToken = hashRefreshToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  // Send refresh token as HttpOnly cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Send access token as HttpOnly cookie (1 hour)
  res.cookie('access_token', token, ACCESS_TOKEN_COOKIE_OPTIONS);

  res.json({
    success: true,
    message: 'تم تسجيل الدخول بنجاح',
    data: formatUserResponse(user, token)
  });
});

/**
 * @desc    الحصول على بيانات المستخدم الحالي
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('enrolledCourses', 'title thumbnail');

  res.json({
    success: true,
    message: 'تم جلب بيانات المستخدم بنجاح',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      enrolledCourses: user.enrolledCourses,
      createdAt: user.createdAt
    }
  });
});

/**
 * @desc    تحديث بيانات المستخدم
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (user) {
    user.name = req.body.name || user.name;
    user.avatar = req.body.avatar || user.avatar;

    // إذا أراد تغيير البريد أو الهاتف، تحقق من عدم وجودهم
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('البريد الإلكتروني مستخدم من قبل');
      }
      user.email = req.body.email;
      // New email must be verified again
      user.isEmailVerified = false;
    }

    if (req.body.phone && req.body.phone !== user.phone) {
      const phoneExists = await User.findOne({ phone: req.body.phone });
      if (phoneExists) {
        res.status(400);
        throw new Error('رقم الهاتف مستخدم من قبل');
      }
      user.phone = req.body.phone;
    }

    // تغيير كلمة المرور (إذا أراد) - مع التحقق من كلمة المرور الحالية
    if (req.body.newPassword) {
      // التحقق من وجود كلمة المرور الحالية
      if (!req.body.currentPassword) {
        res.status(400);
        throw new Error('برجاء إدخال كلمة المرور الحالية لتغيير كلمة المرور');
      }

      // التحقق من صحة كلمة المرور الحالية
      const isPasswordMatch = await user.matchPassword(req.body.currentPassword);
      if (!isPasswordMatch) {
        res.status(401);
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }

      // تعيين كلمة المرور الجديدة
      user.password = req.body.newPassword;
    }

    const updatedUser = await user.save();
    const token = generateToken(updatedUser);

    // Update access token cookie
    res.cookie('access_token', token, ACCESS_TOKEN_COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      data: formatUserResponse(updatedUser, token)
    });
  } else {
    res.status(404);
    throw new Error('المستخدم غير موجود');
  }
});

/**
 * @desc    تحديث صورة البروفايل (مع رفع الملف)
 * @route   PUT /api/auth/avatar
 * @access  Private
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('المستخدم غير موجود');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('برجاء اختيار صورة');
  }

  // حذف الصورة القديمة من Cloudinary إذا كانت موجودة
  if (user.avatar) {
    try {
      // Extract public_id from Cloudinary URL
      const urlParts = user.avatar.split('/');
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = `e-learning/${publicIdWithExt.split('.')[0]}`;
      await deleteImage(publicId);
    } catch (error) {
      logger.error('خطأ في حذف الصورة القديمة:', error);
    }
  }

  // تحديث صورة البروفايل بالصورة الجديدة من Cloudinary
  user.avatar = req.file.path;
  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'تم تحديث صورة البروفايل بنجاح',
    data: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      role: updatedUser.role
    }
  });
});

/**
 * @desc    نسيت كلمة المرور - إرسال رابط إعادة التعيين
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('برجاء إدخال البريد الإلكتروني');
  }

  // البحث عن المستخدم
  const user = await User.findOne({ email });

  // إصلاح User Enumeration - رسالة عامة دائماً
  // حتى لو المستخدم غير موجود، نرسل رسالة نجاح
  if (!user) {
    res.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة إعادة تعيين كلمة المرور 📧',
    });
    return;
  }

  // التحقق من حالة الحظر (بدون كشف وجود الحساب)
  if (user.isBlocked) {
    res.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة إعادة تعيين كلمة المرور 📧',
    });
    return;
  }

  // إنشاء رمز إعادة التعيين
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // إنشاء رابط إعادة التعيين
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  try {
    // إرسال البريد الإلكتروني
    await sendEmail({
      to: user.email,
      subject: '🔐 إعادة تعيين كلمة المرور - E-Learning Platform',
      html: getResetPasswordTemplate(user.name, resetUrl),
    });

    res.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة إعادة تعيين كلمة المرور 📧',
    });
  } catch (error) {
    // في حالة فشل إرسال الإيميل، نحذف التوكن من الداتابيز
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error('Email send error:', error);
    // رسالة عامة حتى في حالة الخطأ
    res.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة إعادة تعيين كلمة المرور 📧',
    });
  }
});

/**
 * @desc    إعادة تعيين كلمة المرور باستخدام التوكن
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400);
    throw new Error('برجاء إدخال جميع البيانات المطلوبة');
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
  if (!passwordRegex.test(password)) {
    res.status(400);
    throw new Error('كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص (@$!%*?&)');
  }

  // تشفير التوكن المرسل ومقارنته بالمحفوظ في الداتابيز
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // البحث عن المستخدم بالتوكن المشفر والتأكد من أن التوكن لم ينتهي
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('رابط إعادة التعيين غير صالح أو منتهي الصلاحية. اطلب رابط جديد');
  }

  // تعيين كلمة المرور الجديدة
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'تم تعيين كلمة المرور الجديدة بنجاح! يمكنك تسجيل الدخول الآن 🎉',
  });
});

/**
 * @desc    الحصول على معلومات مستخدم (عامة - للبروفايل العام)
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getUserById = asyncHandler(async (req, res) => {
  // Email is intentionally excluded to prevent information leakage
  const user = await User.findById(req.params.id).select('name avatar bio role createdAt instructorProfile');

  if (!user) {
    res.status(404);
    throw new Error('المستخدم غير موجود');
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      instructorProfile: user.instructorProfile,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @desc    تجديد الـ Access Token باستخدام الـ Refresh Token
 * @route   POST /api/auth/refresh
 * @access  Public (cookie required)
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error('لا يوجد Refresh Token');
  }

  const hashed = hashRefreshToken(token);
  const user = await User.findOne({ refreshToken: hashed }).select('+refreshToken');

  if (!user) {
    res.status(401);
    throw new Error('Refresh Token غير صالح أو منتهي الصلاحية');
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error('تم حظر حسابك');
  }

  // Issue new access token
  const newAccessToken = generateToken(user);

  // Set new access token as HttpOnly cookie
  res.cookie('access_token', newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

  res.json({
    success: true,
    message: 'تم تجديد التوكن بنجاح',
    data: { token: newAccessToken },
  });
});

/**
 * @desc    تسجيل الخروج وحذف الـ Refresh Token
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // قفل الـ Active Session
  const token = req.cookies?.access_token || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    await deactivateSession(token, req.user._id);
  }

  // Clear refresh token from DB
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  // Clear all auth cookies
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
});

