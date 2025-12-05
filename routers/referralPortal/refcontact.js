/**
 * @swagger
 * /referralPortal/contact:
 *   post:
 *     summary: Submit Contact Form
 *     description: Sends a contact form submission email to the admin team at info@worldwideadmissionshub.com. This endpoint allows users to send inquiries, feedback, or support requests.
 *     tags:
 *       - Contact
 *       - Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the person submitting the form
 *                 example: "John Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the person submitting the form
 *                 example: "john.smith@example.com"
 *               contactNo:
 *                 type: string
 *                 description: Contact number (optional)
 *                 example: "+1 555-123-4567"
 *               message:
 *                 type: string
 *                 description: Message content from the user
 *                 example: "I would like to inquire about admission requirements for international students."
 *     responses:
 *       200:
 *         description: Email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email sent successfully"
 *                 succes:
 *                   type: boolean
 *                   description: Note - This is intentionally misspelled as 'succes' in the actual response
 *                   example: true
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
 *                   example: "Name, Email and Message are required"
 *       500:
 *         description: Internal server error - Failed to send email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error sending email: Connection timeout"
 *                 succes:
 *                   type: boolean
 *                   description: Note - This is intentionally misspelled as 'succes' in the actual response (should likely be false)
 *                   example: true
 */

const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/", async (req, res) => {
  // console.log("Received contact form data:", req.body); // Debug log

  const { name, email, contactNo, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, Email and Message are required",
    });
  }

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  // Setup email data
  let mailOptions = {
    from: `${email}`, // sender address
    to: "info@worldwideadmissionshub.com", // Recipient
    subject: "Contact Us Form Submission", // Subject line
    text: `Name: ${name} ${email} \nMessage: ${message}`, // plain text body
  };

  // Send mail with defined transport object
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully", succes: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending email: " + error.message, succes: true });
  }
});

module.exports = router;
