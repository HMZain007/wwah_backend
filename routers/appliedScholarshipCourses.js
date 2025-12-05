/**
 * @swagger
 * /appliedScholarshipCourses/apply:
 *   post:
 *     summary: Apply for a Scholarship Course
 *     description: Submit an application for a scholarship course. Validates all required fields and checks for duplicate applications.
 *     tags:
 *       - Applied Scholarship Courses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - scholarshipName
 *               - hostCountry
 *               - courseName
 *               - duration
 *               - language
 *               - universityName
 *               - scholarshipType
 *               - deadline
 *               - banner
 *               - logo
 *               - ScholarshipId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *               scholarshipName:
 *                 type: string
 *                 example: "Chevening Scholarship"
 *               hostCountry:
 *                 type: string
 *                 example: "United Kingdom"
 *               courseName:
 *                 type: string
 *                 example: "Master of Science in Computer Science"
 *               duration:
 *                 type: string
 *                 example: "1 Year"
 *               language:
 *                 type: string
 *                 example: "English"
 *               universityName:
 *                 type: string
 *                 example: "University of Oxford"
 *               scholarshipType:
 *                 type: string
 *                 example: "Fully Funded"
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-15"
 *               banner:
 *                 type: string
 *                 example: "https://example.com/banner.jpg"
 *               logo:
 *                 type: string
 *                 example: "https://example.com/logo.jpg"
 *               ScholarshipId:
 *                 type: string
 *                 example: "60d5ec49f1b2c72b8c8e4a9b"
 *               successChances:
 *                 type: number
 *                 example: 75
 *     responses:
 *       201:
 *         description: Application submitted successfully.
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
 *                   example: "Application submitted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     ScholarshipId:
 *                       type: string
 *                     scholarshipName:
 *                       type: string
 *                     hostCountry:
 *                       type: string
 *                     courseName:
 *                       type: string
 *                     duration:
 *                       type: string
 *                     language:
 *                       type: string
 *                     universityName:
 *                       type: string
 *                     scholarshipType:
 *                       type: string
 *                     deadline:
 *                       type: string
 *                     banner:
 *                       type: string
 *                     logo:
 *                       type: string
 *                     successChances:
 *                       type: number
 *                     appliedDate:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       example: "pending"
 *       400:
 *         description: Missing required fields.
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
 *                   example: "All fields including userId are required"
 *                 missingFields:
 *                   type: object
 *       404:
 *         description: User not found.
 *       409:
 *         description: Already applied for this course.
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
 *                   example: "You have already applied for this course"
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedScholarshipCourses/confirmed-applications/{userId}:
 *   get:
 *     summary: Get Confirmed Scholarship Applications (Admin Only)
 *     description: Retrieves all confirmed scholarship applications for a specific user with pagination. Requires admin authentication.
 *     tags:
 *       - Applied Scholarship Courses
 *       - Admin
 *     security:
 *       - adminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "60d5ec49f1b2c72b8c8e4a1b"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Confirmed scholarship courses fetched successfully.
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
 *                   example: "Confirmed scholarship courses fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     applications:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalApplications:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *       400:
 *         description: User ID is required.
 *       401:
 *         description: Unauthorized - Admin access required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedScholarshipCourses/my-applications/{userId}:
 *   get:
 *     summary: Get User's Applied Scholarship Courses
 *     description: Retrieves all scholarship courses that a user has applied for, sorted by application date (most recent first) with pagination.
 *     tags:
 *       - Applied Scholarship Courses
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "60d5ec49f1b2c72b8c8e4a1b"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Applications retrieved successfully.
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
 *                     applications:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         totalApplications:
 *                           type: integer
 *                           example: 25
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *       400:
 *         description: User ID is required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedScholarshipCourses/{applicationId}/{userId}:
 *   get:
 *     summary: Get Specific Scholarship Application
 *     description: Retrieves details of a specific scholarship application by its ID for a given user.
 *     tags:
 *       - Applied Scholarship Courses
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *         example: "60d5ec49f1b2c72b8c8e4a5c"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Application retrieved successfully.
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
 *                     ScholarshipId:
 *                       type: string
 *                     scholarshipName:
 *                       type: string
 *                     hostCountry:
 *                       type: string
 *                     courseName:
 *                       type: string
 *                     universityName:
 *                       type: string
 *                     status:
 *                       type: string
 *                     appliedDate:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: User ID is required.
 *       404:
 *         description: User or application not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedScholarshipCourses/scholarship-courses/{userId}:
 *   get:
 *     summary: Get Applied Scholarship Courses with Pagination
 *     description: Retrieves all applied scholarship courses for a user, sorted by most recent application date with pagination support.
 *     tags:
 *       - Applied Scholarship Courses
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "60d5ec49f1b2c72b8c8e4a1b"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Applied scholarship courses fetched successfully.
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
 *                   example: "Applied scholarship courses fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appliedScholarshipCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalApplications:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *       400:
 *         description: User ID is required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedScholarshipCourses/tracking/{applicationId}:
 *   put:
 *     summary: Update Scholarship Application Status and Tracking
 *     description: Updates the application progress step (1-7) and/or status dropdown (1-11) for a scholarship application. Can be used by both users and admins.
 *     tags:
 *       - Applied Scholarship Courses
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *         example: "60d5ec49f1b2c72b8c8e4a5c"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               applicationStatus:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 7
 *                 description: Progress tracking step (1-7)
 *                 example: 3
 *               statusId:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 11
 *                 description: |
 *                   Status dropdown ID:
 *                   1=incomplete-application, 2=complete-application, 3=awaiting-course-confirmation,
 *                   4=pay-application-fee, 5=in-process, 6=application-withdrawn,
 *                   7=application-successful, 8=application-unsuccessful, 9=visa-in-process,
 *                   10=visa-rejected, 11=ready-to-fly
 *                 example: 5
 *               userId:
 *                 type: string
 *                 description: Target user ID (for admin updates)
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Scholarship application status updated successfully.
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
 *                   example: "Scholarship application status updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     application:
 *                       type: object
 *                     updatedApplicationId:
 *                       type: string
 *                     changes:
 *                       type: object
 *                       properties:
 *                         applicationStatus:
 *                           type: object
 *                           properties:
 *                             old:
 *                               type: integer
 *                             new:
 *                               type: integer
 *                             changed:
 *                               type: boolean
 *                         status:
 *                           type: object
 *                           properties:
 *                             old:
 *                               type: string
 *                             new:
 *                               type: string
 *                             changed:
 *                               type: boolean
 *                         statusId:
 *                           type: integer
 *                           nullable: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     isVerified:
 *                       type: boolean
 *       400:
 *         description: Invalid applicationStatus or statusId value.
 *       404:
 *         description: User or application not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedScholarshipCourses/{applicationId}:
 *   delete:
 *     summary: Delete Scholarship Application
 *     description: Removes a scholarship application from the user's applied courses list.
 *     tags:
 *       - Applied Scholarship Courses
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID to delete
 *         example: "60d5ec49f1b2c72b8c8e4a5c"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Application deleted successfully.
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
 *                   example: "Application deleted successfully"
 *       400:
 *         description: User ID is required.
 *       404:
 *         description: User or application not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedScholarshipCourses/confirm/{applicationId}:
 *   put:
 *     summary: Confirm or Unconfirm Scholarship Application
 *     description: Updates the confirmation status (isConfirmed) of a scholarship application. Can be used by both users and admins.
 *     tags:
 *       - Applied Scholarship Courses
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *         example: "60d5ec49f1b2c72b8c8e4a5c"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isConfirmed
 *             properties:
 *               isConfirmed:
 *                 type: boolean
 *                 description: Confirmation status (true to confirm, false to unconfirm)
 *                 example: true
 *               userId:
 *                 type: string
 *                 description: Target user ID (for admin updates)
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Scholarship confirmation status updated successfully.
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
 *                   example: "Scholarship course confirmed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     application:
 *                       type: object
 *                     updatedApplicationId:
 *                       type: string
 *                     scholarshipName:
 *                       type: string
 *                     courseName:
 *                       type: string
 *                     oldConfirmation:
 *                       type: boolean
 *                     newConfirmation:
 *                       type: boolean
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     isVerified:
 *                       type: boolean
 *       400:
 *         description: isConfirmed must be a boolean value or User ID is required.
 *       404:
 *         description: User or application not found.
 *       500:
 *         description: Internal server error.
 */
// routes/appliedScholarshipCourses.js
const express = require("express");
const UserDb = require("../database/models/UserDb");
const authenticateAdminToken = require("../middlewares/adminAuthMiddleware");
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
      successChances,
    } = req.body;
    // console.log(req.body, "req.body in apply route");

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
      logo: !logo,
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
      successChances,
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
router.get(
  "/confirmed-applications/:userId",
  authenticateAdminToken,
  async (req, res) => {
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
  }
);
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
