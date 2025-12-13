/**
 * @swagger
 * /send-otp:
 *   post:
 *     summary: Send OTP for Email Verification
 *     description: Validates user data and sends a 6-digit OTP to the provided email address. Creates a session that expires in 10 minutes, with OTP valid for 2 minutes.
 *     tags:
 *       - Auth
 *       - Signup
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
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 pattern: '^\d{10,15}$'
 *                 example: "1234567890"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePass123"
 *               referralCode:
 *                 type: string
 *                 nullable: true
 *                 example: "MBA12345"
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
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully to your email"
 *       400:
 *         description: Validation error (missing fields, invalid password length, or invalid phone format).
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
 *                   example: "Password must be at least 8 characters"
 *       409:
 *         description: Email is already registered.
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
 *         description: Server error or failed to send OTP.
 */

/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verify Email OTP
 *     description: Verifies the 6-digit OTP sent to user's email. OTP is valid for 2 minutes from generation.
 *     tags:
 *       - Auth
 *       - Signup
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
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               emailOtp:
 *                 type: string
 *                 pattern: '^\d{6}$'
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
 *         description: Invalid session, expired OTP, expired session, or incorrect OTP.
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
 *                   example: "OTP expired. Please click 'Resend OTP' to get a new code."
 *                 otpExpired:
 *                   type: boolean
 *                   example: true
 *                 sessionExpired:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Server error while verifying OTP.
 */

/**
 * @swagger
 * /complete-signup:
 *   post:
 *     summary: Complete User Registration
 *     description: Finalizes user registration after OTP verification. Creates user account, processes referral code if provided, generates JWT token, and triggers embedding creation.
 *     tags:
 *       - Auth
 *       - Signup
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
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Optional - if not provided, uses password from session
 *                 example: "SecurePass123"
 *     responses:
 *       201:
 *         description: User successfully signed up with embeddings created.
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
 *                   example: "User successfully signed up and embeddings created"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 referral:
 *                   type: object
 *                   properties:
 *                     processed:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "Successfully referred by Jane Smith"
 *                     mbaInfo:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         referralCode:
 *                           type: string
 *                         totalReferrals:
 *                           type: number
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         firstReferralAt:
 *                           type: string
 *                           format: date-time
 *                         lastReferralAt:
 *                           type: string
 *                           format: date-time
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     isEmailVerified:
 *                       type: boolean
 *                     referralCodeUsed:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid session, OTP not verified, session expired, or password validation error.
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
 *                   example: "Invalid session or OTP not verified"
 *       409:
 *         description: Email is already registered (duplicate entry).
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
 *         description: Server error while creating account.
 */

/**
 * @swagger
 * /resend-otp:
 *   post:
 *     summary: Resend OTP to Email
 *     description: Generates and sends a new 6-digit OTP to the user's email. Session must still be valid (within 10 minutes).
 *     tags:
 *       - Auth
 *       - Signup
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
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Optional - for logging purposes
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: New OTP sent successfully to email.
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
 *         description: Session ID required, session not found, or session expired.
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
 *                   example: "Session expired. Please register again."
 *                 sessionExpired:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Server error or failed to send OTP email.
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Check if the OTP signup service is running properly.
 *     tags:
 *       - Auth
 *       - Health
 *     responses:
 *       200:
 *         description: Service is running.
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
 *                   example: "2025-12-04T10:30:00.000Z"
 */
 // Signup Router
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpSessions = require("../utils/otpStore");
const UserDb = require("../database/models/UserDb");
const jwt = require("jsonwebtoken");
const { send } = require("process");
const { ExpressDbHooks } = require("../utils/embedding-hooks");
const UserRefDb = require("../database/models/refPortal/refuser");

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

// ✅ Send Email OTP
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

