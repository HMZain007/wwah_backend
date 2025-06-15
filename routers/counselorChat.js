const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const Chat = require("../database/models/Chat"); // Adjust path as needed

const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

// Configure multer for memory storage (files will be stored in memory temporarily)
const storage = multer.memoryStorage();

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/zip",
    "application/x-rar-compressed",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF, ZIP, and RAR files are allowed."
      ),
      false
    );
  }
};

// Configure multer with options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Function to upload file to S3
const uploadToS3 = async (file, email) => {
  const userDir = email.replace(/[@.]/g, "_");
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileExtension = file.originalname.split(".").pop();
  const fileName = `${file.fieldname}-${uniqueSuffix}.${fileExtension}`;
  const key = `chat-files/${userDir}/${fileName}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "private", // or 'public-read' if you want files to be publicly accessible
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      url: result.Location,
      key: result.Key,
      fileName: fileName,
      originalName: file.originalname,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
};

// Function to generate pre-signed URL for file access
const generatePresignedUrl = async (key, expiresIn = 3600) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Expires: expiresIn, // URL expires in 1 hour by default
  };

  try {
    const url = await s3.getSignedUrlPromise("getObject", params);
    return url;
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    throw new Error("Failed to generate download URL");
  }
};

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File size too large. Maximum size is 10MB." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res
        .status(400)
        .json({ error: "Too many files. Only one file allowed." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ error: "Unexpected file field." });
    }
  }

  if (err.message.includes("Invalid file type")) {
    return res.status(400).json({ error: err.message });
  }

  if (err.message.includes("Email is required")) {
    return res
      .status(400)
      .json({ error: "Email is required for file upload." });
  }

  next(err);
};

// File upload route
router.post(
  "/upload",
  upload.single("file"),
  handleMulterError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Upload file to S3
      const s3Result = await uploadToS3(req.file, email);

      // Log successful upload
      console.log(
        `File uploaded successfully to S3: ${req.file.originalname} for user: ${email}`
      );

      res.json({
        message: "File uploaded successfully",
        fileUrl: s3Result.url,
        fileName: s3Result.originalName,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        s3Key: s3Result.key,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  }
);

// Route to get pre-signed URL for file download
router.get("/download/:s3Key(*)", async (req, res) => {
  try {
    const s3Key = req.params.s3Key;

    if (!s3Key) {
      return res.status(400).json({ error: "S3 key is required" });
    }

    const presignedUrl = await generatePresignedUrl(s3Key);

    res.json({
      downloadUrl: presignedUrl,
      expiresIn: 3600, // 1 hour
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    res.status(500).json({ error: "Failed to generate download URL" });
  }
});

// Get messages for a specific user
router.get("/messages/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" });
    }

    const chat = await Chat.findOne({ userEmail: email });

    if (!chat) {
      return res.json([]);
    }

    // Sort messages by timestamp and generate pre-signed URLs for files
    const sortedMessages = chat.messages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Generate pre-signed URLs for files in messages
    const messagesWithUrls = await Promise.all(
      sortedMessages.map(async (message) => {
        if (message.file && message.file.s3Key) {
          try {
            const presignedUrl = await generatePresignedUrl(message.file.s3Key);
            return {
              ...message.toObject(),
              file: {
                ...message.file,
                downloadUrl: presignedUrl,
              },
            };
          } catch (error) {
            console.error(
              "Error generating pre-signed URL for message file:",
              error
            );
            return message.toObject();
          }
        }
        return message.toObject();
      })
    );

    res.json(messagesWithUrls);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get all chats (for admin)
router.get("/all", async (req, res) => {
  try {
    const chats = await Chat.find({}).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    console.error("Error fetching all chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// Delete a specific message (and its S3 file if exists)
router.delete("/messages/:email/:messageId", async (req, res) => {
  try {
    const { email, messageId } = req.params;

    const chat = await Chat.findOne({ userEmail: email });
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Find the message to get S3 key before deleting
    const messageToDelete = chat.messages.find(
      (msg) => msg._id.toString() === messageId
    );

    if (messageToDelete && messageToDelete.file && messageToDelete.file.s3Key) {
      // Delete file from S3
      try {
        await s3
          .deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: messageToDelete.file.s3Key,
          })
          .promise();
        console.log(`Deleted file from S3: ${messageToDelete.file.s3Key}`);
      } catch (s3Error) {
        console.error("Error deleting file from S3:", s3Error);
        // Continue with message deletion even if S3 deletion fails
      }
    }

    // Remove the message
    chat.messages = chat.messages.filter(
      (msg) => msg._id.toString() !== messageId
    );
    await chat.save();

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Clear all messages for a user (and delete associated S3 files)
router.delete("/messages/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const chat = await Chat.findOne({ userEmail: email });
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Delete all files from S3 before clearing messages
    const filesToDelete = chat.messages
      .filter((msg) => msg.file && msg.file.s3Key)
      .map((msg) => ({ Key: msg.file.s3Key }));

    if (filesToDelete.length > 0) {
      try {
        await s3
          .deleteObjects({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Delete: {
              Objects: filesToDelete,
            },
          })
          .promise();
        console.log(`Deleted ${filesToDelete.length} files from S3`);
      } catch (s3Error) {
        console.error("Error deleting files from S3:", s3Error);
        // Continue with message deletion even if S3 deletion fails
      }
    }

    chat.messages = [];
    await chat.save();

    res.json({ message: "All messages cleared successfully" });
  } catch (error) {
    console.error("Error clearing messages:", error);
    res.status(500).json({ error: "Failed to clear messages" });
  }
});

module.exports = router;
