import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Video from '../models/Video.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script لإضافة كل فيديوهات playlist الـ HTML من Elzero
 * 
 * الـ Playlist: https://www.youtube.com/playlist?list=PLDoPjvoNmBAw_t_XWUFbBX-c9MafPk9ji
 * عدد الفيديوهات: 37 فيديو
 */

const COURSE_DATA = {
  courseInfo: {
    title: 'Learn HTML In Arabic 2021',
    description: 'كورس شامل لتعلم لغة HTML من الصفر حتى الاحتراف باللغة العربية. يغطي الكورس كل العناصر والوسوم الأساسية في HTML بما فيها النماذج والجداول والوسائط المتعددة والـ Semantic Elements والـ Accessibility.',
    price: 5,
    thumbnail: 'https://i.ytimg.com/vi/6QAELgirvjs/maxresdefault.jpg',
    category: 'web',
    level: 'beginner',
    instructor: {
      name: 'Elzero Web School',
      bio: 'قناة تعليمية متخصصة في البرمجة وتطوير الويب',
      avatar: 'https://yt3.ggpht.com/BfSdc0xKk9Gx5ge5cHQm9uzNV4zyJ7RCWSmnoMwbIvAE3xqdYWQV_b_TGVQTQUjGVcSJr_XHraw=s176-c-k-c0x00ffffff-no-rj'
    },
    whatYouWillLearn: [
      'أساسيات لغة HTML من الصفر',
      'بناء صفحات ويب كاملة',
      'التعامل مع العناصر والوسوم المختلفة',
      'إنشاء النماذج Forms بكل أنواعها',
      'التعامل مع الجداول Tables',
      'إدراج الصور والروابط والوسائط المتعددة',
      'Semantic Elements لتحسين بنية الصفحة',
      'أساسيات الـ Accessibility وقابلية الوصول',
      'ARIA وقارئات الشاشة Screen Readers',
      'التعامل مع iFrame و HTML Entities'
    ],
    requirements: [
      'لا يوجد متطلبات مسبقة',
      'جهاز كمبيوتر مع متصفح ومحرر أكواد',
      'حماس للتعلم والممارسة'
    ],
    isPublished: true
  },

  // كل فيديوهات الـ Playlist (37 فيديو) - بيانات حقيقية من YouTube
  videos: [
    { order: 1, title: '#01 - Introduction and What I Need To Learn', videoId: '6QAELgirvjs', duration: 665, isFreePreview: true },
    { order: 2, title: '#02 - Elements And Browser', videoId: '7LxA9qXUY5k', duration: 255, isFreePreview: false },
    { order: 3, title: '#03 - First Project And First Page', videoId: 'QG5aEmS9Fu0', duration: 544, isFreePreview: false },
    { order: 4, title: '#04 - Head And Nested Elements', videoId: 'dVgTBEYCseU', duration: 481, isFreePreview: false },
    { order: 5, title: '#05 - Comments And Use Cases', videoId: '3lXuWHtm7PM', duration: 293, isFreePreview: false },
    { order: 6, title: '#06 - Doctype And Standard And Quirks Mode', videoId: 'sBFemL2Mfj4', duration: 208, isFreePreview: false },
    { order: 7, title: '#07 - Headings And Use Cases', videoId: 'XxkX8wnRq3s', duration: 366, isFreePreview: false },
    { order: 8, title: '#08 - Syntax And Tests', videoId: 'S58smWj5Yn0', duration: 292, isFreePreview: false },
    { order: 9, title: '#09 - Paragraph Element', videoId: 'Fpibp-291xQ', duration: 248, isFreePreview: false },
    { order: 10, title: '#10 - Elements Attributes', videoId: 'nCpNsMgyzh4', duration: 239, isFreePreview: false },
    { order: 11, title: '#11 - Formatting Elements', videoId: 'zhwqvfoi50Q', duration: 666, isFreePreview: false },
    { order: 12, title: '#12 - Links - Anchor Tag', videoId: '7TQhxAOjd1w', duration: 441, isFreePreview: false },
    { order: 13, title: '#13 - Image And Deal With Paths', videoId: 'FmIUk3bWGmU', duration: 413, isFreePreview: false },
    { order: 14, title: '#14 - Lists - UL, OL, DL', videoId: '8Z7zR-UGjcQ', duration: 565, isFreePreview: false },
    { order: 15, title: '#15 - Table', videoId: 'SUW49Jjxvac', duration: 713, isFreePreview: false },
    { order: 16, title: '#16 - Span And Break And Horizontal Rule', videoId: 'T2myRpY2iN4', duration: 313, isFreePreview: false },
    { order: 17, title: '#17 - Div And How To Use', videoId: 'IGeh2mlM9Rg', duration: 460, isFreePreview: false },
    { order: 18, title: '#18 - HTML Entities', videoId: 'B8raKziIYyY', duration: 273, isFreePreview: false },
    { order: 19, title: '#19 - Semantic Elements', videoId: 'xlQwlfvrDuI', duration: 386, isFreePreview: false },
    { order: 20, title: '#20 - Layout With Div And Classes', videoId: 'r6LhFImQxeE', duration: 352, isFreePreview: false },
    { order: 21, title: '#21 - Layout With Semantic Elements', videoId: 'uj5lC-GQPEw', duration: 272, isFreePreview: false },
    { order: 22, title: '#22 - Audio', videoId: 'KltQb6cJSd8', duration: 369, isFreePreview: false },
    { order: 23, title: '#23 - Video', videoId: 'oJbo28ewnL4', duration: 564, isFreePreview: false },
    { order: 24, title: '#24 - Form Part 1 - Input Types And Label', videoId: 'inC9gWjNMJI', duration: 401, isFreePreview: false },
    { order: 25, title: '#25 - Form Part 2 - Required, Placeholder, Value', videoId: '3xd1IQ3llBk', duration: 505, isFreePreview: false },
    { order: 26, title: '#26 - Form Part 3 - Action, Name, Method', videoId: 'Anfn7RzoDHw', duration: 401, isFreePreview: false },
    { order: 27, title: '#27 - Form Part 4 - Hidden, Reset, Color, Range, Number', videoId: 'ZUax-YsT57I', duration: 434, isFreePreview: false },
    { order: 28, title: '#28 - Form Part 5 - ReadOnly, Disabled, Autofocus', videoId: 'rpPIRitcAn8', duration: 435, isFreePreview: false },
    { order: 29, title: '#29 - Form Part 6 - Radio And Checkbox', videoId: 'YAcn1MyAcDM', duration: 604, isFreePreview: false },
    { order: 30, title: '#30 - Form Part 7 - Select And Textarea', videoId: 'HGB42mnD0o4', duration: 491, isFreePreview: false },
    { order: 31, title: '#31 - Form Part 8 - File, Search, URL, Time', videoId: 'cSmE9cVeaYg', duration: 309, isFreePreview: false },
    { order: 32, title: '#32 - Form Part 9 - Data List, Novalidate, Target', videoId: 'X_TGbRuZ80Q', duration: 314, isFreePreview: false },
    { order: 33, title: '#33 - Q, BlockQuote, Wbr, Bdi, Button', videoId: 'AzjtVtxoBLc', duration: 372, isFreePreview: false },
    { order: 34, title: '#34 - iFrame, Pre, Code', videoId: 'aycYLVSOtZo', duration: 329, isFreePreview: false },
    { order: 35, title: '#35 - Accessibility Intro', videoId: 'lSqXHePabFo', duration: 484, isFreePreview: false },
    { order: 36, title: '#36 - ARIA And Screen Readers', videoId: 'UnTxFfbpqco', duration: 523, isFreePreview: false },
    { order: 37, title: '#37 - The End And What To Do', videoId: 'ysJQH5uPfTg', duration: 193, isFreePreview: false }
  ]
};

