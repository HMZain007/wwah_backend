// routes/referralPortal/CommissionRoutes.js
const express = require("express");
const router = express.Router();
const Commission = require("../../database/models/refPortal/Commission");
const UserRefDb = require("../../database/models/refPortal/refuser");
// Middleware to verify user exists
const verifyUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await UserRefDb.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying user",
    });
  }
};
// GET /api/refportal/commission/:userId - Get all commissions for a user
router.get("/:userId", verifyUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const commissions = await Commission.find({ user: userId }).sort({
      createdAt: -1,
    }); // Sort by newest first
    res.status(200).json({
      success: true,
      data: commissions,
    });
  } catch (error) {
    console.error("Error fetching commissions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching commission data",
      error: error.message,
    });
  }
});
// POST /api/refportal/commission/:userId - Create new commission
router.post("/:userId", verifyUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, referrals, amount, status } = req.body;
    // Validate required fields
    if (!month || referrals === undefined || amount === undefined || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: month, referrals, amount, status",
      });
    }
    // Validate data types
    if (typeof referrals !== "number" || typeof amount !== "number") {
      return res.status(400).json({
        success: false,
        message: "Referrals and amount must be numbers",
      });
    }
    // Validate values
    if (referrals < 0 || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Referrals and amount must be positive numbers",
      });
    }
    // Validate status
    if (!["Paid", "Pending", "Requested"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: Paid, Pending, Requested",
      });
    }
    // Check if commission for this month already exists
    const existingCommission = await Commission.findOne({
      user: userId,
      month: month,
    });
    if (existingCommission) {
      return res.status(400).json({
        success: false,
        message: "Commission record for this month already exists",
      });
    }
    // Create new commission
    const commission = new Commission({
      user: userId,
      month,
      referrals,
      amount,
      status,
    });
    const savedCommission = await commission.save();
    res.status(201).json({
      success: true,
      message: "Commission record created successfully",
      data: savedCommission,
    });
  } catch (error) {
    console.error("Error creating commission:", error);
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Commission record for this month already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating commission record",
      error: error.message,
    });
  }
});
// PUT /api/refportal/commission/:userId/:commissionId - Update commission
router.put("/:userId/:commissionId", verifyUser, async (req, res) => {
  try {
    const { userId, commissionId } = req.params;
    const { month, referrals, amount, status } = req.body;
    // Find the commission
    const commission = await Commission.findOne({
      _id: commissionId,
      user: userId,
    });
    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission record not found",
      });
    }
    // Validate fields if provided
    if (
      referrals !== undefined &&
      (typeof referrals !== "number" || referrals < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Referrals must be a positive number",
      });
    }
    if (amount !== undefined && (typeof amount !== "number" || amount < 0)) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }
    if (status && !["Paid", "Pending", "Requested"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: Paid, Pending, Requested",
      });
    }
    // Check for duplicate month if month is being updated
    if (month && month !== commission.month) {
      const existingCommission = await Commission.findOne({
        user: userId,
        month: month,
        _id: { $ne: commissionId },
      });
      if (existingCommission) {
        return res.status(400).json({
          success: false,
          message: "Commission record for this month already exists",
        });
      }
    }
    // Update fields
    const updates = {};
    if (month !== undefined) updates.month = month;
    if (referrals !== undefined) updates.referrals = referrals;
    if (amount !== undefined) updates.amount = amount;
    if (status !== undefined) updates.status = status;
    const updatedCommission = await Commission.findByIdAndUpdate(
      commissionId,
      updates,
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: "Commission record updated successfully",
      data: updatedCommission,
    });
  } catch (error) {
    console.error("Error updating commission:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Commission record for this month already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating commission record",
      error: error.message,
    });
  }
});
// DELETE /api/refportal/commission/:userId/:commissionId - Delete commission
router.delete("/:userId/:commissionId", verifyUser, async (req, res) => {
  try {
    const { userId, commissionId } = req.params;
    const commission = await Commission.findOne({
      _id: commissionId,
      user: userId,
    });
    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission record not found",
      });
    }
    await Commission.findByIdAndDelete(commissionId);
    res.status(200).json({
      success: true,
      message: "Commission record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting commission:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting commission record",
      error: error.message,
    });
  }
});
module.exports = router;
