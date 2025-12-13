/**
 * @swagger
 * /referral-portal/signup/send-otp:
 *   post:
 *     summary: Send OTP for Registration
 *     description: |
 *       Initiates the MBA registration process by validating user data and sending a 6-digit OTP to the provided email. Creates a temporary session that expires in 10 minutes, with the OTP valid for 2 minutes.
 *       
 *       **Process Flow:**
 *       1. Validates all required fields
 *       2. Validates email format, phone format (10-15 digits), password length (min 8 chars)
 *       3. Checks for duplicate email in database
 *       4. Generates 6-digit OTP and unique session ID
 *       5. Stores session data in memory (otpStore)
 *       6. Sends formatted HTML email with OTP
 *       7. Returns sessionId for subsequent requests
 *       
 *       **Validation Rules:**
 *       - Email: Must match pattern /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *       - Phone: 10-15 digits only
 *       - Password: Minimum 8 characters
 *       - First Name: Minimum 2 characters
 *       - Last Name: Minimum 2 characters
 *       
 *       **Session Management:**
 *       - Session Duration: 10 minutes (for completing entire signup)
 *       - OTP Duration: 2 minutes (for entering the code)
 *       - Session stored in-memory (otpSessions Map)
 *     tags:
 *       - Referral Portal
 *       - Authentication
 *       - Signup
 *       - Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name (minimum 2 characters)
 *                 example: "John"
 *                 minLength: 2
 *               lastName:
 *                 type: string
 *                 description: User's last name (minimum 2 characters)
 *                 example: "Smith"
 *                 minLength: 2
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Valid email address (will be checked for duplicates)
 *                 example: "john.smith@example.com"
 *               phone:
 *                 type: string
 *                 pattern: '^\d{10,15}$'
 *                 description: Phone number (10-15 digits only)
 *                 example: "1234567890"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password (minimum 8 characters)
 *                 example: "SecurePass123"
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: OTP sent successfully to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sessionId:
 *                   type: string
 *                   description: Unique session identifier (valid for 10 minutes)
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully to your email"
 *       400:
 *         description: Bad request - Validation error or missing fields.
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
 *                     - "The following field(s) are missing: firstName, lastName, email, phone, password"
 *                     - "Please enter a valid email address"
 *                     - "Please enter a valid phone number"
 *                     - "Password must be at least 8 characters"
 *                     - "First name must be at least 2 characters"
 *                     - "Last name must be at least 2 characters"
 *                   example: "Please enter a valid email address"
 *       409:
 *         description: Conflict - Email already registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 signup:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email is already registered"
 *       500:
 *         description: Internal server error - Failed to send OTP.
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
 *                   example: "Failed to send OTP"
 */

/**
 * @swagger
 * /referral-portal/signup/verify-otp:
 *   post:
 *     summary: Verify Email OTP
 *     description: |
 *       Verifies the 6-digit OTP sent to the user's email. Checks both session expiration (10 minutes) and OTP expiration (2 minutes). Upon successful verification, marks the session as verified and allows proceeding to complete-signup.
 *       
 *       **Validation Checks:**
 *       1. Session exists in memory
 *       2. Session hasn't expired (10 minute window)
 *       3. OTP hasn't expired (2 minute window from send/resend)
 *       4. OTP matches stored hash
 *       
 *       **After Verification:**
 *       - Session marked as verified
 *       - User can proceed to complete-signup within remaining session time
 *       - If session expires, must restart with send-otp
 *     tags:
 *       - Referral Portal
 *       - Authentication
 *       - Signup
 *       - Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - emailOtp
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session ID received from send-otp endpoint
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               emailOtp:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 description: 6-digit OTP received via email
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully.
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
 *                   example: "OTP verified successfully"
 *       400:
 *         description: Bad request - Invalid OTP, expired session, or expired OTP.
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
 *                     - "Invalid OTP or session expired"
 *                     - "Session expired. Please start registration again."
 *                     - "OTP has expired. Please request a new one."
 *                     - "Invalid OTP"
 *                   example: "OTP has expired. Please request a new one."
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
 *                   example: "Failed to verify OTP"
 */

