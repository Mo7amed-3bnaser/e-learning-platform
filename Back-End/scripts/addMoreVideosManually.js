/**
 * قائمة فيديوهات Playlist الكاملة
 * نسخها من YouTube playlist page
 * 
 * استخدام: 
 * 1. افتح الـ playlist: https://www.youtube.com/playlist?list=PLDoPjvoNmBAwy-rS6WKudwVeb_x63EzgS
 * 2. انسخ كل عناوين الفيديوهات
 * 3. استخدم الـ script ده لإضافتهم
 */

export const FULL_PLAYLIST_VIDEOS = [
  // الفيديوهات المضافة بالفعل
  { order: 1, title: '#001 - Important Introduction About The Course', videoId: 'XDuWyYxksXU', duration: 630 },
  { order: 2, title: '#002 - Why C++ Language', videoId: 'EZwy2rKi4JA', duration: 452 },
  { order: 3, title: '#003 - What Is C++', videoId: 'N7EZNTbKxd8', duration: 382 },
  { order: 4, title: '#004 - Check If Your Computer Ready To Learn', videoId: 'k5R74gWaLjA', duration: 428 },
  { order: 5, title: '#005 - Install Code::Blocks Editor', videoId: 'ALAcY7kF2Fg', duration: 384 },
  
  // يمكن إضافة المزيد هنا بنفس الطريقة:
  // { order: 6, title: '#006 - Title Here', videoId: 'VIDEO_ID', duration: 300 },
  // { order: 7, title: '#007 - Title Here', videoId: 'VIDEO_ID', duration: 300 },
  
  // للحصول على Video ID من رابط YouTube:
  // https://www.youtube.com/watch?v=VIDEO_ID_HERE
  
  // للحصول على Duration (بالثواني):
  // 5:30 دقيقة = 5*60 + 30 = 330 ثانية
  // 10:45 دقيقة = 10*60 + 45 = 645 ثانية
];

/**
 * دالة مساعدة لتحويل Duration من string إلى seconds
 * مثال: "5:30" → 330
 */
export function timeToSeconds(timeString) {
  const parts = timeString.split(':').map(Number);
  if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * دالة لإضافة فيديوهات إضافية لكورس موجود
 */
export async function addVideosToExistingCourse(courseId, videos) {
  const Video = (await import('../models/Video.js')).default;
  
  console.log(`🎬 جاري إضافة ${videos.length} فيديو للكورس...`);
  
  for (const videoData of videos) {
    try {
      const video = await Video.create({
        courseId,
        title: videoData.title,
        videoProvider: 'youtube',
        youtubeVideoId: videoData.videoId,
        duration: videoData.duration,
        order: videoData.order,
        isFreePreview: videoData.order <= 2, // أول فيديوهين مجانيين
        thumbnail: `https://img.youtube.com/vi/${videoData.videoId}/maxresdefault.jpg`
      });
      
      console.log(`  ✅ [${videoData.order}] ${video.title}`);
    } catch (error) {
      console.error(`  ❌ خطأ في الفيديو ${videoData.order}:`, error.message);
    }
  }
  
  console.log('✅ تم إضافة الفيديوهات بنجاح!');
}

// مثال على الاستخدام:
// import { addVideosToExistingCourse, FULL_PLAYLIST_VIDEOS } from './addMoreVideosManually.js';
// await addVideosToExistingCourse('COURSE_ID_HERE', FULL_PLAYLIST_VIDEOS.slice(5)); // إضافة من الفيديو 6+
