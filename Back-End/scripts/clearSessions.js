import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const ActiveSession = mongoose.model('ActiveSession', new mongoose.Schema({}, { strict: false }));
const DeviceLog = mongoose.model('DeviceLog', new mongoose.Schema({}, { strict: false }));

const sessions = await ActiveSession.deleteMany({});
const devices = await DeviceLog.deleteMany({});

console.log('✅ Sessions deleted:', sessions.deletedCount);
console.log('✅ Device logs deleted:', devices.deletedCount);
console.log('🎉 تم رفع البلوك - يمكنك تسجيل الدخول الآن');

await mongoose.disconnect();
process.exit(0);
