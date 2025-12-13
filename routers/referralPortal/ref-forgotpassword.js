/**
 * @swagger
 * /refral/forgot:
 *   post:
 *     summary: Request Password Reset OTP
 *     description: |
 *       Initiates the password reset process by sending a 6-digit OTP to the user's email address. The OTP is valid for 2 minutes and is hashed using SHA-256 before storage.
 *       
 *       **Process Flow:**
 *       1. Validates email format
 *       2. Checks if user account exists
 *       3. Generates secure 6-digit OTP (100000-999999)
 *       4. Hashes OTP with SHA-256 for secure storage
 *       5. Stores hashed OTP with 2-minute expiration
 *       6. Sends formatted HTML email with OTP
 *       
 *       **Email Details:**
 *       - Sent from: WWAH Support
 *       - Subject: "Password Reset OTP - WWAH"
 *       - Contains: Personalized greeting, OTP in large format, expiration notice
 *       - Style: Professional HTML template with brand colors
 *       
 *       **Security Features:**
 *       - OTP hashed with SHA-256 before database storage
 *       - 2-minute expiration window
 *       - OTP marked as unverified until successful verification
 *       - Uses Gmail App Password for secure email delivery
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's registered email address
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully to the provided email address.
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
 *                   example: "OTP sent successfully. Please check your email inbox."
 *       400:
 *         description: Bad request - Invalid email format.
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
 *                   example: "Please provide a valid email address."
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
 *         description: Internal server error - Email service failure or other errors.
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
 *                     - "Email service configuration error. Please contact support."
 *                     - "An internal server error occurred. Please try again later."
 *                   example: "An internal server error occurred. Please try again later."
 */
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
const sendOTPEmail = async (email, otp,) => {
  const mailOptions = {
    from: `"WWAH" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP - WWAH",
    html: `
  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
    <h2 style="color: #333333; margin-bottom: 10px;">Password Reset OTP</h2>
    
    <p style="font-size: 15px; color: #555;">
      Your One-Time Password (OTP) is:
    </p>

    <h1 style="font-size: 36px; color: #2F54EB; margin: 20px 0;">
      ${otp}
    </h1>

    <p style="color: #555; font-size: 14px;">
      This OTP is valid for <strong>2 minutes</strong>.
    </p>
    
    <p>
      If you did not request a password reset, please ignore this email.
    </p>
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
    const otpExpires = Date.now() + 2 * 60 * 1000; // 5 minutes

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
    console.error(
      `[${new Date().toISOString()}] Forgot password error:`,
      error.message
    );

    if (
      error.message.includes("Invalid login") ||
      error.message.includes("authentication")
    ) {
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
