const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authenticateToken = require("../middlewares/authMiddleware"); // Adjust path as needed
const userSuccessDb = require("../database/models/successChance"); // adjust path if needed
// Input validation middleware
const validateSuccessChanceInput = (req, res, next) => {
  console.log("Validating input for success chance data:", req.body);
  const {
    studyLevel,
    grade,
    dateOfBirth,
    nationality,
    majorSubject,
    livingCosts,
    tuitionFee, // Note: field name mismatch in schema vs request
    LanguageProficiency, // Note: field name mismatch in schema vs request
    years,
    StudyPreferenced, // Note: field name mismatch in schema vs request
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

  // Additional validations
  if (grade.score && isNaN(parseFloat(grade.score))) {
    return res.status(400).json({
      success: false,
      message: "Grade score must be a number",
      field: "grade.score",
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

// Add new success chance entry
router.post("/add", authenticateToken, validateSuccessChanceInput, async (req, res) => {
  const userId = req.user.id;
  console.log(`Processing request for user ID: ${userId}`);
  try {
    const {
      studyLevel,
      grade,
      dateOfBirth,
      nationality,
      majorSubject,
      livingCosts,
      tuitionfee, // Note the naming difference from schema
      LanguageProficiency, // Note the naming difference from schema
      years,
      StudyPreferenced, // Note the naming difference from schema
    } = req.body;

    // Check if user already has an entry
    const existingEntry = await userSuccessDb.findOne({ userId });
    if (existingEntry) {
      return res.status(409).json({
        success: false,
        message:
          "User already has a success chance entry. Use PUT to update.",
        data: existingEntry,
      });
    }

    // Create new entry with normalized field names
    const newEntry = new userSuccessDb({
      userId,
      studyLevel,
      gradeType: grade.gradeType,
      grade: parseFloat(grade.score),
      dateOfBirth,
      nationality,
      majorSubject,
      livingCosts: {
        amount: livingCosts.amount,
        currency: livingCosts.currency,
      },
      tuitionFee: {
        amount: tuitionfee.amount,
        currency: tuitionfee.currency,
      },
      languageProficiency: LanguageProficiency
        ? {
          test: LanguageProficiency.test,
          score: LanguageProficiency.score,
        }
        : undefined,
      workExperience: years,
      studyPreferenced: {
        country: StudyPreferenced.country,
        degree: StudyPreferenced.degree,
        subject: StudyPreferenced.subject,
      },
    });

    const saved = await newEntry.save();
    console.log(`Success chance data saved for user ID: ${userId}`);

    return res.status(201).json({
      success: true,
      message: "Success chance data saved successfully",
      data: saved,
    });
  } catch (error) {
    console.error(
      `Error saving success chance data for user ID ${userId}:`,
      error
    );

    // Handle specific errors
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
      message: "Server error while saving success chance data",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
);

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
    });
  } catch (error) {
    console.error("Error fetching success chance data:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching success chance data",
    });
  }
});

// Update success chance data
router.patch("/update", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  console.log(req.body, "req.body");
  try {
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
    } = req.body;

    // Check if entry exists
    const existingEntry = await userSuccessDb.findOne({ userId });
    console.log(existingEntry, "existingEntry");

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: "No success chance data found to update. Use POST to create.",
      });
    }

    // Create update object with only fields that exist in request body
    const updateFields = {};

    if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
    if (nationality) updateFields.nationality = nationality;
    if (years !== undefined) updateFields.workExperience = years;
    if (studyLevel) updateFields.studyLevel = studyLevel;
    if (majorSubject) updateFields.majorSubject = majorSubject;
    if (gradeType) updateFields.gradeType = gradeType;
    if (grade) updateFields.grade = parseFloat(grade);

    // Handle living costs if it exists
    if (livingCosts && typeof livingCosts === "object") {
      updateFields.livingCosts = {
        amount:
          parseFloat(livingCosts.amount) || existingEntry.livingCosts.amount,
        currency: livingCosts.currency || existingEntry.livingCosts.currency,
      };
    }

    // Handle tuition fee if it exists
    if (tuitionFee && typeof tuitionFee === "object") {
      updateFields.tuitionFee = {
        amount:
          parseFloat(tuitionFee.amount) || existingEntry.tuitionFee.amount,
        currency: tuitionFee.currency || existingEntry.tuitionFee.currency,
      };
    }

    // Handle language proficiency if it exists
    if (languageProficiency && typeof languageProficiency === "object") {
      updateFields.languageProficiency = {
        test: languageProficiency.test,
        score: languageProficiency.score,
      };
    }

    // Handle study preferences if they exist
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

    // Update the entry with only the fields that were provided
    const updatedEntry = await userSuccessDb.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Success chance data updated successfully",
      data: updatedEntry,
    });
  } catch (error) {
    console.error(
      `Error updating success chance data for user ID ${userId}:`,
      error
    );

    // Handle specific errors
    if (error.name === "ValidationError") {
      console.log(error, "ValidationError");

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

    return res.status(200).json({
      success: true,
      message: "Success chance data deleted successfully",
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
