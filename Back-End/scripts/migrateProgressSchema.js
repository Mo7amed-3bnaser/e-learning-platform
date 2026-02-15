import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import User from "../models/User.js";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, "..", ".env") });

/**
 * Migration Script: Convert enrolledCourses from simple array to structured format
 *
 * Old format: enrolledCourses: [ObjectId, ObjectId, ...]
 * New format: enrolledCourses: [{ course: ObjectId, enrolledAt: Date, videoProgress: [] }, ...]
 *
 * Usage: node Back-End/scripts/migrateProgressSchema.js
 */

const migrateProgressSchema = async () => {
  try {
    // Connect to MongoDB
    console.log("📦 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected\n");

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to process\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Check if user needs migration
        // If enrolledCourses is empty, skip
        if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
          console.log(`⏭️  Skipping user ${user.email} (no enrolled courses)`);
          skippedCount++;
          continue;
        }

        // Check if already in new format (has 'course' field)
        const firstEnrollment = user.enrolledCourses[0];
        if (
          firstEnrollment &&
          typeof firstEnrollment === "object" &&
          firstEnrollment.course
        ) {
          console.log(`⏭️  Skipping user ${user.email} (already migrated)`);
          skippedCount++;
          continue;
        }

        // Migrate: Convert simple ObjectIds to structured format
        const oldEnrollments = [...user.enrolledCourses];
        const newEnrollments = oldEnrollments.map((courseId) => ({
          course: courseId,
          enrolledAt: user.createdAt || new Date(),
          videoProgress: [],
        }));

        // Replace enrolledCourses
        user.enrolledCourses = newEnrollments;

        // Save user
        await user.save();
        console.log(
          `✅ Migrated user ${user.email} (${oldEnrollments.length} courses)`,
        );
        migratedCount++;
      } catch (userError) {
        console.error(
          `❌ Error migrating user ${user.email}:`,
          userError.message,
        );
        errorCount++;
      }
    }

    console.log("\n=================================");
    console.log("📊 Migration Summary:");
    console.log("=================================");
    console.log(`✅ Successfully migrated: ${migratedCount} users`);
    console.log(
      `⏭️  Skipped (already migrated or no courses): ${skippedCount} users`,
    );
    console.log(`❌ Errors: ${errorCount} users`);
    console.log(`📦 Total processed: ${users.length} users`);
    console.log("=================================\n");

    // Close connection
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
    console.log("🎉 Migration complete!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

// Run migration
migrateProgressSchema();
