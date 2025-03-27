// Importing necessary modules
const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb"); // Importing the User model for interacting with the user database
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// GET Route for Default Home Page
router.get("/", async (req, res) => {
  try {
    res.status(200).send("All fine");
  } catch (error) {
    res.status(500).send("There is an error");
  }
});

// POST Route for User Signup
router.post("/", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Validate the required fields
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required", success: false });
  }

  try {
    // Check if a user with the given email already exists in the database
    const userExists = await UserDb.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "Email is already in use", success: false, signup: false });
    }

    // Password length validation
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long", success: false });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new UserDb({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Generate a JWT token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Save the user to the database
    await newUser.save();
    res.cookie("authToken", token, {
      sameSite: "strict", // Prevent CSRF
      maxAge: 3600000, // 1 hour
    });
    // Respond with success
    res.status(201).json({
      message: "User successfully signed up",
      success: true,
      signup: true,
      token,
      user: newUser
    });
  } catch (error) {
    console.error(`Error during signup: ${error.message}`);
    res.status(500).json({ message: "Internal server error in backennd", success: false });
  }
});

// Exporting the router to be used in other parts of the application
module.exports = router;
