const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

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
    console.log(otpToken);
    user.otp = otpToken;
    user.otpExpiration = Date.now() + 2 * 60 * 1000; // Expire in 2 minutes
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

    // Store email in session
    if (req.session) {
      req.session.email = email;
    } else {
      console.warn("Session not found. Ensure session middleware is set up correctly.");
    }

    res.status(200).json({ message: "OTP sent to email. Please check your inbox." });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in forgotPassword route:`, error);

    // Specific error handling for email failures
    if (error.response && error.response.includes("Invalid login")) {
      return res.status(500).json({ message: "Failed to send OTP. Email configuration issue." });
    }

    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
});

module.exports = router;
