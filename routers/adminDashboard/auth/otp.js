// otpRoutes.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const admin = require("../../../database/models/adminDashboard/user");

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

// POST Route to send OTP
router.post("/send-otp", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide email/username and password.",
      success: false,
    });
  }

  try {
    // Check if input is email or username
    const isEmail = /\S+@\S+\.\S+/.test(email);
    const trimmedInput = email.trim();

    // Find user by email or username
    const user = await admin.findOne(
      isEmail
        ? { email: { $regex: new RegExp(`^${trimmedInput}$`, "i") } }
        : { name: { $regex: new RegExp(`^${trimmedInput}$`, "i") } }
    );

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials.",
        success: false,
      });
    }

    // Verify password
    if (user.password.trim() !== password.trim()) {
      return res.status(401).json({
        message: "Invalid credentials.",
        success: false,
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP with expiration (5 minutes)
    otpStore.set(user.email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      userId: user._id,
      attempts: 0,
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your OTP for Admin Login",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>OTP Verification</h2>
          <p>Hello ${user.name},</p>
          <p>Your OTP for admin login is:</p>
          <h1 style="color: #DC2626; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`OTP sent to ${user.email}`);

    return res.status(200).json({
      message: "OTP sent successfully to your email.",
      success: true,
      email: user.email,
      // Masked email for display
      maskedEmail: user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
    });
  } catch (error) {
    console.error(`Error sending OTP: ${error.message}`);
    return res.status(500).json({
      message: "Failed to send OTP. Please try again.",
      success: false,
      error: error.message,
    });
  }
});

// POST Route to verify OTP
// router.post("/verify-otp", async (req, res) => {
//   console.log("=== VERIFY OTP REQUEST ===");
//   console.log("Request body:", { email, otp });
//   console.log("Request headers:", req.headers);
//   const { email, otp } = req.body;

//   // Validate input
//   if (!email || !otp) {
//     return res.status(400).json({
//       message: "Please provide email and OTP.",
//       success: false,
//     });
//   }

//   try {
//     const storedOtpData = otpStore.get(email);

//     // Check if OTP exists
//     if (!storedOtpData) {
//       return res.status(400).json({
//         message: "OTP not found or expired. Please request a new one.",
//         success: false,
//       });
//     }

//     // Check if OTP expired
//     if (Date.now() > storedOtpData.expiresAt) {
//       otpStore.delete(email);
//       return res.status(400).json({
//         message: "OTP has expired. Please request a new one.",
//         success: false,
//       });
//     }

//     // Check attempts limit
//     // if (storedOtpData.attempts >= 3) {
//     //   otpStore.delete(email);
//     //   return res.status(400).json({
//     //     message: "Too many failed attempts. Please request a new OTP.",
//     //     success: false,
//     //   });
//     // }

//     // Verify OTP
//     if (storedOtpData.otp !== otp.trim()) {
//       storedOtpData.attempts += 1;
//       return res.status(400).json({
//         message: "Invalid OTP. Please try again.",
//         success: false,
//         attemptsLeft: 3 - storedOtpData.attempts,
//       });
//     }

//     // OTP verified successfully
//     const user = await admin.findById(storedOtpData.userId);

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found.",
//         success: false,
//       });
//     }

//     // Generate JWT token
//     const jwt = require("jsonwebtoken");
//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET_KEY || "defaultSecretKey",
//       { expiresIn: "1d" }
//     );

//     // Set token in cookie
//     // Change this line in /verify-otp
//     res.cookie("adminToken", token, {
//       httpOnly: false,
//       sameSite: "Lax", // NOT "None" for localhost
//       secure: false,
//       maxAge: 24 * 60 * 60 * 1000,
//     });

//     // Clear OTP from store
//     otpStore.delete(email);

//     console.log(`Admin user ${user.email} verified and signed in successfully`);

//     return res.status(200).json({
//       message: "OTP verified successfully. Sign in complete.",
//       success: true,
//       token,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error(`Error verifying OTP: ${error.message}`);
//     return res.status(500).json({
//       message: "Failed to verify OTP. Please try again.",
//       success: false,
//       error: error.message,
//     });
//   }
// });
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  console.log("=== VERIFY OTP REQUEST ===");
  console.log("Request body:", { email, otp });
  console.log("Request headers:", req.headers);

  // Validate input
  if (!email || !otp) {
    console.log("❌ Validation failed: Missing email or OTP");
    return res.status(400).json({
      message: "Please provide email and OTP.",
      success: false,
    });
  }

  try {
    const storedOtpData = otpStore.get(email);
    console.log("Stored OTP data:", storedOtpData);

    // Check if OTP exists
    if (!storedOtpData) {
      console.log("❌ OTP not found in store for email:", email);
      console.log("Available emails in store:", Array.from(otpStore.keys()));
      return res.status(400).json({
        message: "OTP not found or expired. Please request a new one.",
        success: false,
      });
    }

    // Check if OTP expired
    if (Date.now() > storedOtpData.expiresAt) {
      console.log("❌ OTP expired");
      otpStore.delete(email);
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
        success: false,
      });
    }

    // Verify OTP
    console.log("Comparing OTPs:");
    console.log("  Stored:", storedOtpData.otp);
    console.log("  Received:", otp.trim());
    console.log("  Match:", storedOtpData.otp === otp.trim());

    if (storedOtpData.otp !== otp.trim()) {
      storedOtpData.attempts += 1;
      console.log(`❌ Invalid OTP. Attempts: ${storedOtpData.attempts}`);
      return res.status(400).json({
        message: "Invalid OTP. Please try again.",
        success: false,
        attemptsLeft: 3 - storedOtpData.attempts,
      });
    }

    console.log("✅ OTP verified successfully");

    // OTP verified successfully
    const user = await admin.findById(storedOtpData.userId);

    if (!user) {
      console.log("❌ User not found:", storedOtpData.userId);
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    console.log("✅ User found:", user.email);

    // Generate JWT token
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY || "defaultSecretKey",
      { expiresIn: "1d" }
    );

    console.log("✅ Token generated");

    console.log("Setting cookie with these settings:", {
      httpOnly: false,
      sameSite: "Lax",
      secure: false,
      path: "/",
    });

    res.cookie("adminToken", token, {
      httpOnly: false,
      sameSite: "None",
      secure: false,
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log("✅ Cookie set, sending response");

    return res.status(200).json({
      message: "OTP verified successfully. Sign in complete.",
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    return res.status(500).json({
      message: "Failed to verify OTP. Please try again.",
      success: false,
      error: error.message,
    });
  }
});
// POST Route to resend OTP
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Please provide email.",
      success: false,
    });
  }

  try {
    const user = await admin.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Update OTP store
    otpStore.set(user.email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      userId: user._id,
      attempts: 0,
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your New OTP for Admin Login",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>OTP Verification</h2>
          <p>Hello ${user.name},</p>
          <p>Your new OTP for admin login is:</p>
          <h1 style="color: #DC2626; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "New OTP sent successfully.",
      success: true,
    });
  } catch (error) {
    console.error(`Error resending OTP: ${error.message}`);
    return res.status(500).json({
      message: "Failed to resend OTP. Please try again.",
      success: false,
    });
  }
});

module.exports = router;
