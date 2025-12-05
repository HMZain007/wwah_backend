/**
 * @swagger
 * /referral-portal/signin:
 *   post:
 *     summary: Sign In to Referral Portal
 *     description: |
 *       Authenticates an MBA user with email and password credentials. Validates credentials, generates a JWT token valid for 24 hours, and sets an authentication cookie.
 *       
 *       **Authentication Process:**
 *       1. Validates email format
 *       2. Checks if user exists in database
 *       3. Compares provided password with hashed password (bcrypt)
 *       4. Generates JWT token (24-hour expiration)
 *       5. Sets refToken cookie (24-hour max-age)
 *       6. Returns token and user data (excluding password)
 *       
 *       **Security Features:**
 *       - Password hashed with bcrypt (verified via bcrypt.compare)
 *       - Generic error message for invalid credentials (doesn't reveal if user exists)
 *       - JWT signed with secret key
 *       - Cookie set with 24-hour expiration
 *       
 *       **Cookie Configuration:**
 *       - Name: refToken
 *       - HttpOnly: false (allows client-side JavaScript access)
 *       - SameSite: None
 *       - Secure: false (should be true in production)
 *       - Max-Age: 24 hours (86400000 ms)
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
 *                 description: User's registered email address
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: "SecurePassword123"
 *     responses:
 *       200:
 *         description: Sign in successful. JWT token generated and cookie set.
 *         headers:
 *           Set-Cookie:
 *             description: Authentication cookie
 *             schema:
 *               type: string
 *               example: "refToken=eyJhbGc...; Path=/; Max-Age=86400; SameSite=None"
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
 *                   example: "Sign In Successful"
 *                 token:
 *                   type: string
 *                   description: JWT authentication token (24-hour expiration)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   description: User information (password excluded)
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: User's MongoDB ObjectId
 *                       example: "507f1f77bcf86cd799439011"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Smith"
 *                     email:
 *                       type: string
 *                       example: "john.smith@example.com"
 *                     phone:
 *                       type: string
 *                       example: "1234567890"
 *       400:
 *         description: Bad request - Invalid email format or missing credentials.
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
 *                   example: "Please provide a valid email address."
 *       401:
 *         description: Unauthorized - Invalid email or password.
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
 *                   example: "Invalid credentials."
 *       500:
 *         description: Internal server error.
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
 *                   example: "An internal server error occurred."
 */
// Importing necessary modules
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserRefDb = require("../../../database/models/refPortal/refuser");
// const UserRefDb = require("../../database/models/refuser");

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
    const user = await UserRefDb.findOne({ email });

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

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY || "defaultSecretKey", // Fallback for missing secret key
      { expiresIn: "1d" }
    );

    res.cookie("refToken", token, {
      httpOnly: false,
      sameSite: "None",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    console.log(" Ref user Sign In Successful");
    return res.status(200).json({
      message: "Sign In Successful",
      success: true,
      token,
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
      `${new Date().toISOString()}] Backend error: ${error.message}`
    );
    return res.status(500).json({
      message: "An internal server error occurred.",
      success: false,
      x,
    });
  }
});

module.exports = router;
