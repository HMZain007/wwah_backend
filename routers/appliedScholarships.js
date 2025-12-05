 
const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const authenticateToken = require("../middlewares/authMiddleware");

// ✅ GET all applied scholarships
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await UserDb.findById(userId).select("appliedScholarships");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Applied scholarships fetched successfully",
      data: {
        appliedScholarships: user.appliedScholarships || [],
        totalAppliedScholarships: user.appliedScholarships?.length || 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching applied scholarships:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ✅ POST to add/remove a scholarship
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { scholarshipId, action } = req.body;
    const userId = req.user?.id || req.userId;

    if (!scholarshipId) {
      return res.status(400).json({
        success: false,
        message: "Scholarship ID is required",
      });
    }

    if (!action || !["add", "remove"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'add' or 'remove'",
      });
    }

    const scholarshipIdString = scholarshipId.toString();
    const user = await UserDb.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let updatedUser;
    let message;
    let isApplied;

    if (action === "add") {
      if (user.appliedScholarships?.includes(scholarshipIdString)) {
        return res.json({
          success: true,
          message: "Scholarship already applied",
          data: {
            appliedScholarships: user.appliedScholarships,
            isApplied: true,
            totalAppliedScholarships: user.appliedScholarships.length,
          },
        });
      }

      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $addToSet: { appliedScholarships: scholarshipIdString } },
        { new: true }
      );

      message = "Scholarship added successfully";
      isApplied = true;
    } else {
      updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        { $pull: { appliedScholarships: scholarshipIdString } },
        { new: true }
      );

      message = "Scholarship removed successfully";
      isApplied = false;
    }

    res.json({
      success: true,
      message,
      data: {
        appliedScholarships: updatedUser.appliedScholarships || [],
        isApplied,
        totalAppliedScholarships: updatedUser.appliedScholarships?.length || 0,
      },
    });
  } catch (error) {
    console.error("❌ Error updating scholarship:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ✅ GET - check if specific scholarship is applied
router.get("/check/:scholarshipId", authenticateToken, async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    const userId = req.user?.id || req.userId;

    const user = await UserDb.findById(userId).select("appliedScholarships");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isApplied = user.appliedScholarships?.includes(scholarshipId);
    res.json({
      success: true,
      data: {
        isApplied,
        scholarshipId,
        totalAppliedScholarships: user.appliedScholarships?.length || 0,
      },
    });
  } catch (error) {
    console.error("❌ Error checking scholarship status:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
