/**
 * @swagger
 * /referral-portal/auth/signin:
 *   post:
 *     summary: Sign In to Referral Portal
 *     description: Authenticates a referral portal user with email and password credentials. This endpoint is currently a placeholder and requires implementation of the full authentication logic.
 *     tags:
 *       - Referral Portal
 *       - Authentication
 *       - Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: "SecurePassword123"
 *     responses:
 *       200:
 *         description: Sign in successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 message:
 *                   type: string
 *                   example: "Sign in successful"
 *                 user:
 *                   type: object
 *                   description: User information
 *       400:
 *         description: Bad request - Missing required fields.
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
 *                   example: "Email and password are required"
 *       401:
 *         description: Unauthorized - Invalid credentials.
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
 *                   example: "Sign in failed. Please try again."
 */

/**
 * @swagger
 * /referral-portal/auth/logout:
 *   post:
 *     summary: Logout from Referral Portal
 *     description: Logs out the user by clearing the authentication cookie (authToken). Works in both development and production environments with appropriate cookie settings.
 *     tags:
 *       - Referral Portal
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logout successful.
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
 *                   example: "Logged out successfully"
 */

/**
 * @swagger
 * /referral-portal/auth/google-login:
 *   post:
 *     summary: Google OAuth Sign In (Currently Disabled)
 *     description: |
 *       **Note: This endpoint is currently commented out in the code and not active.
 *       Authenticates users via Google OAuth 2.0. Verifies Google ID token, creates new user accounts or links existing accounts, generates unique referral codes for new users, and issues JWT tokens with 24-hour expiration.
 *     tags:
 *       - Referral Portal
 *       - Authentication
 *       - OAuth
 *       - Public
 *       - Disabled
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credential
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Google ID token received from Google Sign-In
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3ZTRlZGJjOT..."
 *     responses:
 *       200:
 *         description: Google authentication successful.
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
 *                 token:
 *                   type: string
 *                   description: JWT authentication token (24-hour expiration)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 message:
 *                   type: string
 *                   example: "Google authentication successful"
 *                 user:
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
 *                       example: "john.smith@gmail.com"
 *                     phone:
 *                       type: string
 *                       example: ""
 *                     profilePic:
 *                       type: string
 *                       description: Google profile picture URL
 *                       example: "https://lh3.googleusercontent.com/a/..."
 *                     provider:
 *                       type: string
 *                       example: "google"
 *                     referralCode:
 *                       type: string
 *                       description: Unique 6-character referral code (auto-generated for new users)
 *                       example: "A3X9K2"
 *       400:
 *         description: Bad request - Missing Google credential or email.
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
 *                   example: "Google credential is required"
 *       401:
 *         description: Unauthorized - Google authentication failed.
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
 *                   example: "Google token has expired. Please try again."
 *                 error:
 *                   type: string
 *                   description: Detailed error message (only in development mode)
 *                   example: "Token used too late"
 */
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const UserRefDb = require("../../database/models/refPortal/refuser");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure CORS specifically for this router
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "https://wwah.ai",
      "http://localhost:3000",
      "https://wwah.vercel.app",
      "https://www.worldwideadmissionshub.com",
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

router.use(cors(corsOptions));

// Handle preflight requests
router.options("*", cors(corsOptions));

// router.post("/google-login", async (req, res) => {
//   const { credential } = req.body;

//   // Add request logging for debugging
//   console.log("Google login attempt:", {
//     hasCredential: !!credential,
//     origin: req.get("origin"),
//     userAgent: req.get("user-agent"),
//   });

//   if (!credential) {
//     return res.status(400).json({
//       success: false,
//       message: "Google credential is required",
//     });
//   }

//   try {
//     // Verify the Google token
//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();

//     if (!payload) {
//       throw new Error("Invalid Google token payload");
//     }

//     const { email, given_name, family_name, picture, sub: googleId } = payload;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email not provided by Google",
//       });
//     }

//     // Check if user exists
//     let user = await UserRefDb.findOne({
//       $or: [{ email: email }, { googleId: googleId }],
//     });

//     if (!user) {
//       // Generate a unique referral code
//       const generateReferralCode = () => {
//         return Math.random().toString(36).substring(2, 8).toUpperCase();
//       };

//       let referralCode;
//       let isUnique = false;

//       // Ensure referral code is unique
//       while (!isUnique) {
//         referralCode = generateReferralCode();
//         const existingUser = await UserRefDb.findOne({ referralCode });
//         if (!existingUser) {
//           isUnique = true;
//         }
//       }

//       // Create new user
//       user = new UserRefDb({
//         firstName: given_name || "",
//         lastName: family_name || "",
//         email: email,
//         profilePic: picture,
//         provider: "google",
//         googleId: googleId,
//         phone: "",
//         isVerified: true,
//         referralCode: referralCode,
//         totalReferrals: 0,
//       });

//       await user.save();
//       console.log("New Google user created:", user._id);
//     } else if (!user.googleId) {
//       // Link existing account with Google
//       user.googleId = googleId;
//       user.provider = user.provider ? user.provider : "google";
//       user.profilePic = user.profilePic || picture;
//       user.isVerified = true;
//       await user.save();
//       console.log("Existing user linked with Google:", user._id);
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user._id, type: "referral" },
//       process.env.JWT_SECRET_KEY || "defaultSecretKey",
//       { expiresIn: "24h" }
//     );

//     // Determine cookie settings based on environment
//     const isProduction = process.env.NODE_ENV === "production";
//     const cookieOptions = {
//       httpOnly: true, // Allow frontend to access the token
//       secure: isProduction, // Only secure in production
//       sameSite: isProduction ? "None" : "Lax",
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//       path: "/",
//     };

//     // Set cookie
//     res.cookie("authToken", token, cookieOptions);

//     console.log("Google login successful for user:", user._id);

//     res.status(200).json({
//       success: true,
//       token,
//       message: "Google authentication successful",
//       user: {
//         _id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         phone: user.phone,
//         profilePic: user.profilePic,
//         provider: user.provider,
//         referralCode: user.referralCode,
//       },
//     });
//   } catch (error) {
//     console.error("Google authentication error:", error);

//     // Provide more specific error messages
//     if (error.message && error.message.includes("Token used too early")) {
//       return res.status(401).json({
//         success: false,
//         message: "Google token is not yet valid. Please try again.",
//       });
//     }

//     if (error.message && error.message.includes("Token used too late")) {
//       return res.status(401).json({
//         success: false,
//         message: "Google token has expired. Please try again.",
//       });
//     }

//     res.status(401).json({
//       success: false,
//       message: "Google authentication failed. Please try again.",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// });

// Regular signin route
router.post("/signin", async (req, res) => {
  // Add your regular signin logic here
  // This is just a placeholder structure
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Your existing signin logic here...
  } catch (error) {
    console.error("Signin error:", error);
    res.status(401).json({
      success: false,
      message: "Sign in failed. Please try again.",
    });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("authToken", {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
