// module.exports = router;
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const admin = require("../../../database/models/adminDashboard/user");

// POST Route for user login Authentication
router.post("/", async (req, res) => {
  const { emailOrUsername, password } = req.body;

  // Validate input
  if (!emailOrUsername) {
    return res.status(400).json({
      message: "Please provide an email or username.",
      success: false,
    });
  }

  if (!password) {
    return res.status(400).json({
      message: "Please provide a password.",
      success: false,
    });
  }

  console.log("Request body:", req.body);
  console.log("Looking for user with:", emailOrUsername);

  try {
    // Check if input is email or username
    const isEmail = /\S+@\S+\.\S+/.test(emailOrUsername);
    
    // Trim whitespace and use case-insensitive search
    const trimmedInput = emailOrUsername.trim();
    
    // Find user by email or username (name field) - case insensitive
    const user = await admin.findOne(
      isEmail 
        ? { email: { $regex: new RegExp(`^${trimmedInput}$`, 'i') } }
        : { name: { $regex: new RegExp(`^${trimmedInput}$`, 'i') } }
    );

    if (!user) {
      console.log("User not found");
      return res.status(401).json({
        message: "Invalid credentials.",
        success: false,
      });
    }

    console.log("User found:", user.email, "Name:", user.name);

    // Compare plain text password (trim whitespace)
    console.log("Comparing passwords...");
    if (user.password.trim() !== password.trim()) {
      console.log("Password mismatch");
      return res.status(401).json({
        message: "Invalid credentials.",
        success: false,
      });
    }

    console.log("Password matched!");

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: "admin" },
      process.env.JWT_SECRET_KEY || "defaultSecretKey",
      { expiresIn: "1d" }
    );

    // Set token in cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    console.log("admin user Sign In Successful");
    return res.status(200).json({
      message: "Super Admin Sign In Successful",
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Log the error and send a generic response
    console.error(
      `${new Date().toISOString()} Backend error: ${error.message}`
    );
    return res.status(500).json({
      message: "An internal server error occurred.",
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;