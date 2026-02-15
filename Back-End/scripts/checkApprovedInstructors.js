import mongoose from "mongoose";
import dotenv from "dotenv";
import InstructorApplication from "../models/InstructorApplication.js";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const checkApprovedInstructors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all approved applications
    const approvedApps = await InstructorApplication.find({
      status: "approved",
    })
      .populate("userId", "name email role")
      .sort("-createdAt");

    if (approvedApps.length === 0) {
      console.log("❌ لا توجد طلبات مقبولة حالياً");
      process.exit(0);
    }

    console.log("📋 الطلبات المقبولة (المدرسين):\n");
    console.log("=".repeat(70));

    for (const app of approvedApps) {
      console.log(`\n👤 الاسم: ${app.firstName} ${app.lastName}`);
      console.log(`📧 البريد: ${app.email}`);
      console.log(`📱 الهاتف: ${app.phone}`);
      console.log(`🎓 التخصص: ${app.specialization}`);
      console.log(`⭐ الخبرة: ${app.yearsOfExperience}`);

      if (app.userId) {
        console.log(`\n🔑 بيانات تسجيل الدخول:`);
        console.log(`   البريد: ${app.userId.email}`);
        console.log(`   الدور: ${app.userId.role}`);
      }

      console.log("\n" + "=".repeat(70));
    }

    console.log(`\n✅ إجمالي المدرسين: ${approvedApps.length}`);
    console.log(
      "\n💡 تلميح: استخدم البريد الإلكتروني أعلاه للدخول بكلمة المرور التي سجلت بها",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkApprovedInstructors();
