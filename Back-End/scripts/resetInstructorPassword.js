import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const resetPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // The user email
    const userEmail = "ghdkuzyuf@gmail.com";
    const newPassword = "instructor123";

    // Find the user
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log("❌ المستخدم غير موجود");
      process.exit(1);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log("✅ تم تغيير كلمة المرور بنجاح!\n");
    console.log("=".repeat(50));
    console.log("📧 البريد الإلكتروني:", userEmail);
    console.log("🔑 كلمة المرور الجديدة:", newPassword);
    console.log("👤 الاسم:", user.name);
    console.log("🎯 الدور:", user.role);
    console.log("=".repeat(50));
    console.log("\n🚀 يمكنك الآن تسجيل الدخول بهذه البيانات!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

resetPassword();
