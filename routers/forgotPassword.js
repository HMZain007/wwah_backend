const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    // Validate email input
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    const user = await UserDb.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate OTP and set expiration time
    const otpToken = crypto.randomInt(100000, 999999).toString();
    console.log('Generated OTP:', otpToken);

    user.otp = otpToken;
    user.otpExpiration = Date.now() + 2 * 60 * 1000; // Expire in 2 minutes (increased for testing)
    user.otpVerified = false; // Mark OTP as unverified
    await user.save();

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email with OTP
    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otpToken}. This OTP is valid for 2 minutes.`,
    });
    console.log(`OTP sent to ${user.email}: ${otpToken}`);

    if (!req.session) {
      return res.status(500).json({
        message: "Session not available. Please ensure cookies are enabled.",
      });
    }

    // Store email in session with explicit regeneration
    req.session.email = email;
    req.session.otpRequested = true;
    req.session.otpToken = otpToken; // Store for debugging (remove in production)
    console.log('Session after setting data:', JSON.stringify(req.session, null, 2));


    // Save session explicitly and wait for completion
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({
          message: "Failed to save session. Please try again.",
        });
      }

      console.log('Session saved successfully');
      console.log('Final session data:', JSON.stringify(req.session, null, 2));

      res.status(200).json({
        message: "OTP sent to email. Please check your inbox.",
        success: true,
        debug: {
          sessionId: req.sessionID,
          email: req.session.email // Remove in production
        }
      });
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error in forgotPassword route:`,
      error
    );

    // Specific error handling for email failures
    if (error.response && error.response.includes("Invalid login")) {
      return res
        .status(500)
        .json({ message: "Failed to send OTP. Email configuration issue." });
    }

    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
});

module.exports = router;