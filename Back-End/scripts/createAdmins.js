import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/database.js';

const createAdmins = async () => {
  try {
    await connectDB();

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      phone: String,
      password: String,
      role: String,
      enrolledCourses: { type: [mongoose.Schema.Types.Mixed], default: [] },
      isBlocked: { type: Boolean, default: false },
      avatar: { type: String, default: null },
    }, { timestamps: true }));

    const admins = [
      {
        name: 'yasa',
        email: 'yasa@admin.com',
        phone: '01000000001',
        password: 'yasa12345',
        role: 'admin',
      },
      {
        name: '3bnaser',
        email: '3bnaser@admin.com',
        phone: '01000000002',
        password: '3bnaser123',
        role: 'admin',
      },
    ];

    for (const adminData of admins) {
      const existing = await User.findOne({ email: adminData.email });
      if (existing) {
        console.log(`⚠️  Admin "${adminData.name}" already exists (${adminData.email})`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);

      await User.create({
        ...adminData,
        password: hashedPassword,
      });

      console.log(`✅ Admin "${adminData.name}" created successfully (${adminData.email})`);
    }

    console.log('\n🎉 Done! Admin accounts are ready.');
    console.log('\nLogin credentials:');
    console.log('  1. Email: yasa@admin.com    | Password: yasa12345');
    console.log('  2. Email: 3bnaser@admin.com | Password: 3bnaser123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmins();
