const express = require("express");
const multer = require("multer");
const sendEmail = require("../utils/sendEmail");
const router = express.Router();

// ✅ Allowed file types
const allowedFileTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

// ✅ Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // ⬅ 3 MB limit (per file)
  fileFilter: (req, file, cb) => {
    if (allowedFileTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Only PDF, DOCX, JPG, and PNG allowed."));
  },
});

// ✅ Upload fields
const uploadFields = upload.fields([
  { name: "cvFile", maxCount: 1 },
  { name: "coverLetterFile", maxCount: 1 },
  { name: "ref1Attachment", maxCount: 1 },
  { name: "ref2Attachment", maxCount: 1 },
]);

// ✅ Custom multer error handler middleware
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size too large. Each file must be under 5MB.",
    });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
}

router.post("/", uploadFields, handleMulterError, async (req, res) => {
  try {
    const {
      fullName,
      email,
      countryCode,
      phoneNumber,
      city,
      dateOfBirth,
      position,
      degree,
      program,
      universityName,
      semester,
      skills,
      ref1Name,
      ref1PhoneNumber,
      ref1countryCode,
      ref2Name,
      ref2PhoneNumber,
      ref2countryCode,
    } = req.body;

    console.log("📩 Email received:", email);
    console.log("📱 Phone number received:", phoneNumber);

    // ✅ 1. Required field validation
    if (
      !fullName ||
      !email ||
      !countryCode ||
      !phoneNumber ||
      !city ||
      !dateOfBirth ||
      !position ||
      !degree ||
      !program ||
      !universityName ||
       (degree === "Pursuing" && !semester) // ✅ Only required if degree is pursuing
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }
    if (/^\d+$/.test(fullName.trim())) {
      return res.status(400).json({
        success: false,
        message: "Full name cannot contain only numbers.",
      });
    }
    // ✅ 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.log("❌ Invalid email format detected:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email format. Please enter a valid email address.",
      });
    }

    // ✅ 3. Phone number validation
    const phoneRegex = /^\+?[0-9\s]{7,20}$/; // allows + and spaces
    if (!phoneRegex.test(phoneNumber.trim())) {
      console.log("❌ Invalid phone number detected:", phoneNumber);
      return res.status(400).json({
        success: false,
        message:
          "Invalid phone number. Use digits only (optionally + or spaces).",
      });
    }


    // ✅ Uploaded files
    const cvFile = req.files?.cvFile?.[0];
    const coverLetterFile = req.files?.coverLetterFile?.[0];
    const ref1Attachment = req.files?.ref1Attachment?.[0];
    const ref2Attachment = req.files?.ref2Attachment?.[0];

    if (!cvFile) return res.status(400).json({ success: false, message: "CV file is required." });

    // ✅ Prepare attachments
    const attachments = [cvFile, coverLetterFile, ref1Attachment, ref2Attachment].filter(Boolean);

    // ✅ Full phone
    const fullPhone = `${countryCode}${phoneNumber}`.replace(/\s+/g, "");

    // ✅ Reference table HTML
    let referenceSection = "";
    const referenceRows = [];

  if (ref1Name || ref1PhoneNumber) {
  const ref1PhoneFull = ref1countryCode ? `${ref1countryCode}${ref1PhoneNumber}` : ref1PhoneNumber || "N/A";
  referenceRows.push(`<tr><td>${ref1Name || "N/A"}</td><td>${ref1PhoneFull}</td></tr>`);
}

if (ref2Name || ref2PhoneNumber) {
  const ref2PhoneFull = ref2countryCode ? `${ref2countryCode}${ref2PhoneNumber}` : ref2PhoneNumber || "N/A";
  referenceRows.push(`<tr><td>${ref2Name || "N/A"}</td><td>${ref2PhoneFull}</td></tr>`);
}

    // ✅ User email