async function importHtmlPlaylist() {
  try {
    console.log('🔗 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // التحقق من وجود كورس قديم
    // البحث عن الكورس في قاعدة البيانات مباشرة (بدون Mongoose validation)
    const db = mongoose.connection.db;
    const coursesCollection = db.collection('courses');
    const existingCourse = await coursesCollection.findOne({ title: COURSE_DATA.courseInfo.title });

    let courseId;

    if (existingCourse) {
      // الكورس موجود - نحدّثه ونحذف الفيديوهات القديمة
      courseId = existingCourse._id;
      console.log('📚 الكورس موجود بالفعل، سيتم تحديث الفيديوهات فقط');
      console.log('Course ID:', courseId);

      await coursesCollection.updateOne(
        { _id: courseId },
        { $set: { ...COURSE_DATA.courseInfo, updatedAt: new Date() } }
      );
      console.log('✅ تم تحديث بيانات الكورس');

      const deletedVideos = await Video.deleteMany({ courseId });
      console.log(`🗑️  تم حذف ${deletedVideos.deletedCount} فيديو قديم`);
    } else {
      // إنشاء كورس جديد مباشرة (بدون Mongoose validation لتطابق الكورس الموجود)
      console.log('\n📚 جاري إنشاء الكورس لأول مرة...');
      const now = new Date();
      const result = await coursesCollection.insertOne({
        ...COURSE_DATA.courseInfo,
        enrolledStudents: 0,
        rating: { average: 0, count: 0 },
        createdAt: now,
        updatedAt: now,
        __v: 0
      });
      courseId = result.insertedId;
      console.log('✅ تم إنشاء الكورس بنجاح');
      console.log('Course ID:', courseId);
    }

    const course = await coursesCollection.findOne({ _id: courseId });

    // إضافة كل الفيديوهات
    console.log(`\n🎬 جاري إضافة ${COURSE_DATA.videos.length} فيديو...`);
    let addedVideos = 0;

    for (const videoData of COURSE_DATA.videos) {
      try {
        await Video.create({
          courseId: courseId,
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
    console.log(`   • Course ID: ${courseId}`);
    console.log(`   • عنوان الكورس: ${course.title}`);
    console.log(`   • عدد الفيديوهات: ${addedVideos} فيديو`);
    console.log(`   • السعر: $${course.price}`);
    console.log(`   • التصنيف: ${course.category}`);
    console.log(`   • المستوى: ${course.level}`);
    console.log(`   • الحالة: ${course.isPublished ? 'منشور ✅' : 'غير منشور ⏸️'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 يمكنك الآن:');
    console.log(`   1. زيارة الكورس: http://localhost:3000/courses/${courseId}`);
    console.log(`   2. الدفع التجريبي: POST /api/orders/sandbox/pay`);
    console.log(`   3. مشاهدة الفيديوهات بعد التسجيل`);

    process.exit(0);
  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    process.exit(1);
  }
}

importHtmlPlaylist();
