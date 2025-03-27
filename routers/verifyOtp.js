const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb");

// Verify OTP
router.post("/", async (req, res) => {
  const { otp } = req.body;

  try {
    // Validate input
    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return res.status(400).json({
        message: "Invalid OTP format. Please provide a valid 6-digit OTP.",
        success: false,
      });
    }

    if (!req.session || !req.session.email) {
      return res.status(400).json({
        message: "Session expired or email not found. Please try again.",
        success: false,
      });
    }

    const { email } = req.session; // Get email from session

    // Find user with matching email, OTP, and non-expired OTP
    const user = await UserDb.findOne({
      email,
      otp,
      otpExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP. Please request a new OTP.",
        success: false,
      });
    }

    // Mark OTP as verified and save user
    user.otpVerified = true;
    user.otp = undefined; // Clear the OTP after successful verification
    user.otpExpiration = undefined; // Clear OTP expiration
    await user.save();

    res.status(200).json({
      message: "OTP verified successfully!",
      success: true,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in verifyOtp route:`, error);
    res.status(500).json({
      message: "An error occurred while verifying the OTP. Please try again later.",
      success: false,
    });
  }
});

module.exports = router;
