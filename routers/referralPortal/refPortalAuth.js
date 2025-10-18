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

router.post("/google-login", async (req, res) => {
  const { credential } = req.body;

  // Add request logging for debugging
  console.log("Google login attempt:", {
    hasCredential: !!credential,
    origin: req.get("origin"),
    userAgent: req.get("user-agent"),
  });

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: "Google credential is required",
    });
  }

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Invalid Google token payload");
    }

    const { email, given_name, family_name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not provided by Google",
      });
    }

    // Check if user exists
    let user = await UserRefDb.findOne({
      $or: [{ email: email }, { googleId: googleId }],
    });

    if (!user) {
      // Generate a unique referral code
      const generateReferralCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      };

      let referralCode;
      let isUnique = false;

      // Ensure referral code is unique
      while (!isUnique) {
        referralCode = generateReferralCode();
        const existingUser = await UserRefDb.findOne({ referralCode });
        if (!existingUser) {
          isUnique = true;
        }
      }

      // Create new user
      user = new UserRefDb({
        firstName: given_name || "",
        lastName: family_name || "",
        email: email,
        profilePic: picture,
        provider: "google",
        googleId: googleId,
        phone: "",
        isVerified: true,
        referralCode: referralCode,
        totalReferrals: 0,
      });

      await user.save();
      console.log("New Google user created:", user._id);
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = googleId;
      user.provider = user.provider ? user.provider : "google";
      user.profilePic = user.profilePic || picture;
      user.isVerified = true;
      await user.save();
      console.log("Existing user linked with Google:", user._id);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, type: "referral" },
      process.env.JWT_SECRET_KEY || "defaultSecretKey",
      { expiresIn: "24h" }
    );

    // Determine cookie settings based on environment
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true, // Allow frontend to access the token
      secure: isProduction, // Only secure in production
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    };

    // Set cookie
    res.cookie("authToken", token, cookieOptions);

    console.log("Google login successful for user:", user._id);

    res.status(200).json({
      success: true,
      token,
      message: "Google authentication successful",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic,
        provider: user.provider,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error);

    // Provide more specific error messages
    if (error.message && error.message.includes("Token used too early")) {
      return res.status(401).json({
        success: false,
        message: "Google token is not yet valid. Please try again.",
      });
    }

    if (error.message && error.message.includes("Token used too late")) {
      return res.status(401).json({
        success: false,
        message: "Google token has expired. Please try again.",
      });
    }

    res.status(401).json({
      success: false,
      message: "Google authentication failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

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
