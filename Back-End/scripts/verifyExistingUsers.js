import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to mark all existing users as email verified
 * Run this ONCE after deploying the email verification feature
 * to ensure existing users aren't locked out.
 * 
 * Usage: node scripts/verifyExistingUsers.js
 */

const MONGODB_URI = process.env.MONGODB_URI;

async function verifyExistingUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update all users that don't have isEmailVerified set
    const result = await mongoose.connection.db.collection('users').updateMany(
      { isEmailVerified: { $ne: true } },
      { $set: { isEmailVerified: true } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users to verified`);
    console.log(`📊 Total matched: ${result.matchedCount}`);
    
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyExistingUsers();
