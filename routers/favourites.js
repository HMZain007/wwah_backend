/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Add or Remove Course from Favorites
 *     description: Toggles a course in the user's favorites list with explicit add or remove action. This is the main route for frontend usage.
 *     tags:
 *       - Favourites
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
 *     responses:
 *       200:
 *         description: Course successfully added to or removed from favorites.
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
 *                   example: "Course added to favorites"
 *                 isFavorite:
 *                   type: boolean
 *                   example: true
 *                 favouriteCourses:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["60d5ec49f1b2c72b8c8e4a1b", "60d5ec49f1b2c72b8c8e4a2c"]
 *       400:
 *         description: Missing required fields or invalid action.
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
 *                   example: "Action is required and must be 'add' or 'remove'"
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
 *         description: Internal server error.
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
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *   get:
 *     summary: Get User's Favorite Courses
 *     description: Retrieves the list of all course IDs that the authenticated user has favorited.
 *     tags:
 *       - Favourites
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's favorite courses retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 favouriteCourses:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of favorite course IDs
 *                   example: ["60d5ec49f1b2c72b8c8e4a1b", "60d5ec49f1b2c72b8c8e4a2c", "60d5ec49f1b2c72b8c8e4a3d"]
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
 *         description: Internal server error.
 */

/**
 * @swagger
 * /favorites/toggle:
 *   post:
 *     summary: Toggle Course Favorite Status
 *     description: Automatically toggles a course's favorite status. If already favorited, removes it; if not favorited, adds it.
 *     tags:
 *       - Favourites
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
 *                 description: The ID of the course to toggle
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Course favorite status toggled successfully.
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
 *                   example: "Course added to favorites"
 *                 isFavorite:
 *                   type: boolean
 *                   description: Current favorite status after toggle
 *                   example: true
 *                 favouriteCourses:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Updated list of all favorite course IDs
 *                   example: ["60d5ec49f1b2c72b8c8e4a1b", "60d5ec49f1b2c72b8c8e4a2c"]
 *       400:
 *         description: Course ID is required.
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
 *                   example: "Course ID is required"
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
 *         description: Internal server error.
 */

/**
 * @swagger
 * /favorites/add:
 *   post:
 *     summary: Add Course to Favorites
 *     description: Explicitly adds a course to the user's favorites list. Prevents duplicates using MongoDB's $addToSet operator.
 *     tags:
 *       - Favourites
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
 *                 description: The ID of the course to add to favorites
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Course successfully added to favorites.
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
 *                   example: "Course added to favorites"
 *                 isFavorite:
 *                   type: boolean
 *                   example: true
 *                 favouriteCourses:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Updated list of all favorite course IDs
 *                   example: ["60d5ec49f1b2c72b8c8e4a1b", "60d5ec49f1b2c72b8c8e4a2c"]
 *       400:
 *         description: Course ID is required.
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
 *                   example: "Course ID is required"
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
 *         description: Internal server error.
 */

/**
 * @swagger
 * /favorites/remove:
 *   post:
 *     summary: Remove Course from Favorites
 *     description: Explicitly removes a course from the user's favorites list.
 *     tags:
 *       - Favourites
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
 *                 description: The ID of the course to remove from favorites
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Course successfully removed from favorites.
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
 *                   example: "Course removed from favorites"
 *                 isFavorite:
 *                   type: boolean
 *                   example: false
 *                 favouriteCourses:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Updated list of all favorite course IDs
 *                   example: ["60d5ec49f1b2c72b8c8e4a2c"]
 *       400:
 *         description: Course ID is required.
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
 *                   example: "Course ID is required"
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
 *         description: Internal server error.
 */

const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const authenticateToken = require("../middlewares/authMiddleware");
// const authenticateToken = require("../middlewares/authMiddleware");

// Route 1: Toggle favorites with action parameter (main route for frontend)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { courseId, action } = req.body;
    // Fix: Use consistent userId extraction
    const userId = req.user?.id || req.userId;

    // Validate required fields
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

    // Find user first
    const user = await UserDb.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let updatedUser;
    let message;
    let isFavorite;

    if (action === "add") {
      // Add to favorites (using $addToSet to avoid duplicates)
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $addToSet: { favouriteCourse: courseId } },
        { new: true, select: "favouriteCourse" }
      );
      message = "Course added to favorites";
      isFavorite = true;
    } else {
      // Remove from favorites
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $pull: { favouriteCourse: courseId } },
        { new: true, select: "favouriteCourse" }
      );
      message = "Course removed from favorites";
      isFavorite = false;
    }

    res.status(200).json({
      success: true,
      message: message,
      isFavorite: isFavorite,
      favouriteCourses: updatedUser.favouriteCourse,
    });
  } catch (error) {
    console.error("Error toggling favorite course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Route 2: Toggle favorites without action (automatically detects add/remove)
router.post("/toggle", async (req, res) => {
  try {
    const { courseId } = req.body;
    // Fix: Use consistent userId extraction
    const userId = req.user?.id || req.userId;

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Find user first to check if course is already in favorites
    const user = await UserDb.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isFavorite = user.favouriteCourse.includes(courseId);
    let updatedUser;
    let message;

    if (isFavorite) {
      // Remove from favorites
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $pull: { favouriteCourse: courseId } },
        { new: true, select: "favouriteCourse" }
      );
      message = "Course removed from favorites";
    } else {
      // Add to favorites
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $addToSet: { favouriteCourse: courseId } },
        { new: true, select: "favouriteCourse" }
      );
      message = "Course added to favorites";
    }

    res.status(200).json({
      success: true,
      message: message,
      isFavorite: !isFavorite,
      favouriteCourses: updatedUser.favouriteCourse,
    });
  } catch (error) {
    console.error("Error toggling favorite course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Route 3: Add to favorites explicitly
router.post("/add", async (req, res) => {
  try {
    const { courseId } = req.body;
    // Fix: Use consistent userId extraction
    const userId = req.user?.id || req.userId;

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Find user and update favorites using $addToSet to avoid duplicates
    const user = await UserDb.findByIdAndUpdate(
      userId,
      { $addToSet: { favouriteCourse: courseId } },
      { new: true, select: "favouriteCourse" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course added to favorites",
      isFavorite: true,
      favouriteCourses: user.favouriteCourse,
    });
  } catch (error) {
    console.error("Error adding course to favorites:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Route 4: Remove from favorites explicitly
router.post("/remove", async (req, res) => {
  try {
    const { courseId } = req.body;
    // Fix: Use consistent userId extraction
    const userId = req.user?.id || req.userId;

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Find user and remove from favorites
    const user = await UserDb.findByIdAndUpdate(
      userId,
      { $pull: { favouriteCourse: courseId } },
      { new: true, select: "favouriteCourse" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course removed from favorites",
      isFavorite: false,
      favouriteCourses: user.favouriteCourse,
    });
  } catch (error) {
    console.error("Error removing course from favorites:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Route 5: Get user's favorites
router.get("/", authenticateToken,async (req, res) => {
  try {
    // Fix: Use consistent userId extraction
    const userId = req.user?.id || req.userId;

    const user = await UserDb.findById(userId).select("favouriteCourse");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      favouriteCourses: user.favouriteCourse || [],
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
