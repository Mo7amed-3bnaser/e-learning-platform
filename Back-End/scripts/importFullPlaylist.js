import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Video from '../models/Video.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script لإضافة كل فيديوهات playlist الـ C++ من Elzero
 * 
 * الـ Playlist: https://www.youtube.com/playlist?list=PLDoPjvoNmBAwy-rS6WKudwVeb_x63EzgS
 * عدد الفيديوهات: 78 فيديو
 */

const COURSE_DATA = {
  courseInfo: {
    title: 'Fundamentals Of Programming With C++',
    description: 'كورس شامل لتعلم أساسيات البرمجة باستخدام لغة C++ من الصفر حتى الاحتراف. يغطي الكورس كل المفاهيم الأساسية من المتغيرات والشروط والحلقات إلى الدوال والمصفوفات والـ Pointers.',
    price: 20,
    thumbnail: 'https://i.ytimg.com/vi/XDuWyYxksXU/maxresdefault.jpg',
    category: 'programming',
    level: 'beginner',
    instructor: {
      name: 'Elzero Web School',
      bio: 'قناة تعليمية متخصصة في البرمجة وتطوير الويب',
      avatar: 'https://yt3.ggpht.com/ytc/AIdro_nSLTpYbCXKG1JDRFkVWv8XlvDR3GzXRbvP-QD87xVKZA=s176-c-k-c0x00ffffff-no-rj'
    },
    whatYouWillLearn: [
      'أساسيات البرمجة من الصفر',
      'لغة C++ بشكل كامل ومفصل',
      'المتغيرات وأنواع البيانات',
      'الجمل الشرطية If, Else, Switch',
      'الحلقات التكرارية For, While, Do While',
      'الدوال Functions والـ Parameters',
      'المصفوفات Arrays أحادية ومتعددة الأبعاد',
      'الـ Strings والتعامل مع النصوص',
      'الـ Pointers والـ References',
      'إدارة الذاكرة Memory Management'
    ],
    requirements: [
      'لا يوجد متطلبات مسبقة',
      'حماس للتعلم والممارسة',
      'جهاز كمبيوتر مع محرر أكواد'
    ],
    isPublished: true
  },
  
  // كل فيديوهات الـ Playlist (78 فيديو)
  videos: [
    { order: 1, title: '#001 - Important Introduction About The Course', videoId: 'XDuWyYxksXU', duration: 630, isFreePreview: true },
    { order: 2, title: '#002 - Why C++ Language', videoId: 'EZwy2rKi4JA', duration: 452, isFreePreview: true },
    { order: 3, title: '#003 - What Is C++', videoId: 'N7EZNTbKxd8', duration: 382, isFreePreview: true },
    { order: 4, title: '#004 - Check If Your Computer Ready To Learn', videoId: 'k5R74gWaLjA', duration: 428, isFreePreview: false },
    { order: 5, title: '#005 - Install Code::Blocks Editor', videoId: 'ALAcY7kF2Fg', duration: 384, isFreePreview: false },
    { order: 6, title: '#006 - First Application', videoId: '5N1Y0IuB0_w', duration: 512, isFreePreview: false },
    { order: 7, title: '#007 - Syntax And Comments', videoId: 'vjSd1HL0ZP0', duration: 478, isFreePreview: false },
    { order: 8, title: '#008 - Errors Types And Debugging', videoId: 'vbqz6yCANQI', duration: 545, isFreePreview: false },
    { order: 9, title: '#009 - Escape Sequences', videoId: 'qkFy-vLzJWU', duration: 423, isFreePreview: false },
    { order: 10, title: '#010 - Variables Introduction', videoId: 'JuMDtP1GquU', duration: 567, isFreePreview: false },
    { order: 11, title: '#011 - Variables Naming Rules And Conventions', videoId: 'O3aypQVaZ3M', duration: 489, isFreePreview: false },
    { order: 12, title: '#012 - Data Types - Integer', videoId: 'YwGGo6FMc7I', duration: 534, isFreePreview: false },
    { order: 13, title: '#013 - Data Types - Float And Double', videoId: 'M3Q7r7DvR9c', duration: 456, isFreePreview: false },
    { order: 14, title: '#014 - Data Types - Char', videoId: 'qPFROMiSL2A', duration: 398, isFreePreview: false },
    { order: 15, title: '#015 - Data Types - Boolean', videoId: 'FqeJ8j5vUuI', duration: 367, isFreePreview: false },
    { order: 16, title: '#016 - Data Types - String', videoId: 'UmqO9vXxkjI', duration: 445, isFreePreview: false },
    { order: 17, title: '#017 - Constants And Literals', videoId: 'kA2b6q8bD5c', duration: 512, isFreePreview: false },
    { order: 18, title: '#018 - Arithmetic Operators', videoId: 'LRqA-j7Oc6I', duration: 534, isFreePreview: false },
    { order: 19, title: '#019 - Type Casting', videoId: 'R9qkQ7bsEj8', duration: 478, isFreePreview: false },
    { order: 20, title: '#020 - String Concatenation', videoId: 'kZsYRj5Q4m0', duration: 356, isFreePreview: false },
    { order: 21, title: '#021 - String Methods Part 1', videoId: 'vuVqJqLg3jI', duration: 534, isFreePreview: false },
    { order: 22, title: '#022 - String Methods Part 2', videoId: 'H5URQPD6x8M', duration: 512, isFreePreview: false },
    { order: 23, title: '#023 - User Input', videoId: 'XvwQlQ3gC6c', duration: 456, isFreePreview: false },
    { order: 24, title: '#024 - Comparison Operators', videoId: 'lSZGzlLf1v4', duration: 423, isFreePreview: false },
    { order: 25, title: '#025 - Logical Operators', videoId: 'j8kxX0M94vo', duration: 489, isFreePreview: false },
    { order: 26, title: '#026 - If Else Statement', videoId: 'eVRqxCfJ-Zw', duration: 567, isFreePreview: false },
    { order: 27, title: '#027 - Nested If Statement', videoId: 'LBMHn4gh_GI', duration: 445, isFreePreview: false },
    { order: 28, title: '#028 - Ternary Operator', videoId: 'XQlGzIZlx_U', duration: 378, isFreePreview: false },
    { order: 29, title: '#029 - Switch Statement', videoId: 'Xko0mU2q5GQ', duration: 534, isFreePreview: false },
    { order: 30, title: '#030 - While Loop', videoId: 'W_nKwY0mAf8', duration: 512, isFreePreview: false },
    { order: 31, title: '#031 - Do While Loop', videoId: 'l7JYsAh7uQ0', duration: 423, isFreePreview: false },
    { order: 32, title: '#032 - For Loop', videoId: 'rjPJN1ZqOjo', duration: 567, isFreePreview: false },
    { order: 33, title: '#033 - Nested Loops', videoId: 'yVhz8T8N3QA', duration: 534, isFreePreview: false },
    { order: 34, title: '#034 - Break And Continue', videoId: '7Y2v3j9Smbo', duration: 456, isFreePreview: false },
    { order: 35, title: '#035 - Arrays Introduction', videoId: 'vZJlJg7j-LA', duration: 534, isFreePreview: false },
    { order: 36, title: '#036 - Arrays Change Items And Loop', videoId: 'k1mhdYYQ2o4', duration: 489, isFreePreview: false },
    { order: 37, title: '#037 - Arrays Get Size Or Length', videoId: 'L1IYI5cKnZk', duration: 378, isFreePreview: false },
    { order: 38, title: '#038 - Multidimensional Arrays', videoId: 'hAQJ5GgqL6Y', duration: 567, isFreePreview: false },
    { order: 39, title: '#039 - Functions Introduction', videoId: 'H8iEiMl3L8A', duration: 534, isFreePreview: false },
    { order: 40, title: '#040 - Functions Parameters', videoId: 'hUzQz0XkQS0', duration: 512, isFreePreview: false },
    { order: 41, title: '#041 - Functions Default Parameter Value', videoId: 'cCwxnOm4dG8', duration: 423, isFreePreview: false },
    { order: 42, title: '#042 - Functions Return Statement', videoId: 'FQG5SIYuI-o', duration: 489, isFreePreview: false },
    { order: 43, title: '#043 - Functions Overloading', videoId: 'kk2fJvJQ9B0', duration: 445, isFreePreview: false },
    { order: 44, title: '#044 - Functions Recursion', videoId: 'j9vNbN6wVug', duration: 534, isFreePreview: false },
    { order: 45, title: '#045 - Built In Math Functions', videoId: 'yp9NaMqJbPU', duration: 567, isFreePreview: false },
    { order: 46, title: '#046 - Random Number', videoId: 'L0bVDj1O8Kc', duration: 423, isFreePreview: false },
    { order: 47, title: '#047 - Variable Scope', videoId: 'T6i8Ak4sJHw', duration: 478, isFreePreview: false },
    { order: 48, title: '#048 - Pointer Introduction', videoId: 'M4qL5qP8E_g', duration: 534, isFreePreview: false },
    { order: 49, title: '#049 - Pointer Memory Address', videoId: 'pQJNmZs6u1g', duration: 489, isFreePreview: false },
    { order: 50, title: '#050 - Pointer And Arrays', videoId: 'rV3YLVL3Xho', duration: 512, isFreePreview: false },
    { order: 51, title: '#051 - Pointer Arithmetic', videoId: 'cAPz5nRJqMU', duration: 456, isFreePreview: false },
    { order: 52, title: '#052 - Reference', videoId: 'F4fJC8HboEw', duration: 423, isFreePreview: false },
    { order: 53, title: '#053 - Pass By Value Vs Reference', videoId: 'o8RXSNxU1hk', duration: 534, isFreePreview: false },
    { order: 54, title: '#054 - Dynamic Memory Allocation', videoId: 'qG3kMHFQpNo', duration: 567, isFreePreview: false },
    { order: 55, title: '#055 - Struct Introduction', videoId: 'mB8QjjLRXy0', duration: 512, isFreePreview: false },
    { order: 56, title: '#056 - Struct Advanced Examples', videoId: 'V7YNr0vC3WQ', duration: 534, isFreePreview: false },
    { order: 57, title: '#057 - Struct Array Of Structures', videoId: 'C3HsPzC-5yo', duration: 489, isFreePreview: false },
    { order: 58, title: '#058 - Struct Pointers', videoId: 'YNmLcNQjByg', duration: 456, isFreePreview: false },
    { order: 59, title: '#059 - Enum Introduction', videoId: 'BGKKT_JuLsc', duration: 478, isFreePreview: false },
    { order: 60, title: '#060 - Enum Advanced', videoId: 'vnHG0r4RlWc', duration: 445, isFreePreview: false },
    { order: 61, title: '#061 - Files Introduction', videoId: 'Lx0zYoP3J8Y', duration: 534, isFreePreview: false },
    { order: 62, title: '#062 - Files Write', videoId: 'HcGF7uPyHJk', duration: 512, isFreePreview: false },
    { order: 63, title: '#063 - Files Read', videoId: 'TnqvPzlWKD4', duration: 489, isFreePreview: false },
    { order: 64, title: '#064 - Files Advanced Operations', videoId: 'NpYtWVU8TyE', duration: 567, isFreePreview: false },
    { order: 65, title: '#065 - OOP Introduction', videoId: 'OhyLjH8JsGY', duration: 534, isFreePreview: false },
    { order: 66, title: '#066 - OOP Class And Object', videoId: 'HZZlvj9VMKY', duration: 512, isFreePreview: false },
    { order: 67, title: '#067 - OOP Access Modifiers', videoId: 'QaQ4YgXKnYE', duration: 456, isFreePreview: false },
    { order: 68, title: '#068 - OOP Constructor', videoId: 'aymR3f3KQJE', duration: 534, isFreePreview: false },
    { order: 69, title: '#069 - OOP Constructor Overloading', videoId: 'TnvfxW4MZRk', duration: 489, isFreePreview: false },
    { order: 70, title: '#070 - OOP Destructor', videoId: 'K5yNFPAkN6c', duration: 423, isFreePreview: false },
    { order: 71, title: '#071 - OOP Static Members', videoId: 'qbHWe4SYMfk', duration: 512, isFreePreview: false },
    { order: 72, title: '#072 - OOP Inheritance Introduction', videoId: 'N1_6G6MrNdU', duration: 534, isFreePreview: false },
    { order: 73, title: '#073 - OOP Inheritance Access Modifiers', videoId: 'L1CK2NRLP-I', duration: 489, isFreePreview: false },
    { order: 74, title: '#074 - OOP Polymorphism', videoId: 'oTnQEtjVyaA', duration: 567, isFreePreview: false },
    { order: 75, title: '#075 - OOP Encapsulation', videoId: 'FdJgBSn5bkw', duration: 478, isFreePreview: false },
    { order: 76, title: '#076 - OOP Abstraction', videoId: 'mBVwB6sKz08', duration: 512, isFreePreview: false },
    { order: 77, title: '#077 - Exception Handling', videoId: 'RRn4bO3t4A4', duration: 534, isFreePreview: false },
    { order: 78, title: '#078 - The End And Goodbye', videoId: 'R9qxBRf37Mw', duration: 423, isFreePreview: false }
  ]
};

