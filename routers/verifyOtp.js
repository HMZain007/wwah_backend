const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
// Verify OTP
router.post("/", async (req, res) => {
  const { otp } = req.body;
  console.log('Received OTP:', otp);

  // Debug session information
  console.log('=== VERIFY OTP SESSION DEBUG ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session email:', req.session?.email);
  console.log('Session exists:', !!req.session);

  try {
    // Validate input
    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return res.status(400).json({
        message: "Invalid OTP format. Please provide a valid 6-digit OTP.",
        success: false,
      });
    }

    // Check session availability
    if (!req.session || !req.session.email) {
      return res.status(400).json({
        message: "Session expired or email not found. Please request a new OTP.",
        success: false,
      });
    }

    const { email } = req.session; // Get email from session
    console.log('Email from session:', email, 'OTP:', otp);

    // Find user with matching email, OTP, and non-expired OTP
    const user = await UserDb.findOne({
      email,
      otp,
      otpExpiration: { $gt: Date.now() },
    });

    console.log('User found:', !!user);
    if (user) {
      console.log('User OTP:', user.otp);
      console.log('User OTP Expiration:', new Date(user.otpExpiration));
      console.log('Current time:', new Date());
    }

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

    // IMPORTANT: Keep session data for password reset
    // DO NOT clear session.email here - we need it for password reset
    console.log('OTP verified successfully. Session email preserved:', req.session.email);

    // Save session to ensure it persists
    req.session.save((err) => {
      if (err) {
        console.error('Session save error after OTP verification:', err);
        return res.status(500).json({
          message: "Session save failed. Please try again.",
          success: false,
        });
      }

      res.status(200).json({
        message: "OTP verified successfully!",
        success: true,
      });
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in verifyOtp route:`, error);
    res.status(500).json({
      message: "An error occurred while verifying the OTP. Please try again later.",
      success: false,
    });
  }
});

// In your verifyOtpRouter.js or equivalent
router.post("/resend", async (req, res) => {
  try {
    // Check session for email
    const email = req.session?.email;
    console.log('Resend OTP session email:', email, 'Session ID:', req.sessionID);
    if (!email) {
      return res.status(400).json({ message: "No email in session." });
    }

    const user = await UserDb.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate new OTP
    const otpToken = crypto.randomInt(100000, 999999).toString();
    user.otp = otpToken;
    user.otpExpiration = Date.now() + 5 * 60 * 1000;
    user.otpVerified = false;
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Resent OTP for Verification",
      text: `Your new OTP is: ${otpToken}. It will expire in 5 minutes.`,
    });

    // Update session
    req.session.otpToken = otpToken;

    console.log(`🔁 OTP resent to ${email}: ${otpToken}`);

    res.status(200).json({ message: "OTP resent successfully." });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Failed to resend OTP." });
  }
});


module.exports = router;