/**
 * @swagger
 * /universities/favorites:
 *   post:
 *     summary: Add or Remove University from Favorites
 *     description: Toggles a university in the user's favorites list with explicit add or remove action. This is the main route for frontend usage.
 *     tags:
 *       - Favourite Universities
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
 *               - UniversityId
 *               - action
 *             properties:
 *               UniversityId:
 *                 type: string
 *                 description: The ID of the university to add or remove
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *               action:
 *                 type: string
 *                 enum: [add, remove]
 *                 description: Action to perform - either 'add' or 'remove'
 *                 example: "add"
 *     responses:
 *       200:
 *         description: University successfully added to or removed from favorites.
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
 *                   example: "University added to favorites"
 *                 isFavorite:
 *                   type: boolean
 *                   example: true
 *                 favouriteUniversity:
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
 */

/**
 * @swagger
 * /universities/favorite:
 *   post:
 *     summary: Add or Remove University from Favorites (Legacy)
 *     description: Legacy endpoint for toggling a university in favorites. Kept for backward compatibility. Use /favorites instead.
 *     tags:
 *       - Favourite Universities
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
 *               - UniversityId
 *               - action
 *             properties:
 *               UniversityId:
 *                 type: string
 *                 description: The ID of the university to add or remove
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *               action:
 *                 type: string
 *                 enum: [add, remove]
 *                 description: Action to perform - either 'add' or 'remove'
 *                 example: "add"
 *     responses:
 *       200:
 *         description: University successfully added to or removed from favorites.
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
 *                   example: "University added to favorites"
 *                 isFavorite:
 *                   type: boolean
 *                   example: true
 *                 favouriteUniversity:
 *                   type: array
 *                   items:
 *                     type: string
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
 * /universities/toggle:
 *   post:
 *     summary: Toggle University Favorite Status
 *     description: Automatically toggles a university's favorite status. If already favorited, removes it; if not favorited, adds it.
 *     tags:
 *       - Favourite Universities
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
 *               - UniversityId
 *             properties:
 *               UniversityId:
 *                 type: string
 *                 description: The ID of the university to toggle
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: University favorite status toggled successfully.
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
 *                   example: "University added to favorites"
 *                 isFavorite:
 *                   type: boolean
 *                   description: Current favorite status after toggle
 *                   example: true
 *                 favouriteUniversity:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Updated list of all favorite university IDs
 *                   example: ["60d5ec49f1b2c72b8c8e4a1b", "60d5ec49f1b2c72b8c8e4a2c"]
 *       400:
 *         description: University ID is required.
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
 *                   example: "University ID is required"
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
 * /universities:
 *   get:
 *     summary: Get User's Favorite Universities
 *     description: Retrieves the list of all university IDs that the authenticated user has favorited.
 *     tags:
 *       - Favourite Universities
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's favorite universities retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 favouriteUniversity:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of favorite university IDs
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
 */

// Fixed backend route - favouriteUniversities.js
const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const authenticateToken = require("../middlewares/authMiddleware");
// const authenticateToken = require("../middlewares/authMiddleware");

// Route 1: Toggle favorites with action parameter (main route for frontend)
router.post("/favorites", authenticateToken, async (req, res) => {
  console.log("Received request to toggle favorite University:", req.body);

  try {
    const { UniversityId, action } = req.body;
    const userId = req.user?.id || req.userId;

    // Validate required fields
    if (!UniversityId) {
      return res.status(400).json({
        success: false,
        message: "University ID is required",
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
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $addToSet: { favouriteUniversity: UniversityId } },
        { new: true, select: "favouriteUniversity" }
      );
      message = "University added to favorites";
      isFavorite = true;
    } else {
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $pull: { favouriteUniversity: UniversityId } },
        { new: true, select: "favouriteUniversity" }
      );
      message = "University removed from favorites";
      isFavorite = false;
    }

    res.status(200).json({
      success: true,
      message: message,
      isFavorite: isFavorite,
      favouriteUniversity: updatedUser.favouriteUniversity,
    });
  } catch (error) {
    console.error("Error toggling favorite university:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Keep the original /favorite route for backward compatibility
router.post("/favorite", authenticateToken, async (req, res) => {
  console.log("Received request to toggle favorite University:", req.body);

  try {
    const { UniversityId, action } = req.body;
    const userId = req.user?.id || req.userId;

    if (!UniversityId) {
      return res.status(400).json({
        success: false,
        message: "University ID is required",
      });
    }

    if (!action || !["add", "remove"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action is required and must be 'add' or 'remove'",
      });
    }

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
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $addToSet: { favouriteUniversity: UniversityId } },
        { new: true, select: "favouriteUniversity" }
      );
      message = "University added to favorites";
      isFavorite = true;
    } else {
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $pull: { favouriteUniversity: UniversityId } },
        { new: true, select: "favouriteUniversity" }
      );
      message = "University removed from favorites";
      isFavorite = false;
    }

    res.status(200).json({
      success: true,
      message: message,
      isFavorite: isFavorite,
      favouriteUniversity: updatedUser.favouriteUniversity,
    });
  } catch (error) {
    console.error("Error toggling favorite university:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Keep other routes as they are...
router.post("/toggle", authenticateToken, async (req, res) => {
  try {
    const { UniversityId } = req.body;
    const userId = req.user?.id || req.userId;

    if (!UniversityId) {
      return res.status(400).json({
        success: false,
        message: "University ID is required",
      });
    }

    const user = await UserDb.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isFavorite = user.favouriteUniversity.includes(UniversityId);
    let updatedUser;
    let message;

    if (isFavorite) {
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $pull: { favouriteUniversity: UniversityId } },
        { new: true, select: "favouriteUniversity" }
      );
      message = "University removed from favorites";
    } else {
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $addToSet: { favouriteUniversity: UniversityId } },
        { new: true, select: "favouriteUniversity" }
      );
      message = "University added to favorites";
    }

    res.status(200).json({
      success: true,
      message: message,
      isFavorite: !isFavorite,
      favouriteUniversity: updatedUser.favouriteUniversity,
    });
  } catch (error) {
    console.error("Error toggling favorite university:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get user's favorites
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await UserDb.findById(userId).select("favouriteUniversity");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      favouriteUniversity: user.favouriteUniversity || [],
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
