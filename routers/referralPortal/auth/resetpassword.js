// Importing necessary modules
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const UserRefDb = require("../../../database/models/refPortal/refuser");

// POST Route for resetting password
router.post("/", async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  // Validate input
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address.",
      success: false,
    });
  }

  if (!resetToken) {
    return res.status(400).json({
      message: "Reset token is required.",
      success: false,
    });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long.",
      success: false,
    });
  }

  try {
    console.log("=== PASSWORD RESET REQUEST ===");
    console.log("Email:", email);
    console.log("Reset Token:", resetToken);

    // Find the user
    const user = await UserRefDb.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address.",
        success: false,
      });
    }

    console.log("User found:", user.firstName);

    // Check if reset token exists and is valid
    if (!user.resetPasswordToken || user.resetPasswordToken !== resetToken) {
      return res.status(400).json({
        message:
          "Invalid or expired reset token. Please start the process again.",
        success: false,
      });
    }

    // Check if token has expired
    if (new Date() > user.resetPasswordTokenExpires) {
      // Clear expired token
      await UserRefDb.findByIdAndUpdate(user._id, {
        resetPasswordToken: null,
        resetPasswordTokenExpires: null,
        otp: null,
        otpExpiration: null,
        otpVerified: false,
      });

      return res.status(400).json({
        message: "Reset token has expired. Please start the process again.",
        success: false,
      });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password and clear all reset-related fields
    await UserRefDb.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpires: null,
      otp: null,
      otpExpiration: null,
      otpVerified: false,
    });

    console.log("Password reset successful for:", email);

    return res.status(200).json({
      message:
        "Your password has been reset successfully. You can now sign in with your new password.",
      success: true,
    });
  } catch (error) {
    console.error(
      `${new Date().toISOString()}] Password reset error: ${error.message}`
    );

    return res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
      success: false,
    });
  }
});

module.exports = router;
