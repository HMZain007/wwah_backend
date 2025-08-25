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
      logo,
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
      logo:!logo,
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
      logo,
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
router.get("/confirmed-applications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    console.log(userId, "backend user for confirmed scholarships");

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

    // Filter only confirmed scholarship applications
    const confirmedApplications = (user.appliedScholarshipCourses || [])
      .filter((app) => app.isConfirmed === true)
      .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

    console.log(
      `Found ${confirmedApplications.length} confirmed applications out of ${user.appliedScholarshipCourses.length} total`
    );

    // Apply pagination
    const skip = (page - 1) * limit;
    const applications = confirmedApplications.slice(skip, skip + limit);
    const total = confirmedApplications.length;

    res.status(200).json({
      success: true,
      message: "Confirmed scholarship courses fetched successfully",
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
    console.error("❌ Error fetching confirmed scholarship courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
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
    const {
      applicationStatus, // For progress tracking (step number)
      statusId, // For status dropdown
      userId: targetUserId,
    } = req.body;

    // For admin updates, use the provided userId, otherwise use authenticated user
    const userId = targetUserId || req.user?.id || req.userId;

    console.log("📝 Scholarship status update request:", {
      applicationId,
      applicationStatus,
      statusId,
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

    // Validate applicationStatus (progress step)
    if (
      applicationStatus &&
      ![1, 2, 3, 4, 5, 6, 7].includes(Number(applicationStatus))
    ) {
      return res.status(400).json({
        success: false,
        message: "applicationStatus must be a number between 1 and 7",
      });
    }

    // Validate statusId (if provided)
    if (
      statusId &&
      ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(Number(statusId))
    ) {
      return res.status(400).json({
        success: false,
        message: "statusId must be a number between 1 and 11",
      });
    }

    const user = await UserDb.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the scholarship application using _id
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
      newTrackStep: Number(applicationStatus),
      newStatusId: statusId ? Number(statusId) : null,
    });

    // Store old values for response
    const oldApplicationStatus = application.applicationStatus;
    const oldStatus = application.status;

    // Update the application progress step (if provided)
    if (applicationStatus) {
      application.applicationStatus = Number(applicationStatus);
    }

    // Update additional status field based on statusId (if provided)
    if (statusId) {
      // Map statusId to status labels based on APPLICATION_STATUS array
      const statusMap = {
        1: "incomplete-application",
        2: "complete-application",
        3: "awaiting-course-confirmation",
        4: "pay-application-fee",
        5: "in-process",
        6: "application-withdrawn",
        7: "application-successful",
        8: "application-unsuccessful",
        9: "visa-in-process",
        10: "visa-rejected",
        11: "ready-to-fly",
      };

      application.status = statusMap[Number(statusId)] || "pending";

      // You might want to store the statusId separately for reference
      // Add this field to your schema if needed
      application.statusId = Number(statusId);
    }

    // Always update the timestamp
    application.updatedAt = new Date();

    console.log("💾 Updating application with:", {
      oldApplicationStatus,
      newApplicationStatus: application.applicationStatus,
      oldStatus,
      newStatus: application.status,
      statusId: application.statusId,
      updatedAt: application.updatedAt,
    });

    // Mark the subdocument array as modified before saving
    user.markModified("appliedScholarshipCourses");

    // Save the user document
    const updatedUser = await user.save();

    // Get the updated application to confirm changes
    const verifiedApplication =
      updatedUser.appliedScholarshipCourses.id(applicationId);

    console.log("✅ Application updated successfully:", {
      applicationId,
      oldApplicationStatus,
      newApplicationStatus: verifiedApplication.applicationStatus,
      oldStatus,
      newStatus: verifiedApplication.status,
      statusId: verifiedApplication.statusId,
      verifiedUpdate:
        verifiedApplication.applicationStatus ===
        (applicationStatus ? Number(applicationStatus) : oldApplicationStatus),
    });

    res.json({
      success: true,
      message: "Scholarship application status updated successfully",
      data: {
        application: verifiedApplication.toObject(),
        updatedApplicationId: applicationId,
        changes: {
          applicationStatus: {
            old: oldApplicationStatus,
            new: verifiedApplication.applicationStatus,
            changed:
              applicationStatus &&
              verifiedApplication.applicationStatus !== oldApplicationStatus,
          },
          status: {
            old: oldStatus,
            new: verifiedApplication.status,
            changed: statusId && verifiedApplication.status !== oldStatus,
          },
          statusId: statusId ? Number(statusId) : null,
        },
        updatedAt: verifiedApplication.updatedAt,
        isVerified: true,
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
router.put("/confirm/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { isConfirmed, userId: targetUserId } = req.body;

    // For admin updates, use the provided userId, otherwise use authenticated user
    const userId = targetUserId || req.user?.id || req.userId;

    console.log("📝 Scholarship course confirmation update request:", {
      applicationId,
      isConfirmed,
      userId,
      targetUserId,
      isAdminUpdate: !!targetUserId,
    });

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required for confirmation update",
      });
    }

    // Validate isConfirmed (should be boolean)
    if (typeof isConfirmed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isConfirmed must be a boolean value (true or false)",
      });
    }

    const user = await UserDb.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the scholarship application using _id
    const application = user.appliedScholarshipCourses.id(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Scholarship application not found",
        debug: {
          applicationId,
          availableApplications: user.appliedScholarshipCourses.map((app) => ({
            id: app._id,
            scholarshipName: app.scholarshipName,
            courseName: app.courseName,
            currentConfirmation: app.isConfirmed,
          })),
        },
      });
    }

    console.log("🔍 Found scholarship application:", {
      applicationId,
      scholarshipName: application.scholarshipName,
      courseName: application.courseName,
      currentConfirmation: application.isConfirmed,
      newConfirmation: isConfirmed,
    });

    // Update the scholarship confirmation status
    const oldConfirmation = application.isConfirmed;
    application.isConfirmed = isConfirmed;
    application.updatedAt = new Date();

    console.log("💾 Updating scholarship application with:", {
      oldConfirmation,
      newConfirmation: application.isConfirmed,
      updatedAt: application.updatedAt,
    });

    // Mark the subdocument array as modified before saving
    user.markModified("appliedScholarshipCourses");

    // Save the user document
    const updatedUser = await user.save();

    // Verification: Get the updated application to confirm changes
    const verifiedApplication =
      updatedUser.appliedScholarshipCourses.id(applicationId);

    console.log("✅ Scholarship confirmation updated successfully:", {
      applicationId,
      scholarshipName: verifiedApplication.scholarshipName,
      oldConfirmation,
      newConfirmation: verifiedApplication.isConfirmed,
      verifiedUpdate: verifiedApplication.isConfirmed === isConfirmed,
    });

    res.json({
      success: true,
      message: `Scholarship course ${
        isConfirmed ? "confirmed" : "unconfirmed"
      } successfully`,
      data: {
        application: verifiedApplication.toObject(),
        updatedApplicationId: applicationId,
        scholarshipName: verifiedApplication.scholarshipName,
        courseName: verifiedApplication.courseName,
        oldConfirmation: oldConfirmation,
        newConfirmation: isConfirmed,
        updatedAt: verifiedApplication.updatedAt,
        isVerified: verifiedApplication.isConfirmed === isConfirmed,
      },
    });
  } catch (error) {
    console.error("❌ Error updating scholarship course confirmation:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
