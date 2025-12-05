/**
 * @swagger
 * /referral-portal/email/withdrawal-request:
 *   post:
 *     summary: Send Withdrawal Request Email to Admin
 *     description: |
 *       Sends an automated email notification to the admin team (info@wwah.ai) when an MBA user requests to withdraw their commission. The email includes complete MBA details, commission information, and request timestamp.
 *       
 *       **Process Flow:**
 *       1. Validates required fields (userId, commissionId)
 *       2. Fetches user data from UserRefDb
 *       3. Fetches commission record associated with user
 *       4. Generates professional HTML email with formatted sections
 *       5. Sends email via Gmail SMTP
 *       6. Returns email confirmation with messageId
 *       
 *       **Email Contents:**
 *       - **MBA Details**: Name, MBA ID, Email
 *       - **Commission Details**: Month, Amount (Rs.), Number of referrals, Status
 *       - **Request Information**: Formatted date and time of request
 *       - **Format**: Both HTML (styled) and plain text versions
 *       
 *       **Email Recipient:**
 *       - To: info@wwah.ai
 *       - From: Configured EMAIL_USER
 *       - Subject: "Withdrawal Request - [MBA Name] ([Month])"
 *     tags:
 *       - Referral Portal
 *       - Email
 *       - Commission
 *       - Withdrawal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - commissionId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: MongoDB ObjectId of the MBA user requesting withdrawal
 *                 example: "507f1f77bcf86cd799439011"
 *               commissionId:
 *                 type: string
 *                 description: MongoDB ObjectId of the commission record
 *                 example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Withdrawal request email sent successfully.
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
 *                   example: "Withdrawal request email sent successfully"
 *                 messageId:
 *                   type: string
 *                   description: Unique email message ID from the mail server
 *                   example: "<abc123@gmail.com>"
 *       400:
 *         description: Bad request - Missing required fields.
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
 *                   example: "User ID and Commission ID are required"
 *       404:
 *         description: Not found - User or commission record not found.
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
 *         description: Internal server error - Email sending failed.
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
 *                   example: "Error sending withdrawal request email"
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: "Connection timeout"
 */

// routes/referralPortal/EmailRoutes.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const UserRefDb = require("../../database/models/refPortal/refuser");
const Commission = require("../../database/models/refPortal/Commission");

// Configure your email transporter (adjust based on your existing setup)
const createTransporter = () => {
  return nodemailer.createTransporter({
    // Use your existing email configuration
    // Example for Gmail:
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your app password
    },
    // Or for custom SMTP:
    // host: process.env.SMTP_HOST,
    // port: process.env.SMTP_PORT,
    // secure: false,
    // auth: {
    //   user: process.env.SMTP_USER,
    //   pass: process.env.SMTP_PASS
    // }
  });
};

// POST /api/refportal/email/withdrawal-request - Send withdrawal request email
router.post("/withdrawal-request", async (req, res) => {
  try {
    const { userId, commissionId } = req.body;

    // Validate required fields
    if (!userId || !commissionId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Commission ID are required",
      });
    }

    // Fetch user data
    const user = await UserRefDb.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch commission data
    const commission = await Commission.findOne({
      _id: commissionId,
      user: userId,
    });
    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission record not found",
      });
    }

    // Create transporter
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: "info@wwah.ai",
      subject: `Withdrawal Request - ${user.firstName} ${user.lastName} (${commission.month})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #d32f2f; margin: 0;">Withdrawal Request Notification</h2>
            <p style="color: #666; margin: 5px 0;">World Wide Admissions Hub</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">MBA Details:</h3>
            <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>MBA ID:</strong> ${user._id}</p>
            <p><strong>Email:</strong> ${user.email || "N/A"}</p>
          </div>
          
          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Commission Details:</h3>
            <p><strong>Month:</strong> ${commission.month}</p>
            <p><strong>Amount Requested:</strong> Rs. ${commission.amount.toLocaleString()}</p>
            <p><strong>Number of Referrals:</strong> ${commission.referrals}</p>
            <p><strong>Status:</strong> ${commission.status}</p>
          </div>
          
          <div style="background-color: #fff3e0; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Request Information:</h3>
            <p><strong>Date of Request:</strong> ${new Date().toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated notification from the Commission Tracking System
            </p>
          </div>
        </div>
      `,
      text: `
        Withdrawal Request Notification
        
        MBA Details:
        Name: ${user.firstName} ${user.lastName}
        MBA ID: ${user._id}
        Email: ${user.email || "N/A"}
        
        Commission Details:
        Month: ${commission.month}
        Amount Requested: Rs. ${commission.amount.toLocaleString()}
        Number of Referrals: ${commission.referrals}
        Status: ${commission.status}
        
        Request Information:
        Date of Request: ${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        
        This is an automated notification from the Commission Tracking System.
      `,
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);

    console.log(
      "Withdrawal request email sent successfully:",
      result.messageId
    );

    res.status(200).json({
      success: true,
      message: "Withdrawal request email sent successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error sending withdrawal request email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending withdrawal request email",
      error: error.message,
    });
  }
});

module.exports = router;
