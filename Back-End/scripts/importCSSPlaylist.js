import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Video from '../models/Video.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script لإضافة كل فيديوهات playlist الـ CSS من Elzero Web School
 * 
 * Playlist: https://www.youtube.com/playlist?list=PLDoPjvoNmBAzjsz06gkzlSrlev53MGIKe
 * عدد الفيديوهات: 88 فيديو
 * المدة الإجمالية: ~11 ساعة و 28 دقيقة
 * السعر: $7
 * أول فيديوهين فقط مجانية (Preview)
 */

const COURSE_DATA = {
  courseInfo: {
    title: 'Learn CSS In Arabic 2021',
    description: 'كورس شامل لتعلم CSS بالعربي من الصفر حتى الاحتراف. يغطي الكورس كل أساسيات وخصائص CSS من Background و Padding و Margin والـ Display والـ Position إلى Flexbox و Grid و Animations و Media Queries وكل ما تحتاجه لتصميم مواقع احترافية ومتجاوبة.',
    price: 7,
    thumbnail: 'https://i.ytimg.com/vi/X1ulCwyhCVM/maxresdefault.jpg',
    category: 'web',
    level: 'beginner',
    whatYouWillLearn: [
      'أساسيات CSS من الصفر حتى الاحتراف',
      'Background Properties - Color, Image, Repeat, Attachment, Position, Size',
      'Box Model - Padding, Margin, Border, Outline, Box Sizing',
      'Display و Visibility والفرق بينهم',
      'CSS Selectors كاملة مع أمثلة عملية',
      'Typography - Font Family, Size, Style, Weight',
      'Pseudo Classes و Pseudo Elements',
      'Flexbox بالتفصيل - Parent و Child Properties',
      'CSS Grid بالتفصيل - Template Columns, Rows, Areas',
      '2D و 3D Transforms - Scale, Rotate, Translate, Skew',
      'CSS Animations و KeyFrames',
      'Media Queries و Responsive Design',
      'CSS Variables و Calculations',
      'Transitions و Filters و Gradients',
      'بناء Framework خاص بيك'
    ],
    requirements: [
      'معرفة أساسية بـ HTML',
      'متصفح حديث (Chrome, Firefox, etc.)',
      'محرر أكواد (VS Code مُفضل)',
      'لا يوجد خبرة سابقة في CSS مطلوبة'
    ],
    isPublished: true
  },

  // كل فيديوهات الـ Playlist (88 فيديو) - بيانات حقيقية من YouTube
  // تم جلبها عبر سكريبت fetchCSSPlaylistData.js
  videos: [
    { order: 1, title: 'Learn CSS In Arabic 2021 - #01 - Introduction And What I Need To Learn', videoId: 'X1ulCwyhCVM', duration: 502, isFreePreview: true },
    { order: 2, title: 'Learn CSS In Arabic 2021 - #02 - Your First Project And Syntax', videoId: '89VLfs-wpEY', duration: 521, isFreePreview: true },
    { order: 3, title: 'Learn CSS In Arabic 2021 - #03 - Element Styling', videoId: '66sjwQ-hB64', duration: 385, isFreePreview: false },
    { order: 4, title: 'Learn CSS In Arabic 2021 - #04 - Name Conventions And Rules', videoId: 'xkNpIsbxMuo', duration: 482, isFreePreview: false },
    { order: 5, title: 'Learn CSS In Arabic 2021 - #05 - Background - Color, Image, Repeat', videoId: '-srybsn3YDM', duration: 475, isFreePreview: false },
    { order: 6, title: 'Learn CSS In Arabic 2021 - #06 - Background - Attachment, Position, Size', videoId: '8sooTBY5C4w', duration: 489, isFreePreview: false },
    { order: 7, title: 'Learn CSS In Arabic 2021 - #07 - Padding', videoId: '-wdlA-wFv9A', duration: 542, isFreePreview: false },
    { order: 8, title: 'Learn CSS In Arabic 2021 - #08 - Margin', videoId: 'LEJkJ0AiKDw', duration: 496, isFreePreview: false },
    { order: 9, title: 'Learn CSS In Arabic 2021 - #09 - Border', videoId: 'XE7d1OoljyI', duration: 357, isFreePreview: false },
    { order: 10, title: 'Learn CSS In Arabic 2021 - #10 - Outline', videoId: 'NyOaxP-Adac', duration: 399, isFreePreview: false },
    { order: 11, title: 'Learn CSS In Arabic 2021 - #11 - Display - Block, Inline Block, Inline', videoId: '-qbGxua98To', duration: 714, isFreePreview: false },
    { order: 12, title: 'Learn CSS In Arabic 2021 - #12 - Element Visibility And Use Cases', videoId: 'g2URo6kLtgg', duration: 314, isFreePreview: false },
    { order: 13, title: 'Learn CSS In Arabic 2021 - #13 - Grouping Multiple Selectors', videoId: 'NTccbXHW7AM', duration: 357, isFreePreview: false },
    { order: 14, title: 'Learn CSS In Arabic 2021 - #14 - Nesting', videoId: 'wo_S_Mfl3yg', duration: 319, isFreePreview: false },
    { order: 15, title: 'Learn CSS In Arabic 2021 - #15 - Dimensions - Width And Height', videoId: 'GIWYpmiv1Hc', duration: 494, isFreePreview: false },
    { order: 16, title: 'Learn CSS In Arabic 2021 - #16 - Overflow - Overflow-X And Overflow-Y', videoId: 'FQLRSbVdk28', duration: 293, isFreePreview: false },
    { order: 17, title: 'Learn CSS In Arabic 2021 - #17 - Text - Color And Shadow', videoId: 'P3xdm7md7AE', duration: 233, isFreePreview: false },
    { order: 18, title: 'Learn CSS In Arabic 2021 - #18 - Text - Alignment', videoId: 'IqCXELTTymo', duration: 288, isFreePreview: false },
    { order: 19, title: 'Learn CSS In Arabic 2021 - #19 - Text - Decoration And Transform', videoId: 'E-7k6sySXwE', duration: 246, isFreePreview: false },
    { order: 20, title: 'Learn CSS In Arabic 2021 - #20 - Text - Spacing', videoId: 'Hphs2vBjmQs', duration: 605, isFreePreview: false },
    { order: 21, title: 'Learn CSS In Arabic 2021 - #21 - Text - Overflow And Use Cases', videoId: '0uWk0Ucz3c4', duration: 241, isFreePreview: false },
    { order: 22, title: 'Learn CSS In Arabic 2021 - #22 - Inheritance', videoId: 'fXcY14cm4_I', duration: 335, isFreePreview: false },
    { order: 23, title: 'Learn CSS In Arabic 2021 - #23 - Typography - Font Family', videoId: 'ftjKy7AAjVU', duration: 647, isFreePreview: false },
    { order: 24, title: 'Learn CSS In Arabic 2021 - #24 - Typography - Font Size And CSS Units', videoId: 'LDGfu6O5mI8', duration: 553, isFreePreview: false },
    { order: 25, title: 'Learn CSS In Arabic 2021 - #25 - Typography - Font Style And Variant And Weight', videoId: '-siTKk8QqHo', duration: 286, isFreePreview: false },
    { order: 26, title: 'Learn CSS In Arabic 2021 - #26 - Mouse Cursor', videoId: 'l2Oz9QKd1PU', duration: 255, isFreePreview: false },
    { order: 27, title: 'Learn CSS In Arabic 2021 - #27 - Float And Clear', videoId: 'ZAb-oI23Oc4', duration: 543, isFreePreview: false },
    { order: 28, title: 'Learn CSS In Arabic 2021 - #28 - Mastering The CSS Calculation', videoId: 'Sujl_fq_Ofc', duration: 534, isFreePreview: false },
    { order: 29, title: 'Learn CSS In Arabic 2021 - #29 - Opacity', videoId: '-3Q7sjYxStM', duration: 192, isFreePreview: false },
    { order: 30, title: 'Learn CSS In Arabic 2021 - #30 - Position', videoId: '-q5IyjKkKSc', duration: 667, isFreePreview: false },
    { order: 31, title: 'Learn CSS In Arabic 2021 - #31 - Z-Index', videoId: 'Parqs9bbRMY', duration: 410, isFreePreview: false },
    { order: 32, title: 'Learn CSS In Arabic 2021 - #32 - Lists Styling', videoId: '8VH59jP5s1M', duration: 434, isFreePreview: false },
    { order: 33, title: 'Learn CSS In Arabic 2021 - #33 - Table Styling', videoId: 'WgUbPZBh5cI', duration: 455, isFreePreview: false },
    { order: 34, title: 'Learn CSS In Arabic 2021 - #34 - Pseudo Classes', videoId: 'vEAPPfJfpk0', duration: 688, isFreePreview: false },
    { order: 35, title: 'Learn CSS In Arabic 2021 - #35 - Pseudo Elements - First Letter, First Line, Selection', videoId: '6bZCaDyimCI', duration: 409, isFreePreview: false },
    { order: 36, title: 'Learn CSS In Arabic 2021 - #36 - Pseudo Elements - Before, After, Content', videoId: 'OIWZ4EXwlnA', duration: 667, isFreePreview: false },
    { order: 37, title: 'Learn CSS In Arabic 2021 - #37 - Pseudo Elements - Content And Trainings', videoId: '4WT2eO8aM7U', duration: 558, isFreePreview: false },
    { order: 38, title: 'Learn CSS In Arabic 2021 - #38 - Vendor Prefixes', videoId: 'ZLNzjq4U8Ws', duration: 549, isFreePreview: false },
    { order: 39, title: 'Learn CSS In Arabic 2021 - #39 - Border Radius', videoId: '76-r7wWCdkM', duration: 371, isFreePreview: false },
    { order: 40, title: 'Learn CSS In Arabic 2021 - #40 - Box Shadow And Examples', videoId: 'QGdK5Lrqxcg', duration: 434, isFreePreview: false },
    { order: 41, title: 'Learn CSS In Arabic 2021 - #41 - The Box Model And Box Sizing', videoId: '9PDCOviQOwo', duration: 440, isFreePreview: false },
    { order: 42, title: 'Learn CSS In Arabic 2021 - #42 - Transition', videoId: 'B9wYvMHLCVE', duration: 808, isFreePreview: false },
    { order: 43, title: 'Learn CSS In Arabic 2021 - #43 - !Important Declaration And Use Cases', videoId: 'Lpy5XkEpp2A', duration: 323, isFreePreview: false },
    { order: 44, title: 'Learn CSS In Arabic 2021 - #44 - The Margin Collapse', videoId: '0Zek-O9bzAo', duration: 470, isFreePreview: false },
    { order: 45, title: 'Learn CSS In Arabic 2021 - #45 - CSS Variables And Trainings', videoId: 'qATtKrSvvEo', duration: 514, isFreePreview: false },
    { order: 46, title: 'Learn CSS In Arabic 2021 - #46 - Flex Box Parent - Direction, Wrap, Flow', videoId: 'JkCLL1CzNZk', duration: 562, isFreePreview: false },
    { order: 47, title: 'Learn CSS In Arabic 2021 - #47 - Flex Box Parent - Justify Content', videoId: '_ScoBsCdJ7U', duration: 637, isFreePreview: false },
    { order: 48, title: 'Learn CSS In Arabic 2021 - #48 - Flex Box Parent - Align Items', videoId: 'Nn-tFHepLoo', duration: 296, isFreePreview: false },
    { order: 49, title: 'Learn CSS In Arabic 2021 - #49 - Flex Box Parent - Align Content', videoId: 'sOlpkte0gPs', duration: 333, isFreePreview: false },
    { order: 50, title: 'Learn CSS In Arabic 2021 - #50 - Flex Box Child - Grow, Shrink, Order', videoId: 'F5a6wj3hfbg', duration: 416, isFreePreview: false },
    { order: 51, title: 'Learn CSS In Arabic 2021 - #51 - Flex Box Child - Flex Basis, Flex Shorthand', videoId: '0W8KopNcyRY', duration: 538, isFreePreview: false },
    { order: 52, title: 'Learn CSS In Arabic 2021 - #52 - Flex Box Child - Align Self, Games, Task', videoId: 't2e4aYHrowQ', duration: 203, isFreePreview: false },
    { order: 53, title: 'Learn CSS In Arabic 2021 - #53 - Finish Flex Froggy Game', videoId: '-sUqEXFzbII', duration: 695, isFreePreview: false },
    { order: 54, title: 'Learn CSS In Arabic 2021 - #54 - Filters', videoId: '2v9ZhqX6YOk', duration: 236, isFreePreview: false },
    { order: 55, title: 'Learn CSS In Arabic 2021 - #55 - Gradients', videoId: 'Skjr9fycnio', duration: 742, isFreePreview: false },
    { order: 56, title: 'Learn CSS In Arabic 2021 - #56 - Pointer Events And Caret Color', videoId: 'I6zKVKCewDc', duration: 280, isFreePreview: false },
    { order: 57, title: 'Learn CSS In Arabic 2021 - #57 - Grid - Parent - Template Columns', videoId: 'wYSAjaB3mL8', duration: 693, isFreePreview: false },
    { order: 58, title: 'Learn CSS In Arabic 2021 - #58 - Grid - Parent - Template Rows And Gap', videoId: 'gZ3XNPelC5Y', duration: 474, isFreePreview: false },
    { order: 59, title: 'Learn CSS In Arabic 2021 - #59 - Grid - Parent - Justify Content And Align Content', videoId: 'IsXAEilbm64', duration: 279, isFreePreview: false },
    { order: 60, title: 'Learn CSS In Arabic 2021 - #60 - Grid - Parent - Complete Layout With Template Areas', videoId: 'q6VtSllQHHo', duration: 712, isFreePreview: false },
    { order: 61, title: 'Learn CSS In Arabic 2021 - #61 - Grid - Child - Grid Column And Grid Row', videoId: '7RZr_1qvR2g', duration: 444, isFreePreview: false },
    { order: 62, title: 'Learn CSS In Arabic 2021 - #62 - Grid - Child - Grid Area And Trainings', videoId: 'BJupwn_ii8g', duration: 396, isFreePreview: false },
    { order: 63, title: 'Learn CSS In Arabic 2021 - #63 - Grid - Min, Max And Auto Fill', videoId: 'NO4IeLSKNdw', duration: 468, isFreePreview: false },
    { order: 64, title: 'Learn CSS In Arabic 2021 - #64 - Finish The Grid Garden Game', videoId: '-UvL4OoIsHo', duration: 1061, isFreePreview: false },
    { order: 65, title: 'Learn CSS In Arabic 2021 - #65 - 2D Transform - Scale', videoId: '9KQP22oVCMg', duration: 295, isFreePreview: false },
    { order: 66, title: 'Learn CSS In Arabic 2021 - #66 - 2D Transform - Rotate', videoId: 'AtOB_b0Cjyo', duration: 431, isFreePreview: false },
    { order: 67, title: 'Learn CSS In Arabic 2021 - #67 - 2D Transform - Translate', videoId: 'PklNgYpJSXs', duration: 318, isFreePreview: false },
    { order: 68, title: 'Learn CSS In Arabic 2021 - #68 - 2D Transform - Skew', videoId: 'N2G8JUK7kJs', duration: 301, isFreePreview: false },
    { order: 69, title: 'Learn CSS In Arabic 2021 - #69 - 2D Transform - Matrix', videoId: 'OsypTHsvnVI', duration: 436, isFreePreview: false },
    { order: 70, title: 'Learn CSS In Arabic 2021 - #70 - Transform - Origin', videoId: 'DW0-7s_xJ90', duration: 509, isFreePreview: false },
    { order: 71, title: 'Learn CSS In Arabic 2021 - #71 - 3D Transform - Rotate', videoId: 'WF9LU1IIERM', duration: 372, isFreePreview: false },
    { order: 72, title: 'Learn CSS In Arabic 2021 - #72 - 3D Transform - Translate, Perspective, Perspective Origin', videoId: 'FnIdCYWmJ8A', duration: 288, isFreePreview: false },
    { order: 73, title: 'Learn CSS In Arabic 2021 - #73 - 3D Transform - Backface Visibility And Flip Product', videoId: '7G-a-PHsGyM', duration: 557, isFreePreview: false },
    { order: 74, title: 'Learn CSS In Arabic 2021 - #74 - Animation - KeyFrames, Name, Duration', videoId: 'cfq7u52lvfI', duration: 416, isFreePreview: false },
    { order: 75, title: 'Learn CSS In Arabic 2021 - #75 - Animation - Iteration Count, Timing Function, Spinner Loading', videoId: 'NPy2GGDX-kg', duration: 268, isFreePreview: false },
    { order: 76, title: 'Learn CSS In Arabic 2021 - #76 - Animation - Direction, Fill Mode, Play State, Delay', videoId: 'P2QAAXONOac', duration: 664, isFreePreview: false },
    { order: 77, title: 'Learn CSS In Arabic 2021 - #77 - Up And Down Loading Animation Training', videoId: '9Q8W2YK3dyk', duration: 362, isFreePreview: false },
    { order: 78, title: 'Learn CSS In Arabic 2021 - #78 - CSS Selectors Reference Part 1', videoId: 'PbKHU1Fb1oQ', duration: 568, isFreePreview: false },
    { order: 79, title: 'Learn CSS In Arabic 2021 - #79 - CSS Selectors Reference Part 2', videoId: 'WPOpfk_eCVE', duration: 557, isFreePreview: false },
    { order: 80, title: 'Learn CSS In Arabic 2021 - #80 - CSS Selectors Reference Part 3', videoId: 'NJThXQrhmB0', duration: 613, isFreePreview: false },
    { order: 81, title: 'Learn CSS In Arabic 2021 - #81 - CSS Selectors Reference Part 4', videoId: 's6vDg-XoZ_Y', duration: 554, isFreePreview: false },
    { order: 82, title: 'Learn CSS In Arabic 2021 - #82 - CSS Selectors Reference Part 5', videoId: 'eN9HxtDHREM', duration: 477, isFreePreview: false },
    { order: 83, title: 'Learn CSS In Arabic 2021 - #83 - Media Queries And Responsive Designs Intro', videoId: 'F9FAcVwSV4c', duration: 542, isFreePreview: false },
    { order: 84, title: 'Learn CSS In Arabic 2021 - #84 - Media Queries And Responsive Designs Standards', videoId: 'b2rWjPIZDT0', duration: 691, isFreePreview: false },
    { order: 85, title: 'Learn CSS In Arabic 2021 - #85 - Media Queries And Responsive Designs Practice', videoId: 'QdXQ0Wa9oPY', duration: 704, isFreePreview: false },
    { order: 86, title: 'Learn CSS In Arabic 2021 - #86 - Create Your Framework', videoId: 'xkFDwIPOzik', duration: 600, isFreePreview: false },
    { order: 87, title: 'Learn CSS In Arabic 2021 - #87 - CSS Global Values', videoId: 'iueBHixQyX0', duration: 643, isFreePreview: false },
    { order: 88, title: 'Learn CSS In Arabic 2021 - #88 - The End And How To Master HTML And CSS', videoId: 'YKUkssSbVls', duration: 406, isFreePreview: false },
  ]
};

