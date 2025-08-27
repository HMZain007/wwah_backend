const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");
const UserDb = require("../database/models/UserDb");
const userSuccessDb = require('../database/models/successChance');

/**
 * @route GET /profile/data
 * @desc Get user profile data with all related information
 * @access Private
 */
router.get("/data", authenticateToken, async (req, res) => {
  console.log("Fetching user data...");
  const id = req.user.id;
  try {
    // Fetch basic user information
    const basicInfo = await UserDb.findById(id);
    if (!basicInfo) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    // Fetch detailed user information
    const detailedInfo = await userSuccessDb.findOne({ userId: id });
    // Create response object with all available user data
    const userData = {
      success: true,
      message: "User data fetched successfully",
      user: basicInfo, detailedInfo
    };

    // Log the response size
    const responseSize = JSON.stringify(userData).length;
    console.log(`Sending user data response (${responseSize} bytes)`);

    res.json(userData);
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
    });
  }
});

/**
 * @route PATCH /profile/update
 * @desc Update user profile information
 * @access Private
 */
router.patch("/update", authenticateToken, async (req, res) => {
  const id = req.user.id;
  const updateData = req.body;

  try {
    // Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided"
      });
    }

    // Update basic user info
    if (updateData.basicInfo) {
      const updatedBasicInfo = await UserDb.findByIdAndUpdate(
        id,
        { $set: updateData.basicInfo },
        { new: true, runValidators: true }
      );

      if (!updatedBasicInfo) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
    }

    // Update detailed user info
    if (updateData.detailedInfo) {
      const detailedInfoData = {
        userId: id,
      };

      // Map frontend data structure to database schema
      if (updateData.detailedInfo.AcademicInfo) {
        const academic = updateData.detailedInfo.AcademicInfo;
        detailedInfoData.studyLevel = academic.studyLevel;
        detailedInfoData.gradeType = academic.gradeType;
        detailedInfoData.grade = academic.grade;
        detailedInfoData.majorSubject = academic.majorSubject;
      }

      if (updateData.detailedInfo.PersonalInfo) {
        const personal = updateData.detailedInfo.PersonalInfo;
        detailedInfoData.dateOfBirth = personal.dateOfBirth;
        detailedInfoData.nationality = personal.nationality;
        detailedInfoData.workExperience = personal.workExperience;
      }

      if (updateData.detailedInfo.FinancialInfo) {
        const financial = updateData.detailedInfo.FinancialInfo;
        detailedInfoData.livingCosts = financial.livingCosts;
        detailedInfoData.tuitionFee = financial.tuitionFee;
      }

      if (updateData.detailedInfo.LanguageProf) {
        detailedInfoData.languageProficiency = updateData.detailedInfo.LanguageProf;
      }

      if (updateData.detailedInfo.UserPref) {
        detailedInfoData.studyPreferenced = updateData.detailedInfo.UserPref;
      }

      // Use upsert to create if not exists
      const updatedDetailedInfo = await userSuccessDb.findOneAndUpdate(
        { userId: id },
        { $set: detailedInfoData },
        { new: true, runValidators: true, upsert: true }
      );
    }

    res.json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message
    });
  }
});

module.exports = router;