// routes/appliedScholarshipCourses.js
const express = require("express");
const UserDb = require("../database/models/UserDb");
const router = express.Router();

// Apply for a scholarship course
router.post("/apply", async (req, res) => {
  try {
    const {
      userId,
      scholarshipName,
      hostCountry,
      courseName,
      duration,
      language,
      universityName,
      scholarshipType,
      deadline,
      banner,
      ScholarshipId, // Added scholarshipId to identify the course
    } = req.body;
    console.log(req.body, "req.body in apply route");

    // Validate required fields with detailed error reporting
    const missingFields = {
      userId: !userId,
      scholarshipName: !scholarshipName,
      hostCountry: !hostCountry || hostCountry.trim() === "",
      courseName: !courseName,
      duration: !duration,
      language: !language,
      universityName: !universityName,
      scholarshipType: !scholarshipType,
      deadline: !deadline,
      banner: !banner,
      ScholarshipId: !ScholarshipId, // Ensure scholarshipId is provided
    };

    const hasMissingFields = Object.values(missingFields).some(
      (isMissing) => isMissing
    );

    if (hasMissingFields) {
      return res.status(400).json({
        success: false,
        message: "All fields including userId are required",
        missingFields,
      });
    }

    // Find the user
    const user = await UserDb.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has already applied for this course
    const existingApplication = user.appliedScholarshipCourses.find(
      (app) =>
        app.courseName === courseName &&
        app.universityName === universityName &&
        app.ScholarshipId === ScholarshipId
    );

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this course",
      });
    }

    // Create new application object
    const newApplication = {
      ScholarshipId, // Store the scholarship ID for reference
      scholarshipName,
      hostCountry,
      courseName,
      duration,
      language,
      universityName,
      scholarshipType,
      deadline,
      banner,
      appliedDate: new Date(),
      status: "pending",
    };

    // Add to user's applied scholarship courses
    user.appliedScholarshipCourses.push(newApplication);
    await user.save();

    // Get the newly added application (last one in array)
    const savedApplication =
      user.appliedScholarshipCourses[user.appliedScholarshipCourses.length - 1];

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: savedApplication,
    });
  } catch (error) {
    console.error("Error applying for scholarship course:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get all applied courses for a user
router.get("/my-applications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find user and get their applied scholarship courses
    const user = await UserDb.findById(userId).select(
      "appliedScholarshipCourses"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Sort applications by appliedDate in descending order
    const sortedApplications = user.appliedScholarshipCourses.sort(
      (a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)
    );

    // Apply pagination
    const skip = (page - 1) * limit;
    const applications = sortedApplications.slice(skip, skip + limit);
    const total = user.appliedScholarshipCourses.length;

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalApplications: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching applied courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get a specific application by ID
router.get("/:applicationId/:userId", async (req, res) => {
  try {
    const { applicationId, userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await UserDb.findById(userId).select(
      "appliedScholarshipCourses"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const application = user.appliedScholarshipCourses.id(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
// Get applied scholarship courses for a user
router.get("/scholarship-courses/:userId", async (req, res) => {
  const { userId } = req.params;

  console.log(userId, "backend suser");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await UserDb.findById(userId).select(
      "appliedScholarshipCourses"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Sort applications by appliedDate in descending order (most recent first)
    const sortedApplications = (user.appliedScholarshipCourses || []).sort(
      (a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)
    );

    // Apply pagination
    const skip = (page - 1) * limit;
    const applications = sortedApplications.slice(skip, skip + limit);
    const total = user.appliedScholarshipCourses?.length || 0;

    res.status(200).json({
      success: true,
      message: "Applied scholarship courses fetched successfully",
      data: {
        appliedScholarshipCourses: applications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalApplications: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching applied scholarship courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
// Add this route to your appliedScholarshipCourses routes file

router.put("/tracking/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { applicationStatus, userId: targetUserId } = req.body;

    // For admin updates, use the provided userId, otherwise use authenticated user
    const userId = targetUserId || req.user?.id || req.userId;

    console.log("📝 Scholarship status update request:", {
      applicationId,
      applicationStatus,
      userId,
      targetUserId,
      isAdminUpdate: !!targetUserId,
    });

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required for status update",
      });
    }

    // Validate applicationStatus
    if (
      applicationStatus &&
      ![1, 2, 3, 4, 5, 6, 7].includes(Number(applicationStatus))
    ) {
      return res.status(400).json({
        success: false,
        message: "applicationStatus must be a number between 1 and 7",
      });
    }

    const user = await UserDb.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ FIXED: Find the scholarship application using _id
    const application = user.appliedScholarshipCourses.id(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Scholarship application not found",
        debug: {
          applicationId,
          availableApplications: user.appliedScholarshipCourses.map((app) => ({
            id: app._id,
            name: app.scholarshipName || app.courseName,
            currentStatus: app.applicationStatus,
          })),
        },
      });
    }

    console.log("🔍 Found application:", {
      applicationId,
      currentStatus: application.applicationStatus,
      newStatus: Number(applicationStatus),
    });

    // ✅ FIXED: Update the application status and related fields
    const oldStatus = application.applicationStatus;
    application.applicationStatus = Number(applicationStatus);
    application.updatedAt = new Date();

    // Update the legacy status field based on the step
    const statusMap = {
      1: "pending",
      2: "pending",
      3: "submitted",
      4: "under review",
      5: "shortlisted",
      6: "decision pending",
      7: "final decision",
    };
    application.status = statusMap[Number(applicationStatus)] || "pending";

    console.log("💾 Updating application with:", {
      oldStatus,
      newStatus: application.applicationStatus,
      status: application.status,
      updatedAt: application.updatedAt,
    });

    // ✅ CRITICAL: Mark the subdocument array as modified before saving
    user.markModified("appliedScholarshipCourses");

    // Save the user document
    const updatedUser = await user.save();

    // ✅ VERIFICATION: Get the updated application to confirm changes
    const verifiedApplication =
      updatedUser.appliedScholarshipCourses.id(applicationId);

    console.log("✅ Application updated successfully:", {
      applicationId,
      oldStatus,
      newStatus: verifiedApplication.applicationStatus,
      newStatusLabel: verifiedApplication.status,
      verifiedUpdate:
        verifiedApplication.applicationStatus === Number(applicationStatus),
    });

    res.json({
      success: true,
      message: "Scholarship application status updated successfully",
      data: {
        application: verifiedApplication.toObject(),
        updatedApplicationId: applicationId,
        oldApplicationStatus: oldStatus,
        newApplicationStatus: Number(applicationStatus),
        newStatusLabel: statusMap[Number(applicationStatus)],
        updatedAt: verifiedApplication.updatedAt,
        isVerified:
          verifiedApplication.applicationStatus === Number(applicationStatus),
      },
    });
  } catch (error) {
    console.error("❌ Error updating scholarship application status:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Delete an application
router.delete("/:applicationId", async (req, res) => {
  try {
    const { userId } = req.body;
    const { applicationId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await UserDb.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const application = user.appliedScholarshipCourses.id(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Remove the application using Mongoose's pull method
    user.appliedScholarshipCourses.pull(applicationId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