// ✅ Send OTP (email only)
router.post("/send-otp", async (req, res) => {
  const userData = req.body;

  const missingFields = REQUIRED_FIELDS.filter((field) => !userData[field]);

  if (missingFields.length) {
    const fieldList = missingFields.join(", ");
    return res.status(400).json({
      message: `The following field(s) are missing: ${fieldList}`,
      success: false,
    });
  }

  const { firstName, lastName, email, phone, password, referralCode } =
    userData;

  try {
    const userExists = await UserDb.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        message: "Email is already registered",
        success: false,
        signup: false,
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
        success: false,
      });
    }

    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Please enter a valid phone number",
        success: false,
      });
    }

    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = crypto.randomUUID();

    // ✅ KEY CHANGE: Store session for 10 minutes, but OTP expires in 2 minutes
    otpSessions.set(sessionId, {
      emailOtp,
      email,
      phone,
      firstName,
      lastName,
      password,
      referralCode: referralCode || null,
      verified: false,
      otpExpiresAt: new Date(Date.now() + 2 * 60 * 1000), // ✅ OTP expires in 2 minutes
      sessionExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // ✅ Session expires in 10 minutes
      createdAt: new Date(),
    });

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
        message: "Failed to send OTP",
        success: false,
      });
    }
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({
      message: "Failed to send OTP",
      success: false,
    });
  }
});

// ✅ Verify OTP (email only)
router.post("/verify-otp", async (req, res) => {
  try {
    const { sessionId, emailOtp } = req.body;

    // console.log("=== VERIFY OTP START ===");
    // console.log("SessionId:", sessionId);
    // console.log("EmailOtp received:", emailOtp);

    const session = otpSessions.get(sessionId);

    if (!session) {
      return res.status(400).json({
        message: "Invalid session. Please try resending OTP.",
        success: false,
        sessionExpired: true,
      });
    }

    //  Check SESSION expiry (10 minutes)
    if (new Date() > session.sessionExpiresAt) {
      otpSessions.delete(sessionId);
      return res.status(400).json({
        message: "Session expired. Please register again.",
        success: false,
        sessionExpired: true,
      });
    }

    if (!emailOtp) {
      console.log(" OTP not provided");
      return res.status(400).json({
        message: "Please enter OTP",
        success: false,
      });
    }

    // Check OTP expiry (2 minutes) - NOT session expiry
    if (new Date() > session.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP expired. Please click 'Resend OTP' to get a new code.",
        success: false,
        otpExpired: true, //Different from sessionExpired
      });
    }

    const storedOtp = String(session.emailOtp).trim();
    const receivedOtp = String(emailOtp).trim();

    if (storedOtp !== receivedOtp) {
      return res.status(400).json({
        message: "Invalid OTP. Please check and try again.",
        success: false,
      });
    }

    // console.log("OTP VERIFIED SUCCESSFULLY");

    // Update session
    session.verified = true;
    session.sessionExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes to complete signup

    otpSessions.set(sessionId, session);
    // console.log("Session marked as verified");

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    res.status(500).json({
      message: "Failed to verify OTP",
      success: false,
    });
  }
});
const processReferralCode = async (referralCode, studentData) => {
  try {
    if (!referralCode || referralCode.trim() === "") {
      console.log("No referral code provided, skipping referral processing");
      return { success: true, message: "No referral code provided" };
    }

    // console.log("Processing referral code:", referralCode.trim());

    // Find the MBA with the matching referral code
    const mbaUser = await UserRefDb.findOne({
      referralCode: referralCode.trim(),
    });

    if (!mbaUser) {
      console.log("Invalid referral code:", referralCode);
      return {
        success: false,
        message: "Invalid referral code. Please check and try again.",
      };
    }

    // console.log("Found MBA for referral code:", {
    //   mbaName: mbaUser.firstName + " " + mbaUser.lastName,
    //   referralCode: mbaUser.referralCode,
    //   currentReferrals: mbaUser.totalReferrals || 0,
    //   mbaCreatedAt: mbaUser.createdAt, // Log MBA's original creation date
    // });

    // Check if student is already in this MBA's referrals (prevent duplicates)
    const existingReferral = mbaUser.referrals.find(
      (ref) => ref.id === studentData._id.toString()
    );

    if (existingReferral) {
      // console.log("Student already referred by this MBA");
      return { success: true, message: "Student already referred by this MBA" };
    }

    const currentTimestamp = new Date();

    // Create referral object to add to MBA's referrals array
    const newReferral = {
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      id: studentData._id.toString(),
      profilePicture: studentData.profilePicture || null,
      createdAt: currentTimestamp, // When this referral was made
      status: "pending",
    };

    // Update object for MBA - including lastReferralAt timestamp
    const updateData = {
      $push: { referrals: newReferral },
      $inc: { totalReferrals: 1 },
      lastReferralAt: currentTimestamp, // Track when MBA last made a referral
      firstReferralAt: mbaUser.firstReferralAt || null, // Preserve existing firstReferralAt
    };

    // If this is MBA's first referral, also set firstReferralAt
    if (!mbaUser.totalReferrals || mbaUser.totalReferrals === 0) {
      updateData.firstReferralAt = currentTimestamp;
    }

    // Add student to MBA's referrals array and increment totalReferrals
    const updatedMBA = await UserRefDb.findByIdAndUpdate(
      mbaUser._id,
      updateData,
      { new: true }
    );

    // console.log("Successfully added student to MBA referrals:", {
    //   mbaId: mbaUser._id,
    //   mbaName: mbaUser.firstName + " " + mbaUser.lastName,
    //   mbaCreatedAt: mbaUser.createdAt,
    //   firstReferralAt: updatedMBA.firstReferralAt,
    //   lastReferralAt: updatedMBA.lastReferralAt,
    //   studentId: studentData._id,
    //   studentName: studentData.firstName + " " + studentData.lastName,
    //   newTotalReferrals: updatedMBA.totalReferrals,
    //   referralCreatedAt: currentTimestamp,
    // });

    return {
      success: true,
      message: "Referral processed successfully",
      mbaUser: {
        firstName: mbaUser.firstName,
        lastName: mbaUser.lastName,
        referralCode: mbaUser.referralCode,
        totalReferrals: updatedMBA.totalReferrals,
        createdAt: mbaUser.createdAt, // MBA's original account creation
        firstReferralAt: updatedMBA.firstReferralAt, // When MBA made their first referral
        lastReferralAt: updatedMBA.lastReferralAt, // When MBA made their latest referral
      },
    };
  } catch (error) {
    console.error("Error processing referral code:", error);
    return { success: false, message: "Failed to process referral code" };
  }
};

