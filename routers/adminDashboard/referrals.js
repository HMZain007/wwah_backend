// // routers/adminDashboard/referrals.js
// const express = require("express");
// const authenticateToken = require("../../middlewares/authMiddleware");
// const UserRefDb = require("../../database/models/refPortal/refuser");
// const router = express.Router();

// // Update referral status
// router.patch("/update-status", authenticateToken, async (req, res) => {
//   try {
//     const { userId, referralId, status } = req.body;

//     // Validation
//     if (!userId || !referralId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: "userId, referralId, and status are required",
//       });
//     }

//     if (!["accepted", "pending", "rejected"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status. Must be accepted, pending, or rejected",
//       });
//     }

//     // Find the user and update the specific referral status
//     const result = await UserRefDb.updateOne(
//       {
//         _id: userId,
//         "referrals.id": referralId,
//       },
//       {
//         $set: {
//           "referrals.$.status": status,
//         },
//       }
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User or referral not found",
//       });
//     }

//     if (result.modifiedCount === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Referral status was already set to this value",
//       });
//     }

//     console.log(
//       `Admin updated referral ${referralId} status to ${status} for user ${userId}`
//     );

//     res.json({
//       success: true,
//       message: `Referral status updated to ${status} successfully`,
//       data: {
//         userId,
//         referralId,
//         newStatus: status,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating referral status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// });

// // Get current user's referral statistics
// router.get("/my-statistics", authenticateToken, async (req, res) => {
//   try {
//     const currentUserId = req.user.id; // Get current user ID from auth token
//     console.log(currentUserId, "currentUserId");
//     // Find the current user and their referrals
//     const currentUser = await UserRefDb.findById(currentUserId);

//     if (!currentUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const userReferrals = currentUser.referrals || [];

//     // Calculate statistics for current user's referrals
//     const totalReferrals = userReferrals.length;
//     const pending = userReferrals.filter(
//       (ref) => ref.status === "pending"
//     ).length;
//     const approved = userReferrals.filter(
//       (ref) => ref.status === "accepted"
//     ).length;
//     const rejected = userReferrals.filter(
//       (ref) => ref.status === "rejected"
//     ).length;

//     const formattedStats = {
//       totalReferrals,
//       pending,
//       approved,
//       rejected,
//       totalCommissionEarned: approved, // Assuming 1 commission per accepted referral
//     };

//     res.json({
//       success: true,
//       data: formattedStats,
//     });
//   } catch (error) {
//     console.error("Error fetching user referral statistics:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// });

// // Get current user's referrals only
// router.get("/my-referrals", authenticateToken, async (req, res) => {
//   try {
//     const currentUserId = req.user.id; // Get current user ID from auth token
//     const { status, page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * limit;

//     // Find the current user
//     const currentUser = await UserRefDb.findById(currentUserId);

//     if (!currentUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     let userReferrals = currentUser.referrals || [];

//     // Filter by status if provided
//     if (status && ["pending", "accepted", "rejected"].includes(status)) {
//       userReferrals = userReferrals.filter((ref) => ref.status === status);
//     }

//     // Sort by creation date (newest first)
//     userReferrals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     // Apply pagination
//     const total = userReferrals.length;
//     const paginatedReferrals = userReferrals.slice(
//       skip,
//       skip + parseInt(limit)
//     );

//     // Transform data for frontend
//     const transformedReferrals = paginatedReferrals.map((referral) => ({
//       referrerId: currentUserId,
//       referrerName: `${currentUser.firstName} ${currentUser.lastName}`,
//       referrerEmail: currentUser.email,
//       referral: {
//         id: referral.id,
//         firstName: referral.firstName,
//         lastName: referral.lastName,
//         profilePicture: referral.profilePicture,
//         status: referral.status,
//         createdAt: referral.createdAt,
//       },
//     }));

