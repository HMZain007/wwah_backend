const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
env = require("dotenv").config();

router.post("/", async (req, res) => {
  const {
    name,
    email,
    phone,
    date,
    fromTime,
    toTime,
    country,
    meetingType,
    studyDestination,
    degree,
    major,
    budget,
  } = req.body;

  console.log(req.body);

  // Validate required fields
  if (
    !name ||
    !email ||
    !phone ||
    !date ||
    !fromTime ||
    !toTime ||
    !country ||
    !meetingType ||
    !studyDestination ||
    !degree ||
    !major ||
    !budget
  ) {
    return res.status(400).json({
      error: "All fields are required",
      success: false,
    });
  }

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: email, // Use your configured email as sender
    replyTo: email, // Set reply-to as the user's email
    to: "info@worldwideadmissionshub.com", // Recipient
    subject: "New Session Scheduling Request",
    html: `
      <h2>New Session Scheduling Request</h2>
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h3>Personal Information:</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Country:</strong> ${country}</p>
        
        <h3>Session Details:</h3>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${fromTime} - ${toTime}</p>
        <p><strong>Meeting Type:</strong> ${meetingType}</p>
        
        <h3>Study Preferences:</h3>
        <p><strong>Preferred Study Destination:</strong> ${studyDestination}</p>
        <p><strong>Preferred Degree:</strong> ${degree}</p>
        <p><strong>Preferred Major:</strong> ${major}</p>
        <p><strong>Budget:</strong> $${budget}</p>
      </div>
    `,
    text: `
New Session Scheduling Request

Personal Information:
Name: ${name}
Email: ${email}
Phone: ${phone}
Country: ${country}

Session Details:
Date: ${date}
Time: ${fromTime} - ${toTime}
Meeting Type: ${meetingType}

Study Preferences:
Preferred Study Destination: ${studyDestination}
Preferred Degree: ${degree}
Preferred Major: ${major}
Budget: $${budget}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Session scheduling email sent successfully");

    res.status(200).json({
      message: "Session scheduled successfully! We will contact you soon.",
      success: true,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      error: "Error scheduling session. Please try again later.",
      success: false,
    });
  }
});

module.exports = router;