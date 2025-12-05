/** 
  *@swagger
  * /reset-password:
  *   post:
  *     summary: Reset Password
  *     description: This route is used to reset the password of the user.
  *     tags: [Reset Password]
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  */

// module.exports = router;
const express = require("express");
const router = express.Router();
const User = require("../database/models/UserDb");
const Otp = require("../database/models/Otp"); // ✅ Add this import
const bcrypt = require("bcryptjs");

router.post("/", async (req, res) => {
  try {
    // ✅ Support both 'password' and 'newPassword' field names
    const { password, newPassword } = req.body;
    const passwordToUse = password || newPassword;

    // ✅ Log to debug what's being received
    console.log("Request body:", req.body);
    console.log("Password value:", passwordToUse);

    // ✅ Validate password exists
    if (!passwordToUse) {
      return res.status(400).json({ 
        success: false, 
        message: "Password is required" 
      });
    }

    // ✅ Validate password length
    if (passwordToUse.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long" 
      });
    }

    // ✅ Check session
    const resetData = req.session.resetData;
    console.log("Reset data from session:", resetData);

    if (!resetData) {
      return res.status(400).json({ 
        success: false, 
        message: "Session expired. Please request a new OTP." 
      });
    }

    if (!resetData.verified) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP not verified. Please verify your OTP first." 
      });
    }

    // ✅ Find user
    const user = await User.findOne({ email: resetData.email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // ✅ Check if new password is same as old
    // const isSamePassword = await bcrypt.compare(passwordToUse, user.password);
    // if (isSamePassword) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: "New password cannot be the same as your current password" 
    //   });
    // }

    // ✅ Hash password with salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordToUse, salt);
    
    user.password = hashedPassword;
    await user.save();

    // ✅ Cleanup OTP records
    await Otp.deleteMany({ email: resetData.email });

    // ✅ Clear session data
    req.session.resetData = null;

    // ✅ Optional: Destroy entire session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
      }
    });

    return res.status(200).json({ 
      success: true, 
      message: "Password reset successfully. You can now login with your new password." 
    });

  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while resetting password" 
    });
  }
});

module.exports = router;