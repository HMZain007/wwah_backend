/**
 * @swagger
 * /success-chance/add:
 *   post:
 *     summary: Create or Update Success Chance Data
 *     description: This API creates success chance data for a user if not present, or updates the existing record.
 *     tags:
 *       - Success Chance
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyLevel
 *               - grade
 *               - dateOfBirth
 *               - nationality
 *               - majorSubject
 *               - livingCosts
 *               - tuitionfee
 *               - StudyPreferenced
 *             properties:
 *               studyLevel:
 *                 type: string
 *                 example: "Undergraduate"
 *               grade:
 *                 type: object
 *                 required:
 *                   - gradeType
 *                   - score
 *                 properties:
 *                   gradeType:
 *                     type: string
 *                     example: "CGPA"
 *                   score:
 *                     type: number
 *                     example: 3.2
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "2002-04-18"
 *               nationality:
 *                 type: string
 *                 example: "Pakistan"
 *               majorSubject:
 *                 type: string
 *                 example: "Computer Science"
 *               livingCosts:
 *                 type: object
 *                 required:
 *                   - amount
 *                   - currency
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 6000
 *                   currency:
 *                     type: string
 *                     example: "USD"
 *               tuitionfee:
 *                 type: object
 *                 required:
 *                   - amount
 *                   - currency
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 12000
 *                   currency:
 *                     type: string
 *                     example: "USD"
 *               LanguageProficiency:
 *                 type: object
 *                 nullable: true
 *                 properties:
 *                   level:
 *                     type: string
 *                     example: "Intermediate"
 *                   test:
 *                     type: string
 *                     example: "IELTS"
 *                   score:
 *                     type: number
 *                     example: 6.5
 *               hasExperience:
 *                 type: boolean
 *                 example: true
 *               years:
 *                 type: number
 *                 nullable: true
 *                 example: 2
 *               StudyPreferenced:
 *                 type: object
 *                 required:
 *                   - country
 *                   - degree
 *                   - subject
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: "United Kingdom"
 *                   degree:
 *                     type: string
 *                     example: "Masters"
 *                   subject:
 *                     type: string
 *                     example: "Artificial Intelligence"
 *     responses:
 *       201:
 *         description: Success chance data created successfully.
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
 *                   example: "Success chance data created successfully"
 *                 action:
 *                   type: string
 *                   example: "created"
 *                 data:
 *                   type: object
 *                 embeddingUpdate:
 *                   type: string
 *                   example: "success"
 *                 metadata:
 *                   type: object
 *       200:
 *         description: Success chance data updated successfully.
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
 *                   example: "Success chance data updated successfully"
 *                 action:
 *                   type: string
 *                   example: "updated"
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error.
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
 *                 field:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       409:
 *         description: Duplicate entry error.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /success-chance/add-upsert:
 *   post:
 *     summary: Create or Update Success Chance Data (Native MongoDB Upsert)
 *     description: Alternative endpoint using MongoDB's native upsert functionality to create or update success chance data.
 *     tags:
 *       - Success Chance
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyLevel
 *               - grade
 *               - dateOfBirth
 *               - nationality
 *               - majorSubject
 *               - livingCosts
 *               - tuitionfee
 *               - StudyPreferenced
 *             properties:
 *               studyLevel:
 *                 type: string
 *                 example: "Undergraduate"
 *               grade:
 *                 type: object
 *                 properties:
 *                   gradeType:
 *                     type: string
 *                     example: "CGPA"
 *                   score:
 *                     type: number
 *                     example: 3.2
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "2002-04-18"
 *               nationality:
 *                 type: string
 *                 example: "Pakistan"
 *               majorSubject:
 *                 type: string
 *                 example: "Computer Science"
 *               livingCosts:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 6000
 *                   currency:
 *                     type: string
 *                     example: "USD"
 *               tuitionfee:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 12000
 *                   currency:
 *                     type: string
 *                     example: "USD"
 *               LanguageProficiency:
 *                 type: object
 *                 nullable: true
 *                 properties:
 *                   level:
 *                     type: string
 *                     example: "Intermediate"
 *                   test:
 *                     type: string
 *                     example: "IELTS"
 *                   score:
 *                     type: number
 *                     example: 6.5
 *               years:
 *                 type: number
 *                 nullable: true
 *                 example: 2
 *               StudyPreferenced:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: "United Kingdom"
 *                   degree:
 *                     type: string
 *                     example: "Masters"
 *                   subject:
 *                     type: string
 *                     example: "Artificial Intelligence"
 *     responses:
 *       201:
 *         description: Success chance data created successfully.
 *       200:
 *         description: Success chance data updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /success-chance/update:
 *   patch:
 *     summary: Update Existing Success Chance Data
 *     description: Updates specific fields of existing success chance data for the authenticated user.
 *     tags:
 *       - Success Chance
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
 *               studyLevel:
 *                 type: string
 *                 example: "Graduate"
 *               grade:
 *                 type: number
 *                 example: 3.5
 *               gradeType:
 *                 type: string
 *                 example: "CGPA Grade Scale"
 *               cgpaOutOf:
 *                 type: number
 *                 example: 4.0
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "2002-04-18"
 *               nationality:
 *                 type: string
 *                 example: "Pakistan"
 *               majorSubject:
 *                 type: string
 *                 example: "Computer Science"
 *               livingCosts:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 7000
 *                   currency:
 *                     type: string
 *                     example: "USD"
 *               tuitionFee:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 15000
 *                   currency:
 *                     type: string
 *                     example: "USD"
 *               languageProficiency:
 *                 type: object
 *                 properties:
 *                   level:
 *                     type: string
 *                     example: "Advanced"
 *                   test:
 *                     type: string
 *                     example: "TOEFL"
 *                   score:
 *                     type: number
 *                     example: 95
 *               hasExperience:
 *                 type: boolean
 *                 example: false
 *               years:
 *                 type: number
 *                 nullable: true
 *                 example: null
 *               studyPreferenced:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: "United States"
 *                   degree:
 *                     type: string
 *                     example: "PhD"
 *                   subject:
 *                     type: string
 *                     example: "Machine Learning"
 *     responses:
 *       200:
 *         description: Success chance data updated successfully.
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
 *                   example: "Success chance data updated successfully"
 *                 data:
 *                   type: object
 *                 embeddingUpdate:
 *                   type: string
 *                   example: "success"
 *                 metadata:
 *                   type: object
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: No success chance data found to update.
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
 *                   example: "No success chance data found to update. Use POST to create."
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /success-chance:
 *   get:
 *     summary: Get Success Chance Data
 *     description: Retrieves success chance data for the authenticated user.
 *     tags:
 *       - Success Chance
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success chance data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
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
 *                     tuitionFee:
 *                       type: object
 *                     languageProficiency:
 *                       type: object
 *                     workExperience:
 *                       type: number
 *                       nullable: true
 *                     studyPreferenced:
 *                       type: object
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     profileCompleteness:
 *                       type: number
 *                       example: 85
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                     hasLanguageProficiency:
 *                       type: boolean
 *                     hasWorkExperience:
 *                       type: boolean
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: No success chance data found for this user.
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
 *                   example: "No success chance data found for this user"
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /success-chance/delete:
 *   delete:
 *     summary: Delete Success Chance Data
 *     description: Deletes all success chance data for the authenticated user.
 *     tags:
 *       - Success Chance
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success chance data deleted successfully.
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
 *                   example: "Success chance data deleted successfully"
 *                 embeddingUpdate:
 *                   type: string
 *                   example: "success"
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: No success chance data found to delete.
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
 *                   example: "No success chance data found to delete"
 *       500:
 *         description: Server error.
 */