/**
 * @swagger
 * /referral-portal/signup/complete-signup:
 *   post:
 *     summary: Complete MBA Registration
 *     description: |
 *       Finalizes the registration process after OTP verification. Creates the user account with auto-generated refId and referralCode, sends a welcome email, generates JWT token, and sets authentication cookie.
 *       
 *       **Process Flow:**
 *       1. Validates session exists and OTP was verified
 *       2. Checks session hasn't expired
 *       3. Hashes password with bcrypt (12 rounds)
 *       4. Generates sequential refId (starts at 1)
 *       5. Generates referralCode format: ref[first3letters][refId] (e.g., "refjoh001")
 *       6. Creates user in database
 *       7. Sends welcome email (non-blocking, won't fail registration)
 *       8. Generates JWT token (1 hour expiration)
 *       9. Sets httpOnly cookie (24 hour expiration)
 *       10. Cleans up session from memory
 *       
 *       **Welcome Email Features:**
 *       - Professional HTML template with WWAH branding
 *       - Dashboard access link
 *       - Getting started instructions
 *       - Sent asynchronously (doesn't block response)
 *       - Failure logged but doesn't affect registration
 *       
 *       **Auto-Generated Fields:**
 *       - refId: Sequential numeric ID (1, 2, 3...)
 *       - referralCode: ref + first 3 letters of firstName + padded refId
 *       - isEmailVerified: Set to true
 *       - createdAt: Current timestamp
 *     tags:
 *       - Referral Portal
 *       - Authentication
 *       - Signup
 *       - Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session ID with verified OTP
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Optional - overrides password from send-otp (minimum 8 characters)
 *                 example: "NewSecurePass123"
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User successfully registered. Welcome email sent.
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only authentication cookie
 *             schema:
 *               type: string
 *               example: "authToken=eyJhbGc...; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=86400"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 signup:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User successfully signed up"
 *                 token:
 *                   type: string
 *                   description: JWT authentication token (1 hour expiration)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Smith"
 *                     email:
 *                       type: string
 *                       example: "john.smith@example.com"
 *                     phone:
 *                       type: string
 *                       example: "1234567890"
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: true
 *                     referralCode:
 *                       type: string
 *                       description: Auto-generated unique referral code
 *                       example: "refjoh001"
 *       400:
 *         description: Bad request - Invalid session, not verified, or expired.
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
 *                     - "Invalid session or OTP not verified"
 *                     - "Session expired. Please start registration again."
 *                     - "Password must be at least 8 characters long"
 *                   example: "Invalid session or OTP not verified"
 *       409:
 *         description: Conflict - Email already registered (duplicate key error).
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
 *                   example: "Email is already registered"
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
 *                   example: "Failed to create account. Please try again."
 */

/**
 * @swagger
 * /referral-portal/signup/resend-otp:
 *   post:
 *     summary: Resend OTP Code
 *     description: |
 *       Generates and sends a new 6-digit OTP to the user's email if the previous OTP expired. Can only be used within the original 10-minute session window. The new OTP is valid for 2 minutes from resend time.
 *       
 *       **Process:**
 *       1. Validates sessionId exists and is still active
 *       2. Generates new 6-digit OTP
 *       3. Updates session with new OTP and new 2-minute expiration
 *       4. Marks session as unverified (requires new verification)
 *       5. Sends email with new OTP
 *       
 *       **Important Notes:**
 *       - Does NOT extend the 10-minute session duration
 *       - Only generates new 2-minute OTP validity window
 *       - If session expired (10 min), must restart with send-otp
 *       - Each resend invalidates the previous OTP
 *     tags:
 *       - Referral Portal
 *       - Authentication
 *       - Signup
 *       - Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session ID from send-otp
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: New OTP sent successfully.
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
 *                   example: "New OTP sent successfully to your email"
 *       400:
 *         description: Bad request - Invalid or expired session.
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
 *                     - "Session ID is required"
 *                     - "Invalid or expired session"
 *                     - "Invalid session data"
 *                   example: "Invalid or expired session"
 *       500:
 *         description: Internal server error - Failed to send OTP email.
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
 *                     - "Failed to send OTP email. Please try again."
 *                     - "Internal server error while resending OTP"
 *                   example: "Failed to send OTP email. Please try again."
 *                 error:
 *                   type: string
 *                   description: Detailed error (only in development mode)
 */

