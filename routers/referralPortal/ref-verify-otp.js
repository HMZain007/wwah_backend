/**
 * @swagger
 * /refal/verify-otp:
 *   post:
 *     summary: Verify OTP for Password Reset
 *     description: |
 *       Verifies the OTP sent to the user's email for password reset purposes. Upon successful verification, generates a reset token that can be used to set a new password.
 *       
 *       **Process Flow:**
 *       1. Validates email format and OTP format (6 digits)
 *       2. Checks if OTP exists and hasn't expired (2-minute window)
 *       3. Compares hashed OTP with stored hash
 *       4. Generates a secure reset token (32-byte hex, SHA-256 hashed for storage)
 *       5. Clears OTP fields and marks OTP as verified
 *       6. Returns plain reset token to client (valid for 2 minutes)
 *       
 *       **Security Features:**
 *       - OTPs are hashed using SHA-256 before storage
 *       - Reset tokens are hashed before database storage
 *       - Expired OTPs are automatically cleared
 *       - One-time use - OTP is deleted after successful verification
 *     tags:
 *       - Referral Portal
 *       - Authentication
 *       - Password Reset
 *       - Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: 6-digit OTP code received via email
 *                 example: "123456"
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: OTP verified successfully. Reset token generated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully. You can now reset your password."
 *                 resetToken:
 *                   type: string
 *                   description: Plain reset token to be used for password reset (valid for 2 minutes)
 *                   example: "a3f5e8d2c1b4a6f9e7d8c2b5a4f6e9d7c8b5a4f6e9d7c8b5a4f6e9d7c8b5a4f6"
 *       400:
 *         description: Bad request - Invalid input, expired OTP, or incorrect OTP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Please provide a valid email address."
 *                     - "Please provide a valid 6-digit OTP."
 *                     - "No OTP found. Please request a new one."
 *                     - "OTP has expired. Please request a new one."
 *                     - "Invalid OTP. Please try again."
 *                   example: "OTP has expired. Please request a new one."
 *       404:
 *         description: User not found with the provided email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No account found with this email address."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An internal server error occurred. Please try again later."
 */

const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const UserRefDb = require("../../database/models/refPortal/refuser");

// Helper function to validate email
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// Hash OTP for comparison
const hashOTP = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// Hash token for secure storage
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

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

    if (Date.now() > user.otpExpiration) {
      // Check expiration
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
    const resetTokenExpires = Date.now() + 2 * 60 * 1000; // 2 mins

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
    console.error(
      `[${new Date().toISOString()}] OTP Verification Error:`,
      error
    );

    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

module.exports = router;
