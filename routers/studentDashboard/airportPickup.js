// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const nodemailer = require("nodemailer");
// const fs = require("fs");

// // Create uploads directory if it doesn't exist
// const uploadDir = "uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png|pdf/;
//     const extname = filetypes.test(
//       path.extname(file.originalname).toLowerCase()
//     );
//     const mimetype = filetypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       return cb(null, false); // Reject file
//     }
//   },
// });

// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });
// // Create an endpoint for form submission with file upload
// router.post("/", upload.single("ticket"), async (req, res) => {
//   try {
//     const {
//       email,
//       phoneCountry,
//       phoneNo,
//       country,
//       university,
//       city,
//       pickupOption,
//       dropOffLocation,
//       additionalPreference,
//       flightDetails,
//     } = req.body;

//     let parsedFlightDetails = {};
//     try {
//       parsedFlightDetails = JSON.parse(flightDetails || "{}");
//     } catch (err) {
//       console.error("Error parsing flight details:", err);
//     }

//     // Check if file was uploaded
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid file type! Only PDF, JPG, PNG files are allowed.",
//       });
//     }

//     // Prepare email content
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: "chillpills313@gmail.com",
//       subject: "New Airport Pickup Request",
//       html: `
//         <h2>Airport Pickup Request</h2>
//         <h3>Contact Information</h3>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Phone:</strong> ${phoneCountry} ${phoneNo}</p>

//         <h3>Location Details</h3>
//         <p><strong>Country:</strong> ${country}</p>
//         <p><strong>University:</strong> ${university}</p>
//         <p><strong>City:</strong> ${city}</p>

//         <h3>Pickup Details</h3>
//         <p><strong>Pickup Option:</strong> ${pickupOption}</p>
//         <p><strong>Drop-off Location:</strong> ${dropOffLocation}</p>

//         ${
//           additionalPreference
//             ? `<h3>Additional Preferences</h3><p>${additionalPreference}</p>`
//             : ""
//         }

//         ${
//           Object.keys(parsedFlightDetails).length > 0
//             ? `
//         <h3>Flight Details</h3>
//         <p><strong>Arrival Date:</strong> ${
//           parsedFlightDetails.arrivalDate || "N/A"
//         }</p>
//         <p><strong>Time:</strong> ${parsedFlightDetails.time || "N/A"}</p>
//         <p><strong>Airport Name:</strong> ${
//           parsedFlightDetails.airportName || "N/A"
//         }</p>
//         <p><strong>Flight Number:</strong> ${
//           parsedFlightDetails.flightNumber || "N/A"
//         }</p>
//         <p><strong>Airline Name:</strong> ${
//           parsedFlightDetails.airlineName || "N/A"
//         }</p>
//         `
//             : ""
//         }
//       `,
//       cc: email,
//       attachments: [
//         {
//           filename: req.file.originalname,
//           path: req.file.path,
//         },
//       ],
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);

//     res
//       .status(200)
//       .json({ success: true, message: "Form submitted successfully!" });
//   } catch (error) {
//     console.error("Error submitting form:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error submitting form",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const { body, validationResult } = require("express-validator");
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype.toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      return cb(new Error("Invalid file type! Only PDF, JPG, PNG files are allowed."));
    }
  },
});

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create an endpoint for form submission with file upload
router.post(
  "/",
  [
    body("email").isEmail().normalizeEmail(),
    body("phoneNo").isMobilePhone().trim(),
  ],
  upload.single("ticket"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

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

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type! Only PDF, JPG, PNG files are allowed.",
        });
      }

      // Upload file to Cloudinary
      cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({ success: false, message: "File upload failed." });
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
              ${additionalPreference ? `<h3>Additional Preferences</h3><p>${additionalPreference}</p>` : ""}
              ${Object.keys(parsedFlightDetails).length > 0 ? `
                <h3>Flight Details</h3>
                <p><strong>Arrival Date:</strong> ${parsedFlightDetails.arrivalDate || "N/A"}</p>
                <p><strong>Time:</strong> ${parsedFlightDetails.time || "N/A"}</p>
                <p><strong>Airport Name:</strong> ${parsedFlightDetails.airportName || "N/A"}</p>
                <p><strong>Flight Number:</strong> ${parsedFlightDetails.flightNumber || "N/A"}</p>
                <p><strong>Airline Name:</strong> ${parsedFlightDetails.airlineName || "N/A"}</p>
              ` : ""}
            `,
            cc: email,
            attachments: [
              {
                filename: req.file.originalname,
                path: result.secure_url,
              },
            ],
          };

          try {
            await transporter.sendMail(mailOptions);
            return res.status(200).json({ success: true, message: "Form submitted successfully!" });
          } catch (emailError) {
            console.error("Error sending email:", emailError);
            return res.status(500).json({ success: false, message: "Error submitting form." });
          }
        }
      ).end(req.file.buffer);
    } catch (error) {
      console.error("Error submitting form:", error);
      res.status(500).json({
        success: false,
        message: "Error submitting form",
        error: error.message,
      });
    }
  }
);

module.exports = router;
