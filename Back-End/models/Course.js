import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'عنوان الكورس مطلوب'],
      trim: true,
      minlength: [5, 'عنوان الكورس يجب أن يكون 5 أحرف على الأقل']
    },
    description: {
      type: String,
      required: [true, 'وصف الكورس مطلوب'],
      minlength: [20, 'الوصف يجب أن يكون 20 حرف على الأقل']
    },
    price: {
      type: Number,
      required: [true, 'سعر الكورس مطلوب'],
      min: [0, 'السعر لا يمكن أن يكون سالباً']
    },
    thumbnail: {
      type: String,
      required: [true, 'صورة الكورس مطلوبة']
    },
    instructor: {
      name: {
        type: String,
        required: true
      },
      bio: String,
      avatar: String
    },
    category: {
      type: String,
      required: [true, 'تصنيف الكورس مطلوب'],
      enum: ['programming', 'design', 'marketing', 'business', 'language', 'other']
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    enrolledStudents: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    whatYouWillLearn: [
      {
        type: String
      }
    ],
    requirements: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate for videos
courseSchema.virtual('videos', {
  ref: 'Video',
  localField: '_id',
  foreignField: 'courseId'
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
