
const express = require("express");
const router = express.Router();
const Otp = require("../database/models/Otp");
const { hashString } = require("../utils/hashString");
const sendEmail = require("../utils/sendEmail");

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

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

    await Otp.deleteMany({ email }); // remove old OTPs

    await Otp.create({
      email,
      otpHash,
      expiresAt: Date.now() + 2 * 60 * 1000,
      resendAvailableAt: Date.now() + 1 * 60 * 1000,
    });

    //  BUG — you are setting `expiresAt` in session but not defined in this scope
    // req.session.resetData = { email, otp, expiresAt, verified: false };

    //  FIX
    req.session.resetData = {
      email,
      otp,
      expiresAt: Date.now() + 2 * 60 * 1000,
      verified: false,
    };

    // FIX: Save session explicitly before sending response
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({
          message: "Failed to save session. Please try again.",
        });
      }

      // Send email after session is saved
      sendEmail(email, "Your OTP Code", `Your OTP is ${otp}`)
        .then(() => {
          res.json({ message: "OTP sent successfully" });
        })
        .catch((emailErr) => {
          console.error("Email send error:", emailErr);
          res.status(500).json({ message: "Failed to send email" });
        });
    });

    //  console.log(req.session , "This is my seekn")
    // await sendEmail(email, "Your OTP Code", `Your OTP is ${otp}`);
    // res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