async function importCSSPlaylist() {
  try {
    console.log('🔗 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // البحث عن مدرب (instructor أو admin) أو إنشاء واحد
    let instructor = await User.findOne({ role: { $in: ['instructor', 'admin'] } });

    if (!instructor) {
      console.log('⚠️  لا يوجد مدرب في قاعدة البيانات، سيتم إنشاء واحد...');
      instructor = await User.create({
        name: 'Elzero Web School',
        email: 'elzero@elearning.com',
        phone: '01000000001',
        password: 'Elzero@2024',
        role: 'instructor',
        instructorProfile: {
          bio: 'قناة تعليمية متخصصة في البرمجة وتطوير الويب',
          specialization: 'Web Development',
          website: 'https://elzero.org',
        }
      });
      console.log(`✅ تم إنشاء المدرب: ${instructor.name} (${instructor._id})`);
    } else {
      console.log(`👨‍🏫 سيتم استخدام المدرب: ${instructor.name} (${instructor._id})`);
    }

    // التحقق من وجود كورس قديم بنفس العنوان
    let course = await Course.findOne({
      title: COURSE_DATA.courseInfo.title
    });

    if (course) {
      // الكورس موجود - نحدّثه ونحذف الفيديوهات القديمة
      console.log('📚 الكورس موجود بالفعل، سيتم تحديث الفيديوهات فقط');
      console.log('Course ID:', course._id);

      // تحديث بيانات الكورس مع الـ instructor
      Object.assign(course, { ...COURSE_DATA.courseInfo, instructor: instructor._id });
      await course.save();
      console.log('✅ تم تحديث بيانات الكورس');

      // حذف الفيديوهات القديمة
      const deletedVideos = await Video.deleteMany({ courseId: course._id });
      console.log(`🗑️  تم حذف ${deletedVideos.deletedCount} فيديو قديم`);
    } else {
      // إنشاء كورس جديد
      console.log('\n📚 جاري إنشاء كورس CSS جديد...');
      course = await Course.create({
        ...COURSE_DATA.courseInfo,
        instructor: instructor._id
      });
      console.log('✅ تم إنشاء الكورس بنجاح');
      console.log('Course ID:', course._id);
    }

    // إضافة كل الفيديوهات
    console.log(`\n🎬 جاري إضافة ${COURSE_DATA.videos.length} فيديو...`);
    let addedVideos = 0;
    let previewCount = 0;

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
        if (videoData.isFreePreview) previewCount++;

        // عرض التقدم كل 10 فيديوهات
        if (addedVideos % 10 === 0 || addedVideos === COURSE_DATA.videos.length) {
          console.log(`  ✅ [${addedVideos}/${COURSE_DATA.videos.length}] فيديو تم إضافته`);
        }
      } catch (error) {
        console.error(`  ❌ خطأ في الفيديو ${videoData.order}: ${videoData.title}`, error.message);
      }
    }

    // حساب المدة الإجمالية
    const totalDuration = COURSE_DATA.videos.reduce((sum, v) => sum + v.duration, 0);
    const totalHours = Math.floor(totalDuration / 3600);
    const totalMins = Math.floor((totalDuration % 3600) / 60);

    // ملخص العملية
    console.log('\n🎉 تم الانتهاء بنجاح!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ملخص العملية:');
    console.log(`   • Course ID: ${course._id}`);
    console.log(`   • عنوان الكورس: ${course.title}`);
    console.log(`   • عدد الفيديوهات: ${addedVideos} فيديو`);
    console.log(`   • فيديوهات مجانية (Preview): ${previewCount} فيديو`);
    console.log(`   • المدة الإجمالية: ${totalHours} ساعة و ${totalMins} دقيقة`);
    console.log(`   • السعر: $${course.price}`);
    console.log(`   • التصنيف: ${course.category}`);
    console.log(`   • المستوى: ${course.level}`);
    console.log(`   • الحالة: ${course.isPublished ? 'منشور ✅' : 'غير منشور ⏸️'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 يمكنك الآن:');
    console.log(`   1. زيارة الكورس: http://localhost:3000/courses/${course._id}`);
    console.log(`   2. الدفع التجريبي: POST /api/orders/sandbox/pay`);
    console.log(`   3. أول فيديوهين مجانيين للمعاينة`);
    console.log(`   4. باقي الفيديوهات تحتاج شراء الكورس ($${course.price})`);

    process.exit(0);
  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    console.error(error);
    process.exit(1);
  }
}

importCSSPlaylist();
