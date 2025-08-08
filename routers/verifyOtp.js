const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ✅ ENHANCED VERIFY OTP WITH BETTER ERROR HANDLING
router.post("/", async (req, res) => {
  const { otp } = req.body;
  console.log('Received OTP:', otp);

  // Enhanced session debugging
  console.log('=== VERIFY OTP SESSION DEBUG ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session email:', req.session?.email);
  console.log('Session exists:', !!req.session);
  console.log('Full session:', JSON.stringify(req.session, null, 2));
  console.log('Request cookies:', req.cookies);
  console.log('Request headers cookie:', req.headers.cookie);

  try {
    // Validate input
    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return res.status(400).json({
        message: "Invalid OTP format. Please provide a valid 6-digit OTP.",
        success: false,
        debug: process.env.NODE_ENV !== "production" ? { sessionId: req.sessionID } : undefined
      });
    }

    // ✅ ENHANCED SESSION CHECK with better error messages
    if (!req.session) {
      return res.status(500).json({
        message: "Session not initialized. Please enable cookies and try again.",
        success: false,
        errorType: "SESSION_NOT_INITIALIZED"
      });
    }

    if (!req.session.email) {
      // ✅ Try to regenerate session and provide helpful message
      return res.status(400).json({
        message: "Session expired. Please request a new OTP to continue.",
        success: false,
        errorType: "SESSION_EXPIRED",
        action: "REQUEST_NEW_OTP"
      });
    }

    const { email } = req.session;
    console.log('Processing verification for email:', email, 'with OTP:', otp);

    // ✅ ENHANCED DATABASE QUERY with better logging
    const user = await UserDb.findOne({
      email,
      otp,
      otpExpiration: { $gt: Date.now() },
    });

    console.log('Database query result:');
    if (user) {
      console.log('✅ User found:', {
        email: user.email,
        hasOtp: !!user.otp,
        otpMatch: user.otp === otp,
        otpExpiration: new Date(user.otpExpiration),
        currentTime: new Date(),
        isExpired: user.otpExpiration <= Date.now()
      });
    } else {
      // ✅ Better debugging for failed queries
      const userExists = await UserDb.findOne({ email });
      if (userExists) {
        console.log('❌ User exists but OTP mismatch:', {
          storedOtp: userExists.otp,
          providedOtp: otp,
          otpExpiration: userExists.otpExpiration ? new Date(userExists.otpExpiration) : 'No expiration',
          isExpired: userExists.otpExpiration ? userExists.otpExpiration <= Date.now() : 'No expiration set'
        });
      } else {
        console.log('❌ User not found for email:', email);
      }
    }

    if (!user) {
      // ✅ More specific error messages
      const userCheck = await UserDb.findOne({ email });
      let errorMessage = "Invalid or expired OTP. Please request a new OTP.";

      if (!userCheck) {
        errorMessage = "User session mismatch. Please request a new OTP.";
      } else if (userCheck.otpExpiration && userCheck.otpExpiration <= Date.now()) {
        errorMessage = "OTP has expired. Please request a new OTP.";
      } else if (userCheck.otp !== otp) {
        errorMessage = "Invalid OTP. Please check and try again.";
      }

      return res.status(400).json({
        message: errorMessage,
        success: false,
        errorType: "OTP_VERIFICATION_FAILED"
      });
    }

    // ✅ SUCCESS - Update user and maintain session
    user.otpVerified = true;
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    console.log('✅ OTP verified successfully. Session email preserved:', req.session.email);

    // ✅ ENSURE SESSION PERSISTENCE
    req.session.otpVerified = true; // Add verification flag
    req.session.touch(); // Update session timestamp

    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error after OTP verification:', err);
        return res.status(500).json({
          message: "Verification successful but session save failed. Please try password reset.",
          success: false,
          errorType: "SESSION_SAVE_ERROR"
        });
      }

      console.log('✅ Session saved successfully after OTP verification');
      res.status(200).json({
        message: "OTP verified successfully! You can now reset your password.",
        success: true,
        nextStep: "RESET_PASSWORD"
      });
    });

  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Error in verifyOtp route:`, error);
    res.status(500).json({
      message: "An error occurred while verifying the OTP. Please try again later.",
      success: false,
      errorType: "SERVER_ERROR"
    });
  }
});

// ✅ ENHANCED RESEND OTP with better session handling
router.post("/resend", async (req, res) => {
  try {
    console.log('=== RESEND OTP SESSION DEBUG ===');
    console.log('Session ID:', req.sessionID);
    console.log('Session:', JSON.stringify(req.session, null, 2));

    const email = req.session?.email;
    if (!email) {
      return res.status(400).json({
        message: "No active session found. Please start the password reset process again.",
        success: false,
        errorType: "NO_SESSION_EMAIL",
        action: "RESTART_PROCESS"
      });
    }

    const user = await UserDb.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found. Please start the password reset process again.",
        success: false
      });
    }

    // Generate new OTP
    const otpToken = crypto.randomInt(100000, 999999).toString();
    user.otp = otpToken;
    user.otpExpiration = Date.now() + 15 * 60 * 1000; // 15 minutes for resend
    user.otpVerified = false;
    await user.save();

    // Send email
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Resent OTP for Password Reset",
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your new OTP is: <strong>${otpToken}</strong></p>
        <p>This OTP will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    // ✅ Update session and ensure it's saved
    req.session.otpToken = otpToken; // For debugging only
    req.session.otpResent = true;
    req.session.touch();

    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error after OTP resend:', err);
        return res.status(500).json({
          message: "OTP sent but session save failed. Please try verification.",
          success: false
        });
      }

      console.log(`✅ OTP resent to ${email}: ${otpToken}`);
      res.status(200).json({
        message: "New OTP sent successfully. Please check your email.",
        success: true
      });
    });

  } catch (error) {
    console.error("❌ Error resending OTP:", error);
    res.status(500).json({
      message: "Failed to resend OTP. Please try again.",
      success: false
    });
  }
});

module.exports = router;