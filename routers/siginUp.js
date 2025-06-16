// // Importing necessary modules
// const express = require("express");
// const router = express.Router();
// const UserDb = require("../database/models/UserDb"); // User model
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");

// // Required fields configuration
// const REQUIRED_FIELDS = ["firstName", "lastName", "email", "phone", "password"];

// // GET Route for Default Home Page
// router.get("/", async (req, res) => {
//   try {
//     res.status(200).send("This is GET Request from signup page");
//   } catch (error) {
//     res.status(500).send("There is an error");
//   }
// });

// // POST Route for User Signup
// router.post("/", async (req, res) => {
//   const userData = req.body;
//   // Check which required fields are missing
//   const missingFields = REQUIRED_FIELDS.filter(field => !userData[field]);

//   if (missingFields.length) {
//     const fieldList = missingFields.join(", ");
//     return res.status(400).json({
//       message: `The following field(s) are missing: ${fieldList}`,
//       success: false
//     });
//   }

//   const { firstName, lastName, email, phone, password, referralCode } = userData;

//   try {
//     // Check if a user with the given email already exists
//     const userExists = await UserDb.findOne({ email });
//     if (userExists) {
//       return res.status(409).json({ message: "Email is already registered", success: false, signup: false });
//     }

//     // Password length validation
//     if (password.length < 8) {
//       return res.status(400).json({ message: "Password must be at least 8 characters", success: false });
//     }

//     // Phone number validation - basic format check
//     const phoneRegex = /^\d{10,15}$/; // Adjust regex as needed for your requirements
//     if (!phoneRegex.test(phone)) {
//       return res.status(400).json({ message: "Please enter a valid phone number", success: false });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new UserDb({
//       firstName,
//       lastName,
//       email,
//       phone,
//       password: hashedPassword,
//       referralCode: referralCode || null,  // Store referral code if provided
//       // ...referralData  // Include referred by data if code was valid
//     });

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: newUser._id },
//       process.env.JWT_SECRET_KEY,
//       { expiresIn: "1h" }
//     );

//     // Save the user and set cookie
//     await newUser.save();
//     res.cookie("authToken", token, {
//       httpOnly: true,
//       sameSite: "None",
//       secure: true,
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     });
//     console.log("User successfully signed up:");
//     // Success response
//     res.status(201).json({
//       message: "User successfully signed up",
//       success: true,
//       signup: true,
//       token,
//       data: {
//         _id: newUser._id,
//         firstName: newUser.firstName,
//         lastName: newUser.lastName,
//         email: newUser.email,
//         phone: newUser.phone,
//       }
//     });

//   } catch (error) {
//     console.error(`Error during signup: ${error.message}`);
//     res.status(500).json({ message: "Registration failed, server is busy", success: false });
//   }
// });

// // Exporting the router
// module.exports = router;
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpSessions = require("../utils/otpStore");
const UserDb = require("../database/models/UserDb");
const jwt = require("jsonwebtoken");

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

// ✅ Send OTP (email only)
router.post("/send-otp", async (req, res) => {
  const userData = req.body;
  // Check which required fields are missing
  const missingFields = REQUIRED_FIELDS.filter(field => !userData[field]);
  console.log(userData);

  if (missingFields.length) {
    const fieldList = missingFields.join(", ");
    return res.status(400).json({
      message: `The following field(s) are missing: ${fieldList}`,
      success: false
    });
  }

  const { firstName, lastName, email, phone, password, referralCode } = userData;

  try {
    // Check if a user with the given email already exists
    const userExists = await UserDb.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "Email is already registered", success: false, signup: false });
    }

    // Password length validation
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters", success: false });
    }

    // Phone number validation - basic format check
    const phoneRegex = /^\d{10,15}$/; // Adjust regex as needed for your requirements
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Please enter a valid phone number", success: false });
    }

    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = crypto.randomUUID();

    // Store OTP session
    otpSessions.set(sessionId, {
      emailOtp,
      email,
      phone, // ✅ Add this
      firstName, // ✅ Add this
      lastName, // ✅ Add this
      referralCode: referralCode || null, // ✅ Add this
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
      res.status(500).json({
        message: "Failed to send OTP. Please try again.",
      });
    }
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ✅ Verify OTP (email only)
router.post("/verify-otp", async (req, res) => {
  try {
    const { sessionId, emailOtp } = req.body;
    const session = otpSessions.get(sessionId);

    if (!session || !emailOtp) {
      return res.status(400).json({
        message: "Invalid input or session",
      });
    }

    if (new Date() > session.expiresAt) {
      otpSessions.delete(sessionId);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (session.emailOtp !== emailOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    session.verified = true;
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
});

// ✅ Complete Registration
router.post("/complete-signup", async (req, res) => {
  try {
    const { sessionId, password } = req.body;
    const session = otpSessions.get(sessionId);
    console.log("Session data:", session);

    if (!session || !session.verified) {
      return res.status(400).json({
        message: "Invalid session or OTP not verified",
      });
    }

    if (new Date() > session.expiresAt) {
      otpSessions.delete(sessionId);
      return res.status(400).json({ message: "Session expired" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new UserDb({
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
      phone: session.phone,
      password: hashedPassword,
      isEmailVerified: true,
      referralCode: session.referralCode,
      createdAt: new Date(),
    });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Save the user and set cookie
    await newUser.save();
    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    console.log("User successfully signed up:");
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
      }
    });
  } catch (err) {
    console.error("Complete signup error:", err);
    res.status(500).json({ message: "Failed to create account" });
  }
});

// ✅ Resend OTP (email only)
router.post("/resend-otp", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = otpSessions.get(sessionId);

    if (!session) {
      return res.status(400).json({ message: "Invalid session" });
    }

    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

    session.emailOtp = emailOtp;
    session.verified = false;
    session.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    try {
      await sendEmailOTP(session.email, emailOtp);

      res.status(200).json({
        success: true,
        message: "New OTP sent successfully",
      });
    } catch (sendError) {
      console.error("Error resending OTP:", sendError);
      res.status(500).json({
        message: "Failed to resend OTP. Please try again.",
      });
    }
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
});

module.exports = router;
