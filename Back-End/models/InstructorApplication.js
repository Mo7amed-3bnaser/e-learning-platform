import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const instructorApplicationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'الاسم الأول مطلوب'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'الاسم الأخير مطلوب'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
      select: false, // Don't return password by default
    },
    specialization: {
      type: String,
      required: [true, 'التخصص مطلوب'],
      trim: true,
    },
    yearsOfExperience: {
      type: String,
      required: [true, 'سنوات الخبرة مطلوبة'],
    },
    bio: {
      type: String,
      required: [true, 'النبذة مطلوبة'],
    },
    qualifications: {
      type: String,
      required: [true, 'المؤهلات مطلوبة'],
    },
    linkedin: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    whyInstructor: {
      type: String,
      required: [true, 'السبب مطلوب'],
    },
    courseTopics: {
      type: String,
      required: [true, 'مواضيع الدورات مطلوبة'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
instructorApplicationSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Index for faster queries
instructorApplicationSchema.index({ email: 1, status: 1 });

const InstructorApplication = mongoose.model(
  'InstructorApplication',
  instructorApplicationSchema
);

export default InstructorApplication;
