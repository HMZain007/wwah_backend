// migrateAppliedCourses.js - Place this file in your backend root directory
const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

// Import your UserDb model
const UserDb = require("./database/models/UserDb");

async function connectToDatabase() {
  try {
    // Try different environment variables for MongoDB connection
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.DATABASE_URL ||
      process.env.MONGO_URI ||
      process.env.DB_URI;

    if (!mongoUri) {
      console.error("❌ MongoDB connection string not found!");
      console.error(
        "Please set one of these environment variables in your .env file:"
      );
      console.error("  - MONGODB_URI");
      console.error("  - DATABASE_URL");
      console.error("  - MONGO_URI");
      console.error("  - DB_URI");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("📁 Connected to MongoDB successfully");
    console.log(`🔗 Database: ${mongoUri.split("/").pop()?.split("?")[0]}`);
  } catch (error) {
    console.error("💥 Failed to connect to MongoDB:", error.message);
    console.error("Please check your connection string in .env file");
    process.exit(1);
  }
}

async function migrateAppliedCourses() {
  try {
    console.log(
      "🚀 Starting migration: Converting appliedCourses from strings to objects..."
    );
    console.log(
      "📁 UserDb model loaded successfully from ./database/models/UserDb"
    );

    // Connect to MongoDB
    await connectToDatabase();

    // First, let's check the total number of users
    const totalUsers = await UserDb.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);

    // Find all users who have appliedCourses as strings (old format)
    console.log(
      "🔍 Looking for users with old format appliedCourses (strings)..."
    );

    const usersWithOldFormat = await UserDb.find({
      appliedCourses: {
        $exists: true,
        $not: { $size: 0 },
        $elemMatch: { $type: "string" }, // Find arrays containing strings
      },
    });

    console.log(
      `📊 Found ${usersWithOldFormat.length} users with old appliedCourses format`
    );

    // Also check for users who might already have the new format
    const usersWithNewFormat = await UserDb.find({
      appliedCourses: {
        $exists: true,
        $not: { $size: 0 },
        $elemMatch: { $type: "object" },
      },
    });
    console.log(
      `📊 Found ${usersWithNewFormat.length} users with new object format`
    );

    if (usersWithOldFormat.length === 0) {
      console.log("✅ No users found with old string format.");
      if (usersWithNewFormat.length > 0) {
        console.log("✅ Migration appears to have been completed already.");
      } else {
        console.log("ℹ️ No users have any applied courses yet.");
      }
      await mongoose.disconnect();
      return;
    }

    console.log("\n🔄 Starting migration process...\n");

    let migratedCount = 0;
    let errorCount = 0;

    // Process each user
    for (let i = 0; i < usersWithOldFormat.length; i++) {
      const user = usersWithOldFormat[i];

      try {
        console.log(
          `🔄 [${i + 1}/${usersWithOldFormat.length}] Migrating user: ${
            user._id
          }`
        );
        console.log(`   Email: ${user.email}`);
        console.log(
          `   Current appliedCourses: ${JSON.stringify(user.appliedCourses)}`
        );

        // Transform string IDs to objects
        const migratedAppliedCourses = user.appliedCourses
          .filter((courseId) => typeof courseId === "string") // Only process strings
          .map((courseId) => ({
            courseId: courseId,
            applicationTracker: {
              completeApplication: true,
              applied: true,
              offerLetterReceived: true,
              confirmEnrollment: true,
            },
            appliedDate: user.updatedAt || user.createdAt || new Date(),
            status: "pending",
            notes: "",
            deadline: null,
          }));

        // Keep any objects that might already exist (safety measure)
        const existingObjects = user.appliedCourses.filter(
          (item) => typeof item === "object"
        );

        // Combine migrated and existing objects
        const finalAppliedCourses = [
          ...migratedAppliedCourses,
          ...existingObjects,
        ];

        console.log(
          `   📝 Converting ${migratedAppliedCourses.length} string IDs to objects...`
        );

        // Update user with new format
        const updatedUser = await UserDb.findByIdAndUpdate(
          user._id,
          {
            appliedCourses: finalAppliedCourses,
            // Add migration metadata (optional)
            migrationVersion: 1,
            lastMigrated: new Date(),
          },
          { new: true }
        );

        console.log(
          `   ✅ Successfully migrated! New format:`,
          finalAppliedCourses.map((course) => ({
            courseId: course.courseId,
            status: course.status,
          }))
        );

        migratedCount++;
      } catch (error) {
        console.error(
          `   ❌ Error migrating user ${user._id} (${user.email}):`,
          error.message
        );
        errorCount++;
      }

      console.log(""); // Empty line for readability
    }

    console.log("📈 Migration Summary:");
    console.log(`   ✅ Successfully migrated: ${migratedCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   📊 Total processed: ${usersWithOldFormat.length} users`);

    // Verify migration
    console.log("\n🔍 Verifying migration...");
    const remainingOldFormat = await UserDb.find({
      appliedCourses: {
        $exists: true,
        $not: { $size: 0 },
        $elemMatch: { $type: "string" },
      },
    });

    const newFormatCount = await UserDb.find({
      appliedCourses: {
        $exists: true,
        $not: { $size: 0 },
        $elemMatch: { $type: "object" },
      },
    });

    console.log(
      `📊 Remaining users with old format: ${remainingOldFormat.length}`
    );
    console.log(`📊 Users with new format: ${newFormatCount.length}`);

    if (remainingOldFormat.length === 0) {
      console.log(
        "🎉 Migration completed successfully! All users migrated to new format."
      );
    } else {
      console.log(
        "⚠️ Some users still have old format. Check the errors above."
      );
    }

    await mongoose.disconnect();
    console.log("📁 Disconnected from MongoDB");
  } catch (error) {
    console.error("💥 Migration failed:", error);
    await mongoose.disconnect();
    throw error;
  }
}

