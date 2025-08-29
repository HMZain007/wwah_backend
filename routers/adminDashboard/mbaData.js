// routers/adminDashboard/mbaData.js
const express = require("express");
const UserRefDb = require("../../database/models/refPortal/refuser");
const authenticateToken = require("../../middlewares/authMiddleware");
const refAcademicInfo = require("../../database/models/refPortal/refAcademicInfo");
const refPaymentInformation = require("../../database/models/refPortal/refPaymentInformation");
const refWorkExperience = require("../../database/models/refPortal/refWorkExperience");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { id } = req.query; // Get user ID from query params

    if (id) {
      // Fetch a single referral user by ID
      const user = await UserRefDb.findById(id);

      if (!user) {
        return res.status(404).json({ message: "Referral user not found" });
      }

      return res.json({ user }); // Return user object instead of array
    }

    // Fetch all referral users when no ID is provided
    const users = await UserRefDb.find();

    res.json({ users });
  } catch (error) {
    console.error("Error fetching referral users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Admin route to get any user's profile by ID
router.get("/user/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Optional: Add admin authorization check here
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ message: "Access denied. Admin required." });
    // }

    const user = await UserRefDb.findById(id).select("-otp -otpExpiration");
    
    const AcademmicInfo = await refAcademicInfo.findOne({
      user: id,
    });
    
    const paymentInfo = await refPaymentInformation.findOne({
      user: id,
    });
    
    const workExp = await refWorkExperience.findOne({
      user: id,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user, AcademmicInfo, paymentInfo, workExp });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
module.exports = router;


// Get users by provider (local, google, etc.)
// router.get("/by-provider", async (req, res) => {
//   try {
//     const { provider } = req.query;

//     if (!provider) {
//       return res.status(400).json({ message: "Provider is required" });
//     }

//     const users = await UserRefDb.find({ provider });
//     res.json({ users });
//   } catch (error) {
//     console.error("Error fetching users by provider:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Get users by verification status
// router.get("/by-verification", async (req, res) => {
//   try {
//     const { verified } = req.query; // true/false

//     const isVerified = verified === "true";
//     const users = await UserRefDb.find({ isVerified });

//     res.json({ users });
//   } catch (error) {
//     console.error("Error fetching users by verification status:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Get users with referral codes (for referral program)
// router.get("/with-referrals", async (req, res) => {
//   try {
//     const users = await UserRefDb.find({
//       referralCode: { $exists: true, $ne: null },
//       totalReferrals: { $gt: 0 },
//     }).select("firstName lastName email referralCode totalReferrals");

//     res.json({ users });
//   } catch (error) {
//     console.error("Error fetching users with referrals:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Get user by referral code
// router.get("/by-referral-code", async (req, res) => {
//   try {
//     const { referralCode } = req.query;

//     if (!referralCode) {
//       return res.status(400).json({ message: "Referral code is required" });
//     }

//     const user = await UserRefDb.findOne({ referralCode });

//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: "User with this referral code not found" });
//     }

//     res.json({ user });
//   } catch (error) {
//     console.error("Error fetching user by referral code:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });