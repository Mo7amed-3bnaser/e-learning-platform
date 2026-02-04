import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'معرف الكورس مطلوب']
    },
    title: {
      type: String,
      required: [true, 'عنوان الفيديو مطلوب'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    // Support for both YouTube and Bunny.net
    videoProvider: {
      type: String,
      enum: ['youtube', 'bunny'],
      default: 'youtube'
    },
    youtubeVideoId: {
      type: String,
      sparse: true // Allows null values, unique only if not null
    },
    bunnyVideoId: {
      type: String,
      sparse: true // Made optional for YouTube videos
    },
    duration: {
      type: Number, // in seconds
      required: [true, 'مدة الفيديو مطلوبة'],
      min: [1, 'مدة الفيديو يجب أن تكون على الأقل ثانية واحدة']
    },
    order: {
      type: Number,
      required: true,
      default: 0
    },
    isFreePreview: {
      type: Boolean,
      default: false
    },
    thumbnail: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
videoSchema.index({ courseId: 1, order: 1 });

const Video = mongoose.model('Video', videoSchema);

export default Video;
