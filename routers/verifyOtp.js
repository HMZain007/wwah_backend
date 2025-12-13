/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication related routes
 */

/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verifies the OTP sent to the user's email for password reset.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 resetToken:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP / Session expired
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /verify-otp/resend:
 *   post:
 *     summary: Resend OTP
 *     description: Sends a new OTP to the user's email if allowed.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Session expired
 *       429:
 *         description: User must wait before resending the OTP
 *       500:
 *         description: Server error
 */


// module.exports = router;
const express = require("express");
const router = express.Router();
const Otp = require("../database/models/Otp");
const { hashString } = require("../utils/hashString");
const { generateResetToken } = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
router.post("/", async (req, res) => {
  try {
    const { otp } = req.body;
    // console.log(otp);
    const resetData = req.session.resetData;
    // console.log(resetData , "Resrey")
    if (!otp) return res.status(400).json({ message: "OTP required" });
    if (!resetData)
      return res.status(400).json({
        success: false,
        message: "Session expired, request OTP again.",
      });

    const email = resetData.email;
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: "OTP not found" });

    if (Date.now() > otpRecord.expiresAt) {
      await Otp.deleteMany({ email }); // clean expired OTP
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }

    if (otpRecord.otpHash !== hashString(otp))
      return res.status(400).json({ message: "Invalid OTP" });

    otpRecord.verified = true;
    await otpRecord.save();

    const resetToken = generateResetToken(email);

    // Mark session verified (optional)
    req.session.resetData.verified = true;

    res.json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

router.post("/resend", async (req, res) => {
  try {
    const resetData = req.session.resetData;
    if (!resetData || !resetData.email)
      return res.status(400).json({ message: "Session expired" });

    const email = resetData.email;
    const lastOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
    //  console.log(email , "resend")
    if (lastOtp && new Date() < lastOtp.resendAvailableAt) {
      const waitSec = Math.ceil(
        (lastOtp.resendAvailableAt - Date.now()) / 1000
      );
      return res
        .status(429)
        .json({ message: `Please wait ${waitSec}s before resending.` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashString(otp);

    await Otp.deleteMany({ email });
    await Otp.create({
      email,
      otpHash,
      expiresAt: Date.now() + 2 * 60 * 1000,
      resendAvailableAt: Date.now() + 2 * 60 * 1000,
    });

    const emailContent = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      <h2 style="color: #ffffffff; margin-bottom: 10px;">New OTP Sent</h2>
      
      <p style="font-size: 15px; color: #555;">
        You to resend your One-Time Password (OTP).
      </p>

      <h1 style="font-size: 36px; color: #2F54EB; margin: 20px 0;">
        ${otp}
      </h1>
  
      <p style="color: #555; font-size: 14px;">
        This OTP is valid for <strong>2 minutes</strong>.
      </p>
     <p>If you did not request a password reset, please ignore this email.</p>
    </div>
  `;

    await sendEmail(email, "Your New OTP Code", emailContent);

    res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
