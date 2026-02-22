import mongoose from 'mongoose';

const activeSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    index: true,
  },
  deviceFingerprint: {
    type: String,
    required: true,
  },
  deviceInfo: {
    userAgent: String,
    browser: String,
    os: String,
    ip: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes لسرعة البحث
activeSessionSchema.index({ userId: 1, isActive: 1 });
activeSessionSchema.index({ token: 1, isActive: 1 });
activeSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }); // TTL: 7 أيام

const ActiveSession = mongoose.model('ActiveSession', activeSessionSchema);
export default ActiveSession;
