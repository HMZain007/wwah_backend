const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const authenticateToken = require("../middlewares/authMiddleware");

// Route 1: Toggle favorites with action parameter (main route for frontend)
router.post("/favorite", authenticateToken, async (req, res) => {
  console.log("Received request to toggle favorite scholarship:", req.body); // Debug log

  try {
    const { scholarshipId, action } = req.body;
    // Fix: Use consistent userId extraction
    const userId = req.user?.id || req.userId;

    // Validate required fields
    if (!scholarshipId) {
      return res.status(400).json({
        success: false,
        message: "Scholarship ID is required",
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
        { $addToSet: { favouriteScholarship: scholarshipId } },
        { new: true, select: "favouriteScholarship" }
      );
      message = "Course added to favorites";
      isFavorite = true;
    } else {
      // Remove from favorites
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $pull: { favouriteScholarship: scholarshipId } },
        { new: true, select: "favouriteScholarship" }
      );
      message = " Favourite Scholarship removed from favorites";
      isFavorite = false;
    }

    res.status(200).json({
      success: true,
      message: message,
      isFavorite: isFavorite,
      favouriteScholarship: updatedUser.favouriteScholarship,
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
router.post("/toggle", authenticateToken, async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    // Fix: Use consistent userId extraction
    const userId = req.user?.id || req.userId;

    // Validate scholarshipId
    if (!scholarshipId) {
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

    const isFavorite = user.favouriteScholarship.includes(scholarshipId);
    let updatedUser;
    let message;

    if (isFavorite) {
      // Remove from favorites
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $pull: { favouriteScholarship: scholarshipId } },
        { new: true, select: "favouriteScholarship" }
      );
      message = "Course removed from favorites";
    } else {
      // Add to favorites
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $addToSet: { favouriteScholarship: scholarshipId } },
        { new: true, select: "favouriteScholarship" }
      );
      message = "Course added to favorites";
    }

    res.status(200).json({
      success: true,
      message: message,
      isFavorite: !isFavorite,
       favouriteScholarship: updatedUser.favouriteScholarship,
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
router.post("/add", authenticateToken, async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    // Fix: Use consistent userId extraction
    const userId = req.user?.id || req.userId;

    // Validate scholarshipId
    if (!scholarshipId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Find user and update favorites using $addToSet to avoid duplicates
    const user = await UserDb.findByIdAndUpdate(
      userId,
      { $addToSet: { favouriteScholarship: scholarshipId } },
      { new: true, select: "favouriteScholarship" }
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
       favouriteScholarship: user.favouriteScholarship,
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
router.post("/remove", authenticateToken, async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    // Fix: Use consistent userId extraction
    const userId = req.user?.id || req.userId;

    // Validate scholarshipId
    if (!scholarshipId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Find user and remove from favorites
    const user = await UserDb.findByIdAndUpdate(
      userId,
      { $pull: { favouriteScholarship: scholarshipId } },
      { new: true, select: "favouriteScholarship" }
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
       favouriteScholarship: user.favouriteScholarship,
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
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Fix: Use consistent userId extraction
    const userId = req.user?.id || req.userId;

    const user = await UserDb.findById(userId).select("favouriteScholarship");

    if (!user) {    
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
       favouriteScholarship: user.favouriteScholarship || [],
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
