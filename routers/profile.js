/**
 * @swagger
 * /profile/data:
 *   get:
 *     summary: Get User Profile Data
 *     description: Retrieves complete user profile including basic information and detailed success chance data for the authenticated user.
 *     tags:
 *       - Profile
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User data fetched successfully"
 *                 user:
 *                   type: object
 *                   description: Basic user information
 *                   properties:
 *                     _id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isEmailVerified:
 *                       type: boolean
 *                     profilePicture:
 *                       type: string
 *                       nullable: true
 *                     provider:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 detailedInfo:
 *                   type: object
 *                   nullable: true
 *                   description: Detailed user success chance information
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     studyLevel:
 *                       type: string
 *                     gradeType:
 *                       type: string
 *                     grade:
 *                       type: number
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                     nationality:
 *                       type: string
 *                     majorSubject:
 *                       type: string
 *                     livingCosts:
 *                       type: object
 *                       properties:
 *                         amount:
 *                           type: number
 *                         currency:
 *                           type: string
 *                     tuitionFee:
 *                       type: object
 *                       properties:
 *                         amount:
 *                           type: number
 *                         currency:
 *                           type: string
 *                     languageProficiency:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         level:
 *                           type: string
 *                         test:
 *                           type: string
 *                         score:
 *                           type: number
 *                     workExperience:
 *                       type: number
 *                       nullable: true
 *                     studyPreferenced:
 *                       type: object
 *                       properties:
 *                         country:
 *                           type: string
 *                         degree:
 *                           type: string
 *                         subject:
 *                           type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error while fetching user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error While Fetch The Data"
 *                 error:
 *                   type: string
 *                 stack:
 *                   type: string
 */

/**
 * @swagger
 * /profile/update:
 *   patch:
 *     summary: Update User Profile
 *     description: Updates user profile including basic information and detailed success chance data. Supports partial updates with upsert capability for detailed info.
 *     tags:
 *       - Profile
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               basicInfo:
 *                 type: object
 *                 description: Basic user information to update
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     example: "John"
 *                   lastName:
 *                     type: string
 *                     example: "Doe"
 *                   phone:
 *                     type: string
 *                     example: "1234567890"
 *                   profilePicture:
 *                     type: string
 *                     example: "https://example.com/profile.jpg"
 *               detailedInfo:
 *                 type: object
 *                 description: Detailed user information to update
 *                 properties:
 *                   AcademicInfo:
 *                     type: object
 *                     properties:
 *                       studyLevel:
 *                         type: string
 *                         example: "Undergraduate"
 *                       gradeType:
 *                         type: string
 *                         example: "CGPA"
 *                       grade:
 *                         type: number
 *                         example: 3.5
 *                       majorSubject:
 *                         type: string
 *                         example: "Computer Science"
 *                   PersonalInfo:
 *                     type: object
 *                     properties:
 *                       dateOfBirth:
 *                         type: string
 *                         format: date
 *                         example: "2002-04-18"
 *                       nationality:
 *                         type: string
 *                         example: "Pakistan"
 *                       workExperience:
 *                         type: number
 *                         example: 2
 *                   FinancialInfo:
 *                     type: object
 *                     properties:
 *                       livingCosts:
 *                         type: object
 *                         properties:
 *                           amount:
 *                             type: number
 *                             example: 6000
 *                           currency:
 *                             type: string
 *                             example: "USD"
 *                       tuitionFee:
 *                         type: object
 *                         properties:
 *                           amount:
 *                             type: number
 *                             example: 12000
 *                           currency:
 *                             type: string
 *                             example: "USD"
 *                   LanguageProf:
 *                     type: object
 *                     properties:
 *                       level:
 *                         type: string
 *                         example: "Intermediate"
 *                       test:
 *                         type: string
 *                         example: "IELTS"
 *                       score:
 *                         type: number
 *                         example: 6.5
 *                   UserPref:
 *                     type: object
 *                     properties:
 *                       country:
 *                         type: string
 *                         example: "United Kingdom"
 *                       degree:
 *                         type: string
 *                         example: "Masters"
 *                       subject:
 *                         type: string
 *                         example: "Artificial Intelligence"
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *       400:
 *         description: No update data provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No update data provided"
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error while updating profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to update profile"
 *                 error:
 *                   type: string
 */
const express = require("express");
const router = express.Router();
// const authenticateToken = require("../middlewares/authMiddleware");
const UserDb = require("../database/models/UserDb");
const userSuccessDb = require("../database/models/successChance");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/data", authenticateToken, async (req, res) => {
  console.log("Fetching user data from Profile...");
  const id = req.user.id;
  try {
    // Fetch basic user information
    const basicInfo = await UserDb.findById(id);
    if (!basicInfo) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Fetch detailed user information
    const detailedInfo = await userSuccessDb.findOne({ userId: id });
    // Create response object with all available user data
    const userData = {
      success: true,
      message: "User data fetched successfully",
      user: basicInfo,
      detailedInfo,
    };

    // Log the response size
    const responseSize = JSON.stringify(userData).length;
    console.log(`Sending user data response (${responseSize} bytes)`);

    res.json(userData);
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error While Fetch The Data",
      error: error.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
    });
  }
});

router.patch("/update", authenticateToken, async (req, res) => {
  const id = req.user.id;
  const updateData = req.body;

  try {
    // Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
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
          message: "User not found",
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
        detailedInfoData.languageProficiency =
          updateData.detailedInfo.LanguageProf;
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
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

module.exports = router;
