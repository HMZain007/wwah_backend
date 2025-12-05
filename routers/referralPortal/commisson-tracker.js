/**
 * @swagger
 * /referral-portal/commission/{userId}:
 *   get:
 *     summary: Get All Commissions for User
 *     description: |
 *       Retrieves all commission records for a specific MBA user, sorted by creation date (newest first). Returns an empty array if no commissions exist.
 *       
 *       **Features:**
 *       - Validates MongoDB ObjectId format
 *       - Returns commissions sorted by createdAt in descending order
 *       - No pagination (returns all records)
 *     tags:
 *       - Referral Portal
 *       - Commission
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the MBA user
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Commission records retrieved successfully (may be empty array).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439012"
 *                       user:
 *                         type: string
 *                         description: Reference to MBA user ObjectId
 *                         example: "507f1f77bcf86cd799439011"
 *                       month:
 *                         type: string
 *                         description: Month identifier (e.g., "January 2024")
 *                         example: "January 2024"
 *                       referrals:
 *                         type: number
 *                         description: Number of successful referrals
 *                         example: 5
 *                       amount:
 *                         type: number
 *                         description: Commission amount in Pakistani Rupees
 *                         example: 25000
 *                       status:
 *                         type: string
 *                         enum: [Paid, Pending, Requested]
 *                         example: "Pending"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request - Invalid userId format.
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
 *                   example: "Invalid userId"
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
 *                   example: "Error fetching commission data"
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /referral-portal/commission/{userId}:
 *   post:
 *     summary: Create New Commission Record
 *     description: |
 *       Creates a new commission record for an MBA user. Validates that the user exists and that no duplicate commission exists for the specified month.
 *       
 *       **Validation Rules:**
 *       - All fields are required
 *       - Referrals and amount must be positive numbers
 *       - Status must be one of: "Paid", "Pending", "Requested"
 *       - Month must be unique per user (no duplicates)
 *       - User must exist in database
 *       
 *       **Uses Middleware:**
 *       - verifyUser: Validates userId and checks user existence
 *     tags:
 *       - Referral Portal
 *       - Commission
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the MBA user
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - month
 *               - referrals
 *               - amount
 *               - status
 *             properties:
 *               month:
 *                 type: string
 *                 description: Month identifier (must be unique per user)
 *                 example: "January 2024"
 *               referrals:
 *                 type: number
 *                 description: Number of successful referrals (must be >= 0)
 *                 example: 5
 *                 minimum: 0
 *               amount:
 *                 type: number
 *                 description: Commission amount in Pakistani Rupees (must be >= 0)
 *                 example: 25000
 *                 minimum: 0
 *               status:
 *                 type: string
 *                 enum: [Paid, Pending, Requested]
 *                 description: Commission payment status
 *                 example: "Pending"
 *     responses:
 *       201:
 *         description: Commission created successfully.
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
 *                   example: "Commission created"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     user:
 *                       type: string
 *                     month:
 *                       type: string
 *                     referrals:
 *                       type: number
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Validation error.
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
 *                   enum:
 *                     - "Invalid userId"
 *                     - "All fields required"
 *                     - "Referrals & amount must be positive numbers"
 *                     - "Invalid status value"
 *                     - "Commission for this month already exists"
 *                   example: "Commission for this month already exists"
 *       404:
 *         description: User not found.
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
 *                   example: "User not found"
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
 *                   example: "Error creating commission"
 */

/**
 * @swagger
 * /referral-portal/commission/{userId}/{commissionId}:
 *   put:
 *     summary: Update Commission Record
 *     description: |
 *       Updates an existing commission record. When status changes from "Pending" to "Requested", automatically sends a withdrawal request email to admin (info@wwah.ai).
 *       
 *       **Special Behavior:**
 *       - Status change Pending → Requested triggers withdrawal email notification
 *       - Email includes MBA details, commission info, and request timestamp
 *       - Month uniqueness validated if month is being updated
 *       - Only updates fields that are provided (partial updates supported)
 *       
 *       **Validation Rules:**
 *       - Commission must exist and belong to specified user
 *       - If updating month, new month must be unique for this user
 *       - Referrals and amount must be >= 0 if provided
 *       - Status must be valid enum value if provided
 *       
 *       **Uses Middleware:**
 *       - verifyUser: Validates userId and loads user data for email
 *     tags:
 *       - Referral Portal
 *       - Commission
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the MBA user
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: commissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the commission record
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *                 description: Month identifier (must be unique if changed)
 *                 example: "February 2024"
 *               referrals:
 *                 type: number
 *                 description: Number of successful referrals (must be >= 0)
 *                 example: 7
 *                 minimum: 0
 *               amount:
 *                 type: number
 *                 description: Commission amount in Pakistani Rupees (must be >= 0)
 *                 example: 35000
 *                 minimum: 0
 *               status:
 *                 type: string
 *                 enum: [Paid, Pending, Requested]
 *                 description: Commission payment status (Pending → Requested triggers email)
 *                 example: "Requested"
 *     responses:
 *       200:
 *         description: Commission updated successfully. Email sent if withdrawal requested.
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
 *                   example: "Commission updated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     user:
 *                       type: string
 *                     month:
 *                       type: string
 *                     referrals:
 *                       type: number
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Validation error or duplicate month.
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
 *                   enum:
 *                     - "Invalid userId"
 *                     - "Commission for this month already exists"
 *                   example: "Commission for this month already exists"
 *       404:
 *         description: Commission record not found or doesn't belong to user.
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
 *                   enum:
 *                     - "User not found"
 *                     - "Commission record not found"
 *                   example: "Commission record not found"
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
 *                   example: "Error updating commission"
 */

