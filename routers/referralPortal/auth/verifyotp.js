// Importing necessary modules
const express = require("express");
const router = express.Router();
const UserRefDb = require("../../../database/models/refPortal/refuser");

// POST Route for OTP verification
router.post("/", async (req, res) => {
  const { email, otp } = req.body;

  // Validate input
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address.",
      success: false,
    });
  }

  if (!otp || otp.length !== 6) {
    return res.status(400).json({
      message: "Please provide a valid 6-digit OTP.",
      success: false,
    });
  }

  try {
    console.log("=== OTP VERIFICATION REQUEST ===");
    console.log("Email:", email);
    console.log("OTP:", otp);

    // Find the user
    const user = await UserRefDb.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address.",
        success: false,
      });
    }

    console.log("User found:", user.firstName);
    console.log("Stored OTP:", user.otp);
    console.log("OTP Expiration:", user.otpExpiration);

    // Check if OTP exists
    if (!user.otp) {
      return res.status(400).json({
        message: "No OTP found. Please request a new one.",
        success: false,
      });
    }

    // Check if OTP has expired
    if (new Date() > user.otpExpiration) {
      // Clear expired OTP
      await UserRefDb.findByIdAndUpdate(user._id, {
        otp: null,
        otpExpiration: null,
      });

      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
        success: false,
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP. Please try again.",
        success: false,
      });
    }

    // OTP is valid - mark as verified and generate a temporary token for password reset
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await UserRefDb.findByIdAndUpdate(user._id, {
      otpVerified: true,
      resetPasswordToken: resetToken,
      resetPasswordTokenExpires: resetTokenExpires,
      // Keep OTP for a short while in case user needs to verify again
    });

    console.log("OTP verified successfully");

    return res.status(200).json({
      message: "OTP verified successfully. You can now reset your password.",
      success: true,
      resetToken: resetToken, // Send this to frontend for password reset
    });
  } catch (error) {
    console.error(
      `${new Date().toISOString()}] OTP verification error: ${error.message}`
    );

    return res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
      success: false,
    });
  }
});

module.exports = router;
