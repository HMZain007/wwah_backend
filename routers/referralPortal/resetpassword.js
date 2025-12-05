/**
 * @swagger
 * /refal/reset-password:
 *   post:
 *     summary: Reset Password with Token
 *     description: Resets the user's password using a valid reset token. The token must be unexpired and match the token sent via email. After successful reset, all reset-related fields are cleared.
 *     tags:
 *       - Referral Portal
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - resetToken
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the account to reset
 *                 example: "mba.user@example.com"
 *               resetToken:
 *                 type: string
 *                 description: Reset token received via email (unhashed version)
 *                 example: "a3f5b2c8d9e1f4g7h2i5j8k1l4m7n0"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *                 example: "NewSecurePass123"
 *     responses:
 *       200:
 *         description: Password reset successfully.
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
 *                   example: "Your password has been reset successfully. You can now sign in."
 *       400:
 *         description: Bad request - Invalid input, expired token, or invalid token.
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
 *                   examples:
 *                     invalidEmail:
 *                       value: "Please provide a valid email address."
 *                     missingToken:
 *                       value: "Reset token is required."
 *                     shortPassword:
 *                       value: "Password must be at least 6 characters long."
 *                     noResetRequest:
 *                       value: "No reset request found. Please start the process again."
 *                     tokenExpired:
 *                       value: "Reset token has expired. Please request a new one."
 *                     invalidToken:
 *                       value: "Invalid reset token. Please start again."
 *       404:
 *         description: User not found with provided email.
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
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const router = express.Router();
const UserRefDb = require("../../database/models/refPortal/refuser");

// Helper: Validate email format
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// Helper: Hash reset token for secure comparison
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// ==================== Reset Password Route ====================
router.post("/", async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    // ---------- Input Validation ----------
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
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

    // ---------- Validate Reset Token ----------
    if (!user.resetPasswordToken || !user.resetPasswordTokenExpires) {
      return res.status(400).json({
        success: false,
        message: "No reset request found. Please start the process again.",
      });
    }

    // Check expiration first
    if (Date.now() > user.resetPasswordTokenExpires) {
      await UserRefDb.findByIdAndUpdate(user._id, {
        resetPasswordToken: null,
        resetPasswordTokenExpires: null,
        otp: null,
        otpExpiration: null,
        otpVerified: false,
      });

      return res.status(400).json({
        success: false,
        message: "Reset token has expired. Please request a new one.",
      });
    }

    // Hash incoming token to compare with stored hashed token
    const hashedInputToken = hashToken(resetToken);

    if (hashedInputToken !== user.resetPasswordToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token. Please start again.",
      });
    }

    // ---------- Hash and Save New Password ----------
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserRefDb.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpires: null,
      otp: null,
      otpExpiration: null,
      otpVerified: false,
    });

    console.log(`✅ Password reset successful for: ${email}`);

    return res.status(200).json({
      success: true,
      message: "Your password has been reset successfully. You can now sign in.",
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Password Reset Error:`, error.message);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

module.exports = router;