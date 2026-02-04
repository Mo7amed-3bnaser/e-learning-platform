import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script لحذف الـ indexes القديمة من Video collection
 */
async function dropOldIndexes() {
  try {
    console.log('🔗 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح');

    const db = mongoose.connection.db;
    const collection = db.collection('videos');

    console.log('\n📋 الـ indexes الحالية:');
    const indexes = await collection.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // حذف index الـ bunnyVideoId القديم
    try {
      await collection.dropIndex('bunnyVideoId_1');
      console.log('\n✅ تم حذف index bunnyVideoId_1 بنجاح');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  Index bunnyVideoId_1 غير موجود (تم حذفه مسبقاً)');
      } else {
        throw error;
      }
    }

    console.log('\n📋 الـ indexes بعد التنظيف:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n✅ تم الانتهاء! يمكنك الآن تشغيل importYouTubePlaylist.js');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

dropOldIndexes();
