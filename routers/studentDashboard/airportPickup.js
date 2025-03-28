const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this uploads directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDF, JPG, and PNG are allowed."),
      false
    );
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
router.post("/", upload.single("ticket"), async (req, res) => {
  try {
    const {
      email,
      phoneCountry,
      phoneNo,
      country,
      university,
      city,
      pickupOption,
      dropOffLocation,
      additionalPreference,
      flightDetails,
    } = req.body;

    let parsedFlightDetails = {};
    try {
      parsedFlightDetails = JSON.parse(flightDetails || "{}");
    } catch (err) {
      console.error("Error parsing flight details:", err);
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or invalid file type.",
      });
    }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "chillpills313@gmail.com",
      subject: "New Airport Pickup Request",
      html: `
        <h2>Airport Pickup Request</h2>
        <h3>Contact Information</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phoneCountry} ${phoneNo}</p>

        <h3>Location Details</h3>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>University:</strong> ${university}</p>
        <p><strong>City:</strong> ${city}</p>

        <h3>Pickup Details</h3>
        <p><strong>Pickup Option:</strong> ${pickupOption}</p>
        <p><strong>Drop-off Location:</strong> ${dropOffLocation}</p>

        ${
          additionalPreference
            ? `<h3>Additional Preferences</h3><p>${additionalPreference}</p>`
            : ""
        }

        ${
          Object.keys(parsedFlightDetails).length > 0
            ? `
        <h3>Flight Details</h3>
        <p><strong>Arrival Date:</strong> ${
          parsedFlightDetails.arrivalDate || "N/A"
        }</p>
        <p><strong>Time:</strong> ${parsedFlightDetails.time || "N/A"}</p>
        <p><strong>Airport Name:</strong> ${
          parsedFlightDetails.airportName || "N/A"
        }</p>
        <p><strong>Flight Number:</strong> ${
          parsedFlightDetails.flightNumber || "N/A"
        }</p>
        <p><strong>Airline Name:</strong> ${
          parsedFlightDetails.airlineName || "N/A"
        }</p>
        `
            : ""
        }
      `,
      cc: email,
      attachments: [
        {
          filename: req.file.originalname,
          path: req.file.path,
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting form",
      error: error.message,
    });
  }
});

module.exports = router;
