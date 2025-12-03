 /**
  * @swagger
  * /signup:
  *   post:
  *     summary: User Sign Up
  *     description: Creates a new user account. Returns JWT token, user info, and successChance status.
  *     tags: [Auth]
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
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
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 2 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
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

    console.log("=== VERIFY OTP START ===");
    console.log("SessionId:", sessionId);
    console.log("EmailOtp received:", emailOtp);

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

    console.log("OTP VERIFIED SUCCESSFULLY");

    // Update session
    session.verified = true;
    session.sessionExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes to complete signup

    otpSessions.set(sessionId, session);
    console.log("Session marked as verified");

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

    console.log("Processing referral code:", referralCode.trim());

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

    console.log("Found MBA for referral code:", {
      mbaName: mbaUser.firstName + " " + mbaUser.lastName,
      referralCode: mbaUser.referralCode,
      currentReferrals: mbaUser.totalReferrals || 0,
      mbaCreatedAt: mbaUser.createdAt, // Log MBA's original creation date
    });

    // Check if student is already in this MBA's referrals (prevent duplicates)
    const existingReferral = mbaUser.referrals.find(
      (ref) => ref.id === studentData._id.toString()
    );

    if (existingReferral) {
      console.log("Student already referred by this MBA");
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

    console.log("Successfully added student to MBA referrals:", {
      mbaId: mbaUser._id,
      mbaName: mbaUser.firstName + " " + mbaUser.lastName,
      mbaCreatedAt: mbaUser.createdAt,
      firstReferralAt: updatedMBA.firstReferralAt,
      lastReferralAt: updatedMBA.lastReferralAt,
      studentId: studentData._id,
      studentName: studentData.firstName + " " + studentData.lastName,
      newTotalReferrals: updatedMBA.totalReferrals,
      referralCreatedAt: currentTimestamp,
    });

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

    console.log("Creating student user with embeddings...");
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

    console.log("=== RESEND OTP START ===");
    console.log("SessionId:", sessionId);
    console.log("Email:", email);

    if (!sessionId) {
      console.log("❌ No sessionId provided");
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
    console.log("✅ Session valid, generating new OTP");

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

    console.log("Session updated:", {
      email: session.email,
      newOTP: newEmailOtp,
      otpExpiresAt: updatedSession.otpExpiresAt,
      sessionExpiresAt: updatedSession.sessionExpiresAt,
    });

    // ✅ Send new OTP
    try {
      console.log("📧 Sending new OTP to:", session.email);
      await sendEmailOTP(session.email, newEmailOtp);
      console.log("✅ Email sent successfully");

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