const express = require("express");
const router = express.Router();
// const authenticateToken = require("../middlewares/authMiddleware");
const userSuccessDb = require("../database/models/successChance");
const UserDb = require("../database/models/UserDb");
const { triggerEmbeddingWebhooks } = require("../utils/embedding-hooks"); // Fixed import
const authenticateToken = require("../middlewares/authMiddleware");

// Input validation middleware
const validateSuccessChanceInput = (req, res, next) => {
  // console.log("Validating input for success chance data:", req.body);
  const {
    studyLevel,
    grade,
    dateOfBirth,
    nationality,
    majorSubject,
    livingCosts,
    tuitionFee,
    LanguageProficiency,
    years,
    StudyPreferenced,
  } = req.body;

  // Required fields validation
  const requiredFields = [
    { field: studyLevel, name: "Study Level" },
    { field: grade, name: "Grade" },
    { field: dateOfBirth, name: "Date of Birth" },
    { field: nationality, name: "Nationality" },
    { field: majorSubject, name: "Major Subject" },
  ];

  // Check required fields
  for (const { field, name } of requiredFields) {
    if (!field) {
      return res.status(400).json({
        success: false,
        message: `${name} is required`,
        field: name.toLowerCase().replace(/\s+/g, "_"),
      });
    }
  }

  // Validate grade object
  if (!grade || !grade.gradeType || !grade.score) {
    return res.status(400).json({
      success: false,
      message: "Grade type and score are required",
      field: "grade",
    });
  }

  // Validate living costs
  if (!livingCosts || !livingCosts.amount || !livingCosts.currency) {
    return res.status(400).json({
      success: false,
      message: "Living costs amount and currency are required",
      field: "livingCosts",
    });
  }

  // Validate Study Preferences
  if (
    !StudyPreferenced ||
    !StudyPreferenced.country ||
    !StudyPreferenced.degree ||
    !StudyPreferenced.subject
  ) {
    return res.status(400).json({
      success: false,
      message: "Study preferences (country, degree, and subject) are required",
      field: "StudyPreferenced",
    });
  }

  // Date of birth validation
  const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOfBirth && !dobRegex.test(dateOfBirth)) {
    return res.status(400).json({
      success: false,
      message: "Date of birth must be in YYYY-MM-DD format",
      field: "dateOfBirth",
    });
  }
  next();
};

// Enhanced helper function to get combined user data for embeddings
const getCombinedUserData = async (userId) => {
  try {
    console.log(`🔍 Getting combined user data for userId: ${userId}`);

    // Get user data
    const user = await UserDb.findById(userId);
    if (!user) {
      console.error(`❌ User not found for userId: ${userId}`);
      return null;
    }

    // Get success chance data
    const successChance = await userSuccessDb.findOne({ userId });

    console.log(`📊 Found success chance data:`, !!successChance);

    // Create comprehensive combined data for better embeddings
    const combinedData = {
      _id: userId,
      // User profile data
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      otpVerified: user.otpVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      // Success chance data for embedding generation
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
            // Add computed fields for better embedding context
            totalBudget:
              (successChance.livingCosts?.amount || 0) +
              (successChance.tuitionFee?.amount || 0),
            hasLanguageProficiency: !!(
              successChance.languageProficiency?.test &&
              successChance.languageProficiency?.score
            ),
            hasWorkExperience: !!(
              successChance.workExperience && successChance.workExperience > 0
            ),
            profileCompleteness: calculateProfileCompleteness(successChance),
          }
        : null,

      // Metadata for embedding generation
      lastUpdated: new Date(),
      embeddingContext: {
        dataSource: "user_profile_with_success_chance",
        includesAcademicData: !!successChance,
        includesFinancialData: !!(
          successChance?.livingCosts && successChance?.tuitionFee
        ),
        includesPreferences: !!successChance?.studyPreferenced,
      },
    };

    console.log(`✅ Combined data created for user ${userId}:`, {
      hasUser: !!user,
      hasSuccessChance: !!successChance,
      dataKeys: Object.keys(combinedData),
      profileCompleteness:
        combinedData.successChanceData?.profileCompleteness || 0,
    });

    return combinedData;
  } catch (error) {
    console.error("❌ Error getting combined user data:", error);
    return null;
  }
};

// Helper function to calculate profile completeness for better embeddings
const calculateProfileCompleteness = (successChance) => {
  if (!successChance) return 0;

  let completed = 0;
  let total = 0;

  // Required fields
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

  // Optional but valuable fields
  const optionalFields = ["languageProficiency", "workExperience"];
  optionalFields.forEach((field) => {
    total++;
    if (successChance[field]) completed++;
  });

  // Nested object fields
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

// Enhanced function to handle embedding updates with retry logic
const updateUserEmbeddings = async (userId, action = "update") => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(
        `🔄 Attempting to update embeddings for user ${userId} (attempt ${
          retryCount + 1
        })`
      );

      const combinedUserData = await getCombinedUserData(userId);
      if (!combinedUserData) {
        throw new Error(`Failed to get combined user data for user ${userId}`);
      }

      const results = await triggerEmbeddingWebhooks(
        action,
        "userdbs",
        userId.toString(),
        combinedUserData
      );

      // Check if at least one webhook succeeded
      const successfulWebhooks = results.filter(
        (result) => result.status === "fulfilled" && result.value?.success
      );

      if (successfulWebhooks.length > 0) {
        console.log(`✅ Embeddings updated successfully for user ${userId}`);
        return { success: true, results };
      } else {
        throw new Error("All embedding webhooks failed");
      }
    } catch (error) {
      retryCount++;
      console.error(
        `❌ Embedding update attempt ${retryCount} failed for user ${userId}:`,
        error.message
      );

      if (retryCount >= maxRetries) {
        console.error(
          `❌ All embedding update attempts failed for user ${userId}`
        );
        return { success: false, error: error.message };
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
      );
    }
  }
};

