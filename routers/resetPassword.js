// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const UserDb = require("../database/models/UserDb");

// // Reset Password
// router.post("/", async (req, res) => {
//   const { newPassword } = req.body;
//   try {
//     // Validate input
//     if (!newPassword || newPassword.length < 8) {
//       return res.status(400).json({
//         message: "Password must be at least 8 characters long.",
//         success: false
//       });
//     }

//     if (!req.session) {
//       console.log('ERROR: No session object found');
//       return res.status(400).json({
//         message: "Session not available. Please verify OTP again.",
//         success: false
//       });
//     }

//     if (!req.session.email) {

//       return res.status(400).json({
//         message: "Session expired. Please verify OTP again.",
//         success: false
//       });
//     }

//     const { email } = req.session; // Get email from session

//     const user = await UserDb.findOne({ email });
//     if (!user) {
//       console.log('ERROR: User not found for email:', email);
//       return res.status(404).json({
//         message: "User not found. Unable to reset password.",
//         success: false
//       });
//     }



//     if (!user.otpVerified) {
//       console.log('ERROR: OTP not verified for user');
//       return res.status(403).json({
//         message: "OTP not verified. Please verify your email first.",
//         success: false
//       });
//     }

//     // Hash and update the password
//     const hashedPassword = await bcrypt.hash(newPassword, 12);
//     user.password = hashedPassword;

//     // Reset OTP fields
//     user.otp = undefined;
//     user.otpExpiration = undefined;
//     user.otpVerified = false;
//     await user.save();

//     console.log('Password reset successful for:', email);

//     // Destroy session only after successful password reset
//     req.session.destroy((err) => {
//       if (err) {
//         console.error('Session destroy error:', err);
//         // Don't return error, password was reset successfully
//       }
//       console.log('Session destroyed after password reset');
//     });

//     res.status(200).json({
//       message: "Your password has been reset successfully!",
//       success: true
//     });
//   } catch (error) {
//     console.error(`[${new Date().toISOString()}] Error in resetPassword route:`, error);
//     res.status(500).json({
//       message: "An error occurred while resetting the password.",
//       success: false
//     });
//   }
// });

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