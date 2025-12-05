

// module.exports = router;
const express = require("express");
const router = express.Router();
const multer = require("multer");
const nodemailer = require("nodemailer");

//  Memory storage - No disk/S3 needed, Vercel compatible
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    console.log("File received:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PDF, JPG, and PNG are allowed."),
        false
      );
    }
  },
});

//  Wrapper to handle multer errors
const handleUpload = (req, res, next) => {
  upload.single("ticket")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 5MB.",
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          message: "Unexpected file field or too many files.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Upload error: " + err.message,
      });
    } else if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

// Configure nodemailer
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/", handleUpload, async (req, res) => {
  console.log("Received request to submit airport pickup form");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);

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

    // Validate required fields
    if (
      !email ||
      !phoneNo ||
      !country ||
      !university ||
      !city ||
      !pickupOption ||
      !dropOffLocation
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields. Please fill in all required information.",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Ticket file is required. Please upload a valid file (PDF, JPG, or PNG).",
      });
    }

    //  Validate file size (10KB to 5MB)
    const minSize = 10 * 1024; // 10KB
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (req.file.size < minSize) {
      return res.status(400).json({
        success: false,
        message: "File size is too small. Minimum size is 10KB.",
      });
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 5MB limit. Please upload a smaller file.",
      });
    }

    let parsedFlightDetails = {};
    try {
      parsedFlightDetails = JSON.parse(flightDetails || "{}");
    } catch (err) {
      console.error("Error parsing flight details:", err);
    }

    console.log("File info:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Parse phone country to extract just the code
    let phoneCountryCode = phoneCountry;
    if (phoneCountry && phoneCountry.includes("|")) {
      phoneCountryCode = phoneCountry.split("|")[1];
    }

    //  Admin Email HTML
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#d32f2f; font-weight:bold;">New Airport Pickup Request</h2>
        
        <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#f9f9f9; margin-top:12px;">
          <h3 style="margin-bottom:8px;">Contact Information</h3>
          <div style="line-height:1.6;">
            <div><strong>Email:</strong> ${email}</div>
            <div><strong>Phone:</strong> ${phoneCountryCode} ${phoneNo}</div>
          </div>
        </div>

        <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#f1f3f4; margin-top:12px;">
          <h3 style="margin-bottom:8px;">Location Details</h3>
          <div style="line-height:1.6;">
            <div><strong>Country:</strong> ${country}</div>
            <div><strong>University:</strong> ${university}</div>
            <div><strong>City:</strong> ${city}</div>
          </div>
        </div>

        <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#fef4f4; margin-top:12px;">
          <h3 style="margin-bottom:8px;">Pickup Details</h3>
          <div style="line-height:1.6;">
            <div><strong>Pickup Option:</strong> ${pickupOption}</div>
            <div><strong>Drop-off Location:</strong> ${dropOffLocation}</div>
          </div>
        </div>

        ${
          additionalPreference
            ? `
        <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#fffef4; margin-top:12px;">
          <h3 style="margin-bottom:8px;">Additional Preferences</h3>
          <p>${additionalPreference}</p>
        </div>
        `
            : ""
        }

        ${
          Object.keys(parsedFlightDetails).length > 0
            ? `
        <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#f4f9fe; margin-top:12px;">
          <h3 style="margin-bottom:8px;">Flight Details</h3>
          <div style="line-height:1.6;">
            <div><strong>Arrival Date:</strong> ${
              parsedFlightDetails.arrivalDate || "N/A"
            }</div>
            <div><strong>Time:</strong> ${
              parsedFlightDetails.time || "N/A"
            }</div>
            <div><strong>Airport Name:</strong> ${
              parsedFlightDetails.airportName || "N/A"
            }</div>
            <div><strong>Flight Number:</strong> ${
              parsedFlightDetails.flightNumber || "N/A"
            }</div>
            <div><strong>Airline Name:</strong> ${
              parsedFlightDetails.airlineName || "N/A"
            }</div>
          </div>
        </div>
        `
            : ""
        }

        <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#e8f5e9; margin-top:12px;">
          <h3 style="margin-bottom:8px;">Uploaded Document</h3>
          <div style="line-height:1.6;">
            <div><strong>File:</strong> ${req.file.originalname}</div>
            <div><strong>File Size:</strong> ${(
              req.file.size /
              1024 /
              1024
            ).toFixed(2)} MB</div>
            <div><em>Document attached to this email</em></div>
          </div>
        </div>

        <hr style="margin-top:20px; border:none; border-top:1px solid #ddd;">
        <p style="font-size:12px; color:#666;">
          <strong>Submitted on:</strong> ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    //  User Email HTML
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#1a73e8; font-weight:bold;">Your Airport Pickup Request Has Been Submitted!</h2>
        <p>Dear Customer,</p>
        <p>Thank you for submitting your airport pickup request. We have received your information and will process it shortly.</p>

        <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#e8f0fe; margin-top:12px;">
          <h3 style="margin-bottom:8px;">Your Pickup Details</h3>
          <div style="line-height:1.6;">
            <div><strong>Country:</strong> ${country}</div>
            <div><strong>University:</strong> ${university}</div>
            <div><strong>City:</strong> ${city}</div>
            <div><strong>Pickup Option:</strong> ${pickupOption}</div>
            <div><strong>Drop-off Location:</strong> ${dropOffLocation}</div>
          </div>
        </div>

        ${
          Object.keys(parsedFlightDetails).length > 0
            ? `
        <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#f1f3f4; margin-top:12px;">
          <h3 style="margin-bottom:8px;">Flight Information</h3>
          <div style="line-height:1.6;">
            <div><strong>Arrival Date:</strong> ${
              parsedFlightDetails.arrivalDate || "N/A"
            }</div>
            <div><strong>Time:</strong> ${
              parsedFlightDetails.time || "N/A"
            }</div>
            <div><strong>Airport:</strong> ${
              parsedFlightDetails.airportName || "N/A"
            }</div>
            <div><strong>Flight Number:</strong> ${
              parsedFlightDetails.flightNumber || "N/A"
            }</div>
          </div>
        </div>
        `
            : ""
        }

        <p style="margin-top:12px;">Your uploaded ticket is attached to this email for your reference.</p>
        <p>We will contact you soon with further details.</p>
        <p>Best regards,<br><strong>WWAH Team</strong></p>
      </div>
    `;

    //  Prepare email attachments from memory buffer
    const attachments = [
      {
        filename: req.file.originalname,
        content: req.file.buffer, //  Direct from memory
        contentType: req.file.mimetype,
      },
    ];

    //  Send emails to admin and user
    console.log("Sending emails...");
    await Promise.all([
      // Admin email
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "info@wwah.ai",
        subject: "New Airport Pickup Request",
        html: adminEmailHtml,
        attachments: attachments,
      }),
      // User confirmation email
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Airport Pickup Request Confirmation",
        html: userEmailHtml,
        attachments: attachments,
      }),
    ]);

    console.log("Emails sent successfully");

    res.status(200).json({
      success: true,
      message:
        "Airport pickup request submitted successfully! You will receive a confirmation email shortly.",
    });
  } catch (error) {
    console.error("Error submitting form:", error);

    res.status(500).json({
      success: false,
      message: "Error submitting form. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
