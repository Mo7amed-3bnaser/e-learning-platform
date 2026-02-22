import mongoose from 'mongoose';

const deviceLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
  firstLoginAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  loginCount: {
    type: Number,
    default: 1,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

// كل مستخدم + جهاز = سجل واحد
deviceLogSchema.index({ userId: 1, deviceFingerprint: 1 }, { unique: true });
deviceLogSchema.index({ userId: 1, firstLoginAt: -1 });

const DeviceLog = mongoose.model('DeviceLog', deviceLogSchema);
export default DeviceLog;
