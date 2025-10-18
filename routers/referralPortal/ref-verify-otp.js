// // routes/verifyOtp.js

// const express = require("express");
// const crypto = require("crypto");
// const router = express.Router();
// const UserRefDb = require("../../database/models/refPortal/refuser");

// // Helper function to validate email
// const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// // Hash OTP for comparison
// const hashOTP = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// // ==================== Verify OTP Route ====================
// router.post("/", async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     // ---------- Input Validation ----------
//     if (!email || !isValidEmail(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide a valid email address.",
//       });
//     }

//     if (!otp || otp.length !== 6) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide a valid 6-digit OTP.",
//       });
//     }

//     // ---------- Find User ----------
//     const user = await UserRefDb.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "No account found with this email address.",
//       });
//     }

//     // ---------- Validate OTP ----------
//     if (!user.otp || !user.otpExpiration) {
//       return res.status(400).json({
//         success: false,
//         message: "No OTP found. Please request a new one.",
//       });
//     }

//     // Check expiration
//     if (Date.now() > user.otpExpiration) {
//       await UserRefDb.findByIdAndUpdate(user._id, {
//         otp: null,
//         otpExpiration: null,
//         otpVerified: false,
//       });

//       return res.status(400).json({
//         success: false,
//         message: "OTP has expired. Please request a new one.",
//       });
//     }

//     // Compare hashed OTP
//     const hashedInputOTP = hashOTP(otp);
//     if (hashedInputOTP !== user.otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP. Please try again.",
//       });
//     }

//     // ---------- OTP Valid - Generate Reset Token ----------
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 mins

//     await UserRefDb.findByIdAndUpdate(user._id, {
//       otp: null, // clear OTP once used
//       otpExpiration: null,
//       otpVerified: true,
//       resetPasswordToken: resetToken,
//       resetPasswordTokenExpires: resetTokenExpires,
//     });

//     console.log(`✅ OTP verified successfully for: ${email}`);

//     return res.status(200).json({
//       success: true,
//       message: "OTP verified successfully. You can now reset your password.",
//       resetToken,
//     });
//   } catch (error) {
//     console.error(`[${new Date().toISOString()}] OTP Verification Error:`, error);

//     return res.status(500).json({
//       success: false,
//       message: "An internal server error occurred. Please try again later.",
//     });
//   }
// });

// module.exports = router;
// routes/verifyOtp.js

const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const UserRefDb = require("../../database/models/refPortal/refuser");

// Helper function to validate email
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// Hash OTP for comparison
const hashOTP = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// Hash token for secure storage
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// ==================== Verify OTP Route ====================
router.post("/", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // ---------- Input Validation ----------
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 6-digit OTP.",
      });
    }

    // ---------- Find User ----------
    const user = await UserRefDb.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    // ---------- Validate OTP ----------
    if (!user.otp || !user.otpExpiration) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
    }

    // Check expiration
    if (Date.now() > user.otpExpiration) {
      await UserRefDb.findByIdAndUpdate(user._id, {
        otp: null,
        otpExpiration: null,
        otpVerified: false,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Compare hashed OTP
    const hashedInputOTP = hashOTP(otp);
    if (hashedInputOTP !== user.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // ---------- OTP Valid - Generate Reset Token ----------
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = hashToken(resetToken); // ✅ Hash before storing
    const resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    await UserRefDb.findByIdAndUpdate(user._id, {
      otp: null, // clear OTP once used
      otpExpiration: null,
      otpVerified: true,
      resetPasswordToken: hashedResetToken, // ✅ Store hashed version
      resetPasswordTokenExpires: resetTokenExpires,
    });

    console.log(`✅ OTP verified successfully for: ${email}`);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
      resetToken, // ✅ Send plain token to client
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] OTP Verification Error:`, error);

    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

module.exports = router;