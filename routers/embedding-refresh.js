// Create a new route file: routes/embedding-refresh.js
const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const userSuccessDb = require("../database/models/successChance");
const { triggerEmbeddingWebhooks } = require("../utils/embedding-hooks");
const authenticateToken = require("../middlewares/authMiddleware");

// Helper function to get combined user data (reuse from success-chance routes)
const getCombinedUserData = async (userId) => {
  try {
    console.log(`🔍 Getting combined user data for userId: ${userId}`);

    const user = await UserDb.findById(userId);
    if (!user) {
      console.error(`❌ User not found for userId: ${userId}`);
      return null;
    }

    const successChance = await userSuccessDb.findOne({ userId });

    const combinedData = {
      _id: userId,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      otpVerified: user.otpVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      hasSuccessChanceData: !!successChance,
      successChanceData: successChance
        ? {
            studyLevel: successChance.studyLevel,
            gradeType: successChance.gradeType,
            grade: successChance.grade,
            dateOfBirth: successChance.dateOfBirth,
            nationality: successChance.nationality,
            majorSubject: successChance.majorSubject,
            livingCosts: successChance.livingCosts,
            tuitionFee: successChance.tuitionFee,
            languageProficiency: successChance.languageProficiency,
            workExperience: successChance.workExperience,
            studyPreferenced: successChance.studyPreferenced,
          }
        : null,

      lastUpdated: new Date(),
      embeddingContext: {
        dataSource: "manual_refresh",
        triggerReason: "user_requested_refresh",
        includesAcademicData: !!successChance,
      },
    };

    return combinedData;
  } catch (error) {
    console.error("❌ Error getting combined user data:", error);
    return null;
  }
};

// Refresh embeddings endpoint
router.post("/refresh-embeddings", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  console.log(`🔄 Processing embedding refresh request for user ID: ${userId}`);

  try {
    // Get current user data with success chance info
    const combinedUserData = await getCombinedUserData(userId);

    if (!combinedUserData) {
      return res.status(404).json({
        success: false,
        message: "User data not found for embedding refresh",
      });
    }

    console.log(`📤 Triggering embedding refresh for user ${userId}`);

    // Trigger embedding webhooks
    const results = await triggerEmbeddingWebhooks(
      "update",
      "userdbs",
      userId.toString(),
      combinedUserData
    );

    // Check results
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value?.success
    ).length;
    const failed = results.length - successful;

    const embeddingSuccess = successful > 0;

    if (embeddingSuccess) {
      console.log(
        `✅ Embedding refresh successful for user ${userId} (${successful}/${results.length} webhooks succeeded)`
      );

      return res.status(200).json({
        success: true,
        message: "Embeddings refreshed successfully",
        stats: {
          successful,
          failed,
          total: results.length,
          hasSuccessChanceData: combinedUserData.hasSuccessChanceData,
        },
        refreshedAt: new Date().toISOString(),
      });
    } else {
      console.error(`❌ All embedding webhooks failed for user ${userId}`);

      return res.status(500).json({
        success: false,
        message: "Failed to refresh embeddings - all webhooks failed",
        stats: {
          successful: 0,
          failed,
          total: results.length,
        },
      });
    }
  } catch (error) {
    console.error(
      `❌ Error refreshing embeddings for user ID ${userId}:`,
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error while refreshing embeddings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get embedding status endpoint
router.get("/embedding-status", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await UserDb.findById(userId);
    const successChance = await userSuccessDb.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      embeddingData: {
        userId: userId,
        hasUserData: true,
        hasSuccessChanceData: !!successChance,
        lastUserUpdate: user.updatedAt,
        lastSuccessChanceUpdate: successChance?.updatedAt,
        profileCompleteness: successChance
          ? calculateProfileCompleteness(successChance)
          : 0,
      },
    });
  } catch (error) {
    console.error(
      `❌ Error getting embedding status for user ID ${userId}:`,
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error while getting embedding status",
    });
  }
});

// Helper function to calculate profile completeness
const calculateProfileCompleteness = (successChance) => {
  if (!successChance) return 0;

  let completed = 0;
  let total = 0;

  const requiredFields = [
    "studyLevel",
    "gradeType",
    "grade",
    "dateOfBirth",
    "nationality",
    "majorSubject",
  ];
  requiredFields.forEach((field) => {
    total++;
    if (successChance[field]) completed++;
  });

  const optionalFields = ["languageProficiency", "workExperience"];
  optionalFields.forEach((field) => {
    total++;
    if (successChance[field]) completed++;
  });

  if (successChance.livingCosts?.amount && successChance.livingCosts?.currency)
    completed++;
  total++;

  if (successChance.tuitionFee?.amount && successChance.tuitionFee?.currency)
    completed++;
  total++;

  if (
    successChance.studyPreferenced?.country &&
    successChance.studyPreferenced?.degree &&
    successChance.studyPreferenced?.subject
  )
    completed++;
  total++;

  return Math.round((completed / total) * 100);
};

module.exports = router;
