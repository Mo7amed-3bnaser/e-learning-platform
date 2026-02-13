import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Course from '../models/Course.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script لإصلاح التسجيل بعد إعادة إنشاء الكورس
 *
 * المشكلة: السكريبت القديم كان يحذف الكورس وينشئ واحد جديد بـ ID مختلف
 * فالتسجيل والطلبات كانت مرتبطة بالـ ID القديم
 */

const OLD_COURSE_IDS = [
  '6983bd0588b3aab6d3bb43e7', // الكورس الأصلي
  '698791d1e1ef57457b6838d1'  // الكورس اللي اتعمل في أول import
];

const NEW_COURSE_ID = '698797a6ded27662a473af81';

async function fixEnrollment() {
  try {
    console.log('🔗 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح\n');

    // التأكد إن الكورس الجديد موجود
    const newCourse = await Course.findById(NEW_COURSE_ID);
    if (!newCourse) {
      console.log('❌ الكورس الجديد غير موجود!');
      process.exit(1);
    }
    console.log(`📚 الكورس الجديد: ${newCourse.title} (${NEW_COURSE_ID})\n`);

    // 1. إصلاح enrolledCourses في الـ Users
    console.log('👥 جاري إصلاح تسجيل المستخدمين...');

    const oldIds = OLD_COURSE_IDS.map(id => new mongoose.Types.ObjectId(id));
    const newId = new mongoose.Types.ObjectId(NEW_COURSE_ID);

    // البحث عن كل المستخدمين اللي عندهم الكورس القديم
    const usersWithOldCourse = await User.find({
      enrolledCourses: { $in: oldIds }
    });

    console.log(`   وجدنا ${usersWithOldCourse.length} مستخدم مسجل بالكورس القديم`);

    let fixedUsers = 0;
    for (const user of usersWithOldCourse) {
      // شيل الـ IDs القديمة وحط الجديد
      user.enrolledCourses = user.enrolledCourses.filter(
        id => !OLD_COURSE_IDS.includes(id.toString())
      );

      // تأكد إن الكورس الجديد مش موجود قبل ما تضيفه
      if (!user.enrolledCourses.some(id => id.toString() === NEW_COURSE_ID)) {
        user.enrolledCourses.push(newId);
      }

      await user.save({ validateBeforeSave: false });
      fixedUsers++;
      console.log(`   ✅ تم إصلاح تسجيل: ${user.name} (${user.email})`);
    }

    // 2. إصلاح الـ Orders
    console.log('\n📋 جاري إصلاح الطلبات...');

    const ordersResult = await Order.updateMany(
      { courseId: { $in: oldIds } },
      { $set: { courseId: newId } }
    );

    console.log(`   ✅ تم تحديث ${ordersResult.modifiedCount} طلب`);

    // 3. تحديث عدد الطلاب المسجلين في الكورس
    const enrolledCount = await User.countDocuments({
      enrolledCourses: newId
    });

    await Course.findByIdAndUpdate(NEW_COURSE_ID, {
      enrolledStudents: enrolledCount
    });

    console.log(`\n📊 عدد الطلاب المسجلين الآن: ${enrolledCount}`);

    // ملخص
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 تم الإصلاح بنجاح!');
    console.log(`   • مستخدمين تم إصلاحهم: ${fixedUsers}`);
    console.log(`   • طلبات تم تحديثها: ${ordersResult.modifiedCount}`);
    console.log(`   • Course ID الجديد: ${NEW_COURSE_ID}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    process.exit(1);
  }
}

fixEnrollment();
