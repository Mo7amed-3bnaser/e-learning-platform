import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from Back-End root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import User from '../models/User.js';

/**
 * Script لجلب جميع حسابات الإنستراكتورز من الداتا بيز للتيست
 */
const getInstructors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const instructors = await User.find({ role: 'instructor' })
            .select('name email phone isBlocked isEmailVerified createdAt instructorProfile')
            .lean();

        if (instructors.length === 0) {
            console.log('⚠️  لا يوجد إنستراكتورز في الداتا بيز حالياً.');
            process.exit(0);
        }

        console.log(`📋 عدد الإنستراكتورز: ${instructors.length}\n`);
        console.log('═'.repeat(60));

        instructors.forEach((instructor, index) => {
            console.log(`\n👤 إنستراكتور #${index + 1}`);
            console.log(`   الاسم        : ${instructor.name}`);
            console.log(`   الإيميل      : ${instructor.email}`);
            console.log(`   التليفون     : ${instructor.phone}`);
            console.log(`   الحالة       : ${instructor.isBlocked ? '🔴 محظور' : '🟢 نشط'}`);
            console.log(`   تحقق الإيميل : ${instructor.isEmailVerified ? '✅ محقق' : '❌ غير محقق'}`);
            if (instructor.instructorProfile?.specialization) {
                console.log(`   التخصص       : ${instructor.instructorProfile.specialization}`);
            }
            console.log(`   تاريخ الإنشاء: ${new Date(instructor.createdAt).toLocaleDateString('ar-EG')}`);
            console.log('─'.repeat(60));
        });

        console.log('\n💡 ملاحظة:');
        console.log('   - كلمة المرور مش موجودة هنا لأنها مشفرة في الداتا بيز.');
        console.log('   - لو محتاج تلوج إن بأي أكونت، استخدم سكريبت resetInstructorPassword.js');
        console.log('   - أو اضغط "نسيت كلمة المرور" من الفرونت إند.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

getInstructors();
