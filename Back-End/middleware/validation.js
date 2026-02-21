import { body, param, validationResult } from "express-validator";

/**
 * Reusable: validates that a route param is a valid MongoDB ObjectId
 * Usage: router.get('/:id', validateMongoId('id'), validate, controller)
 */
export const validateMongoId = (paramName = 'id') =>
  param(paramName)
    .isMongoId()
    .withMessage(`المعرف (${paramName}) غير صحيح`);

/**
 * Convenience: validate the standard :id param
 * Usage: router.get('/:id', validateIdParam, validate, handler)
 */
export const validateIdParam = [
  validateMongoId('id'),
];

/**
 * Middleware للتحقق من نتائج الـ Validation
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: "خطأ في البيانات المدخلة",
      errors: formattedErrors,
    });
  }

  next();
};

/**
 * Validation للتسجيل
 */
export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("الاسم مطلوب")
    .isLength({ min: 3 })
    .withMessage("الاسم يجب أن يكون 3 أحرف على الأقل"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("البريد الإلكتروني مطلوب")
    .isEmail()
    .withMessage("البريد الإلكتروني غير صالح"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("رقم الهاتف مطلوب")
    .matches(/^01[0125][0-9]{8}$/)
    .withMessage("رقم الهاتف يجب أن يكون 11 رقم مصري صحيح"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("كلمة المرور مطلوبة")
    .isLength({ min: 8 })
    .withMessage("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص (@$!%*?&)"),
];

/**
 * Validation لتسجيل الدخول
 */
export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("البريد الإلكتروني مطلوب")
    .isEmail()
    .withMessage("البريد الإلكتروني غير صالح"),

  body("password").trim().notEmpty().withMessage("كلمة المرور مطلوبة"),
];

/**
 * Validation لإنشاء كورس
 */
export const createCourseValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("عنوان الكورس مطلوب")
    .isLength({ min: 5 })
    .withMessage("العنوان يجب أن يكون 5 أحرف على الأقل"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("وصف الكورس مطلوب")
    .isLength({ min: 20 })
    .withMessage("الوصف يجب أن يكون 20 حرف على الأقل"),

  body("price")
    .notEmpty()
    .withMessage("السعر مطلوب")
    .isNumeric()
    .withMessage("السعر يجب أن يكون رقم")
    .custom((value) => value >= 0)
    .withMessage("السعر لا يمكن أن يكون سالباً"),

  body("thumbnail")
    .trim()
    .notEmpty()
    .withMessage("صورة الكورس مطلوبة")
    .isURL()
    .withMessage("رابط الصورة غير صحيح"),

  body("category").trim().notEmpty().withMessage("تصنيف الكورس مطلوب"),
];

/**
 * Validation لإضافة فيديو
 */
export const addVideoValidation = [
  body("courseId")
    .trim()
    .notEmpty()
    .withMessage("معرف الكورس مطلوب")
    .isMongoId()
    .withMessage("معرف الكورس غير صحيح"),

  body("title").trim().notEmpty().withMessage("عنوان الفيديو مطلوب"),

  body("videoProvider")
    .optional()
    .isIn(["youtube", "bunny"])
    .withMessage("مزود الفيديو يجب أن يكون youtube أو bunny"),

  body("youtubeVideoId")
    .if(body("videoProvider").equals("youtube"))
    .trim()
    .notEmpty()
    .withMessage("معرف فيديو YouTube مطلوب عند اختيار youtube كمزود"),

  body("bunnyVideoId")
    .if(body("videoProvider").equals("bunny"))
    .trim()
    .notEmpty()
    .withMessage("معرف فيديو Bunny مطلوب عند اختيار bunny كمزود"),

  body("duration")
    .notEmpty()
    .withMessage("مدة الفيديو مطلوبة")
    .isNumeric()
    .withMessage("المدة يجب أن تكون رقم"),

  body("order")
    .notEmpty()
    .withMessage("ترتيب الفيديو مطلوب")
    .isNumeric()
    .withMessage("الترتيب يجب أن يكون رقم"),
];

/**
 * Validation لإنشاء طلب
 */
export const createOrderValidation = [
  body("courseId")
    .trim()
    .notEmpty()
    .withMessage("معرف الكورس مطلوب")
    .isMongoId()
    .withMessage("معرف الكورس غير صحيح"),

  body("paymentMethod")
    .trim()
    .notEmpty()
    .withMessage("طريقة الدفع مطلوبة")
    .isIn(["vodafone_cash", "instapay", "bank_transfer"])
    .withMessage("طريقة الدفع غير صحيحة"),

  body("screenshotUrl")
    .trim()
    .notEmpty()
    .withMessage("صورة التحويل مطلوبة")
    .isURL()
    .withMessage("رابط الصورة غير صحيح"),
];

/**
 * Validation لإنشاء كوبون
 */
export const createCouponValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('كود الكوبون مطلوب')
    .isLength({ min: 3, max: 20 })
    .withMessage('كود الكوبون يجب أن يكون بين 3 و 20 حرف')
    .matches(/^[A-Za-z0-9_%.-]+$/)
    .withMessage('كود الكوبون يجب أن يحتوي على أحرف وأرقام ورموز مسموحة فقط (% _ - .)'),

  body('discountType')
    .trim()
    .notEmpty()
    .withMessage('نوع الخصم مطلوب')
    .isIn(['percentage', 'fixed'])
    .withMessage('نوع الخصم يجب أن يكون percentage أو fixed'),

  body('discountValue')
    .notEmpty()
    .withMessage('قيمة الخصم مطلوبة')
    .isFloat({ min: 0 })
    .withMessage('قيمة الخصم يجب أن تكون رقم موجب'),

  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('الحد الأدنى يجب أن يكون رقم موجب'),

  body('maxDiscountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('الحد الأقصى للخصم يجب أن يكون رقم موجب'),

  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('حد الاستخدام يجب أن يكون عدد صحيح أكبر من 0'),

  body('expiryDate')
    .notEmpty()
    .withMessage('تاريخ انتهاء الكوبون مطلوب')
    .isISO8601()
    .withMessage('تاريخ الانتهاء غير صحيح'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('تاريخ البداية غير صحيح'),

  body('applicableCourses')
    .optional()
    .isArray()
    .withMessage('الكورسات المحددة يجب أن تكون مصفوفة'),

  body('applicableCourses.*')
    .optional()
    .isMongoId()
    .withMessage('معرف الكورس غير صحيح'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('الوصف يجب أن لا يتجاوز 200 حرف'),
];

/**
 * Validation لتطبيق كوبون
 */
export const applyCouponValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('كود الكوبون مطلوب'),

  body('courseId')
    .trim()
    .notEmpty()
    .withMessage('معرف الكورس مطلوب')
    .isMongoId()
    .withMessage('معرف الكورس غير صحيح'),
];

/**
 * Validation for review
 */
export const reviewValidation = [
  body("courseId")
    .trim()
    .notEmpty()
    .withMessage("معرف الكورس مطلوب")
    .isMongoId()
    .withMessage("معرف الكورس غير صحيح"),

  body("rating")
    .notEmpty()
    .withMessage("التقييم مطلوب")
    .isInt({ min: 1, max: 5 })
    .withMessage("التقييم يجب أن يكون بين 1 و 5"),

  body("comment")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("التعليق يجب أن لا يتجاوز 500 حرف"),
];