const userEmailHtml = `
<div style="font-family: Arial, sans-serif; color: #333;">
  <h2 style="color:#1a73e8; font-weight:bold;">Your job application has been submitted!</h2>
  <p>Dear ${fullName},</p>

  <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#e8f0fe; margin-top:12px;">
    <h3 style="margin-bottom:8px;">Personal Information</h3>
    <div style="line-height:1.6;">
      <div><strong>Full Name:</strong> ${fullName}</div>
      <div><strong>Email:</strong> ${email}</div>
      <div><strong>Phone:</strong> ${fullPhone}</div>
      <div><strong>City:</strong> ${city}</div>
    </div>
  </div>

  <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#f1f3f4; margin-top:12px;">
    <h3 style="margin-bottom:8px;">Education & Position</h3>
    <div style="line-height:1.6;">
      <div><strong>Position:</strong> ${position}</div>
      <div><strong>Degree:</strong> ${degree || "N/A"}</div>
      <div><strong>Program:</strong> ${program || "N/A"}</div>
      <div><strong>University:</strong> ${universityName || "N/A"}</div>
      <div><strong>Skills:</strong> ${skills || "No Skills"}</div>
    </div>
  </div>

  ${referenceRows.length > 0 ? `
    <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#f9f9f9; margin-top:12px;">
      <h3 style="margin-bottom:8px;">References</h3>
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr style="background:#e0e0e0;">
            <th style="padding:8px; border:1px solid #ddd; text-align:left;">Name</th>
            <th style="padding:8px; border:1px solid #ddd; text-align:left;">Phone</th>
          </tr>
        </thead>
        <tbody>
          ${referenceRows.join("")}
        </tbody>
      </table>
    </div>
  ` : ''}

  <p style="margin-top:12px;">All uploaded documents are downloadable.</p>
  <p>We will review your application and get back to you soon.</p>
  <p>Best regards,<br>WWAH Team</p>
</div>
`;
const adminEmailHtml = `
<div style="font-family: Arial, sans-serif; color: #333;">
  <h2 style="color:#d32f2f; font-weight:bold;">New Job Application Received</h2>

  <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#f9f9f9; margin-top:12px;">
    <h3 style="margin-bottom:8px;">Personal Information</h3>
    <div style="line-height:1.6;">
      <div><strong>Full Name:</strong> ${fullName}</div>
      <div><strong>Email:</strong> ${email}</div>
      <div><strong>Phone:</strong> ${fullPhone}</div>
      <div><strong>City:</strong> ${city}</div>
    </div>
  </div>

  <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#f1f3f4; margin-top:12px;">
    <h3 style="margin-bottom:8px;">Education & Position</h3>
    <div style="line-height:1.6;">
      <div><strong>Position:</strong> ${position}</div>
      <div><strong>Degree:</strong> ${degree || "N/A"}</div>
      <div><strong>Program:</strong> ${program || "N/A"}</div>
      <div><strong>University:</strong> ${universityName || "N/A"}</div>
      <div><strong>Skills:</strong> ${skills || "N/A"}</div>
    </div>
  </div>

  ${referenceRows.length > 0 ? `
    <div style="border:1px solid #ddd; padding:12px; border-radius:8px; background:#fef4f4; margin-top:12px;">
      <h3 style="margin-bottom:8px;">References</h3>
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr style="background:#f0c2c2;">
            <th style="padding:8px; border:1px solid #ddd; text-align:left;">Name</th>
            <th style="padding:8px; border:1px solid #ddd; text-align:left;">Phone</th>
          </tr>
        </thead>
        <tbody>
          ${referenceRows.join("")}
        </tbody>
      </table>
    </div>
  ` : ''}

  <p style="margin-top:12px;">All uploaded documents are downloadable.</p>
</div>
`;

    // ✅ Send emails
    await Promise.all([
   sendEmail(email, `Application Received - ${position}`, userEmailHtml, attachments),
  sendEmail("info@wwah.ai", `New Job Application - ${position}`, adminEmailHtml, attachments),
]);

    res.status(200).json({ success: true, message: "Emails sent successfully with attachments!" });
  } catch (error) {
    console.error("❌ Error sending emails:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

module.exports = router;
