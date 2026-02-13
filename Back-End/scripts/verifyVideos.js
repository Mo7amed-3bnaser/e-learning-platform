import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Video from '../models/Video.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyVideos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات\n');

    const course = await Course.findOne({
      title: 'Fundamentals Of Programming With C++'
    });

    if (!course) {
      console.log('❌ الكورس غير موجود');
      process.exit(1);
    }

    console.log('📚 معلومات الكورس:');
    console.log(`   ID: ${course._id}`);
    console.log(`   العنوان: ${course.title}`);
    console.log(`   السعر: $${course.price}`);
    console.log(`   المستوى: ${course.level}\n`);

    const videos = await Video.find({ courseId: course._id })
      .sort({ order: 1 });

    console.log(`🎬 عدد الفيديوهات: ${videos.length} فيديو\n`);

    console.log('📋 أول 10 فيديوهات:');
    videos.slice(0, 10).forEach(video => {
      const minutes = Math.floor(video.duration / 60);
      const seconds = video.duration % 60;
      const freeTag = video.isFreePreview ? ' [FREE]' : '';
      console.log(`   ${video.order}. ${video.title}`);
      console.log(`      ID: ${video.youtubeVideoId} | ${minutes}:${seconds.toString().padStart(2, '0')}${freeTag}`);
    });

    console.log('\n📋 آخر 5 فيديوهات:');
    videos.slice(-5).forEach(video => {
      const minutes = Math.floor(video.duration / 60);
      const seconds = video.duration % 60;
      console.log(`   ${video.order}. ${video.title}`);
      console.log(`      ID: ${video.youtubeVideoId} | ${minutes}:${seconds.toString().padStart(2, '0')}`);
    });

    // حساب إجمالي المدة
    const totalSeconds = videos.reduce((sum, video) => sum + video.duration, 0);
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

    console.log('\n📊 إحصائيات:');
    console.log(`   المدة الإجمالية: ${totalHours} ساعة و ${totalMinutes} دقيقة`);
    console.log(`   Free Preview: ${videos.filter(v => v.isFreePreview).length} فيديو`);
    console.log(`   مدفوع: ${videos.filter(v => !v.isFreePreview).length} فيديو`);

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

verifyVideos();