// Add new success chance entry
// Add new success chance entry (with upsert logic)
router.post(
  "/add",
  authenticateToken,
  validateSuccessChanceInput,
  async (req, res) => {
    const userId = req.user.id;
    console.log(`📝 Processing success chance upsert for user ID: ${userId}`);

    try {
      const {
        studyLevel,
        grade,
        dateOfBirth,
        nationality,
        majorSubject,
        livingCosts,
        tuitionfee,
        LanguageProficiency,
        years,
        StudyPreferenced,
        hasExperience, // Add this to get the boolean value
      } = req.body;

      // Check if user already has an entry
      const existingEntry = await userSuccessDb.findOne({ userId });

      if (existingEntry) {
        console.log(
          `🔄 User ${userId} already has data. Updating existing entry...`
        );

        // Update existing entry
        const updateFields = {
          studyLevel,
          gradeType: grade.gradeType,
          grade: grade.score,
          dateOfBirth,
          nationality,
          majorSubject,
          livingCosts: {
            amount: parseFloat(livingCosts.amount),
            currency: livingCosts.currency,
          },
          tuitionFee: {
            amount: parseFloat(tuitionfee.amount),
            currency: tuitionfee.currency,
          },
          languageProficiency: LanguageProficiency
            ? {
                level: LanguageProficiency.level,
                test: LanguageProficiency.test,
                score: LanguageProficiency.score,
              }
            : undefined,
          // ✅ FIXED: Properly handle clearing work experience
          workExperience:
            hasExperience === false || years === null || years === 0
              ? null
              : years
              ? parseInt(years, 10)
              : null,
          studyPreferenced: {
            country: StudyPreferenced.country,
            degree: StudyPreferenced.degree,
            subject: StudyPreferenced.subject,
          },
          updatedAt: new Date(),
        };

        const updatedEntry = await userSuccessDb.findOneAndUpdate(
          { userId },
          { $set: updateFields },
          { new: true, runValidators: true }
        );

        console.log(
          `✅ Success chance data updated for existing user ID: ${userId}`
        );

        // 🚀 Trigger enhanced embedding update
        const embeddingResult = await updateUserEmbeddings(userId, "update");

        return res.status(200).json({
          success: true,
          message: "Success chance data updated successfully",
          action: "updated",
          data: updatedEntry,
          embeddingUpdate: embeddingResult.success ? "success" : "failed",
          metadata: {
            profileCompleteness: calculateProfileCompleteness(updatedEntry),
            hasLanguageProficiency: !!(
              LanguageProficiency?.test && LanguageProficiency?.score
            ),
            hasWorkExperience: !!(
              updatedEntry.workExperience && updatedEntry.workExperience > 0
            ),
            wasExistingEntry: true,
          },
        });
      }

      // Create new entry if no existing data
      console.log(`➕ Creating new entry for user ID: ${userId}`);

      const newEntry = new userSuccessDb({
        userId,
        studyLevel,
        gradeType: grade.gradeType,
        grade: grade.score,
        dateOfBirth,
        nationality,
        majorSubject,
        livingCosts: {
          amount: parseFloat(livingCosts.amount),
          currency: livingCosts.currency,
        },
        tuitionFee: {
          amount: parseFloat(tuitionfee.amount),
          currency: tuitionfee.currency,
        },
        languageProficiency: LanguageProficiency
          ? {
              level: LanguageProficiency.level,
              test: LanguageProficiency.test,
              score: LanguageProficiency.score,
            }
          : undefined,
        // ✅ FIXED: Properly handle clearing work experience
        workExperience:
          hasExperience === false || years === null || years === 0
            ? null
            : years
            ? parseInt(years, 10)
            : null,
        studyPreferenced: {
          country: StudyPreferenced.country,
          degree: StudyPreferenced.degree,
          subject: StudyPreferenced.subject,
        },
      });

      const saved = await newEntry.save();
      console.log(`✅ New success chance data created for user ID: ${userId}`);

      // 🚀 Trigger enhanced embedding update
      const embeddingResult = await updateUserEmbeddings(userId, "update");

      return res.status(201).json({
        success: true,
        message: "Success chance data created successfully",
        action: "created",
        data: saved,
        embeddingUpdate: embeddingResult.success ? "success" : "failed",
        metadata: {
          profileCompleteness: calculateProfileCompleteness(saved),
          hasLanguageProficiency: !!(
            LanguageProficiency?.level && LanguageProficiency?.score
          ),
          hasWorkExperience: !!(
            saved.workExperience && saved.workExperience > 0
          ),
          wasExistingEntry: false,
        },
      });
    } catch (error) {
      console.error(
        `❌ Error processing success chance data for user ID ${userId}:`,
        error
      );

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
        });
      }

      if (error.name === "MongoServerError" && error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Duplicate entry error",
          field: Object.keys(error.keyPattern)[0],
        });
      }

      return res.status(500).json({
        success: false,
        message: "Server error while processing success chance data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Alternative: If you want a cleaner approach using MongoDB's upsert functionality
router.post(
  "/add-upsert", // Alternative endpoint with native MongoDB upsert
  authenticateToken,
  validateSuccessChanceInput,
  async (req, res) => {
    const userId = req.user.id;
    console.log(
      `📝 Processing success chance upsert (MongoDB native) for user ID: ${userId}`
    );

    try {
      const {
        studyLevel,
        grade,
        dateOfBirth,
        nationality,
        majorSubject,
        livingCosts,
        tuitionfee,
        LanguageProficiency,
        years,
        StudyPreferenced,
      } = req.body;

      const updateFields = {
        userId,
        studyLevel,
        gradeType: grade.gradeType,
        grade: grade.score,
        dateOfBirth,
        nationality,
        majorSubject,
        livingCosts: {
          amount: parseFloat(livingCosts.amount),
          currency: livingCosts.currency,
        },
        tuitionFee: {
          amount: parseFloat(tuitionfee.amount),
          currency: tuitionfee.currency,
        },
        languageProficiency: LanguageProficiency
          ? {
              level: LanguageProficiency.level,
              test: LanguageProficiency.test,
              score: LanguageProficiency.score,
            }
          : undefined,
        workExperience: years ? parseInt(years, 10) : undefined,
        studyPreferenced: {
          country: StudyPreferenced.country,
          degree: StudyPreferenced.degree,
          subject: StudyPreferenced.subject,
        },
        updatedAt: new Date(),
      };

      // Use MongoDB's upsert functionality
      const result = await userSuccessDb.findOneAndUpdate(
        { userId },
        { $set: updateFields },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      const wasCreated =
        !result.createdAt ||
        (result.updatedAt &&
          result.createdAt &&
          Math.abs(new Date(result.updatedAt) - new Date(result.createdAt)) <
            1000);

      console.log(
        `✅ Success chance data ${
          wasCreated ? "created" : "updated"
        } for user ID: ${userId}`
      );

      // 🚀 Trigger enhanced embedding update
      const embeddingResult = await updateUserEmbeddings(userId, "update");

      return res.status(wasCreated ? 201 : 200).json({
        success: true,
        message: `Success chance data ${
          wasCreated ? "created" : "updated"
        } successfully`,
        action: wasCreated ? "created" : "updated",
        data: result,
        embeddingUpdate: embeddingResult.success ? "success" : "failed",
        metadata: {
          profileCompleteness: calculateProfileCompleteness(result),
          hasLanguageProficiency: !!(
            LanguageProficiency?.test && LanguageProficiency?.score
          ),
          hasWorkExperience: !!(years && years > 0),
          wasExistingEntry: !wasCreated,
        },
      });
    } catch (error) {
      console.error(
        `❌ Error upserting success chance data for user ID ${userId}:`,
        error
      );

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
        });
      }

      return res.status(500).json({
        success: false,
        message: "Server error while processing success chance data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Update success chance data
// router.patch("/update", authenticateToken, async (req, res) => {
//   const userId = req.user.id;
//   console.log(`📝 Processing success chance update for user ID: ${userId}`);

//   try {
//     const existingEntry = await userSuccessDb.findOne({ userId });
//     if (!existingEntry) {
//       return res.status(404).json({
//         success: false,
//         message: "No success chance data found to update. Use POST to create.",
//       });
//     }

//     // Build update object from request body
//     const updateFields = {};
//     const {
//       studyLevel,
//       grade,
//       gradeType,
//       dateOfBirth,
//       nationality,
//       majorSubject,
//       livingCosts,
//       tuitionFee,
//       languageProficiency,
//       years,
//       studyPreferenced,
//     } = req.body;

//     if (studyLevel) updateFields.studyLevel = studyLevel;
//     if (gradeType) updateFields.gradeType = gradeType;
//     if (grade) updateFields.grade = parseFloat(grade);
//     if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
//     if (nationality) updateFields.nationality = nationality;
//     if (majorSubject) updateFields.majorSubject = majorSubject;
//     if (years !== undefined) updateFields.workExperience = parseInt(years, 10);

//     if (livingCosts && typeof livingCosts === "object") {
//       updateFields.livingCosts = {
//         amount:
//           parseFloat(livingCosts.amount) || existingEntry.livingCosts.amount,
//         currency: livingCosts.currency || existingEntry.livingCosts.currency,
//       };
//     }

//     if (tuitionFee && typeof tuitionFee === "object") {
//       updateFields.tuitionFee = {
//         amount:
//           parseFloat(tuitionFee.amount) || existingEntry.tuitionFee.amount,
//         currency: tuitionFee.currency || existingEntry.tuitionFee.currency,
//       };
//     }

//     if (languageProficiency && typeof languageProficiency === "object") {
//       updateFields.languageProficiency = {
//         test: languageProficiency.test,
//         score: languageProficiency.score,
//       };
//     }

//     if (studyPreferenced && typeof studyPreferenced === "object") {
//       updateFields.studyPreferenced = {
//         country:
//           studyPreferenced.country || existingEntry.studyPreferenced?.country,
//         degree:
//           studyPreferenced.degree || existingEntry.studyPreferenced?.degree,
//         subject:
//           studyPreferenced.subject || existingEntry.studyPreferenced?.subject,
//       };
//     }

//     const updatedEntry = await userSuccessDb.findOneAndUpdate(
//       { userId },
//       { $set: updateFields },
//       { new: true, runValidators: true }
//     );

//     console.log(`✅ Success chance data updated for user ID: ${userId}`);

//     // 🚀 Trigger enhanced embedding update
//     const embeddingResult = await updateUserEmbeddings(userId, "update");

//     return res.status(200).json({
//       success: true,
//       message: "Success chance data updated successfully",
//       data: updatedEntry,
//       embeddingUpdate: embeddingResult.success ? "success" : "failed",
//       metadata: {
//         profileCompleteness: calculateProfileCompleteness(updatedEntry),
//         fieldsUpdated: Object.keys(updateFields),
//       },
//     });
//   } catch (error) {
//     console.error(
//       `❌ Error updating success chance data for user ID ${userId}:`,
//       error
//     );

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: Object.values(error.errors).map((err) => ({
//           field: err.path,
//           message: err.message,
//         })),
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Server error while updating success chance data",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// });
router.patch("/update", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  console.log(`📝 Processing success chance update for user ID: ${userId}`);

  try {
    const existingEntry = await userSuccessDb.findOne({ userId });
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: "No success chance data found to update. Use POST to create.",
      });
    }

    // Build update object from request body
    const updateFields = {};
    const {
      studyLevel,
      grade,
      gradeType,
      dateOfBirth,
      nationality,
      majorSubject,
      livingCosts,
      tuitionFee,
      languageProficiency,
      years,
      studyPreferenced,
      cgpaOutOf,
      hasExperience, // Add this
    } = req.body;

    if (studyLevel) updateFields.studyLevel = studyLevel;
    if (gradeType) updateFields.gradeType = gradeType;

    if (grade !== undefined) {
      const currentGradeType = gradeType || existingEntry.gradeType;

      if (
        currentGradeType === "Percentage Grade Scale" ||
        currentGradeType === "CGPA Grade Scale"
      ) {
        updateFields.grade = parseFloat(grade);
      } else {
        updateFields.grade =
          typeof grade === "string" ? grade.trim() : String(grade);
      }
    }

    if (cgpaOutOf !== undefined) {
      updateFields.cgpaOutOf = cgpaOutOf;
    }

    if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
    if (nationality) updateFields.nationality = nationality;
    if (majorSubject) updateFields.majorSubject = majorSubject;

    // ✅ FIXED: Properly handle clearing work experience
    if (years !== undefined || hasExperience !== undefined) {
      if (hasExperience === false || years === null || years === 0) {
        updateFields.workExperience = null;
      } else if (years) {
        updateFields.workExperience = parseInt(years, 10);
      }
    }

    if (livingCosts && typeof livingCosts === "object") {
      updateFields.livingCosts = {
        amount:
          parseFloat(livingCosts.amount) || existingEntry.livingCosts.amount,
        currency: livingCosts.currency || existingEntry.livingCosts.currency,
      };
    }

    if (tuitionFee && typeof tuitionFee === "object") {
      updateFields.tuitionFee = {
        amount:
          parseFloat(tuitionFee.amount) || existingEntry.tuitionFee.amount,
        currency: tuitionFee.currency || existingEntry.tuitionFee.currency,
      };
    }

    if (languageProficiency && typeof languageProficiency === "object") {
      updateFields.languageProficiency = {
        level: languageProficiency.level,
        test: languageProficiency.test,
        score: languageProficiency.score,
      };
    }

    if (studyPreferenced && typeof studyPreferenced === "object") {
      updateFields.studyPreferenced = {
        country:
          studyPreferenced.country || existingEntry.studyPreferenced?.country,
        degree:
          studyPreferenced.degree || existingEntry.studyPreferenced?.degree,
        subject:
          studyPreferenced.subject || existingEntry.studyPreferenced?.subject,
      };
    }

    const updatedEntry = await userSuccessDb.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    console.log(`✅ Success chance data updated for user ID: ${userId}`);

    // 🚀 Trigger enhanced embedding update
    const embeddingResult = await updateUserEmbeddings(userId, "update");

    return res.status(200).json({
      success: true,
      message: "Success chance data updated successfully",
      data: updatedEntry,
      embeddingUpdate: embeddingResult.success ? "success" : "failed",
      metadata: {
        profileCompleteness: calculateProfileCompleteness(updatedEntry),
        fieldsUpdated: Object.keys(updateFields),
      },
    });
  } catch (error) {
    console.error(
      `❌ Error updating success chance data for user ID ${userId}:`,
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating success chance data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
// Get success chance data for authenticated user
router.get("/", authenticateToken, async (req, res) => {
  console.log(`Fetching success chance data for user ID: ${req.user.id}`);

  try {
    const userId = req.user.id;
    const data = await userSuccessDb.findOne({ userId });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No success chance data found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      data,
      metadata: {
        profileCompleteness: calculateProfileCompleteness(data),
        lastUpdated: data.updatedAt,
        hasLanguageProficiency: !!(
          data.languageProficiency?.test && data.languageProficiency?.score
        ),
        hasWorkExperience: !!(data.workExperience && data.workExperience > 0),
      },
    });
  } catch (error) {
    console.error("Error fetching success chance data:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching success chance data",
    });
  }
});

// Delete success chance data
router.delete("/delete", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await userSuccessDb.findOneAndDelete({ userId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "No success chance data found to delete",
      });
    }

    // 🚀 Trigger embedding update (user data without success chance)
    const embeddingResult = await updateUserEmbeddings(userId, "update");

    return res.status(200).json({
      success: true,
      message: "Success chance data deleted successfully",
      embeddingUpdate: embeddingResult.success ? "success" : "failed",
    });
  } catch (error) {
    console.error(
      `Error deleting success chance data for user ID ${userId}:`,
      error
    );
    return res.status(500).json({
      success: false,
      message: "Server error while deleting success chance data",
    });
  }
});

module.exports = router;
