// // routers/adminDashboard/mbaData.js
// const express = require("express");
// const UserRefDb = require("../../database/models/refPortal/refuser");
// const authenticateToken = require("../../middlewares/authMiddleware");
// const refAcademicInfo = require("../../database/models/refPortal/refAcademicInfo");
// const refPaymentInformation = require("../../database/models/refPortal/refPaymentInformation");
// const refWorkExperience = require("../../database/models/refPortal/refWorkExperience");
// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const { id } = req.query; // Get user ID from query params

//     if (id) {
//       // Fetch a single referral user by ID
//       const user = await UserRefDb.findById(id);

//       if (!user) {
//         return res.status(404).json({ message: "Referral user not found" });
//       }

//       return res.json({ user }); // Return user object instead of array
//     }

//     // Fetch all referral users when no ID is provided
//     const users = await UserRefDb.find();

//     res.json({ users });
//   } catch (error) {
//     console.error("Error fetching referral users:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
// // Admin route to get any user's profile by ID
// router.get("/user/:id", authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Optional: Add admin authorization check here
//     // if (!req.user.isAdmin) {
//     //   return res.status(403).json({ message: "Access denied. Admin required." });
//     // }

//     const user = await UserRefDb.findById(id).select("-otp -otpExpiration");

//     const AcademmicInfo = await refAcademicInfo.findOne({
//       user: id,
//     });

//     const paymentInfo = await refPaymentInformation.findOne({
//       user: id,
//     });

//     const workExp = await refWorkExperience.findOne({
//       user: id,
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // console.log(user, "user from backend");
//     res.json({ user, AcademmicInfo, paymentInfo, workExp });
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });
// module.exports = router;

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
    const { id } = req.query;
    
    if (id) {
      // Fetch a single referral user by ID with commission data
      const user = await UserRefDb.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Referral user not found" });
      }
      
      // Calculate commission data
      const acceptedReferrals = user.referrals.filter(ref => ref.status === 'accepted').length;
      const totalCommissionEarned = acceptedReferrals * (user.commissionPerReferral || 0);
      
      return res.json({ 
        user: {
          ...user.toObject(),
          acceptedReferrals,
          totalCommissionEarned
        }
      });
    }

    // Fetch all referral users with commission calculations
    const users = await UserRefDb.find();
    const usersWithCommission = users.map(user => {
      const acceptedReferrals = user.referrals.filter(ref => ref.status === 'accepted').length;
      const totalCommissionEarned = acceptedReferrals * (user.commissionPerReferral || 0);
      
      return {
        ...user.toObject(),
        acceptedReferrals,
        totalCommissionEarned
      };
    });
    
    res.json({ users: usersWithCommission });
  } catch (error) {
    console.error("Error fetching referral users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin route to get any user's profile by ID
router.get("/user/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserRefDb.findById(id).select("-otp -otpExpiration");
    const AcademmicInfo = await refAcademicInfo.findOne({ user: id });
    const paymentInfo = await refPaymentInformation.findOne({ user: id });
    const workExp = await refWorkExperience.findOne({ user: id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate commission data
    const acceptedReferrals = user.referrals.filter(ref => ref.status === 'accepted').length;
    const totalCommissionEarned = acceptedReferrals * (user.commissionPerReferral || 0);

    res.json({
      user: {
        ...user.toObject(),
        acceptedReferrals,
        totalCommissionEarned
      },
      AcademmicInfo,
      paymentInfo,
      workExp,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// NEW: Admin route to update commission per referral for a user
router.patch("/user/:id/commission", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionPerReferral } = req.body;

    // Optional: Add admin authorization check
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ message: "Access denied. Admin required." });
    // }

    // Validate commission rate
    if (commissionPerReferral < 0) {
      return res.status(400).json({ message: "Commission rate must be a positive number" });
    }

    const user = await UserRefDb.findByIdAndUpdate(
      id,
      { commissionPerReferral },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate updated commission
    const acceptedReferrals = user.referrals.filter(ref => ref.status === 'accepted').length;
    const totalCommissionEarned = acceptedReferrals * commissionPerReferral;

    res.json({
      message: "Commission rate updated successfully",
      user: {
        ...user.toObject(),
        acceptedReferrals,
        totalCommissionEarned
      }
    });
  } catch (error) {
    console.error("Error updating commission rate:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// NEW: Admin route to get commission summary for all users
router.get("/commission-summary", authenticateToken, async (req, res) => {
  try {
    // Optional: Add admin authorization check
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ message: "Access denied. Admin required." });
    // }

    const users = await UserRefDb.find().select('firstName lastName email referrals commissionPerReferral totalReferrals');
    
    const commissionSummary = users.map(user => {
      const acceptedReferrals = user.referrals.filter(ref => ref.status === 'accepted').length;
      const pendingReferrals = user.referrals.filter(ref => ref.status === 'pending').length;
      const rejectedReferrals = user.referrals.filter(ref => ref.status === 'rejected').length;
      const totalCommissionEarned = acceptedReferrals * (user.commissionPerReferral || 0);
      
      return {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        totalReferrals: user.referrals.length,
        acceptedReferrals,
        pendingReferrals,
        rejectedReferrals,
        commissionPerReferral: user.commissionPerReferral || 0,
        totalCommissionEarned
      };
    });

    // Calculate totals
    const totalCommissionPaid = commissionSummary.reduce((sum, user) => sum + user.totalCommissionEarned, 0);
    const totalAcceptedReferrals = commissionSummary.reduce((sum, user) => sum + user.acceptedReferrals, 0);

    res.json({
      users: commissionSummary,
      summary: {
        totalUsers: users.length,
        totalAcceptedReferrals,
        totalCommissionPaid
      }
    });
  } catch (error) {
    console.error("Error fetching commission summary:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;