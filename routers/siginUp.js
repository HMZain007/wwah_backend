// Importing necessary modules
const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb"); // User model
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Required fields configuration
const REQUIRED_FIELDS = ["firstName", "lastName", "email", "phone", "password"];

// GET Route for Default Home Page
router.get("/", async (req, res) => {
  try {
    res.status(200).send("This is GET Request from signup page");
  } catch (error) {
    res.status(500).send("There is an error");
  }
});

// POST Route for User Signup
router.post("/", async (req, res) => {
  const userData = req.body;

  // Check which required fields are missing
  const missingFields = REQUIRED_FIELDS.filter(field => !userData[field]);

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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Process referral code if provided


    // Create new user instance with all fields including optional referral code
    const newUser = new UserDb({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      referralCode: referralCode || null,  // Store referral code if provided
      ...referralData  // Include referred by data if code was valid
    });

    // Generate JWT token
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
        // Don't return the password even if hashed
        // Return only the necessary user data
      }
    });
  } catch (error) {
    console.error(`Error during signup: ${error.message}`);
    res.status(500).json({ message: "Registration failed, server is busy", success: false });
  }
});

// Exporting the router
module.exports = router;