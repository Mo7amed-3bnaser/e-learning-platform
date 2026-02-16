import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'المستخدم مطلوب'],
      index: true,
    },
    type: {
      type: String,
      enum: [
        'order_approved',
        'order_rejected',
        'course_enrolled',
        'certificate_issued',
        'comment_reply',
        'instructor_approved',
        'instructor_rejected',
        'course_published',
        'new_review',
      ],
      required: [true, 'نوع الإشعار مطلوب'],
    },
    title: {
      type: String,
      required: [true, 'عنوان الإشعار مطلوب'],
      trim: true,
      maxlength: [200, 'العنوان يجب ألا يتجاوز 200 حرف'],
    },
    message: {
      type: String,
      required: [true, 'رسالة الإشعار مطلوبة'],
      trim: true,
      maxlength: [500, 'الرسالة يجب ألا تتجاوز 500 حرف'],
    },
    link: {
      type: String,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
      certificateId: {
        type: String,
      },
      reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index للبحث السريع
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// Method لتحديد الإشعار كمقروء
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  return await this.save();
};

// Static method لإنشاء إشعار جديد
notificationSchema.statics.createNotification = async function (data) {
  return await this.create(data);
};

// Static method لتحديد كل إشعارات المستخدم كمقروءة
notificationSchema.statics.markAllAsRead = async function (userId) {
  return await this.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
};

// Static method لحذف الإشعارات القديمة (أكثر من 30 يوم)
notificationSchema.statics.deleteOldNotifications = async function () {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return await this.deleteMany({
    createdAt: { $lt: thirtyDaysAgo },
    isRead: true,
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