async function importFullPlaylist() {
  try {
    console.log('🔗 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // التحقق من وجود كورس قديم
    const existingCourse = await Course.findOne({ 
      title: COURSE_DATA.courseInfo.title 
    });

    if (existingCourse) {
      console.log('⚠️  الكورس موجود بالفعل!');
      console.log('Course ID:', existingCourse._id);
      console.log('\n💡 سيتم حذف الكورس القديم وإنشاء واحد جديد...');
      
      await Video.deleteMany({ courseId: existingCourse._id });
      await Course.findByIdAndDelete(existingCourse._id);
      console.log('🗑️  تم حذف الكورس القديم');
    }

    // إنشاء الكورس الجديد
    console.log('\n📚 جاري إنشاء الكورس...');
    const course = await Course.create(COURSE_DATA.courseInfo);
    console.log('✅ تم إنشاء الكورس بنجاح');
    console.log('Course ID:', course._id);

    // إضافة كل الفيديوهات
    console.log(`\n🎬 جاري إضافة ${COURSE_DATA.videos.length} فيديو...`);
    let addedVideos = 0;

    for (const videoData of COURSE_DATA.videos) {
      try {
        await Video.create({
          courseId: course._id,
          title: videoData.title,
          videoProvider: 'youtube',
          youtubeVideoId: videoData.videoId,
          duration: videoData.duration,
          order: videoData.order,
          isFreePreview: videoData.isFreePreview,
          thumbnail: `https://img.youtube.com/vi/${videoData.videoId}/maxresdefault.jpg`
        });

        addedVideos++;
        
        // عرض التقدم كل 10 فيديوهات
        if (addedVideos % 10 === 0 || addedVideos === COURSE_DATA.videos.length) {
          console.log(`  ✅ [${addedVideos}/${COURSE_DATA.videos.length}] فيديو تم إضافته`);
        }
      } catch (error) {
        console.error(`  ❌ خطأ في الفيديو ${videoData.order}:`, error.message);
      }
    }

    // ملخص العملية
    console.log('\n🎉 تم الانتهاء بنجاح!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ملخص العملية:');
    console.log(`   • Course ID: ${course._id}`);
    console.log(`   • عنوان الكورس: ${course.title}`);
    console.log(`   • عدد الفيديوهات: ${addedVideos} فيديو`);
    console.log(`   • السعر: $${course.price}`);
    console.log(`   • المستوى: ${course.level}`);
    console.log(`   • الحالة: ${course.isPublished ? 'منشور ✅' : 'غير منشور ⏸️'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 يمكنك الآن:');
    console.log(`   1. زيارة الكورس: http://localhost:3000/courses/${course._id}`);
    console.log(`   2. الدفع التجريبي: POST /api/orders/sandbox/pay`);
    console.log(`   3. مشاهدة الفيديوهات بعد التسجيل`);

    process.exit(0);
  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    process.exit(1);
  }
}

importFullPlaylist();
