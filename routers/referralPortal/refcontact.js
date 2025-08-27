const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("Received contact form data:", req.body); // Debug log

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
