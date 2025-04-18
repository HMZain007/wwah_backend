const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const formData = req.body;
    console.log("backend : Received form data:", formData );
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
      to: "info@worldwideadmissionshub.com", // Recipient
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