/**
 * @swagger
 * /referral-portal/signup/health:
 *   get:
 *     summary: Health Check
 *     description: Simple health check endpoint to verify the signup service is running and responsive.
 *     tags:
 *       - Referral Portal
 *       - Health
 *       - Public
 *     responses:
 *       200:
 *         description: Service is healthy and running.
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
 *                   example: "OTP signup service is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 */

// /routers/referralPortal/auth/signup.js
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpSessions = require("../../../utils/otpStore");
const jwt = require("jsonwebtoken");
const { send } = require("process");
const UserRefDb = require("../../../database/models/refPortal/refuser");

const router = express.Router();
const REQUIRED_FIELDS = ["firstName", "lastName", "email", "phone", "password"];

// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

emailTransporter.verify((error, success) => {
  if (error) {
    console.log("Email transporter error:", error);
  } else {
    console.log("Email transporter is ready to send messages!");
  }
});

// Generate next reference ID
const generateNextRefId = async () => {
  try {
    const lastUser = await UserRefDb.findOne({}, { refId: 1 })
      .sort({ refId: -1 })
      .lean();
    const nextRefId = lastUser && lastUser.refId ? lastUser.refId + 1 : 1;
    return nextRefId;
  } catch (error) {
    console.error("Error generating refId:", error);
    throw new Error("Failed to generate reference ID");
  }
};

// Generate referral code
const generateReferralCode = (firstName, refId) => {
  try {
    const namePrefix = firstName.toLowerCase().substring(0, 3);
    const formattedRefId = refId.toString().padStart(3, "0");
    return `ref${namePrefix}${formattedRefId}`;
  } catch (error) {
    console.error("Error generating referral code:", error);
    throw new Error("Failed to generate referral code");
  }
};

