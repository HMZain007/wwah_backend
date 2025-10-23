const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const UserDb = require("../database/models/UserDb");

// Reset Password
router.post("/", async (req, res) => {
  const { newPassword } = req.body;
  try {
    // Validate input
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
        success: false
      });
    }

    if (!req.session) {
      console.log('ERROR: No session object found');
      return res.status(400).json({
        message: "Session not available. Please verify OTP again.",
        success: false
      });
    }

    if (!req.session.email) {

      return res.status(400).json({
        message: "Session expired. Please verify OTP again.",
        success: false
      });
    }

    const { email } = req.session; // Get email from session

    const user = await UserDb.findOne({ email });

    if (!user) {
      console.log('ERROR: User not found for email:', email);
      return res.status(404).json({
        message: "User not found. Unable to reset password.",
        success: false
      });
    }



    if (!user.otpVerified) {
      console.log('ERROR: OTP not verified for user');
      return res.status(403).json({
        message: "OTP not verified. Please verify your email first.",
        success: false
      });
    }

    // Hash and update the password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;

    // Reset OTP fields
    user.otp = undefined;
    user.otpExpiration = undefined;
    user.otpVerified = false;
    await user.save();

    console.log('Password reset successful for:', email);

    // Destroy session only after successful password reset
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        // Don't return error, password was reset successfully
      }
      console.log('Session destroyed after password reset');
    });

    res.status(200).json({
      message: "Your password has been reset successfully!",
      success: true
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in resetPassword route:`, error);
    res.status(500).json({
      message: "An error occurred while resetting the password.",
      success: false
    });
  }
});

module.exports = router;