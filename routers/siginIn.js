/**
 * @swagger
 * /signin:
 *   post:
 *     summary: User Sign In
 *     description: Authenticates a user using email and password. Returns JWT token, user info, and successChance status.
 *     tags: [Auth]
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Sign in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sign In Successful
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsIn...
 *                 successChance:
 *                   type: boolean
 *                   example: true
 *                 user:
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
 *       400:
 *         description: Invalid email format
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */

// Importing necessary modules
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserDb = require("../database/models/UserDb"); // Importing the User database model for user data handling
const userSuccessDb = require("../database/models/successChance");
// POST Route for user login Authentication
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address.",
      success: false,
    });
  }

  try {
    // Find the user in the database
    const user = await UserDb.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials.",
        success: false,
      });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials.",
        success: false,
      });
    }
    const existingEntry = await userSuccessDb.findOne({ userId: user._id });

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY || "defaultSecretKey", // Fallback for missing secret key
      { expiresIn: "1d" }
    );

    res.cookie("authToken", token, {
      httpOnly: false,
      sameSite: "None",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    console.log("Sign In Successful");
    return res.status(200).json({
      message: "Sign In Successful",
      success: true,
      token,
      successChance: existingEntry ? true : false,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        // Don't return the password even if hashed
        // Return only the necessary user data
      },
    });
  } catch (error) {
    // Log the error and send a generic response
    console.error(
      `[${new Date().toISOString()}] Backend error: ${error.message}`
    );
    return res.status(500).json({
      message: "An internal server error occurred.",
      success: false,
    });
  }
});

module.exports = router;