//     res.json({
//       success: true,
//       data: {
//         referrerName: `${currentUser.firstName} ${currentUser.lastName}`, // Always include referrer name
//         referrals: transformedReferrals,
//         pagination: {
//           current: parseInt(page),
//           limit: parseInt(limit),
//           total: total,
//           pages: Math.ceil(total / limit),
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching user referrals:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// });
// // Get referral statistics for dashboard (Admin - all users)
// router.get("/statistics", async (req, res) => {
//   try {
//     // Optional: Add admin authorization check
//     // if (!req.user.isAdmin) {
//     //   return res.status(403).json({ message: "Access denied. Admin required." });
//     // }

//     const pipeline = [
//       // Unwind the referrals array to work with individual referrals
//       { $unwind: { path: "$referrals", preserveNullAndEmptyArrays: false } },

//       // Group by status and count
//       {
//         $group: {
//           _id: "$referrals.status",
//           count: { $sum: 1 },
//           referrals: {
//             $push: {
//               referrerId: "$_id",
//               referrerName: { $concat: ["$firstName", " ", "$lastName"] },
//               referralId: "$referrals.id",
//               referralName: {
//                 $concat: ["$referrals.firstName", " ", "$referrals.lastName"],
//               },
//               createdAt: "$referrals.createdAt",
//             },
//           },
//         },
//       },
//     ];

//     const statistics = await UserRefDb.aggregate(pipeline);

//     // Get total signups (users with referrals)
//     const totalSignups = await UserRefDb.countDocuments({
//       referrals: { $exists: true, $ne: [] },
//     });

//     // Calculate total referrals across all users
//     const totalReferralsResult = await UserRefDb.aggregate([
//       { $unwind: { path: "$referrals", preserveNullAndEmptyArrays: false } },
//       { $count: "totalReferrals" },
//     ]);

//     const totalReferrals = totalReferralsResult[0]?.totalReferrals || 0;

//     // Format the response to match your dashboard structure
//     const formattedStats = {
//       totalSignups,
//       totalReferrals,
//       pending: statistics.find((stat) => stat._id === "pending")?.count || 0,
//       approved: statistics.find((stat) => stat._id === "accepted")?.count || 0,
//       rejected: statistics.find((stat) => stat._id === "rejected")?.count || 0,
//       totalCommissionEarned:
//         statistics.find((stat) => stat._id === "accepted")?.count || 0, // Assuming 1 commission per accepted referral
//       breakdown: statistics,
//     };

//     res.json({
//       success: true,
//       data: formattedStats,
//     });
//   } catch (error) {
//     console.error("Error fetching referral statistics:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// });

// // Get all referrals across all users (for admin overview)
// router.get("/all", async (req, res) => {
//   try {
//     const { status, page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * limit;

//     let matchStage = {};
//     if (status && ["pending", "accepted", "rejected"].includes(status)) {
//       matchStage = { "referrals.status": status };
//     }

//     const pipeline = [
//       { $match: { referrals: { $exists: true, $ne: [] } } },
//       { $unwind: "$referrals" },
//       ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
//       {
//         $project: {
//           referrerId: "$_id",
//           referrerName: { $concat: ["$firstName", " ", "$lastName"] },
//           referrerEmail: "$email",
//           referral: {
//             id: "$referrals.id",
//             firstName: "$referrals.firstName",
//             lastName: "$referrals.lastName",
//             profilePicture: "$referrals.profilePicture",
//             status: "$referrals.status",
//             createdAt: "$referrals.createdAt",
//           },
//         },
//       },
//       { $sort: { "referral.createdAt": -1 } },
//       { $skip: parseInt(skip) },
//       { $limit: parseInt(limit) },
//     ];

//     const referrals = await UserRefDb.aggregate(pipeline);
//     const total = await UserRefDb.aggregate([
//       { $match: { referrals: { $exists: true, $ne: [] } } },
//       { $unwind: "$referrals" },
//       ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
//       { $count: "total" },
//     ]);

