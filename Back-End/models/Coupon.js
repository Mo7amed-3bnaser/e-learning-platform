import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'كود الكوبون مطلوب'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'كود الكوبون يجب أن يكون 3 أحرف على الأقل'],
      maxlength: [20, 'كود الكوبون يجب أن لا يتجاوز 20 حرف'],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'نوع الخصم مطلوب'],
    },
    discountValue: {
      type: Number,
      required: [true, 'قيمة الخصم مطلوبة'],
      min: [0, 'قيمة الخصم لا يمكن أن تكون سالبة'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'الحد الأدنى لا يمكن أن يكون سالباً'],
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
      min: [0, 'الحد الأقصى للخصم لا يمكن أن يكون سالباً'],
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'حد الاستخدام يجب أن يكون 1 على الأقل'],
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    applicableCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, 'تاريخ انتهاء الكوبون مطلوب'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'الوصف يجب أن لا يتجاوز 200 حرف'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, expiryDate: 1 });

/**
 * Validate: percentage discount must be 1–100
 */
couponSchema.pre('validate', function (next) {
  if (this.discountType === 'percentage' && this.discountValue > 100) {
    this.invalidate('discountValue', 'نسبة الخصم لا يمكن أن تتجاوز 100%');
  }
  if (this.expiryDate && this.startDate && this.expiryDate <= this.startDate) {
    this.invalidate('expiryDate', 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية');
  }
  next();
});

/**
 * Check whether the coupon is currently valid (active, not expired, has remaining uses)
 */
couponSchema.methods.isValid = function () {
  const now = new Date();
  if (!this.isActive) return { valid: false, reason: 'الكوبون غير مفعل' };
  if (now < this.startDate) return { valid: false, reason: 'الكوبون لم يبدأ بعد' };
  if (now > this.expiryDate) return { valid: false, reason: 'الكوبون منتهي الصلاحية' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'تم استنفاد عدد الاستخدامات المتاحة للكوبون' };
  }
  return { valid: true };
};

/**
 * Check if a specific user has already used this coupon
 */
couponSchema.methods.isUsedByUser = function (userId) {
  return this.usedBy.some((entry) => entry.user.toString() === userId.toString());
};

/**
 * Check if the coupon is applicable to a specific course
 */
couponSchema.methods.isApplicableToCourse = function (courseId) {
  // If no specific courses, coupon applies to all
  if (!this.applicableCourses || this.applicableCourses.length === 0) return true;
  return this.applicableCourses.some((id) => id.toString() === courseId.toString());
};

/**
 * Calculate the discount for a given price
 */
couponSchema.methods.calculateDiscount = function (originalPrice) {
  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (originalPrice * this.discountValue) / 100;
  } else {
    // fixed
    discount = this.discountValue;
  }

  // Cap at maxDiscountAmount if set
  if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
    discount = this.maxDiscountAmount;
  }

  // Discount cannot exceed the price
  if (discount > originalPrice) {
    discount = originalPrice;
  }

  return Math.round(discount * 100) / 100; // round to 2 decimal places
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
