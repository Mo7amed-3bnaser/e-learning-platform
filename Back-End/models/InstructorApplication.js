import mongoose from 'mongoose';

const instructorApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    },
    phone: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      trim: true,
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

// Index for faster queries
instructorApplicationSchema.index({ userId: 1, status: 1 });

const InstructorApplication = mongoose.model(
  'InstructorApplication',
  instructorApplicationSchema
);

export default InstructorApplication;
