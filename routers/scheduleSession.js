const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

env = require("dotenv").config();

router.post("/", async (req, res) => {
  const { name, email, phone, date, fromTime, toTime, message } = req.body;
  console.log(req.body);

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  let mailOptions = {
    // from: process.env.EMAIL_USER, // Sender email address
    // to: "chillpills313@gmail.com", // Recipient email
    from: "umberfatimi@gmail.com", // Use your configured email as sender
    to: "info@worldwideadmissionshub.com", // Recipient
    subject: "New Session Scheduling Request",
    text: `Name: ${name}
           Email: ${email}
Phone: ${phone}
Date: ${date}
Time: ${fromTime} - ${toTime}
Message: ${message || "No message provided."}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Done");

    res.status(200).json({ message: "Email sent successfully", success: true });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error sending email: " + error.message,
        success: false,
      });
  }
});

module.exports = router;
