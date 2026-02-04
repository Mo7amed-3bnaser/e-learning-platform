import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Video from '../models/Video.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script لإضافة playlist كامل من YouTube
 * 
 * الاستخدام:
 * node scripts/importYouTubePlaylist.js
 */

// معلومات الـ Playlist
const PLAYLIST_DATA = {
  playlistId: 'PLDoPjvoNmBAwy-rS6WKudwVeb_x63EzgS',
  courseInfo: {
    title: 'Fundamentals Of Programming With C++',
    description: 'كورس شامل لتعلم أساسيات البرمجة باستخدام لغة C++ من الصفر حتى الاحتراف',
    price: 20, // $20
    thumbnail: 'https://i.ytimg.com/vi/XDuWyYxksXU/maxresdefault.jpg',
    category: 'programming',
    level: 'beginner',
    instructor: {
      name: 'Elzero Web School',
      bio: 'مدرب برمجة محترف',
      avatar: 'https://yt3.ggpht.com/r_LSxR8JHQwCKSfVFxIxJFa5zdNe5MbHp8H0xH9mF47sCVCPVlMqAQR-VPvVb2vPvD8i6V91=s176-c-k-c0x00ffffff-no-rj'
    },
    whatYouWillLearn: [
      'أساسيات البرمجة من الصفر',
      'التعامل مع المتغيرات والأنواع',
      'الجمل الشرطية والحلقات التكرارية',
      'الدوال والـ Functions',
      'البرمجة الكائنية OOP',
      'هياكل البيانات الأساسية'
    ],
    requirements: [
      'لا يوجد متطلبات مسبقة',
      'حماس للتعلم',
      'جهاز كمبيوتر'
    ],
    isPublished: true
  },
  videos: [
    {
      title: '#001 - Important Introduction About The Course',
      youtubeVideoId: 'XDuWyYxksXU',
      duration: 630, // 10:30
      order: 1,
      isFreePreview: true
    },
    {
      title: '#002 - Why C++ Language',
      youtubeVideoId: 'EZwy2rKi4JA',
      duration: 452, // 7:52
      order: 2,
      isFreePreview: true
    },
    {
      title: '#003 - What Is C++',
      youtubeVideoId: 'N7EZNTbKxd8',
      duration: 382,
      order: 3,
      isFreePreview: false
    },
    {
      title: '#004 - Check If Your Computer Ready To Learn',
      youtubeVideoId: 'k5R74gWaLjA',
      duration: 428,
      order: 4,
      isFreePreview: false
    },
    {
      title: '#005 - Install Code::Blocks Editor',
      youtubeVideoId: 'ALAcY7kF2Fg',
      duration: 384,
      order: 5,
      isFreePreview: false
    }
    // يمكن إضافة باقي الفيديوهات يدوياً أو استخدام YouTube API
  ]
};

/**
 * دالة لإنشاء الكورس وإضافة الفيديوهات
 */
async function importPlaylist() {
  try {
    console.log('🔗 جاري الاتصال بقاعدة البيانات...');
    
    // الاتصال بـ MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // التحقق من وجود كورس بنفس الاسم
    const existingCourse = await Course.findOne({ 
      title: PLAYLIST_DATA.courseInfo.title 
    });

    if (existingCourse) {
      console.log('⚠️  الكورس موجود بالفعل!');
      console.log('Course ID:', existingCourse._id);
      console.log('\n💡 سيتم حذف الكورس القديم وإنشاء واحد جديد...');
      
      // حذف الكورس القديم تلقائياً
      await Video.deleteMany({ courseId: existingCourse._id });
      await Course.findByIdAndDelete(existingCourse._id);
      console.log('🗑️  تم حذف الكورس القديم');
      await createNewCourse();
    } else {
      await createNewCourse();
    }

  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    process.exit(1);
  }
}

/**
 * إنشاء كورس جديد
 */
async function createNewCourse() {
  try {
    // 1. إنشاء الكورس
    console.log('\n📚 جاري إنشاء الكورس...');
    const course = await Course.create(PLAYLIST_DATA.courseInfo);
    console.log('✅ تم إنشاء الكورس بنجاح');
    console.log('Course ID:', course._id);
    console.log('Course Title:', course.title);

    // 2. إضافة الفيديوهات
    console.log('\n🎬 جاري إضافة الفيديوهات...');
    let addedVideos = 0;

    for (const videoData of PLAYLIST_DATA.videos) {
      const video = await Video.create({
        courseId: course._id,
        title: videoData.title,
        description: videoData.description || '',
        videoProvider: 'youtube',
        youtubeVideoId: videoData.youtubeVideoId,
        duration: videoData.duration,
        order: videoData.order,
        isFreePreview: videoData.isFreePreview,
        thumbnail: `https://img.youtube.com/vi/${videoData.youtubeVideoId}/maxresdefault.jpg`
      });

      addedVideos++;
      console.log(`  ✅ [${addedVideos}/${PLAYLIST_DATA.videos.length}] ${video.title}`);
    }

    console.log('\n🎉 تم الانتهاء بنجاح!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ملخص العملية:');
    console.log(`   • Course ID: ${course._id}`);
    console.log(`   • عنوان الكورس: ${course.title}`);
    console.log(`   • عدد الفيديوهات: ${addedVideos}`);
    console.log(`   • السعر: ${course.price} جنيه`);
    console.log(`   • الحالة: ${course.isPublished ? 'منشور ✅' : 'غير منشور ⏸️'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 يمكنك الآن:');
    console.log(`   1. زيارة الكورس: http://localhost:3000/courses/${course._id}`);
    console.log(`   2. التسجيل في الكورس: POST /api/orders/sandbox/pay`);
    console.log(`   3. مشاهدة الفيديوهات: GET /api/videos/${course._id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إنشاء الكورس:', error.message);
    process.exit(1);
  }
}

// تشغيل الـ Script
importPlaylist();