//     res.json({
//       success: true,
//       data: {
//         referrals,
//         pagination: {
//           current: parseInt(page),
//           limit: parseInt(limit),
//           total: total[0]?.total || 0,
//           pages: Math.ceil((total[0]?.total || 0) / limit),
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching all referrals:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// });

// module.exports = router;
// routers/adminDashboard/referrals.js
const express = require("express");
const authenticateToken = require("../../middlewares/authMiddleware");
const UserRefDb = require("../../database/models/refPortal/refuser");
const router = express.Router();

// Update referral status
router.patch("/update-status", authenticateToken, async (req, res) => {
  try {
    const { userId, referralId, status } = req.body;

    // Validation
    if (!userId || !referralId || !status) {
      return res.status(400).json({
        success: false,
        message: "userId, referralId, and status are required",
      });
    }

    if (!["accepted", "pending", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be accepted, pending, or rejected",
      });
    }

    // Find the user and update the specific referral status
    const result = await UserRefDb.updateOne(
      {
        _id: userId,
        "referrals.id": referralId,
      },
      {
        $set: {
          "referrals.$.status": status,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User or referral not found",
      });
    }

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Referral status was already set to this value",
      });
    }

    console.log(
      `Admin updated referral ${referralId} status to ${status} for user ${userId}`
    );

    res.json({
      success: true,
      message: `Referral status updated to ${status} successfully`,
      data: {
        userId,
        referralId,
        newStatus: status,
      },
    });
  } catch (error) {
    console.error("Error updating referral status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get current user's referral statistics with commission calculation
router.get("/my-statistics", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    console.log(currentUserId, "currentUserId");
    
    // Find the current user and their referrals
    const currentUser = await UserRefDb.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userReferrals = currentUser.referrals || [];

    // Calculate statistics for current user's referrals
    const totalReferrals = userReferrals.length;
    const pending = userReferrals.filter(
      (ref) => ref.status === "pending"
    ).length;
    const approved = userReferrals.filter(
      (ref) => ref.status === "accepted"
    ).length;
    const rejected = userReferrals.filter(
      (ref) => ref.status === "rejected"
    ).length;

    // Calculate total commission earned (approved referrals × commission per referral)
    const commissionPerReferral = currentUser.commissionPerReferral || 0;
    const totalCommissionEarned = approved * commissionPerReferral;

    const formattedStats = {
      totalReferrals,
      pending,
      approved,
      rejected,
      commissionPerReferral,
      totalCommissionEarned,
      currency: "PKR", // Pakistani Rupees
    };

    res.json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Error fetching user referral statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get current user's referrals only
router.get("/my-referrals", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find the current user
    const currentUser = await UserRefDb.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let userReferrals = currentUser.referrals || [];

    // Filter by status if provided
    if (status && ["pending", "accepted", "rejected"].includes(status)) {
      userReferrals = userReferrals.filter((ref) => ref.status === status);
    }

    // Sort by creation date (newest first)
    userReferrals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const total = userReferrals.length;
    const paginatedReferrals = userReferrals.slice(
      skip,
      skip + parseInt(limit)
    );

    // Transform data for frontend
    const transformedReferrals = paginatedReferrals.map((referral) => ({
      referrerId: currentUserId,
      referrerName: `${currentUser.firstName} ${currentUser.lastName}`,
      referrerEmail: currentUser.email,
      referral: {
        id: referral.id,
        firstName: referral.firstName,
        lastName: referral.lastName,
        profilePicture: referral.profilePicture,
        status: referral.status,
        createdAt: referral.createdAt,
      },
    }));

    // Calculate commission data
    const commissionPerReferral = currentUser.commissionPerReferral || 0;
    const approvedCount = userReferrals.filter(ref => ref.status === "accepted").length;
    const totalCommissionEarned = approvedCount * commissionPerReferral;

    res.json({
      success: true,
      data: {
        referrerName: `${currentUser.firstName} ${currentUser.lastName}`,
        referrals: transformedReferrals,
        commissionData: {
          commissionPerReferral,
          totalCommissionEarned,
          currency: "PKR",
        },
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user referrals:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get referral statistics for dashboard (Admin - all users)
router.get("/statistics", async (req, res) => {
  try {
    // Optional: Add admin authorization check
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ message: "Access denied. Admin required." });
    // }

    const pipeline = [
      // Unwind the referrals array to work with individual referrals
      { $unwind: { path: "$referrals", preserveNullAndEmptyArrays: false } },

      // Group by status and count
      {
        $group: {
          _id: "$referrals.status",
          count: { $sum: 1 },
          referrals: {
            $push: {
              referrerId: "$_id",
              referrerName: { $concat: ["$firstName", " ", "$lastName"] },
              referralId: "$referrals.id",
              referralName: {
                $concat: ["$referrals.firstName", " ", "$referrals.lastName"],
              },
              createdAt: "$referrals.createdAt",
            },
          },
        },
      },
    ];

    const statistics = await UserRefDb.aggregate(pipeline);

    // Get total signups (users with referrals)
    const totalSignups = await UserRefDb.countDocuments({
      referrals: { $exists: true, $ne: [] },
    });

    // Calculate total referrals across all users
    const totalReferralsResult = await UserRefDb.aggregate([
      { $unwind: { path: "$referrals", preserveNullAndEmptyArrays: false } },
      { $count: "totalReferrals" },
    ]);

    const totalReferrals = totalReferralsResult[0]?.totalReferrals || 0;

    // Calculate total commission earned across all users
    const commissionResult = await UserRefDb.aggregate([
      { $unwind: { path: "$referrals", preserveNullAndEmptyArrays: false } },
      { $match: { "referrals.status": "accepted" } },
      {
        $group: {
          _id: "$_id",
          acceptedCount: { $sum: 1 },
          commissionRate: { $first: { $ifNull: ["$commissionPerReferral", 0] } },
        },
      },
      {
        $project: {
          userCommission: { $multiply: ["$acceptedCount", "$commissionRate"] },
        },
      },
      {
        $group: {
          _id: null,
          totalCommissionEarned: { $sum: "$userCommission" },
        },
      },
    ]);

    const totalCommissionEarned = commissionResult[0]?.totalCommissionEarned || 0;

    // Format the response to match your dashboard structure
    const formattedStats = {
      totalSignups,
      totalReferrals,
      pending: statistics.find((stat) => stat._id === "pending")?.count || 0,
      approved: statistics.find((stat) => stat._id === "accepted")?.count || 0,
      rejected: statistics.find((stat) => stat._id === "rejected")?.count || 0,
      totalCommissionEarned,
      currency: "PKR",
      breakdown: statistics,
    };

    res.json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Error fetching referral statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all referrals across all users (for admin overview)
router.get("/all", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let matchStage = {};
    if (status && ["pending", "accepted", "rejected"].includes(status)) {
      matchStage = { "referrals.status": status };
    }

    const pipeline = [
      { $match: { referrals: { $exists: true, $ne: [] } } },
      { $unwind: "$referrals" },
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $project: {
          referrerId: "$_id",
          referrerName: { $concat: ["$firstName", " ", "$lastName"] },
          referrerEmail: "$email",
          commissionPerReferral: { $ifNull: ["$commissionPerReferral", 0] },
          referral: {
            id: "$referrals.id",
            firstName: "$referrals.firstName",
            lastName: "$referrals.lastName",
            profilePicture: "$referrals.profilePicture",
            status: "$referrals.status",
            createdAt: "$referrals.createdAt",
          },
        },
      },
      { $sort: { "referral.createdAt": -1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
    ];

    const referrals = await UserRefDb.aggregate(pipeline);
    const total = await UserRefDb.aggregate([
      { $match: { referrals: { $exists: true, $ne: [] } } },
      { $unwind: "$referrals" },
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      { $count: "total" },
    ]);

    res.json({
      success: true,
      data: {
        referrals,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total: total[0]?.total || 0,
          pages: Math.ceil((total[0]?.total || 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all referrals:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;