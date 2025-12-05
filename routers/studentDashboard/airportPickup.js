/**
 * @swagger
 * studentDashboard/airport-pickup:
 *   post:
 *     summary: Submit Airport Pickup Request
 *     description: Submits an airport pickup request form with flight ticket upload. The ticket file is uploaded to AWS S3, and a confirmation email is sent to both the admin and the requester with a presigned download link (valid for 7 days).
 *     tags:
 *       - Airport Pickup
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phoneNo
 *               - country
 *               - university
 *               - city
 *               - pickupOption
 *               - dropOffLocation
 *               - ticket
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Requester's email address
 *                 example: "student@example.com"
 *               phoneCountry:
 *                 type: string
 *                 description: Phone country code (can include country name with | separator)
 *                 example: "Pakistan|+92"
 *               phoneNo:
 *                 type: string
 *                 description: Phone number without country code
 *                 example: "3001234567"
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
 *                 description: Destination city
 *                 example: "Oxford"
 *               pickupOption:
 *                 type: string
 *                 description: Type of pickup service requested
 *                 example: "Shared Transfer"
 *               dropOffLocation:
 *                 type: string
 *                 description: Drop-off address or location
 *                 example: "Student Accommodation, Oxford Road"
 *               additionalPreference:
 *                 type: string
 *                 description: Optional additional preferences or notes
 *                 example: "Wheelchair accessible vehicle required"
 *               flightDetails:
 *                 type: string
 *                 description: JSON string containing flight information
 *                 example: '{"arrivalDate":"2025-09-15","time":"14:30","airportName":"Heathrow Airport","flightNumber":"BA123","airlineName":"British Airways"}'
 *               ticket:
 *                 type: string
 *                 format: binary
 *                 description: Flight ticket file (PDF, JPG, or PNG, max 5MB)
 *     responses:
 *       200:
 *         description: Airport pickup request submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Airport pickup request submitted successfully! You will receive a confirmation email shortly."
 *                 fileUrl:
 *                   type: string
 *                   description: Presigned URL to access the uploaded ticket (valid for 7 days)
 *                   example: "https://s3.amazonaws.com/bucket/airport-pickup/1234567890-ticket.pdf?..."
 *                 fileKey:
 *                   type: string
 *                   description: S3 object key for the uploaded file
 *                   example: "airport-pickup/1234567890-987654321.pdf"
 *       400:
 *         description: Bad request - Missing required fields, invalid file type, or file too large.
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
 *                   examples:
 *                     missingFields:
 *                       value: "Missing required fields. Please fill in all required information."
 *                     noFile:
 *                       value: "Ticket file is required. Please upload a valid file (PDF, JPG, or PNG)."
 *                     invalidFileType:
 *                       value: "Invalid file type. Only PDF, JPG, and PNG are allowed."
 *                     fileTooLarge:
 *                       value: "File too large. Maximum size is 5MB."
 *       500:
 *         description: Server error during form submission or file upload.
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
 *                   example: "Error submitting form. Please try again."
 *                 error:
 *                   type: string
 *                   description: Error details (only in development mode)
 */

/**
 * @swagger
 * /studentDashboard/airport-pickup/file/{key}:
 *   delete:
 *     summary: Delete Uploaded Ticket File
 *     description: Deletes a previously uploaded ticket file from AWS S3 storage. This is an optional cleanup endpoint.
 *     tags:
 *       - Airport Pickup
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: S3 object key of the file to delete (URL encoded)
 *         example: "airport-pickup%2F1234567890-987654321.pdf"
 *     responses:
 *       200:
 *         description: File deleted successfully from S3.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "File deleted successfully"
 *       500:
 *         description: Server error while deleting file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error deleting file from S3"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FlightDetails:
 *       type: object
 *       description: Flight information object (sent as JSON string in flightDetails field)
 *       properties:
 *         arrivalDate:
 *           type: string
 *           format: date
 *           description: Flight arrival date
 *           example: "2025-09-15"
 *         time:
 *           type: string
 *           description: Arrival time
 *           example: "14:30"
 *         airportName:
 *           type: string
 *           description: Name of the arrival airport
 *           example: "Heathrow Airport"
 *         flightNumber:
 *           type: string
 *           description: Flight number
 *           example: "BA123"
 *         airlineName:
 *           type: string
 *           description: Name of the airline
 *           example: "British Airways"
 */

// module.exports = router;
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  S3Client,
  HeadBucketCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const nodemailer = require("nodemailer");

// Configure AWS S3 Client - AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Test S3 connection (optional - for debugging)
const testS3Connection = async () => {
  try {
    const command = new HeadBucketCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
    });
    await s3Client.send(command);
    console.log("S3 connection successful");
  } catch (error) {
    console.error("S3 connection failed:", error.message);
  }
};

// Call this when server starts
testS3Connection();

