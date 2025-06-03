// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const nodemailer = require("nodemailer");

// // Configure multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Make sure this uploads directory exists
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//   },
// });

// // File filter to accept only specific file types
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error("Invalid file type. Only PDF, JPG, and PNG are allowed."),
//       false
//     );
//   }
// };

// // Configure multer upload
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
// });
// // let transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASS,
// //   },
// // });
// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });
// router.post("/", upload.single("ticket"), async (req, res) => {
//   console.log("Received request to submit airport pickup form");

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
//         message: "No file uploaded or invalid file type.",
//       });
//     }
//     const mailOptions = {
//       from: "umberfatimi@gmail.com", // Use your configured email as sender
//       to: "info@worldwideadmissionshub.com", // Recipient
//       // from: process.env.EMAIL_USER,
//       // to: "chillpills313@gmail.com",
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
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");
const nodemailer = require("nodemailer");

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// Configure multer with S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Create a unique filename with timestamp and original extension
      const uniqueName = `airport-pickup/${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${getFileExtension(file.originalname)}`;
      cb(null, uniqueName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically set content type
    serverSideEncryption: "AES256", // Optional: encrypt files
  }),
  fileFilter: (req, file, cb) => {
    console.log("File received:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PDF, JPG, and PNG are allowed."),
        false
      );
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only allow 1 file
  },
});

// Helper function to get file extension
function getFileExtension(filename) {
  return filename.slice(filename.lastIndexOf("."));
}

// Wrapper to handle multer errors
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
let transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/", handleUpload, async (req, res) => {
  console.log("Received request to submit airport pickup form");

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

    // Check if file was uploaded to S3
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or invalid file type.",
      });
    }

    console.log("File uploaded to S3:", {
      location: req.file.location,
      bucket: req.file.bucket,
      key: req.file.key,
      size: req.file.size,
    });

    const mailOptions = {
      from: "umberfatimi@gmail.com",
      to: "info@worldwideadmissionshub.com",
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

        <h3>Uploaded Document</h3>
        <p><strong>File:</strong> ${req.file.originalname}</p>
        <p><strong>Download Link:</strong> <a href="${
          req.file.location
        }">View Document</a></p>
      `,
      cc: email,
      attachments: [
        {
          filename: req.file.originalname,
          path: req.file.location, // S3 URL
        },
      ],
    };

    // Send email
    console.log("Sending email...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    res.status(200).json({
      success: true,
      message: "Form submitted successfully!",
      fileUrl: req.file.location, // Return S3 URL
      fileKey: req.file.key, // S3 key for future reference
    });
  } catch (error) {
    console.error("Error submitting form:", error);

    // If there was an error after file upload, optionally delete the file from S3
    if (req.file && req.file.key) {
      try {
        await s3
          .deleteObject({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: req.file.key,
          })
          .promise();
        console.log("Cleaned up uploaded file due to error");
      } catch (deleteError) {
        console.error("Error deleting file from S3:", deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Error submitting form",
      error: error.message,
    });
  }
});

// Optional: Route to delete files from S3 (for cleanup)
router.delete("/file/:key", async (req, res) => {
  try {
    const { key } = req.params;

    await s3
      .deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: decodeURIComponent(key),
      })
      .promise();

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
