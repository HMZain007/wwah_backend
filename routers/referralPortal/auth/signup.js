// /routers/referralPortal/signup.js
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpSessions = require("../../../utils/otpStore");
const jwt = require("jsonwebtoken");
const { send } = require("process");
const UserRefDb = require("../../../database/models/refPortal/refuser");
// const UserRefDb = require("../../database/models/refuser");

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
const generateNextRefId = async () => {
  try {
    // Find the user with the highest refId
    const lastUser = await UserRefDb.findOne({}, { refId: 1 })
      .sort({ refId: -1 })
      .lean();

    // If no users exist, start with 1, otherwise increment
    const nextRefId = lastUser && lastUser.refId ? lastUser.refId + 1 : 1;

    return nextRefId;
  } catch (error) {
    console.error("Error generating refId:", error);
    throw new Error("Failed to generate reference ID");
  }
};
const generateReferralCode = (firstName, refId) => {
  try {
    // Get first 3 letters of first name in lowercase
    const namePrefix = firstName.toLowerCase().substring(0, 3);

    // Format refId as 3-digit string with leading zeros
    const formattedRefId = refId.toString().padStart(3, "0");

    // Combine: REF + namePrefix + formattedRefId
    return `REF${namePrefix}${formattedRefId}`;
  } catch (error) {
    console.error("Error generating referral code:", error);
    throw new Error("Failed to generate referral code");
  }
};
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
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  return emailTransporter.sendMail(mailOptions);
};

// 🆕 Standalone function to create user (replaces ExpressDbHooks.createUser)
const createUser = async (userData) => {
  try {
    console.log("Creating new user...");

    // Generate unique refId
    const refId = await generateNextRefId();
    console.log("Generated refId:", refId);

    // Generate referral code
    const referralCode = generateReferralCode(userData.firstName, refId);
    console.log("Generated referral code:", referralCode);

    // Add refId and referralCode to userData
    const userDataWithIds = {
      ...userData,
      refId,
      referralCode,
    };

    // Create new user instance
    const newUser = new UserRefDb(userDataWithIds);

    // Save user to database
    const savedUser = await newUser.save();

    console.log("User created successfully:", savedUser._id);
    return savedUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// 🆕 Standalone function to validate user data
const validateUserData = (userData) => {
  const { firstName, lastName, email, phone, password } = userData;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address");
  }

  // Phone number validation
  const phoneRegex = /^\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error("Please enter a valid phone number");
  }

  // Password validation
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  // Name validation
  if (firstName.trim().length < 2) {
    throw new Error("First name must be at least 2 characters");
  }

  if (lastName.trim().length < 2) {
    throw new Error("Last name must be at least 2 characters");
  }

  return true;
};

// ✅ Send OTP (email only)
router.post("/send-otp", async (req, res) => {
  const userData = req.body;

  // Check which required fields are missing
  const missingFields = REQUIRED_FIELDS.filter((field) => !userData[field]);
  console.log("User data received:", userData);

  if (missingFields.length) {
    const fieldList = missingFields.join(", ");
    return res.status(400).json({
      message: `The following field(s) are missing: ${fieldList}`,
      success: false,
    });
  }

  const { firstName, lastName, email, phone, password } = userData;

  try {
    // Validate user data
    validateUserData({ firstName, lastName, email, phone, password });

    // Check if a user with the given email already exists
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

    // Store OTP session with all user data (including password for later use)
    otpSessions.set(sessionId, {
      emailOtp,
      email,
      phone,
      firstName,
      lastName,
      password, // Store password temporarily for complete-signup
      verified: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
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
      console.log("OTP session deleted due to send error", sendError);

      res.status(500).json({
        message: `Failed to send OTP. ${sendError.message}`,
        success: false,
      });
    }
  } catch (err) {
    console.error("Send OTP error:", err);

    // Handle validation errors
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

// ✅ Verify OTP (email only)
router.post("/verify-otp", async (req, res) => {
  try {
    const { sessionId, emailOtp } = req.body;
    const session = otpSessions.get(sessionId);
    console.log("Session data:", session, "Email OTP:", emailOtp);

    if (!session || !emailOtp) {
      return res.status(400).json({
        message: "Invalid OTP or session expired",
        success: false,
      });
    }

    if (new Date() > session.expiresAt) {
      otpSessions.delete(sessionId);
      return res.status(400).json({
        message: "OTP expired",
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

// ✅ Complete Registration (Updated without embedding hooks)
router.post("/complete-signup", async (req, res) => {
  try {
    const { sessionId, password: providedPassword } = req.body;
    const session = otpSessions.get(sessionId);
    console.log(
      "Session data for completion:",
      session ? "Found" : "Not found"
    );

    if (!session || !session.verified) {
      return res.status(400).json({
        message: "Invalid session or OTP not verified",
        success: false,
      });
    }

    if (new Date() > session.expiresAt) {
      otpSessions.delete(sessionId);
      return res.status(400).json({
        message: "Session expired",
        success: false,
      });
    }

    // Use password from session or provided password (for flexibility)
    const passwordToUse = providedPassword || session.password;

    if (!passwordToUse || passwordToUse.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(passwordToUse, 12);

    // Create user data object
    const userData = {
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
      phone: session.phone,
      password: hashedPassword,
      isEmailVerified: true,
      createdAt: new Date(),
    };

    // 🚀 Create user using standalone function (replaces ExpressDbHooks.createUser)
    console.log("Creating user...");
    const newUser = await createUser(userData);
    console.log("User created successfully:", newUser._id);

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    // Set cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Clean up session
    otpSessions.delete(sessionId);
    console.log("User successfully signed up");

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
      },
    });
  } catch (err) {
    console.error("Complete signup error:", err);

    // More specific error handling
    if (err.code === 11000) {
      // Duplicate key error
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

// ✅ Resend OTP (email only)
router.post("/resend-otp", async (req, res) => {
  try {
    const { sessionId } = req.body;

    console.log("Resend OTP request received:", { sessionId });

    // Check if sessionId is provided
    if (!sessionId) {
      console.log("No sessionId provided");
      return res.status(400).json({
        message: "Session ID is required",
        success: false,
      });
    }

    const session = otpSessions.get(sessionId);
    console.log("Session found:", session ? "Yes" : "No");

    if (!session) {
      console.log("Session not found for sessionId:", sessionId);
      return res.status(400).json({
        message: "Invalid or expired session",
        success: false,
      });
    }

    // Check if session has required data
    if (!session.email) {
      console.log("Session missing email data");
      return res.status(400).json({
        message: "Invalid session data",
        success: false,
      });
    }

    console.log("Generating new OTP for email:", session.email);
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update session with new OTP
    session.emailOtp = emailOtp;
    session.verified = false;
    session.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("Updated session with new OTP");

    try {
      console.log("Attempting to send email OTP");
      await sendEmailOTP(session.email, emailOtp);
      console.log("Email OTP sent successfully");

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

// 🆕 Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OTP signup service is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
