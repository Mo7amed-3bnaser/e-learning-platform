import mongoose from 'mongoose';
import Video from '../models/Video.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * سكريبت لإصلاح الـ YouTube Video IDs
 * الـ IDs القديمة كانت خاطئة - هذا السكريبت يحدثها بالـ IDs الصحيحة
 */

// الـ Video IDs الصحيحة من playlist Elzero
const CORRECT_VIDEO_IDS = {
  1: { videoId: 'XDuWyYxksXU', title: 'Important Introduction About The Course' },
  2: { videoId: 'jOUb09iiO20', title: 'Why C++ Language' },
  3: { videoId: 'R-Hu5rdn-vc', title: 'Install VSC Editor, Compiler And Debugger' },
  4: { videoId: 'RWtT07Id-n4', title: 'Install Visual Studio And Answer Questions' },
  5: { videoId: 'FVV4kTy0dJg', title: 'How The C++ Works' },
  6: { videoId: '1K1sET8dDrI', title: 'Preprocessing, Compiling And Linking' },
  7: { videoId: 'NeHu899_uYA', title: 'C++ Language Syntax' },
  8: { videoId: '6UoFcvARKI4', title: 'Comments And Use Cases' },
  9: { videoId: 'R2zqj_52WwU', title: 'Variables Basic Knowledge' },
  10: { videoId: 'A6B4tlaPapo', title: 'Variables Naming Rules And Best Practices' },
};

async function fixVideoIds() {
  try {
    console.log('🔧 جاري إصلاح الـ Video IDs...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات\n');

    // تحديث كل فيديو
    for (const [order, data] of Object.entries(CORRECT_VIDEO_IDS)) {
      const orderNum = parseInt(order);
      
      const result = await Video.updateOne(
        { order: orderNum },
        { 
          youtubeVideoId: data.videoId,
          title: `#${String(orderNum).padStart(3, '0')} - ${data.title}`
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ تم تحديث الفيديو #${orderNum}: ${data.title}`);
        console.log(`   Video ID: ${data.videoId}`);
      } else if (result.matchedCount > 0) {
        console.log(`⏭️  الفيديو #${orderNum} لم يحتج تحديث`);
      } else {
        console.log(`⚠️  الفيديو #${orderNum} غير موجود`);
      }
    }

    // حذف الفيديوهات التي ليس لها IDs صحيحة (من 11 فما فوق)
    const deleteResult = await Video.deleteMany({ order: { $gt: 10 } });
    console.log(`\n🗑️  تم حذف ${deleteResult.deletedCount} فيديو بـ IDs خاطئة`);

    // عرض الفيديوهات المحدثة
    console.log('\n📋 الفيديوهات بعد التحديث:');
    const videos = await Video.find({}).sort('order').select('order title youtubeVideoId');
    videos.forEach(v => {
      console.log(`   ${v.order}. ${v.title}`);
      console.log(`      YouTube ID: ${v.youtubeVideoId}`);
    });

    console.log('\n✅ تم إصلاح الـ Video IDs بنجاح!');
    console.log('📺 يمكنك الآن مشاهدة الفيديوهات في الموقع');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixVideoIds();
