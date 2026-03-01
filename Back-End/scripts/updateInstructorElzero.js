import mongoose from 'mongoose';
import Course from '../models/Course.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script لتحديث كل الكورسات ليكون المدرس Elzero Web School
 * مع تحديث اللوجو من Cloudinary
 */

const ELZERO_LOGO = 'https://res.cloudinary.com/dq6ftuott/image/upload/v1770764012/e87ff898-bac6-4820-a721-9bc9af59715c.png';
const ELZERO_NAME = 'Elzero Web School';

async function updateAllCoursesInstructor() {
  try {
    console.log('🔗 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح\n');

    // 1. البحث عن أو إنشاء مستخدم Elzero Web School
    let elzero = await User.findOne({ name: ELZERO_NAME });

    if (!elzero) {
      // البحث عن أي instructor موجود
      elzero = await User.findOne({ role: { $in: ['instructor', 'admin'] } });
    }

    if (elzero) {
      // تحديث بيانات المدرب الموجود
      console.log(`👨‍🏫 تم إيجاد المدرب: ${elzero.name} (${elzero._id})`);
      
      elzero.name = ELZERO_NAME;
      elzero.avatar = ELZERO_LOGO;
      elzero.role = elzero.role === 'admin' ? 'admin' : 'instructor';
      elzero.instructorProfile = {
        ...elzero.instructorProfile,
        bio: 'قناة تعليمية متخصصة في البرمجة وتطوير الويب',
        specialization: 'Web Development & Programming',
        website: 'https://elzero.org',
      };
      await elzero.save();
      console.log(`✅ تم تحديث بيانات المدرب:`);
      console.log(`   • الاسم: ${elzero.name}`);
      console.log(`   • اللوجو: ${ELZERO_LOGO}`);
    } else {
      console.log('⚠️  لا يوجد أي مدرب، سيتم إنشاء واحد...');
      elzero = await User.create({
        name: ELZERO_NAME,
        email: 'elzero@elearning.com',
        phone: '01000000001',
        password: 'Elzero@2024',
        role: 'instructor',
        avatar: ELZERO_LOGO,
        instructorProfile: {
          bio: 'قناة تعليمية متخصصة في البرمجة وتطوير الويب',
          specialization: 'Web Development & Programming',
          website: 'https://elzero.org',
        }
      });
      console.log(`✅ تم إنشاء المدرب: ${elzero.name} (${elzero._id})`);
    }

    // 2. تحديث كل الكورسات ليكون المدرس هو Elzero
    console.log('\n📚 جاري تحديث كل الكورسات...');
    const courses = await Course.find({});
    console.log(`   عدد الكورسات: ${courses.length}`);

    let updated = 0;
    for (const course of courses) {
      const oldInstructor = course.instructor;
      course.instructor = elzero._id;
      await course.save();
      updated++;
      console.log(`   ✅ [${updated}/${courses.length}] ${course.title} - تم التحديث`);
    }

    // 3. ملخص
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 تم التحديث بنجاح!');
    console.log(`   • المدرب: ${ELZERO_NAME}`);
    console.log(`   • اللوجو: ${ELZERO_LOGO}`);
    console.log(`   • عدد الكورسات المُحدثة: ${updated}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateAllCoursesInstructor();
