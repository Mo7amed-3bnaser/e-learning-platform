import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المستخدم مطلوب']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'معرف الكورس مطلوب']
    },
    paymentMethod: {
      type: String,
      enum: ['vodafone_cash', 'instapay', 'bank_transfer', 'sandbox'],
      required: [true, 'طريقة الدفع مطلوبة']
    },
    screenshotUrl: {
      type: String,
      required: function() {
        // الـ screenshot مش مطلوب في الـ sandbox mode
        return this.paymentMethod !== 'sandbox';
      }
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    price: {
      type: Number,
      required: true
    },
    rejectionReason: {
      type: String
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
