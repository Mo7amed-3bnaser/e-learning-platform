import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

/**
 * Script لإنشاء أول مستخدم Admin
 */
const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // بيانات الأدمن (غيرها بأي بيانات تحبها)
    const adminData = {
      name: 'Admin',
      email: 'admin@elearning.com',
      phone: '01000000000',
      password: '123456',
      role: 'admin'
    };

    // التحقق من وجود أدمن
    const adminExists = await User.findOne({ email: adminData.email });

    if (adminExists) {
      console.log('❌ Admin already exists!');
      process.exit(0);
    }

    // إنشاء الأدمن
    const admin = await User.create(adminData);

    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Name:', admin.name);
    console.log('\n⚠️  تذكر تغيير كلمة المرور بعد أول دخول!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
