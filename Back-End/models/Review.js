import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'معرف الكورس مطلوب']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المستخدم مطلوب']
    },
    rating: {
      type: Number,
      required: [true, 'التقييم مطلوب'],
      min: [1, 'التقييم يجب أن يكون على الأقل 1'],
      max: [5, 'التقييم يجب أن لا يتجاوز 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'التعليق يجب أن لا يتجاوز 500 حرف']
    },
    userName: {
      type: String,
      required: true
    },
    userAvatar: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Compound index: one review per user per course
reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Index for faster queries
reviewSchema.index({ courseId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