// Send Email OTP
const sendEmailOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code",
    html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Your verification code is:</p>
    <h1 style="font-size: 36px; color: #2F54EB; margin: 20px 0;">
      ${otp}
    </h1>
    <p style="color: #555; font-size: 14px;">
      This code will expire in <strong>2 minutes</strong>.
    </p>
            
    <p>
      If you did not request a password reset, please ignore this email.
    </p>
      </div>
    `,
  };

  return emailTransporter.sendMail(mailOptions);
};

// ✅ NEW: Send Welcome Email for MBA Registration
const sendWelcomeEmail = async (userInfo) => {
  try {
    const { firstName, lastName, email, referralCode } = userInfo;
    const dashboardUrl = `${process.env.FRONTEND_URL || "https://wwah.ai"
      }/referralportal/signin`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to the Worldwide Admissions Hub (WWAH) MBA Program!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0; font-size: 24px;">Welcome to WWAH!</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Mini Brand Ambassador Program</p>
            </div>

            <!-- Greeting -->
            <h2 style="color: #333; margin-bottom: 10px;">Hello ${firstName} ${lastName},</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              <strong>Welcome aboard!</strong> Your registration for the Mini Brand Ambassador (MBA) Program has been successfully completed. 
              You're now part of WWAH's mission to make studying abroad easier, accessible, and achievable for students everywhere - while you earn exciting rewards!
            </p>

            <!-- What's Next Section -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Here's what's next for you:</h3>
              <ol style="color: #555; line-height: 1.8;">
                <li><strong>Complete Your Profile</strong> – Log in to your dashboard and fill in the required details to activate all features.</li>
                <li><strong>Start Referring</strong> – Generate your unique referral link and share it with potential students.</li>
                <li><strong>Track Your Impact</strong> – View real-time analytics on your referrals and commissions.</li>
              </ol>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" 
                 style="display: inline-block; background-color: #dc2626; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Access Your Dashboard Now
              </a>
            </div>

            <!-- Footer Message -->
            <p style="color: #555; line-height: 1.6; margin-top: 30px;">
              We're excited to have you on the team and can't wait to see the difference you'll make.
            </p>

            <!-- Signature -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #555;">Best regards,</p>
              <p style="margin: 5px 0 0 0; color: #dc2626; font-weight: bold;">Worldwide Admissions Hub (WWAH) Team</p>
              <p style="margin: 5px 0 0 0; color: #888; font-size: 14px;">
                <a href="https://wwah.ai" style="color: #dc2626; text-decoration: none;">www.wwah.ai</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw error here - welcome email failure shouldn't break registration
    return false;
  }
};

// Create user function
const createUser = async (userData) => {
  try {
    // console.log("Creating new user...");
    const refId = await generateNextRefId();
    // console.log("Generated refId:", refId);

    const referralCode = generateReferralCode(userData.firstName, refId);
    // console.log("Generated referral code:", referralCode);

    const userDataWithIds = {
      ...userData,
      refId,
      referralCode,
    };

    const newUser = new UserRefDb(userDataWithIds);
    const savedUser = await newUser.save();

    console.log("User created successfully:", savedUser._id);
    return savedUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Validate user data
const validateUserData = (userData) => {
  const { firstName, lastName, email, phone, password } = userData;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address");
  }

  const phoneRegex = /^\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error("Please enter a valid phone number");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  if (firstName.trim().length < 2) {
    throw new Error("First name must be at least 2 characters");
  }

  if (lastName.trim().length < 2) {
    throw new Error("Last name must be at least 2 characters");
  }

  return true;
};

// Send OTP endpoint
router.post("/send-otp", async (req, res) => {
  const userData = req.body;
  const missingFields = REQUIRED_FIELDS.filter((field) => !userData[field]);
  // console.log("User data received:", userData);

  if (missingFields.length) {
    const fieldList = missingFields.join(", ");
    return res.status(400).json({
      message: `The following field(s) are missing: ${fieldList}`,
      success: false,
    });
  }

  const { firstName, lastName, email, phone, password } = userData;

  try {
    validateUserData({ firstName, lastName, email, phone, password });

    const userExists = await UserRefDb.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        message: "Email is already registered",
        success: false,
        signup: false,
      });
    }

    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = crypto.randomUUID();

    otpSessions.set(sessionId, {
      emailOtp,
      email,
      phone,
      firstName,
      lastName,
      password,
      otpExpiresAt: new Date(Date.now() + 2 * 60 * 1000), // OTP valid for 2 mins
      sessionExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // Session valid for 10 mins
    });

    // console.log("✅ OTP session created:", {
    //   sessionId,
    //   email,
    //   expiresIn: "10 minutes",
    //   optexpireIn: "2 minutes",
    // });

    try {
      await sendEmailOTP(email, emailOtp);
      res.status(200).json({
        success: true,
        sessionId,
        message: "OTP sent successfully to your email",
      });
    } catch (sendError) {
      console.error("Error sending OTP:", sendError);
      otpSessions.delete(sessionId);
      res.status(500).json({
        message: `Failed to send OTP. ${sendError.message}`,
        success: false,
      });
    }
  } catch (err) {
    console.error("Send OTP error:", err);
    if (
      err.message.includes("valid email") ||
      err.message.includes("valid phone") ||
      err.message.includes("Password must") ||
      err.message.includes("name must")
    ) {
      return res.status(400).json({
        message: err.message,
        success: false,
      });
    }

    res.status(500).json({
      message: "Failed to send OTP",
      success: false,
    });
  }
});

// Verify OTP endpoint
router.post("/verify-otp", async (req, res) => {
  try {
    const { sessionId, emailOtp } = req.body;
    const session = otpSessions.get(sessionId);
    // console.log("Session data:", session, "Email OTP:", emailOtp); 

    if (!session || !emailOtp) {
      return res.status(400).json({
        message: "Invalid OTP or session expired",
        success: false,
      });
    }

    if (new Date() > session.expiresAt) {
      otpSessions.delete(sessionId);
      return res.status(400).json({
        message: "Session expired. Please start registration again.",
        success: false,
      });
    }

    // Check if OTP expired
    if (new Date() > session.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
        success: false,
      });
    }

    if (session.emailOtp !== emailOtp) {
      return res.status(400).json({
        message: "Invalid OTP",
        success: false,
      });
    }

    session.verified = true;
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({
      message: "Failed to verify OTP",
      success: false,
    });
  }
});

// ✅ UPDATED: Complete Registration with Welcome Email
router.post("/complete-signup", async (req, res) => {
  try {
    const { sessionId, password: providedPassword } = req.body;
    const session = otpSessions.get(sessionId);
    // console.log(
    //   "Session data for completion:",
    //   session ? "Found" : "Not found"
    // );

    if (!session || !session.verified) {
      return res.status(400).json({
        message: "Invalid session or OTP not verified",
        success: false,
      });
    }

    if (new Date() > session.expiresAt) {
      otpSessions.delete(sessionId);
      return res.status(400).json({
        message: "Session expired. Please start registration again.",
        success: false,
      });
    }

    const passwordToUse = providedPassword || session.password;

    if (!passwordToUse || passwordToUse.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(passwordToUse, 12);

    const userData = {
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
      phone: session.phone,
      password: hashedPassword,
      isEmailVerified: true,
      createdAt: new Date(),
    };

    // console.log("Creating user...");
    const newUser = await createUser(userData);
    // console.log("User created successfully:", newUser._id);

    // ✅ Send welcome email (non-blocking)
    const welcomeEmailInfo = {
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      referralCode: newUser.referralCode,
    };

    // Send welcome email in background (don't await to avoid blocking response)
    sendWelcomeEmail(welcomeEmailInfo).catch((error) => {
      console.error("Welcome email failed but continuing:", error);
    });

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    // Set cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Clean up session
    otpSessions.delete(sessionId);
    // console.log("User successfully signed up");

    // Success response
    res.status(201).json({
      message: "User successfully signed up",
      success: true,
      signup: true,
      token,
      data: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        isEmailVerified: newUser.isEmailVerified,
        referralCode: newUser.referralCode,
      },
    });
  } catch (err) {
    console.error("Complete signup error:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered",
        success: false,
      });
    }

    res.status(500).json({
      message: "Failed to create account. Please try again.",
      success: false,
    });
  }
});

// Resend OTP endpoint
router.post("/resend-otp", async (req, res) => {
  try {
    const { sessionId } = req.body;
    // console.log("🔄 Resend OTP request for sessionId:", sessionId);
    if (!sessionId) {
      return res.status(400).json({
        message: "Session ID is required",
        success: false,
      });
    }

    const session = otpSessions.get(sessionId);

    if (!session) {
      // console.log("❌ Session not found or expired");
      return res.status(400).json({
        message: "Invalid or expired session",
        success: false,
      });
    }

    if (!session.email) {
      // console.log("Session missing email data");
      return res.status(400).json({
        message: "Invalid session data",
        success: false,
      });
    }

    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // session.emailOtp = emailOtp;
    // session.verified = false;
    // session.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes for session

    session.emailOtp = emailOtp;
    session.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes OTP validity
    session.verified = false;

    try {
      await sendEmailOTP(session.email, emailOtp);
      // console.log("✅ New OTP sent to:", session.email);

      res.status(200).json({
        success: true,
        message: "New OTP sent successfully to your email",
      });
    } catch (sendError) {
      console.error("Error sending email OTP:", sendError);
      res.status(500).json({
        message: "Failed to send OTP email. Please try again.",
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? sendError.message
            : undefined,
      });
    }
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({
      message: "Internal server error while resending OTP",
      success: false,
    });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OTP signup service is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
