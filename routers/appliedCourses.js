/**
 * @swagger
 * /appliedCourses/user/{userId}:
 *   get:
 *     summary: Get Applied Courses and Scholarships by User ID (Admin Only)
 *     description: Retrieves all applied courses and scholarship courses for a specific user. Requires admin authentication.
 *     tags:
 *       - Applied Courses
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
 *     responses:
 *       200:
 *         description: Applied data fetched successfully.
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
 *                   example: "Applied data fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appliedCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           courseId:
 *                             type: string
 *                           applicationStatus:
 *                             type: integer
 *                           statusId:
 *                             type: integer
 *                           isConfirmed:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     appliedScholarshipCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalAppliedCourses:
 *                       type: integer
 *                     totalAppliedScholarshipCourses:
 *                       type: integer
 *                     appliedCourseIds:
 *                       type: array
 *                       items:
 *                         type: string
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
 * /appliedCourses:
 *   get:
 *     summary: Get Applied Courses with Tracking Data
 *     description: Retrieves all applied courses for the authenticated user with their tracking information (applicationStatus, statusId, confirmation status).
 *     tags:
 *       - Applied Courses
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applied courses fetched successfully.
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
 *                   example: "Applied courses fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appliedCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           courseId:
 *                             type: string
 *                           applicationStatus:
 *                             type: integer
 *                             minimum: 1
 *                             maximum: 7
 *                           statusId:
 *                             type: integer
 *                             minimum: 1
 *                             maximum: 11
 *                           isConfirmed:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     totalAppliedCourses:
 *                       type: integer
 *                     appliedCourseIds:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 *   post:
 *     summary: Add or Remove Applied Course
 *     description: Adds or removes a course from the user's applied courses list with optional tracking data.
 *     tags:
 *       - Applied Courses
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
 *               - courseId
 *               - action
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: The ID of the course to add or remove
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *               action:
 *                 type: string
 *                 enum: [add, remove]
 *                 description: Action to perform - either 'add' or 'remove'
 *                 example: "add"
 *               trackingData:
 *                 type: object
 *                 description: Optional tracking data when adding a course
 *                 properties:
 *                   applicationStatus:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 7
 *                     example: 1
 *     responses:
 *       200:
 *         description: Course added or removed successfully.
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
 *                   example: "Course added to applied courses successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appliedCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                     isApplied:
 *                       type: boolean
 *                     totalAppliedCourses:
 *                       type: integer
 *                     courseId:
 *                       type: string
 *                     appliedCourseIds:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Missing required fields or invalid action.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedCourses/tracking/{courseId}:
 *   put:
 *     summary: Update Course Application Tracking Status
 *     description: Updates the application progress step (1-7) and/or status dropdown (1-11) for an applied course. Can be used by both users and admins.
 *     tags:
 *       - Applied Courses
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "60d5ec49f1b2c72b8c8e4a1b"
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
 *                   Status dropdown ID (1-11):
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
 *         description: Course tracking updated successfully.
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
 *                   example: "Course tracking updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appliedCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                     updatedCourseId:
 *                       type: string
 *                     newApplicationStatus:
 *                       type: integer
 *                     newStatusId:
 *                       type: integer
 *       400:
 *         description: Invalid applicationStatus or statusId value, or User ID required.
 *       404:
 *         description: User or applied course not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedCourses/check/{courseId}:
 *   get:
 *     summary: Check if Course is Applied
 *     description: Checks whether a specific course is in the user's applied courses list and returns its tracking data if applicable.
 *     tags:
 *       - Applied Courses
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to check
 *         example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Course application status retrieved successfully.
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
 *                     isApplied:
 *                       type: boolean
 *                       example: true
 *                     courseId:
 *                       type: string
 *                     courseData:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         courseId:
 *                           type: string
 *                         applicationStatus:
 *                           type: integer
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     totalAppliedCourses:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedCourses/ids:
 *   get:
 *     summary: Get Applied Course IDs Only
 *     description: Retrieves a lightweight list of only the course IDs that the user has applied for (backward compatible endpoint).
 *     tags:
 *       - Applied Courses
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applied course IDs fetched successfully.
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
 *                   example: "Applied course IDs fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appliedCourseIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["60d5ec49f1b2c72b8c8e4a1b", "60d5ec49f1b2c72b8c8e4a2c"]
 *                     totalAppliedCourses:
 *                       type: integer
 *                       example: 2
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedCourses/remove:
 *   delete:
 *     summary: Remove Course from Applied Courses
 *     description: Removes a specific course from the user's applied courses list.
 *     tags:
 *       - Applied Courses
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
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: The ID of the course to remove
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Course removed successfully.
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
 *                   example: "Course removed from applied courses successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     removedCourseId:
 *                       type: string
 *                     appliedCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                     appliedCourseIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                     totalAppliedCourses:
 *                       type: integer
 *       400:
 *         description: Course ID is required.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: User or course not found in applied courses.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedCourses/status-options:
 *   get:
 *     summary: Get Application Status Options
 *     description: Retrieves the list of available application status options (1-7) for tracking course applications.
 *     tags:
 *       - Applied Courses
 *     responses:
 *       200:
 *         description: Status options retrieved successfully.
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
 *                     applicationStatuses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: integer
 *                           label:
 *                             type: string
 *                       example:
 *                         - value: 1
 *                           label: "Application Started"
 *                         - value: 2
 *                           label: "Documents Prepared"
 *                         - value: 3
 *                           label: "Application Submitted"
 *                         - value: 4
 *                           label: "Under Review"
 *                         - value: 5
 *                           label: "Interview Scheduled"
 *                         - value: 6
 *                           label: "Decision Pending"
 *                         - value: 7
 *                           label: "Final Decision"
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedCourses/confirm/{courseId}:
 *   put:
 *     summary: Confirm or Unconfirm Applied Course
 *     description: Updates the confirmation status (isConfirmed) of an applied course. Can be used by both users and admins.
 *     tags:
 *       - Applied Courses
 *       - Admin
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "60d5ec49f1b2c72b8c8e4a1b"
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
 *         description: Course confirmation status updated successfully.
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
 *                   example: "Course confirmed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appliedCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                     updatedCourseId:
 *                       type: string
 *                     isConfirmed:
 *                       type: boolean
 *       400:
 *         description: isConfirmed must be a boolean or User ID required.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: User or applied course not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedCourses/confirmed/{userId}:
 *   get:
 *     summary: Get Confirmed Applied Courses by User ID
 *     description: Retrieves only the confirmed applied courses for a specific user.
 *     tags:
 *       - Applied Courses
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Confirmed applied courses fetched successfully.
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
 *                   example: "Confirmed applied courses fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appliedCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           courseId:
 *                             type: string
 *                           applicationStatus:
 *                             type: integer
 *                           statusId:
 *                             type: integer
 *                           isConfirmed:
 *                             type: boolean
 *                             example: true
 *                     totalConfirmedCourses:
 *                       type: integer
 *                     totalAppliedCourses:
 *                       type: integer
 *                     confirmedCourseIds:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: User ID is required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /appliedCourses/my-confirmed:
 *   get:
 *     summary: Get My Confirmed Applied Courses
 *     description: Retrieves only the confirmed applied courses for the authenticated user.
 *     tags:
 *       - Applied Courses
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Confirmed applied courses fetched successfully.
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
 *                   example: "Confirmed applied courses fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appliedCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           courseId:
 *                             type: string
 *                           applicationStatus:
 *                             type: integer
 *                           statusId:
 *                             type: integer
 *                           isConfirmed:
 *                             type: boolean
 *                             example: true
 *                     totalConfirmedCourses:
 *                       type: integer
 *                     totalAppliedCourses:
 *                       type: integer
 *                     confirmedCourseIds:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
// /routers/appliedCourses.js
const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const authenticateToken = require("../middlewares/authMiddleware");
const authenticateAdminToken = require("../middlewares/adminAuthMiddleware");
// const authenticateToken = require("../middlewares/authMiddleware");

// 🔧 Helper function to normalize applied courses data (SCHEMA ALIGNED)
function normalizeAppliedCourses(appliedCourses = []) {
  return appliedCourses.map((item) => {
    if (typeof item === "string") {
      // Convert old string format to new object format
      return {
        courseId: item,
        applicationStatus: 1, // Default to first status
        statusId: 1, // ✅ CRITICAL: Default statusId
        isConfirmed: false, // Default confirmation status
      };
    }

    // Return only schema fields - ENSURE statusId is included
    return {
      courseId: item.courseId,
      applicationStatus: item.applicationStatus || 1,
      statusId: item.statusId || 1, // ✅ CRITICAL: Always include statusId
      isConfirmed: item.isConfirmed || false,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });
}

// 🔧 Helper function to extract course IDs from mixed format
function extractCourseIds(appliedCourses = []) {
  return appliedCourses
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item.courseId) return item.courseId;
      return null;
    })
    .filter(Boolean);
}

// ✅ADMIN SIDE : GET route to fetch applied courses & scholarships by userId
router.get("/user/:userId", authenticateAdminToken, async (req, res) => {
  console.log("🟢 Inside /user/:userId route, userId:", req.params.userId);
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await UserDb.findById(userId).select(
      "appliedCourses appliedScholarshipCourses"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Reuse helper for appliedCourses
    const normalizedCourses = normalizeAppliedCourses(user.appliedCourses);

    res.json({
      success: true,
      message: "Applied data fetched successfully",
      data: {
        appliedCourses: normalizedCourses,
        appliedScholarshipCourses: user.appliedScholarshipCourses || [],
        totalAppliedCourses: normalizedCourses.length,
        totalAppliedScholarshipCourses:
          user.appliedScholarshipCourses?.length || 0,
        appliedCourseIds: extractCourseIds(user.appliedCourses), // backward compatibility
      },
    });
  } catch (error) {
    console.error("❌ Error fetching applied data by userId:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ✅ GET route to fetch applied courses with tracking data (SCHEMA ALIGNED)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await UserDb.findById(userId).select("appliedCourses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Normalize the data to ensure consistent object format with ALL schema fields
    const normalizedCourses = normalizeAppliedCourses(user.appliedCourses);

    console.log("✅ Normalized courses with statusId:", normalizedCourses); // Debug log

    res.json({
      success: true,
      message: "Applied courses fetched successfully",
      data: {
        appliedCourses: normalizedCourses,
        totalAppliedCourses: normalizedCourses.length,
        // Backward compatibility
        appliedCourseIds: extractCourseIds(user.appliedCourses),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching applied courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ✅ POST route to add/remove applied courses (SCHEMA ALIGNED)
router.post("/",authenticateToken, async (req, res) => {
  try {
    const { courseId, action, trackingData } = req.body;
    const userId = req.user?.id || req.userId;

    console.log("📝 Request received:", {
      courseId,
      action,
      userId,
      trackingData,
    });

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    if (!action || !["add", "remove"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action is required and must be 'add' or 'remove'",
      });
    }

    const courseIdString = courseId.toString();
    const user = await UserDb.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let updatedUser;
    let message;
    let isApplied;

    if (action === "add") {
      // Check if course is already applied (handle both formats)
      const existingCourseIds = extractCourseIds(user.appliedCourses || []);

      if (existingCourseIds.includes(courseIdString)) {
        return res.json({
          success: true,
          message: "Course is already in applied courses",
          data: {
            appliedCourses: normalizeAppliedCourses(user.appliedCourses),
            isApplied: true,
            totalAppliedCourses: existingCourseIds.length,
            courseId: courseIdString,
          },
        });
      }

      // Create new applied course object with ONLY schema fields
      const newAppliedCourse = {
        courseId: courseIdString,
        applicationStatus: trackingData?.applicationStatus || 1, // Only use applicationStatus from schema
      };

      // Add to applied courses
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        {
          $push: { appliedCourses: newAppliedCourse },
        },
        { new: true }
      );

      console.log("✅ Course added with tracking:", newAppliedCourse);

      message = "Course added to applied courses successfully";
      isApplied = true;
    } else {
      // Remove from applied courses (handle both formats)
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        {
          $pull: {
            appliedCourses: {
              $or: [
                courseIdString, // Remove if it's a string
                { courseId: courseIdString }, // Remove if it's an object
              ],
            },
          },
        },
        { new: true }
      );

      console.log("❌ Course removed:", courseIdString);
      message = "Course removed from applied courses successfully";
      isApplied = false;
    }

    const normalizedCourses = normalizeAppliedCourses(
      updatedUser.appliedCourses
    );

    res.json({
      success: true,
      message,
      data: {
        appliedCourses: normalizedCourses,
        isApplied,
        totalAppliedCourses: normalizedCourses.length,
        courseId: courseIdString,
        // Backward compatibility
        appliedCourseIds: extractCourseIds(updatedUser.appliedCourses),
      },
    });
  } catch (error) {
    console.error("❌ Error toggling applied courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.put("/tracking/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { applicationStatus, statusId, userId: targetUserId } = req.body;

    // For admin updates, use the provided userId, otherwise use authenticated user
    const userId = targetUserId || req.user?.id || req.userId;

    console.log("📝 Status update request:", {
      courseId,
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

    // Validate statusId
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

    // Find the course in appliedCourses
    const courseIndex = user.appliedCourses.findIndex((course) => {
      if (typeof course === "string") {
        return course === courseId;
      }
      return course.courseId === courseId;
    });

    if (courseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Applied course not found",
        debug: {
          courseId,
          availableCourses: user.appliedCourses.map((course) =>
            typeof course === "string" ? course : course.courseId
          ),
        },
      });
    }

    // Update the course status
    if (typeof user.appliedCourses[courseIndex] === "string") {
      // Convert string format to object format
      user.appliedCourses[courseIndex] = {
        courseId: user.appliedCourses[courseIndex],
        applicationStatus: applicationStatus ? Number(applicationStatus) : 1,
        statusId: statusId ? Number(statusId) : 1,
        isConfirmed: false, // ✅ CRITICAL: Include isConfirmed
        updatedAt: new Date(),
      };
    } else {
      // Update existing object
      if (applicationStatus !== undefined) {
        user.appliedCourses[courseIndex].applicationStatus =
          Number(applicationStatus);
      }
      if (statusId !== undefined) {
        user.appliedCourses[courseIndex].statusId = Number(statusId);
      }
      user.appliedCourses[courseIndex].updatedAt = new Date();
    }

    // Save the updated user
    const updatedUser = await user.save();

    console.log("✅ Course status updated successfully:", {
      courseId,
      newApplicationStatus: applicationStatus,
      newStatusId: statusId,
      userId,
      updatedCourse: user.appliedCourses[courseIndex], // Log the actual updated course
    });

    // ✅ CRITICAL: Return the normalized courses with ALL fields
    const normalizedCourses = normalizeAppliedCourses(
      updatedUser.appliedCourses
    );

    res.json({
      success: true,
      message: "Course tracking updated successfully",
      data: {
        appliedCourses: normalizedCourses, // ✅ Return normalized courses with statusId
        updatedCourseId: courseId,
        newApplicationStatus: applicationStatus
          ? Number(applicationStatus)
          : undefined,
        newStatusId: statusId ? Number(statusId) : undefined,
      },
    });
  } catch (error) {
    console.error("❌ Error updating course tracking:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ✅ GET route to check if a specific course is applied (SCHEMA ALIGNED)
router.get("/check/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id || req.userId;

    const user = await UserDb.findById(userId).select("appliedCourses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const courseIds = extractCourseIds(user.appliedCourses || []);
    const isApplied = courseIds.includes(courseId);

    // Find the full course data if it exists
    const courseData = user.appliedCourses?.find((item) => {
      if (typeof item === "string") return item === courseId;
      if (typeof item === "object") return item.courseId === courseId;
      return false;
    });

    // Normalize course data to only include schema fields
    const normalizedCourseData =
      courseData && typeof courseData === "object"
        ? {
            courseId: courseData.courseId,
            applicationStatus: courseData.applicationStatus,
            createdAt: courseData.createdAt,
            updatedAt: courseData.updatedAt,
          }
        : null;

    res.json({
      success: true,
      data: {
        isApplied,
        courseId,
        courseData: normalizedCourseData,
        totalAppliedCourses: courseIds.length,
      },
    });
  } catch (error) {
    console.error("❌ Error checking course application status:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ✅ GET route to get applied course IDs only (lightweight, backward compatible)
router.get("/ids", async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await UserDb.findById(userId).select("appliedCourses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const courseIds = extractCourseIds(user.appliedCourses || []);

    res.json({
      success: true,
      message: "Applied course IDs fetched successfully",
      data: {
        appliedCourseIds: courseIds,
        totalAppliedCourses: courseIds.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching applied course IDs:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.delete("/remove", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.id || req.userId;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const courseIdString = courseId.toString();
    const user = await UserDb.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if course exists (handle both formats)
    const courseIds = extractCourseIds(user.appliedCourses || []);

    if (!courseIds.includes(courseIdString)) {
      return res.status(404).json({
        success: false,
        message: "Course not found in applied courses",
        data: {
          courseId: courseIdString,
          currentAppliedCourses: courseIds,
        },
      });
    }

    // FIXED: Remove from applied courses using separate operations for different formats
    // First, remove string format entries
    await UserDb.findByIdAndUpdate(userId, {
      $pull: { appliedCourses: courseIdString },
    });

    // Then, remove object format entries
    const updatedUser = await UserDb.findByIdAndUpdate(
      userId,
      {
        $pull: { appliedCourses: { courseId: courseIdString } },
      },
      { new: true }
    );

    const remainingCourseIds = extractCourseIds(
      updatedUser.appliedCourses || []
    );

    res.json({
      success: true,
      message: "Course removed from applied courses successfully",
      data: {
        removedCourseId: courseIdString,
        appliedCourses: normalizeAppliedCourses(updatedUser.appliedCourses),
        appliedCourseIds: remainingCourseIds,
        totalAppliedCourses: remainingCourseIds.length,
      },
    });
  } catch (error) {
    console.error("❌ Error removing applied course:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ✅ GET route to get application status options (SCHEMA ALIGNED)
router.get("/status-options", async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        applicationStatuses: [
          { value: 1, label: "Application Started" },
          { value: 2, label: "Documents Prepared" },
          { value: 3, label: "Application Submitted" },
          { value: 4, label: "Under Review" },
          { value: 5, label: "Interview Scheduled" },
          { value: 6, label: "Decision Pending" },
          { value: 7, label: "Final Decision" },
        ],
      },
    });
  } catch (error) {
    console.error("❌ Error fetching status options:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ✅ PUT route to confirm/unconfirm a specific applied course
router.put("/confirm/:courseId", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { isConfirmed, userId: targetUserId } = req.body;

    // For admin updates, use the provided userId, otherwise use authenticated user
    const userId = targetUserId || req.user?.id || req.userId;

    console.log("📝 Course confirmation update request:", {
      courseId,
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

    // Find the course in appliedCourses
    const courseIndex = user.appliedCourses.findIndex((course) => {
      if (typeof course === "string") {
        return course === courseId;
      }
      return course.courseId === courseId;
    });

    if (courseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Applied course not found",
        debug: {
          courseId,
          availableCourses: user.appliedCourses.map((course) =>
            typeof course === "string" ? course : course.courseId
          ),
        },
      });
    }

    // Update the course confirmation status
    if (typeof user.appliedCourses[courseIndex] === "string") {
      // Convert string format to object format with confirmation
      console.log();

      user.appliedCourses[courseIndex] = {
        courseId: user.appliedCourses[courseIndex],
        applicationStatus: user.complete_profile ? 2 : 1, // Default status
        isConfirmed: isConfirmed,
        updatedAt: new Date(),
      };
    } else {
      // Update existing object
      user.appliedCourses[courseIndex].isConfirmed = isConfirmed;
      user.appliedCourses[courseIndex].updatedAt = new Date();
    }

    // Save the updated user
    const updatedUser = await user.save();

    console.log("✅ Course confirmation updated successfully:", {
      courseId,
      isConfirmed,
      userId,
    });

    res.json({
      success: true,
      message: `Course ${
        isConfirmed ? "confirmed" : "unconfirmed"
      } successfully`,
      data: {
        appliedCourses: normalizeAppliedCourses(updatedUser.appliedCourses), // FIXED: Use the correct function name
        updatedCourseId: courseId,
        isConfirmed: isConfirmed,
      },
    });
  } catch (error) {
    console.error("❌ Error updating course confirmation:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/confirmed/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await UserDb.findById(userId).select("appliedCourses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter for confirmed courses only
    const allAppliedCourses = normalizeAppliedCourses(
      user.appliedCourses || []
    );
    const confirmedCourses = allAppliedCourses.filter(
      (course) => course.isConfirmed === true
    );

    console.log("✅ Confirmed courses filter result:", {
      totalAppliedCourses: allAppliedCourses.length,
      confirmedCourses: confirmedCourses.length,
      confirmedCourseIds: confirmedCourses.map((c) => c.courseId),
    });

    res.json({
      success: true,
      message: "Confirmed applied courses fetched successfully",
      data: {
        appliedCourses: confirmedCourses,
        totalConfirmedCourses: confirmedCourses.length,
        totalAppliedCourses: allAppliedCourses.length,
        confirmedCourseIds: confirmedCourses.map((course) => course.courseId),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching confirmed applied courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ✅ GET route to fetch confirmed courses for authenticated user
router.get("/my-confirmed", async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await UserDb.findById(userId).select("appliedCourses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter for confirmed courses only
    const allAppliedCourses = normalizeAppliedCourses(
      user.appliedCourses || []
    );
    const confirmedCourses = allAppliedCourses.filter(
      (course) => course.isConfirmed === true
    );

    res.json({
      success: true,
      message: "Confirmed applied courses fetched successfully",
      data: {
        appliedCourses: confirmedCourses,
        totalConfirmedCourses: confirmedCourses.length,
        totalAppliedCourses: allAppliedCourses.length,
        confirmedCourseIds: confirmedCourses.map((course) => course.courseId),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching confirmed applied courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
