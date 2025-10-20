// routes/forgotPassword.js

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const UserRefDb = require("../../database/models/refPortal/refuser");

// ==================== Helper Functions ====================

// Email validation
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// Generate a 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Hash OTP for secure storage
const hashOTP = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// Configure transporter once (not per request)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password (not regular Gmail password)
  },
});

// Send OTP Email
const sendOTPEmail = async (email, otp, firstName = "User") => {
  const mailOptions = {
    from: `"WWAH Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP - WWAH",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #d32f2f; text-align: center;">Password Reset Request</h2>
        <p>Hello ${firstName},</p>
        <p>We received a request to reset your password for your WWAH account. Please use the following One-Time Password (OTP) to proceed:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
          <h1 style="color: #d32f2f; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          <p style="color: #666; font-size: 14px;">Valid for 2 minutes</p>
        </div>
        <p>If you did not request this, please ignore this email.</p>
        <p style="font-size: 12px; color: #999; text-align: center;">This is an automated email. Please do not reply.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ==================== Forgot Password Route ====================

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Find user
    const user = await UserRefDb.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    // Generate and hash OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpires = Date.now() + 2 * 60 * 1000; // 2 minutes

    // Update user with OTP and expiration
    await UserRefDb.findByIdAndUpdate(user._id, {
      otp: hashedOTP,
      otpExpiration: otpExpires,
      otpVerified: false,
    });

    // Send OTP email
    await sendOTPEmail(email, otp, user.firstName);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your email inbox.",
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Forgot password error:`, error.message);

    if (error.message.includes("Invalid login") || error.message.includes("authentication")) {
      return res.status(500).json({
        success: false,
        message: "Email service configuration error. Please contact support.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

module.exports = router;
