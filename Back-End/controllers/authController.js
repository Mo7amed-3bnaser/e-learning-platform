import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken, formatUserResponse } from '../utils/authHelpers.js';
import { deleteImage } from '../config/cloudinary.js';

/**
 * @desc    تسجيل مستخدم جديد
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
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'تم التسجيل بنجاح! مرحباً بك 🎉',
      data: formatUserResponse(user, token)
    });
  } else {
    res.status(400);
    throw new Error('فشل إنشاء الحساب. حاول مرة أخرى');
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