// Custom multer storage for AWS SDK v3
const s3Storage = {
  _handleFile: function (req, file, cb) {
    const uniqueName = `airport-pickup/${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${getFileExtension(file.originalname)}`;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: uniqueName,
        Body: file.stream,
        ContentType: file.mimetype,
        ServerSideEncryption: "AES256",
        Metadata: {
          fieldName: file.fieldname,
          originalName: file.originalname,
        },
      },
    });

    upload
      .done()
      .then((result) => {
        cb(null, {
          bucket: process.env.AWS_S3_BUCKET_NAME,
          key: uniqueName,
          location: result.Location,
          etag: result.ETag,
          size: file.size,
          originalname: file.originalname,
          mimetype: file.mimetype,
        });
      })
      .catch((error) => {
        console.error("S3 upload error:", error);
        cb(error);
      });
  },
  _removeFile: function (req, file, cb) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: file.key,
    });

    s3Client
      .send(deleteCommand)
      .then(() => cb())
      .catch((error) => cb(error));
  },
};

// Configure multer with custom S3 storage for AWS SDK v3
const upload = multer({
  storage: s3Storage,
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

// Generate presigned URL for secure file access - AWS SDK v3
const generatePresignedUrl = async (bucket, key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 60 * 24 * 7, // URL expires in 7 days
    });

    return presignedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return null;
  }
};

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
        message:
          "Ticket file is required. Please upload a valid file (PDF, JPG, or PNG).",
      });
    }

    console.log("File uploaded to S3:", {
      location: req.file.location,
      bucket: req.file.bucket,
      key: req.file.key,
      size: req.file.size,
      originalname: req.file.originalname,
    });

    // Parse phone country to extract just the code
    let phoneCountryCode = phoneCountry;
    if (phoneCountry && phoneCountry.includes("|")) {
      phoneCountryCode = phoneCountry.split("|")[1];
    }

    // Generate a presigned URL for the email attachment
    const presignedUrl = await generatePresignedUrl(
      req.file.bucket,
      req.file.key
    );

    const mailOptions = {
      from: email,
      to: "info@wwah.ai",
      subject: "New Airport Pickup Request",
      html: `
        <h2>Airport Pickup Request</h2>
        <h3>Contact Information</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phoneCountryCode} ${phoneNo}</p>

        <h3>Location Details</h3>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>University:</strong> ${university}</p>
        <p><strong>City:</strong> ${city}</p>

        <h3>Pickup Details</h3>
        <p><strong>Pickup Option:</strong> ${pickupOption}</p>
        <p><strong>Drop-off Location:</strong> ${dropOffLocation}</p>

        ${additionalPreference
          ? `<h3>Additional Preferences</h3><p>${additionalPreference}</p>`
          : ""
        }

        ${Object.keys(parsedFlightDetails).length > 0
          ? `
        <h3>Flight Details</h3>
        <p><strong>Arrival Date:</strong> ${parsedFlightDetails.arrivalDate || "N/A"
          }</p>
        <p><strong>Time:</strong> ${parsedFlightDetails.time || "N/A"}</p>
        <p><strong>Airport Name:</strong> ${parsedFlightDetails.airportName || "N/A"
          }</p>
        <p><strong>Flight Number:</strong> ${parsedFlightDetails.flightNumber || "N/A"
          }</p>
        <p><strong>Airline Name:</strong> ${parsedFlightDetails.airlineName || "N/A"
          }</p>
        `
          : ""
        }

        <h3>Uploaded Document</h3>
        <p><strong>File:</strong> ${req.file.originalname}</p>
        <p><strong>Download Link:</strong> <a href="${presignedUrl || req.file.location
        }">View Document</a></p>
        
        <hr>
        <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
      `,
      cc: email,
      // Note: For security, we're using presigned URLs instead of direct S3 URLs for attachments
      // If you want to include file as attachment, uncomment below and ensure proper permissions
      // attachments: [
      //   {
      //     filename: req.file.originalname,
      //     path: presignedUrl,
      //   },
      // ],
    };

    // Send email
    console.log("Sending email...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    res.status(200).json({
      success: true,
      message:
        "Airport pickup request submitted successfully! You will receive a confirmation email shortly.",
      fileUrl: presignedUrl || req.file.location,
      fileKey: req.file.key,
    });
  } catch (error) {
    console.error("Error submitting form:", error);

    // If there was an error after file upload, optionally delete the file from S3
    if (req.file && req.file.key) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: req.file.key,
        });
        await s3Client.send(deleteCommand);
        console.log("Cleaned up uploaded file due to error");
      } catch (deleteError) {
        console.error("Error deleting file from S3:", deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Error submitting form. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Optional: Route to delete files from S3 (for cleanup) - AWS SDK v3
router.delete("/file/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: decodeURIComponent(key),
    });

    await s3Client.send(deleteCommand);

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;