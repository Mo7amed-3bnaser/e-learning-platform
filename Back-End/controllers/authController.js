import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken, formatUserResponse } from '../utils/authHelpers.js';
import { deleteImage } from '../config/cloudinary.js';
import sendEmail, { getResetPasswordTemplate, getEmailVerificationTemplate } from '../utils/sendEmail.js';

/**
 * @desc    تسجيل مستخدم جديد (مع إرسال إيميل تأكيد)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // التحقق من وجود جميع البيانات
  if (!name || !email || !phone || !password) {
    res.status(400);
    throw new Error('برجاء إدخال جميع البيانات المطلوبة');
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
    password // will be hashed automatically by pre-save hook
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

      console.error('Email send error:', error);
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

    console.error('Email send error:', error);
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

  // التحقق من كلمة المرور
  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    res.status(401);
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // التحقق من تأكيد البريد الإلكتروني (الأدمن معفي)
  if (!user.isEmailVerified && user.role !== 'admin') {
    res.status(403);
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  // إنشاء التوكن
  const token = generateToken(user);

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
  const user = await User.findById(req.user._id);

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
    }

    if (req.body.phone && req.body.phone !== user.phone) {
      const phoneExists = await User.findOne({ phone: req.body.phone });
      if (phoneExists) {
        res.status(400);
        throw new Error('رقم الهاتف مستخدم من قبل');
      }
      user.phone = req.body.phone;
    }

    // تغيير كلمة المرور (إذا أراد)
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const token = generateToken(updatedUser);

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
      console.error('خطأ في حذف الصورة القديمة:', error);
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

  if (!user) {
    res.status(404);
    throw new Error('لا يوجد حساب مرتبط بهذا البريد الإلكتروني');
  }

  // التحقق من حالة الحظر
  if (user.isBlocked) {
    res.status(403);
    throw new Error('تم حظر حسابك. تواصل مع الدعم الفني');
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
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني 📧',
    });
  } catch (error) {
    // في حالة فشل إرسال الإيميل، نحذف التوكن من الداتابيز
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('Email send error:', error);
    res.status(500);
    throw new Error('فشل إرسال البريد الإلكتروني. حاول مرة أخرى لاحقاً');
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

  if (password.length < 6) {
    res.status(400);
    throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
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
