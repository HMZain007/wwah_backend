const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const UserDb = require("../database/models/UserDb");
const cors = require("cors");
const { ExpressDbHooks } = require("../utils/embedding-hooks");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure CORS for Google auth
router.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "https://wwah.vercel.app",
      "https://wwah.ai",
      "https://www.worldwideadmissionshub.com",
    ],
    credentials: true,
  })
);

router.post("/google-login", async (req, res) => {
  const { credential } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await UserDb.findOne({
      $or: [{ email: email }, { googleId: googleId }],
    });

    if (!user) {
      // Create new user with Google data
      user = await ExpressDbHooks.createUser({
        firstName: given_name || "",
        lastName: family_name || "",
        email: email,
        profilePic: picture,
        provider: "google",
        googleId: googleId,
        phone: "", // You might want to request this separately
        isVerified: true, // Google accounts are pre-verified
      });
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = googleId;
      user.provider = user.provider ? user.provider : "google";
      user.profilePic = user.profilePic || picture;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY || "defaultSecretKey", // Fallback for missing secret key
      { expiresIn: "1d" }
    );
    // Set secure cookie
    res.cookie("authToken", token, {
      // httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      success: true,
      token,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error);
    res.status(401).json({
      success: false,
      message: "Google authentication failed. Please try again.",
    });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