// ✅ Updated Complete Registration with Referral Processing
router.post("/complete-signup", async (req, res) => {
  try {
    const { sessionId, password: providedPassword } = req.body;
    const session = otpSessions.get(sessionId);

    if (!session || !session.verified) {
      return res.status(400).json({
        message: "Invalid session or OTP not verified",
        success: false,
      });
    }

    // ✅ Check session expiry (not OTP expiry)
    if (new Date() > session.sessionExpiresAt) {
      otpSessions.delete(sessionId);
      return res.status(400).json({
        message: "Session expired",
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
      provider: "local",
      isEmailVerified: true,
      referralCode: session.referralCode,
      createdAt: new Date(),
    };

    // console.log("Creating student user with embeddings...");
    const newUser = await ExpressDbHooks.createUser(userData);

    let referralProcessed = false;
    let referralMessage = "";
    let mbaInfo = null;

    if (session.referralCode) {
      const referralResult = await processReferralCode(
        session.referralCode,
        newUser
      );

      if (referralResult.success && referralResult.mbaUser) {
        referralProcessed = true;
        mbaInfo = referralResult.mbaUser;
        referralMessage = `Successfully referred by ${referralResult.mbaUser.firstName} ${referralResult.mbaUser.lastName}`;
      } else {
        referralMessage = referralResult.message;
      }
    }

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    otpSessions.delete(sessionId);

    res.status(201).json({
      message: "User successfully signed up and embeddings created",
      success: true,
      signup: true,
      token,
      referral: {
        processed: referralProcessed,
        message: referralMessage,
        mbaInfo: mbaInfo,
      },
      data: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        isEmailVerified: newUser.isEmailVerified,
        referralCodeUsed: session.referralCode || null,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    console.error("Complete student signup error:", err);

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
// const processReferralCode = async (referralCode, studentData) => {
//   try {
//     if (!referralCode || referralCode.trim() === "") {
//       console.log("No referral code provided, skipping referral processing");
//       return { success: true, message: "No referral code provided" };
//     }

//     console.log("Processing referral code:", referralCode.trim());

//     // Find the MBA with the matching referral code
//     const mbaUser = await UserRefDb.findOne({
//       referralCode: referralCode.trim(),
//     });

//     if (!mbaUser) {
//       console.log("Invalid referral code:", referralCode);
//       return {
//         success: false,
//         message: "Invalid referral code. Please check and try again.",
//       };
//     }

//     console.log("Found MBA for referral code:", {
//       mbaName: mbaUser.firstName + " " + mbaUser.lastName,
//       referralCode: mbaUser.referralCode,
//       currentReferrals: mbaUser.totalReferrals || 0,
//     });

//     // Check if student is already in this MBA's referrals (prevent duplicates)
//     const existingReferral = mbaUser.referrals.find(
//       (ref) => ref.id === studentData._id.toString()
//     );

//     if (existingReferral) {
//       console.log("Student already referred by this MBA");
//       return { success: true, message: "Student already referred by this MBA" };
//     }

//     // Create referral object to add to MBA's referrals array
//     const newReferral = {
//       firstName: studentData.firstName,
//       lastName: studentData.lastName,
//       id: studentData._id.toString(),
//       profilePicture: studentData.profilePicture || null,
//       createdAt: new Date(),
//       status: "pending",
//     };

//     // Add student to MBA's referrals array and increment totalReferrals
//     const updatedMBA = await UserRefDb.findByIdAndUpdate(
//       mbaUser._id,
//       {
//         $push: { referrals: newReferral },
//         $inc: { totalReferrals: 1 },
//       },
//       { new: true }
//     );

//     console.log("Successfully added student to MBA referrals:", {
//       mbaId: mbaUser._id,
//       mbaName: mbaUser.firstName + " " + mbaUser.lastName,
//       studentId: studentData._id,
//       studentName: studentData.firstName + " " + studentData.lastName,
//       newTotalReferrals: updatedMBA.totalReferrals,
//     });

//     return {
//       success: true,
//       message: "Referral processed successfully",
//       mbaUser: {
//         firstName: mbaUser.firstName,
//         lastName: mbaUser.lastName,
//         referralCode: mbaUser.referralCode,
//         totalReferrals: updatedMBA.totalReferrals,
//       },
//     };
//   } catch (error) {
//     console.error("Error processing referral code:", error);
//     return { success: false, message: "Failed to process referral code" };
//   }
// };

// // ✅ Updated Complete Registration with Referral Processing
// router.post("/complete-signup", async (req, res) => {
//   try {
//     const { sessionId, password: providedPassword } = req.body;
//     const session = otpSessions.get(sessionId);
//     console.log(
//       "Session data for completion:",
//       session ? "Found" : "Not found"
//     );

//     if (!session || !session.verified) {
//       return res.status(400).json({
//         message: "Invalid session or OTP not verified",
//         success: false,
//       });
//     }

//     if (new Date() > session.expiresAt) {
//       otpSessions.delete(sessionId);
//       return res.status(400).json({
//         message: "Session expired",
//         success: false,
//       });
//     }

//     // Use password from session or provided password (for flexibility)
//     const passwordToUse = providedPassword || session.password;

//     if (!passwordToUse || passwordToUse.length < 8) {
//       return res.status(400).json({
//         message: "Password must be at least 8 characters long",
//         success: false,
//       });
//     }

//     const hashedPassword = await bcrypt.hash(passwordToUse, 12);

//     // Create user data object
//     const userData = {
//       firstName: session.firstName,
//       lastName: session.lastName,
//       email: session.email,
//       phone: session.phone,
//       password: hashedPassword,
//       provider: "local",
//       isEmailVerified: true,
//       referralCode: session.referralCode, // Store the referral code used by student
//       createdAt: new Date(),
//     };

//     // 🚀 Create user with embedding integration
//     console.log("Creating student user with embeddings...");
//     const newUser = await ExpressDbHooks.createUser(userData);

//     console.log(
//       "Student user created successfully with embeddings:",
//       newUser._id
//     );

//     // 🆕 Process referral code if provided
//     let referralProcessed = false;
//     let referralMessage = "";

//     if (session.referralCode) {
//       console.log(
//         "Processing referral code for student:",
//         session.referralCode
//       );

//       const referralResult = await processReferralCode(
//         session.referralCode,
//         newUser
//       );

//       if (referralResult.success && referralResult.mbaUser) {
//         console.log("Referral processing successful:", referralResult.message);
//         referralProcessed = true;
//         referralMessage = `Successfully referred by ${referralResult.mbaUser.firstName} ${referralResult.mbaUser.lastName}`;
//       } else {
//         console.log("Referral processing failed:", referralResult.message);
//         referralMessage = referralResult.message;
//         // Note: We don't fail the signup if referral processing fails
//         // The account is still created, but referral might not be tracked
//       }
//     }

//     // Generate JWT token
//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
//       expiresIn: "1h",
//     });

//     // Set cookie
//     res.cookie("authToken", token, {
//       httpOnly: true,
//       sameSite: "None",
//       secure: true,
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     });

//     // Clean up session
//     otpSessions.delete(sessionId);
//     console.log(
//       "Student user successfully signed up with embeddings and referral processing complete"
//     );

//     // Success response with referral information
//     res.status(201).json({
//       message: "User successfully signed up and embeddings created",
//       success: true,
//       signup: true,
//       token,
//       referral: {
//         processed: referralProcessed,
//         message: referralMessage,
//       },
//       data: {
//         _id: newUser._id,
//         firstName: newUser.firstName,
//         lastName: newUser.lastName,
//         email: newUser.email,
//         phone: newUser.phone,
//         isEmailVerified: newUser.isEmailVerified,
//         referralCodeUsed: session.referralCode || null,
//       },
//     });
//   } catch (err) {
//     console.error("Complete student signup error:", err);

//     // More specific error handling
//     if (err.code === 11000) {
//       // Duplicate key error
//       return res.status(409).json({
//         message: "Email is already registered",
//         success: false,
//       });
//     }

//     res.status(500).json({
//       message: "Failed to create account. Please try again.",
//       success: false,
//     });
//   }
// });
// router.post("/complete-signup", async (req, res) => {
//   try {
//     const { sessionId, password: providedPassword } = req.body;
//     const session = otpSessions.get(sessionId);
//     console.log(
//       "Session data for completion:",
//       session ? "Found" : "Not found"
//     );

//     if (!session || !session.verified) {
//       return res.status(400).json({
//         message: "Invalid session or OTP not verified",
//         success: false,
//       });
//     }

//     if (new Date() > session.expiresAt) {
//       otpSessions.delete(sessionId);
//       return res.status(400).json({
//         message: "Session expired",
//         success: false,
//       });
//     }

//     // Use password from session or provided password (for flexibility)
//     const passwordToUse = providedPassword || session.password;

//     if (!passwordToUse || passwordToUse.length < 8) {
//       return res.status(400).json({
//         message: "Password must be at least 8 characters long",
//         success: false,
//       });
//     }

//     const hashedPassword = await bcrypt.hash(passwordToUse, 12);

//     // Create user data object
//     const userData = {
//       firstName: session.firstName,
//       lastName: session.lastName,
//       email: session.email,
//       phone: session.phone,
//       password: hashedPassword,
//       provider: "local",
//       isEmailVerified: true,
//       referralCode: session.referralCode,
//       createdAt: new Date(),
//     };

//     // 🚀 Create user with embedding integration
//     console.log("Creating user with embeddings...");
//     const newUser = await ExpressDbHooks.createUser(userData);

//     console.log("User created successfully with embeddings:", newUser._id);

//     // Generate JWT token
//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
//       expiresIn: "1h",
//     });

//     // Set cookie
//     res.cookie("authToken", token, {
//       httpOnly: true,
//       sameSite: "None",
//       secure: true,
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     });

//     // Clean up session
//     otpSessions.delete(sessionId);
//     console.log("User successfully signed up with embeddings");

//     // Success response
//     res.status(201).json({
//       message: "User successfully signed up and embeddings created",
//       success: true,
//       signup: true,
//       token,
//       data: {
//         _id: newUser._id,
//         firstName: newUser.firstName,
//         lastName: newUser.lastName,
//         email: newUser.email,
//         phone: newUser.phone,
//         isEmailVerified: newUser.isEmailVerified,
//       },
//     });
//   } catch (err) {
//     console.error("Complete signup error:", err);

//     // More specific error handling
//     if (err.code === 11000) {
//       // Duplicate key error
//       return res.status(409).json({
//         message: "Email is already registered",
//         success: false,
//       });
//     }

//     res.status(500).json({
//       message: "Failed to create account. Please try again.",
//       success: false,
//     });
//   }
// });

// ✅ Resend OTP (email only)
router.post("/resend-otp", async (req, res) => {
  try {
    const { sessionId, email } = req.body;

    // console.log("=== RESEND OTP START ===");
    // console.log("SessionId:", sessionId);
    // console.log("Email:", email);

    if (!sessionId) {
      // console.log("❌ No sessionId provided");
      return res.status(400).json({
        message: "Session ID is required",
        success: false,
      });
    }

    // ✅ Get session
    const session = otpSessions.get(sessionId);

    if (!session) {
      console.log("❌ Session not found");
      return res.status(400).json({
        message: "Session expired. Please register again.",
        success: false,
        sessionExpired: true,
      });
    }

    // ✅ Check if SESSION expired (10 minutes) - NOT OTP
    if (new Date() > session.sessionExpiresAt) {
      console.log("❌ Session completely expired (10 min)");
      otpSessions.delete(sessionId);
      return res.status(400).json({
        message: "Session expired. Please register again.",
        success: false,
        sessionExpired: true,
      });
    }

    // ✅ Session is still valid - Generate NEW OTP
    // console.log("✅ Session valid, generating new OTP");

    const newEmailOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Update session with new OTP and extend OTP expiry (but NOT session expiry)
    const updatedSession = {
      ...session,
      emailOtp: newEmailOtp,
      verified: false,
      otpExpiresAt: new Date(Date.now() + 2 * 60 * 1000), // ✅ New OTP expires in 2 minutes
      // sessionExpiresAt stays the same - session continues for 10 minutes total
    };

    otpSessions.set(sessionId, updatedSession);

    // console.log("Session updated:", {
    //   email: session.email,
    //   newOTP: newEmailOtp,
    //   otpExpiresAt: updatedSession.otpExpiresAt,
    //   sessionExpiresAt: updatedSession.sessionExpiresAt,
    // });

    // ✅ Send new OTP
    try {
      // console.log("📧 Sending new OTP to:", session.email);
      await sendEmailOTP(session.email, newEmailOtp);
      // console.log("✅ Email sent successfully");

      res.status(200).json({
        success: true,
        message: "New OTP sent successfully to your email",
      });
    } catch (sendError) {
      console.error("❌ Error sending email:", sendError);
      res.status(500).json({
        message: "Failed to send OTP email. Please try again.",
        success: false,
      });
    }
  } catch (err) {
    console.error("❌ Resend OTP error:", err);
    res.status(500).json({
      message: "Internal server error while resending OTP",
      success: false,
    });
  }
});

// 🆕 Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OTP signup service is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
