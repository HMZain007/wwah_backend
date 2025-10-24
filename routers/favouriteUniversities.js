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
