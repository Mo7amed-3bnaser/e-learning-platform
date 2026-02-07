import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'معرف الفيديو مطلوب']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المستخدم مطلوب']
    },
    content: {
      type: String,
      required: [true, 'محتوى التعليق مطلوب'],
      trim: true,
      minlength: [1, 'التعليق يجب أن يحتوي على حرف واحد على الأقل'],
      maxlength: [1000, 'التعليق يجب أن لا يتجاوز 1000 حرف']
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

// Index للاستعلامات الأسرع
commentSchema.index({ videoId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