// Rollback function (in case you need to revert)
async function rollbackAppliedCourses() {
  try {
    console.log(
      "🔄 Starting rollback: Converting appliedCourses back to strings..."
    );
    console.log(
      "⚠️ WARNING: This will remove all tracking data and revert to simple course IDs!"
    );

    await connectToDatabase();

    const usersWithNewFormat = await UserDb.find({
      appliedCourses: {
        $exists: true,
        $not: { $size: 0 },
        $elemMatch: { $type: "object" },
      },
    });

    console.log(`📊 Found ${usersWithNewFormat.length} users to rollback`);

    if (usersWithNewFormat.length === 0) {
      console.log("✅ No users found with new format to rollback.");
      await mongoose.disconnect();
      return;
    }

    let rolledBackCount = 0;

    for (let i = 0; i < usersWithNewFormat.length; i++) {
      const user = usersWithNewFormat[i];

      console.log(
        `🔄 [${i + 1}/${usersWithNewFormat.length}] Rolling back user: ${
          user._id
        } (${user.email})`
      );

      const courseIds = user.appliedCourses
        .filter((item) => typeof item === "object" && item.courseId)
        .map((item) => item.courseId);

      await UserDb.findByIdAndUpdate(user._id, {
        appliedCourses: courseIds,
        $unset: { migrationVersion: "", lastMigrated: "" },
      });

      console.log(`   ✅ Rolled back to ${courseIds.length} simple course IDs`);
      rolledBackCount++;
    }

    console.log(
      `\n📈 Rollback Summary: ${rolledBackCount} users rolled back to old format`
    );
    await mongoose.disconnect();
    console.log("📁 Disconnected from MongoDB");
  } catch (error) {
    console.error("💥 Rollback failed:", error);
    await mongoose.disconnect();
    throw error;
  }
}

// Show current status
async function showStatus() {
  try {
    console.log("📊 Checking current database status...");
    await connectToDatabase();

    const totalUsers = await UserDb.countDocuments();
    const usersWithAppliedCourses = await UserDb.countDocuments({
      appliedCourses: { $exists: true, $not: { $size: 0 } },
    });

    const usersWithOldFormat = await UserDb.countDocuments({
      appliedCourses: {
        $exists: true,
        $not: { $size: 0 },
        $elemMatch: { $type: "string" },
      },
    });

    const usersWithNewFormat = await UserDb.countDocuments({
      appliedCourses: {
        $exists: true,
        $not: { $size: 0 },
        $elemMatch: { $type: "object" },
      },
    });

    console.log("\n📈 Database Status:");
    console.log(`   👥 Total users: ${totalUsers}`);
    console.log(`   📚 Users with applied courses: ${usersWithAppliedCourses}`);
    console.log(`   📜 Users with old format (strings): ${usersWithOldFormat}`);
    console.log(`   📋 Users with new format (objects): ${usersWithNewFormat}`);

    if (usersWithOldFormat > 0) {
      console.log(
        '\n💡 Migration needed: Run "node migrateAppliedCourses.js migrate"'
      );
    } else if (usersWithNewFormat > 0) {
      console.log("\n✅ Migration completed: All users have new object format");
    } else {
      console.log("\nℹ️ No users have applied courses yet");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("💥 Status check failed:", error);
    await mongoose.disconnect();
    throw error;
  }
}

// CLI handling
const command = process.argv[2];

if (command === "migrate") {
  migrateAppliedCourses()
    .then(() => {
      console.log("🎉 Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration failed:", error);
      process.exit(1);
    });
} else if (command === "rollback") {
  rollbackAppliedCourses()
    .then(() => {
      console.log("🎉 Rollback completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Rollback failed:", error);
      process.exit(1);
    });
} else if (command === "status") {
  showStatus()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Status check failed:", error);
      process.exit(1);
    });
} else {
  console.log("📋 Applied Courses Migration Tool");
  console.log("=====================================");
  console.log("");
  console.log("Usage:");
  console.log(
    "  node migrateAppliedCourses.js status    - Check current database status"
  );
  console.log(
    "  node migrateAppliedCourses.js migrate   - Convert strings to objects"
  );
  console.log(
    "  node migrateAppliedCourses.js rollback  - Convert objects back to strings"
  );
  console.log("");
  console.log("🔧 Requirements:");
  console.log(
    "  - MongoDB connection string in .env file (MONGODB_URI, DATABASE_URL, etc.)"
  );
  console.log("  - UserDb model at ./database/models/UserDb.js");
  console.log("");
  console.log('💡 Tip: Run "status" first to see what needs to be migrated');
  process.exit(1);
}
