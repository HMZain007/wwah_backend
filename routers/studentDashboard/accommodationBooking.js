/**
 * @swagger
 * studentDashboard/accommodation:
 *   post:
 *     summary: Submit Accommodation Booking Request
 *     description: Submits an accommodation booking request and sends an email notification to the admin with the booking details. A copy is not sent to the user in this implementation.
 *     tags:
 *       - Accommodation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - country
 *               - university
 *               - city
 *               - accommodationType
 *               - startDate
 *               - distance
 *               - currency
 *               - budgetMin
 *               - budgetMax
 *               - countryCode
 *               - phone
 *               - email
 *             properties:
 *               userName:
 *                 type: string
 *                 description: Name of the user requesting accommodation
 *                 example: "John Doe"
 *               country:
 *                 type: string
 *                 description: Destination country
 *                 example: "United Kingdom"
 *               university:
 *                 type: string
 *                 description: University name
 *                 example: "University of Oxford"
 *               city:
 *                 type: string
 *                 description: City where accommodation is needed
 *                 example: "Oxford"
 *               accommodationType:
 *                 type: string
 *                 description: Type of accommodation preferred
 *                 example: "Student Hall"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Preferred move-in date
 *                 example: "2025-09-01"
 *               distance:
 *                 type: string
 *                 description: Preferred distance from university
 *                 example: "Within 2km"
 *               currency:
 *                 type: string
 *                 description: Currency for budget (e.g., USD, GBP, EUR)
 *                 example: "GBP"
 *               budgetMin:
 *                 type: number
 *                 description: Minimum budget amount
 *                 example: 500
 *               budgetMax:
 *                 type: number
 *                 description: Maximum budget amount
 *                 example: 800
 *               countryCode:
 *                 type: string
 *                 description: Phone country code
 *                 example: "+44"
 *               phone:
 *                 type: string
 *                 description: Phone number without country code
 *                 example: "7700900123"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contact email address
 *                 example: "john.doe@example.com"
 *               preferences:
 *                 type: string
 *                 description: Additional preferences or requirements
 *                 example: "Prefer ground floor, pet-friendly, close to bus stop"
 *     responses:
 *       200:
 *         description: Booking request submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking request submitted successfully"
 *       500:
 *         description: Server error while processing the booking request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error processing booking request"
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: "SMTP connection failed"
 */

const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const formData = req.body;
    console.log("backend : Received form data:", formData);
    let transporter = nodemailer.createTransport({

      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    // Format data for email body
    const emailBodyText = `
      Accommodation Booking Request
      User: ${formData.userName || "Not provided"}
      Country: ${formData.country}
      University: ${formData.university}
      City: ${formData.city}
      Accommodation Type: ${formData.accommodationType}
      Start Date: ${formData.startDate}
      Preferred Distance: ${formData.distance}
      Budget: ${formData.currency} ${formData.budgetMin} - ${formData.budgetMax}
      Contact Information:
      Phone: ${formData.countryCode} ${formData.phone}
      Email: ${formData.email}
      Additional Preferences:
      ${formData.preferences || "None provided"}
    `;

    // Setup email data
    let mailOptions = {
      from: "umberfatimi@gmail.com", // Use your configured email as sender
      to: "info@wwah.ai", // Recipient
      subject: "New Accommodation Booking Request",
      text: emailBodyText,
    };

    // Send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    res.status(200).json({ message: "Booking request submitted successfully" });
  } catch (error) {
    console.error("Error processing booking request:", error);
    res.status(500).json({
      message: "Error processing booking request",
      error: error.message,
    });
  }
});

module.exports = router;
