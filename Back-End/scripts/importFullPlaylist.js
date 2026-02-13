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
  
  // كل فيديوهات الـ Playlist (78 فيديو) - بيانات حقيقية من YouTube
  videos: [
    { order: 1, title: '#001 - Important Introduction About The Course', videoId: 'XDuWyYxksXU', duration: 650, isFreePreview: true },
    { order: 2, title: '#002 - Why C++ Language', videoId: 'jOUb09iiO20', duration: 472, isFreePreview: true },
    { order: 3, title: '#003 - Install VSC Editor, Compiler And Debugger', videoId: 'R-Hu5rdn-vc', duration: 1246, isFreePreview: true },
    { order: 4, title: '#004 - Install Visual Studio And Answer Questions', videoId: 'RWtT07Id-n4', duration: 1297, isFreePreview: false },
    { order: 5, title: '#005 - How The C++ Works', videoId: 'FVV4kTy0dJg', duration: 497, isFreePreview: false },
    { order: 6, title: '#006 - Preprocessing, Compiling And Linking', videoId: '1K1sET8dDrI', duration: 334, isFreePreview: false },
    { order: 7, title: '#007 - C++ Language Syntax', videoId: 'NeHu899_uYA', duration: 725, isFreePreview: false },
    { order: 8, title: '#008 - Comments And Use Cases', videoId: '6UoFcvARKI4', duration: 895, isFreePreview: false },
    { order: 9, title: '#009 - Variables Basic Knowledge', videoId: 'R2zqj_52WwU', duration: 630, isFreePreview: false },
    { order: 10, title: '#010 - Variables Naming Rules And Best Practices', videoId: 'A6B4tlaPapo', duration: 666, isFreePreview: false },
    { order: 11, title: '#011 - Variables Advanced Knowledge', videoId: 'J_vnlD5Ca-U', duration: 479, isFreePreview: false },
    { order: 12, title: '#012 - Variables Scope', videoId: 'HHl6YF6GUhw', duration: 316, isFreePreview: false },
    { order: 13, title: '#013 - Variables - Constant Variable', videoId: 'zBhT544Xy0o', duration: 572, isFreePreview: false },
    { order: 14, title: '#014 - Calculate Your Age Application', videoId: 'cS0tbixHmdI', duration: 474, isFreePreview: false },
    { order: 15, title: '#015 - Escape Sequences Characters', videoId: '7hM-MBheZ-w', duration: 667, isFreePreview: false },
    { order: 16, title: '#016 - Data Types - What Is Data ?', videoId: 'BibCqAo5ZsQ', duration: 483, isFreePreview: false },
    { order: 17, title: '#017 - Data Types, Sizes And Memory', videoId: 'MrwqesK64aU', duration: 685, isFreePreview: false },
    { order: 18, title: '#018 - Data Types - Integer', videoId: '739Wvc6XqDM', duration: 582, isFreePreview: false },
    { order: 19, title: '#019 - Data Types - Float And Double', videoId: '8efyLVOfd4E', duration: 393, isFreePreview: false },
    { order: 20, title: '#020 - Data Types - Char And ASCII', videoId: 'BIQplCgmB2o', duration: 454, isFreePreview: false },
    { order: 21, title: '#021 - Data Types - Bool And Void', videoId: 'rqXv-mKqw5Y', duration: 628, isFreePreview: false },
    { order: 22, title: '#022 - Data Types - Modifiers And Type Alias', videoId: 'ZX2DLrnCR3w', duration: 807, isFreePreview: false },
    { order: 23, title: '#023 - Data Types - Type Conversion', videoId: 'N68m5IxR_zw', duration: 529, isFreePreview: false },
    { order: 24, title: '#024 - Operators - Arithmetic Operators', videoId: 'AQyni1r43T0', duration: 777, isFreePreview: false },
    { order: 25, title: '#025 - Operators - Assignment Operators', videoId: 'nCO0KZ67b1Q', duration: 474, isFreePreview: false },
    { order: 26, title: '#026 - Operators - Increment And Decrement Operators', videoId: 'RWVrMQpvVxU', duration: 344, isFreePreview: false },
    { order: 27, title: '#027 - Operators - Comparison Operators', videoId: 'xpznDlbgQPM', duration: 382, isFreePreview: false },
    { order: 28, title: '#028 - Operators - Logical Operators', videoId: '41v0w8BjJms', duration: 604, isFreePreview: false },
    { order: 29, title: '#029 - Operators - Precedence', videoId: 'e0Gz1_ceuMU', duration: 448, isFreePreview: false },
    { order: 30, title: '#030 - Control Flow - If Condition Introduction', videoId: 'QmUR0ZIrXQA', duration: 362, isFreePreview: false },
    { order: 31, title: '#031 - Control Flow - If, Else If, Else', videoId: 'l67qWVYe-xo', duration: 369, isFreePreview: false },
    { order: 32, title: '#032 - Control Flow - Nested If Conditions', videoId: 'Ps0xSAXmULA', duration: 280, isFreePreview: false },
    { order: 33, title: '#033 - Control Flow - Ternary Conditional Operator', videoId: 'Ang11UuVE30', duration: 229, isFreePreview: false },
    { order: 34, title: '#034 - Control Flow - Nested Ternary Operator', videoId: '8ptGpQ_2Np8', duration: 472, isFreePreview: false },
    { order: 35, title: '#035 - Condition Trainings - Create Four Application', videoId: 'KWRFfCToxiY', duration: 1335, isFreePreview: false },
    { order: 36, title: '#036 - Control Flow - Switch Case', videoId: 'OK1uu-axN0E', duration: 480, isFreePreview: false },
    { order: 37, title: '#037 - Switch Training - Create Three Application', videoId: 'w8WnxLZmctg', duration: 616, isFreePreview: false },
    { order: 38, title: '#038 - Array - What Is Array ?', videoId: 'NWP1cTeDFVY', duration: 348, isFreePreview: false },
    { order: 39, title: '#039 - Array - Access Elements & Memory Location', videoId: '4DkdiXp5rYw', duration: 217, isFreePreview: false },
    { order: 40, title: '#040 - Array - Add And Update Elements', videoId: '4v5hDgUDK9Q', duration: 579, isFreePreview: false },
    { order: 41, title: '#041 - Array - Two Dimensional Array', videoId: '2pG43LVr_Sw', duration: 455, isFreePreview: false },
    { order: 42, title: '#042 - Array - Class Array', videoId: 'dNCryC9CzQQ', duration: 446, isFreePreview: false },
    { order: 43, title: '#043 - Array - Methods Discussions', videoId: 'lylQR-hFV-M', duration: 403, isFreePreview: false },
    { order: 44, title: '#044 - Array Trainings - Guess The Number Game', videoId: 'Ne7RthIdaok', duration: 549, isFreePreview: false },
    { order: 45, title: '#045 - String - What Is A String', videoId: 'oyYC2dOekeU', duration: 741, isFreePreview: false },
    { order: 46, title: '#046 - String - Concatenating', videoId: 'PJeNjjQcrG8', duration: 277, isFreePreview: false },
    { order: 47, title: '#047 - Loop With For', videoId: '_eYTdzypBIY', duration: 480, isFreePreview: false },
    { order: 48, title: '#048 - Loop With For - Advanced Syntax', videoId: 'p0pCO7gPfmQ', duration: 488, isFreePreview: false },
    { order: 49, title: '#049 - Loop With For - Advanced Trainings', videoId: 'DoY-G3Fwy4g', duration: 496, isFreePreview: false },
    { order: 50, title: '#050 - Loop With For - Nested Loop', videoId: 'ykpDu3swciM', duration: 395, isFreePreview: false },
    { order: 51, title: '#051 - Loop With While', videoId: 'pbu11F6X9Yg', duration: 381, isFreePreview: false },
    { order: 52, title: '#052 - Loop With Do While', videoId: '3ESx17kVUKo', duration: 345, isFreePreview: false },
    { order: 53, title: '#053 - Loop - Break, Continue', videoId: '5rtyV-WOIpA', duration: 466, isFreePreview: false },
    { order: 54, title: '#054 - Loop Training Create Three Apps', videoId: 'q2BVplB0RgI', duration: 984, isFreePreview: false },
    { order: 55, title: '#055 - Function - Introduction', videoId: 'Gkg8NmfUCjg', duration: 501, isFreePreview: false },
    { order: 56, title: '#056 - Function With Parameter', videoId: 'MBvixzJw2sQ', duration: 616, isFreePreview: false },
    { order: 57, title: '#057 - Function With Parameter Training', videoId: 'wOBMuQUlKNY', duration: 456, isFreePreview: false },
    { order: 58, title: '#058 - Function Parameter Default Value', videoId: 'qBojueEZxjs', duration: 284, isFreePreview: false },
    { order: 59, title: '#059 - Function - Passing Array As Parameter', videoId: 'kApYul6wN3A', duration: 469, isFreePreview: false },
    { order: 60, title: '#060 - Function - Return Statement + Void', videoId: '2NPd8KgneBQ', duration: 719, isFreePreview: false },
    { order: 61, title: '#061 - Function - Forward Declaration', videoId: 'ErBDovJ3eTk', duration: 293, isFreePreview: false },
    { order: 62, title: '#062 - Built-In Functions - Math Functions', videoId: 'wyFLcNCCaas', duration: 567, isFreePreview: false },
    { order: 63, title: '#063 - Built-In Functions - Training - Create 2 Apps', videoId: 'AU_wSvenbI8', duration: 735, isFreePreview: false },
    { order: 64, title: '#064 - Built-In Functions - Training - Create 3 Apps', videoId: 'bpXRvo4IH-0', duration: 703, isFreePreview: false },
    { order: 65, title: '#065 - Function Overloading', videoId: 'I_AzDYyhlMU', duration: 425, isFreePreview: false },
    { order: 66, title: '#066 - Function Recursion', videoId: 'djgs6PnNl2w', duration: 502, isFreePreview: false },
    { order: 67, title: '#067 - Vector - What Is Vector', videoId: '55MRxgVOkMo', duration: 527, isFreePreview: false },
    { order: 68, title: '#068 - Vector Versus Array', videoId: 'OIJsJrNJKUc', duration: 609, isFreePreview: false },
    { order: 69, title: '#069 - Vector - Access, Add, Update And Delete', videoId: 'QSmQylbugAg', duration: 364, isFreePreview: false },
    { order: 70, title: '#070 - Vector - Functions', videoId: 'JrPhJtFuwqU', duration: 286, isFreePreview: false },
    { order: 71, title: '#071 - Vector - Iterator And Why To Use', videoId: '_RE-naCqphE', duration: 557, isFreePreview: false },
    { order: 72, title: '#072 - Vector - Traversing With Iterator', videoId: 'DgJqgq5Is0Y', duration: 367, isFreePreview: false },
    { order: 73, title: '#073 - Vector - Loop With Iterator And Ranged Loop', videoId: 'RoKGZi4ArFo', duration: 273, isFreePreview: false },
    { order: 74, title: '#074 - Vector - Use Iterator To Count, Sort & Reverse', videoId: 'Qm14ePexV10', duration: 308, isFreePreview: false },
    { order: 75, title: '#075 - Pointers - What Are Pointers ?', videoId: 's6sb23dglxs', duration: 461, isFreePreview: false },
    { order: 76, title: '#076 - Pointers - Pointing To Array', videoId: '9ALw6qoCvk8', duration: 278, isFreePreview: false },
    { order: 77, title: '#077 - Pointers - Void And Wild Pointer And Null', videoId: '9ZE8HAHyp4I', duration: 300, isFreePreview: false },
    { order: 78, title: '#078 - Pointers - Arithmetic And Array', videoId: 'Mlo7_fUG4N0', duration: 404, isFreePreview: false }
  ]
};

async function importFullPlaylist() {
  try {
    console.log('🔗 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // التحقق من وجود كورس قديم
    let course = await Course.findOne({
      title: COURSE_DATA.courseInfo.title
    });

    if (course) {
      // الكورس موجود - نحدّثه ونحذف الفيديوهات القديمة بس
      console.log('📚 الكورس موجود بالفعل، سيتم تحديث الفيديوهات فقط');
      console.log('Course ID:', course._id);

      // تحديث بيانات الكورس لو اتغيرت
      Object.assign(course, COURSE_DATA.courseInfo);
      await course.save();
      console.log('✅ تم تحديث بيانات الكورس');

      // حذف الفيديوهات القديمة بس (الكورس يفضل زي ما هو)
      const deletedVideos = await Video.deleteMany({ courseId: course._id });
      console.log(`🗑️  تم حذف ${deletedVideos.deletedCount} فيديو قديم`);
    } else {
      // إنشاء كورس جديد لأول مرة
      console.log('\n📚 جاري إنشاء الكورس لأول مرة...');
      course = await Course.create(COURSE_DATA.courseInfo);
      console.log('✅ تم إنشاء الكورس بنجاح');
      console.log('Course ID:', course._id);
    }

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