/**
 * @swagger
 * /referral-portal/commission/{userId}/{commissionId}:
 *   delete:
 *     summary: Delete Commission Record
 *     description: |
 *       Permanently deletes a commission record. Validates that the commission exists and belongs to the specified user before deletion.
 *       
 *       **Security:**
 *       - Validates userId format and existence
 *       - Ensures commission belongs to specified user (prevents unauthorized deletion)
 *       
 *       **Uses Middleware:**
 *       - verifyUser: Validates userId and checks user existence
 *     tags:
 *       - Referral Portal
 *       - Commission
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the MBA user
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: commissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the commission record to delete
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Commission deleted successfully.
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
 *                   example: "Commission deleted successfully"
 *       400:
 *         description: Bad request - Invalid userId format.
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
 *                   example: "Invalid userId"
 *       404:
 *         description: Commission not found or doesn't belong to user.
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
 *                   enum:
 *                     - "User not found"
 *                     - "Commission not found"
 *                   example: "Commission not found"
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
 *                   example: "Error deleting commission"
 */
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Commission = require("../../database/models/refPortal/Commission");
const UserRefDb = require("../../database/models/refPortal/refuser");

// ======================
// 🔹 Utility: Send Email
// ======================
const sendWithdrawalEmail = async (user, commission) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: "info@wwah.ai",
      subject: `Withdrawal Request - ${user.firstName} ${user.lastName} (${commission.month})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding: 20px; border:1px solid #ddd; border-radius:8px;">
          <h2 style="color:#D32F2F; text-align:center;">Withdrawal Request Notification</h2>
          <p style="text-align:center; color:#666;">World Wide Admissions Hub</p>
          <hr />
          <h3>MBA Details:</h3>
          <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
          <p><strong>MBA ID:</strong> ${user._id}</p>
          <p><strong>Email:</strong> ${user.email || "N/A"}</p>
          <h3>Commission Details:</h3>
          <p><strong>Month:</strong> ${commission.month}</p>
          <p><strong>Amount Requested:</strong> Rs. ${commission.amount.toLocaleString()}</p>
          <p><strong>Referrals:</strong> ${commission.referrals}</p>
          <p><strong>Status:</strong> ${commission.status}</p>
          <h3>Request Info:</h3>
          <p><strong>Date:</strong> ${new Date().toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", result.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Email error:", error.message);
    return { success: false, error: error.message };
  }
};

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
        // console.log("Fetching commissions for userId:", userId);
    
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          console.error("Invalid ObjectId:", userId);
          return res.status(400).json({
            success: false,
            message: "Invalid userId",
          });
        }
    
        const commissions = await Commission.find({ user: userId }).sort({ createdAt: -1 });
        // console.log("Found commissions:", commissions.length);
    
        res.status(200).json({ success: true, data: commissions });
      } catch (error) {
        console.error("Error fetching commissions:", error);
        res.status(500).json({
          success: false,
          message: "Error fetching commission data",
          error: error.message,
        });
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
router.delete("/:userId/:commissionId", verifyUser, async (req, res) => {
  try {
    const { userId, commissionId } = req.params;
    const commission = await Commission.findOneAndDelete({ _id: commissionId, user: userId });

    if (!commission)
      return res.status(404).json({ success: false, message: "Commission not found" });

    res.status(200).json({ success: true, message: "Commission deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Commission Error:", error.message);
    res.status(500).json({ success: false, message: "Error deleting commission" });
  }
});

module.exports = router;
