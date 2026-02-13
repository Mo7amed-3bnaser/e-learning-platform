import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const updateChannelLogo = async () => {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    const channelLogo = 'https://res.cloudinary.com/dq6ftuott/image/upload/v1770764012/e87ff898-bac6-4820-a721-9bc9af59715c.png';

    // تحديث جميع الكورسات
    const result = await Course.updateMany(
      {},
      { $set: { 'instructor.channelLogo': channelLogo } }
    );

    console.log(`✅ تم تحديث ${result.modifiedCount} كورس بنجاح`);
    console.log(`📝 عدد الكورسات الكلي: ${result.matchedCount}`);

    // عرض بعض الكورسات المحدثة
    const updatedCourses = await Course.find({}).select('title instructor.channelLogo').limit(5);
    console.log('\n📚 أمثلة على الكورسات المحدثة:');
    updatedCourses.forEach(course => {
      console.log(`   - ${course.title}: ${course.instructor?.channelLogo ? '✅' : '❌'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
};

updateChannelLogo();
