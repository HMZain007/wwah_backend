const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Commission = require("../../database/models/refPortal/Commission");
const UserRefDb = require("../../database/models/refPortal/refuser");

// ======================
// 🔹 Utility: Send Email
// ======================
// const sendWithdrawalEmail = async (user, commission) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
//       to: "info@wwah.ai",
//       subject: `Withdrawal Request - ${user.firstName} ${user.lastName} (${commission.month})`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding: 20px; border:1px solid #ddd; border-radius:8px;">
//           <h2 style="color:#D32F2F; text-align:center;">Withdrawal Request Notification</h2>
//           <p style="text-align:center; color:#666;">World Wide Admissions Hub</p>
//           <hr />
//           <h3>MBA Details:</h3>
//           <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
//           <p><strong>MBA ID:</strong> ${user._id}</p>
//           <p><strong>Email:</strong> ${user.email || "N/A"}</p>
//           <h3>Commission Details:</h3>
//           <p><strong>Month:</strong> ${commission.month}</p>
//           <p><strong>Amount Requested:</strong> Rs. ${commission.amount.toLocaleString()}</p>
//           <p><strong>Referrals:</strong> ${commission.referrals}</p>
//           <p><strong>Status:</strong> ${commission.status}</p>
//           <h3>Request Info:</h3>
//           <p><strong>Date:</strong> ${new Date().toLocaleString("en-US", {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//           })}</p>
//         </div>
//       `,
//     };

//     const result = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent:", result.messageId);
//     return { success: true };
//   } catch (error) {
//     console.error("❌ Email error:", error.message);
//     return { success: false, error: error.message };
//   }
// };

// ======================
// 🔹 Middleware: Verify User
// ======================
const verifyUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const user = await UserRefDb.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Verify User Error:", error.message);
    res.status(500).json({ success: false, message: "Error verifying user" });
  }
};
// ======================
// 🔹 GET: All Commissions
// ======================
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ success: false, message: "Invalid userId" });

    const commissions = await Commission.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: commissions  , message : "Put function added"});
  } catch (error) {
    console.error("❌ Fetch Commissions Error:", error.message);
    res.status(500).json({ success: false, message: "Error fetching commissions" });
  }
});

// ======================
// 🔹 POST: Create Commission
// ======================
router.post("/:userId", verifyUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, referrals, amount, status } = req.body;

    // Validation
    if (!month || referrals == null || amount == null || !status)
      return res.status(400).json({ success: false, message: "All fields required" });

    if (typeof referrals !== "number" || typeof amount !== "number" || referrals < 0 || amount < 0)
      return res.status(400).json({ success: false, message: "Referrals & amount must be positive numbers" });

    if (!["Paid", "Pending", "Requested"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status value" });

    const exists = await Commission.exists({ user: userId, month });
    if (exists)
      return res.status(400).json({ success: false, message: "Commission for this month already exists" });

    const savedCommission = await Commission.create({ user: userId, month, referrals, amount, status });
    res.status(201).json({ success: true, message: "Commission created", data: savedCommission });
  } catch (error) {
    console.error("❌ Create Commission Error:", error.message);
    res.status(500).json({ success: false, message: "Error creating commission" });
  }
});

// ======================
// 🔹 PUT: Update Commission
// ======================
router.put("/:userId/:commissionId", verifyUser, async (req, res) => {
  try {
    const { userId, commissionId } = req.params;
    const { month, referrals, amount, status } = req.body;

    const commission = await Commission.findOne({ _id: commissionId, user: userId });
    if (!commission)
      return res.status(404).json({ success: false, message: "Commission record not found" });

    const isWithdrawalRequest = commission.status === "Pending" && status === "Requested";

    // Check for duplicate month if updated
    if (month && month !== commission.month) {
      const exists = await Commission.exists({ user: userId, month, _id: { $ne: commissionId } });
      if (exists)
        return res.status(400).json({ success: false, message: "Commission for this month already exists" });
    }

    const updates = {
      ...(month && { month }),
      ...(referrals >= 0 && { referrals }),
      ...(amount >= 0 && { amount }),
      ...(status && { status }),
    };

    const updated = await Commission.findByIdAndUpdate(commissionId, updates, {
      new: true,
      runValidators: true,
    });

    if (isWithdrawalRequest) {
      console.log("📧 Sending withdrawal request email...");
      await sendWithdrawalEmail(req.user, updated);
    }

    res.status(200).json({ success: true, message: "Commission updated", data: updated });
  } catch (error) {
    console.error("❌ Update Commission Error:", error.message);
    res.status(500).json({ success: false, message: "Error updating commission" });
  }
});

// ======================
// 🔹 DELETE: Commission
// ======================
// router.delete("/:userId/:commissionId", verifyUser, async (req, res) => {
//   try {
//     const { userId, commissionId } = req.params;
//     const commission = await Commission.findOneAndDelete({ _id: commissionId, user: userId });

//     if (!commission)
//       return res.status(404).json({ success: false, message: "Commission not found" });

//     res.status(200).json({ success: true, message: "Commission deleted successfully" });
//   } catch (error) {
//     console.error("❌ Delete Commission Error:", error.message);
//     res.status(500).json({ success: false, message: "Error deleting commission" });
//   }
// });

module.exports = router;
