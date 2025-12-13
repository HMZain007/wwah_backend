/** 
  *@swagger
  * /forgot-password:
  *   post:
  *     summary: Forgot Password
  *     description: This route is used to forgot the password of the user.
  *     tags: [Forgot Password]
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  */


const express = require("express");
const router = express.Router();
const Otp = require("../database/models/Otp");
const userDb = require("../database/models/UserDb");
const { hashString } = require("../utils/hashString");
const sendEmail = require("../utils/sendEmail");

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email  is required" });

    // check if user exists
    const userExists = await userDb.findOne({ email });
    if (!userExists) return res.status(404).json({ message: "User not found" });

    // Check last OTP
    const lastOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (lastOtp && new Date() < lastOtp.resendAvailableAt) {
      const waitSec = Math.ceil(
        (lastOtp.resendAvailableAt - Date.now()) / 1000
      );
      return res.status(429).json({
        message: `Please wait ${waitSec}s before requesting a new OTP.`,
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashString(otp);
    const otpExpiry = Date.now() + 2 * 60 * 1000; // 2 minutes

    await Otp.deleteMany({ email }); // remove old OTPs

    await Otp.create({
      email,
      otpHash,
      expiresAt: otpExpiry,
      resendAvailableAt: Date.now() + 1 * 60 * 1000,
    });

    // Save session
    req.session.resetData = {
      email,
      otp,
      expiresAt: otpExpiry,
      verified: false,
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({
          message: "Failed to save session. Please try again.",
        });
      }

      // Updated email template with OTP validity info
      // Updated email template with consistent formatting
      const emailContent = `
  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
    <h2 style="color: #333333; margin-bottom: 10px;">Password Reset OTP</h2>
    
    <p style="font-size: 15px; color: #555;">
      Your One-Time Password (OTP) is:
    </p>

    <h1 style="font-size: 36px; color: #2F54EB; margin: 20px 0;">
      ${otp}
    </h1>

    <p style="color: #555; font-size: 14px;">
      This OTP is valid for <strong>2 minutes</strong>.
    </p>
    
    <p>
      If you did not request a password reset, please ignore this email.
    </p>
  </div>
`;

      sendEmail(email, "Your Password Reset OTP", emailContent)
        .then(() => {
          res.json({ message: "OTP sent successfully" });
        })
        .catch((emailErr) => {
          console.error("Email send error:", emailErr);
          res.status(500).json({ message: "Failed to send email" });
        });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;