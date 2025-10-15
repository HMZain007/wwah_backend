// Importing necessary modules
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const UserRefDb = require("../../../database/models/refPortal/refuser");

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Function to send OTP email
const sendOTPEmail = async (email, otp, firstName = "") => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset OTP - WWAH",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #d32f2f; margin: 0;">Password Reset Request</h2>
        </div>
        
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Hello ${firstName ? firstName : "User"},
        </p>
        
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          We received a request to reset your password for your WWAH account. Please use the following One-Time Password (OTP) to proceed with resetting your password:
        </p>
        
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
          <h1 style="color: #d32f2f; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          <p style="color: #666; font-size: 14px; margin-top: 10px;">This OTP is valid for 10 minutes</p>
        </div>
        
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// POST Route for forgot password - Send OTP
router.post("/", async (req, res) => {
  const { email } = req.body;
  console.log("=== FORGOT PASSWORD REQUEST ===");
  console.log("Email received:", email);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

  // Validate input
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    console.log("Invalid email format");
    return res.status(400).json({
      message: "Please provide a valid email address.",
      success: false,
    });
  }

  try {
    // Check if user exists
    const user = await UserRefDb.findOne({ email });
    console.log("User found:", !!user);

    if (!user) {
      console.log("No user found with email:", email);
      return res.status(404).json({
        message: "No account found with this email address.",
        success: false,
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    console.log("Generated OTP:", otp);
    console.log("OTP expires at:", otpExpires);

    // Update user with OTP and expiration time (using existing fields)
    await UserRefDb.findByIdAndUpdate(user._id, {
      otp: otp,
      otpExpiration: otpExpires,
      otpVerified: false, // Reset verification status
    });

    console.log("User updated with OTP");

    // Send OTP email
    console.log("Attempting to send email...");
    await sendOTPEmail(email, otp, user.firstName);
    console.log("Email sent successfully!");

    return res.status(200).json({
      message:
        "OTP has been sent to your email address. Please check your inbox.",
      success: true,
    });
  } catch (error) {
    // Log the error and send a generic response
    console.error(
      `${new Date().toISOString()}] Forgot password error: ${error.message}`
    );
    console.error("Full error:", error);

    // Handle specific email sending errors
    if (
      error.message.includes("Invalid login") ||
      error.message.includes("authentication")
    ) {
      return res.status(500).json({
        message: "Email service configuration error. Please contact support.",
        success: false,
      });
    }

    return res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
      success: false,
    });
  }
});

module.exports = router;
