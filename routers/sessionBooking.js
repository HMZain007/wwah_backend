/** 
  *@swagger
  * /session-booking:
  *   post:
  *     summary: Session Booking
  *     description: This route is used to book a session.
  *     tags: [Session Booking]
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  */

const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail"); // same email helper you're using

// ✅ Convert 12-hour time (e.g. "1:30pm") → 24-hour time ("13:30")
function convertTo24Hour(timeStr) {
  const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
  if (!match) return null;

  let [_, hours, minutes, period] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  if (period.toLowerCase() === "pm" && hours !== 12) hours += 12;
  if (period.toLowerCase() === "am" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

// ✅ Parse timezone string like "GMT+05:00 Pakistan Standard Time"
function parseTimezoneOffset(tzString) {
  const match = tzString.match(/GMT([+-]\d{2}):(\d{2})/);
  if (!match) return 0;
  const [, sign, hours, minutes] = match;
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
  return sign === "+" ? totalMinutes : -totalMinutes;
}

router.post("/", async (req, res) => {
  try {
    const {
      fullName,
      email,
      countryCode,
      phoneNumber,
      city,
      budget,
      studyDestinations,
      selectedDate,
      selectedTime,
      timezone,
      bookingTimestamp,
    } = req.body;

    // 🛑 1. Required field validation
    if (
      !fullName ||
      !email ||
      !countryCode ||
      !phoneNumber ||
      !city ||
      !budget ||
      !studyDestinations ||
      !selectedDate ||
      !selectedTime ||
      !timezone ||
      !bookingTimestamp
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 🧾 2. Email & phone format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    // 🕒 3. Time validation with correct timezone handling
    const time24 = convertTo24Hour(selectedTime);
    if (!time24)
      return res
        .status(400)
        .json({ error: "Invalid time format (must include am/pm)" });

    const [hours, minutes] = time24.split(":").map(Number);
    const selected = new Date(selectedDate);
    selected.setHours(hours);
    selected.setMinutes(minutes);

    // Parse and apply timezone offset correctly (add minutes)
    const offsetMinutes = parseTimezoneOffset(timezone);
    selected.setMinutes(selected.getMinutes() + offsetMinutes);

    const now = new Date();
    const nowOffset = now.getTimezoneOffset() * -1;
    now.setMinutes(now.getMinutes() + nowOffset);

    if (selected < now) {
      return res
        .status(400)
        .json({ error: "Selected time cannot be in the past (adjusted to timezone)" });
    }

    // 📧 4. Email content (with modern layout)
    const adminEmailContent = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="background-color: #004aad; color: white; padding: 12px; border-radius: 6px;">
      New Session Booking Received
    </h2>
    <p>A new session booking has been made. Details are below:</p>

    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
      <h3 style="color: #004aad; margin-top: 0;">🧍‍♂️ Personal Information</h3>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Country Code:</strong> ${countryCode}</p>
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      <p><strong>City:</strong> ${city}</p>
    </div>

    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
      <h3 style="color: #004aad; margin-top: 0;">💰 Booking & Session Details</h3>
      <p><strong>Budget:</strong> ${budget}</p>
      <p><strong>Study Destinations:</strong> ${studyDestinations.join(", ")}</p>
      <p><strong>Selected Date:</strong> ${selectedDate}</p>
      <p><strong>Selected Time:</strong> ${selectedTime}</p>
      <p><strong>Timezone:</strong> ${timezone}</p>
    </div>

    <p style="margin-top: 20px; font-size: 14px; color: #777;">
      📅 Booking received on: ${new Date(bookingTimestamp).toLocaleString()}
    </p>
  </div>
`;

    const userEmailContent = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="background-color: #007bff; color: white; padding: 12px; border-radius: 6px;">
      Booking Confirmation
    </h2>

    <p>Dear <strong>${fullName}</strong>,</p>
    <p>Thank you for booking a session with <strong>WWAH</strong>! Below are your booking details:</p>

    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
      <h3 style="color: #007bff; margin-top: 0;">📅 Session Details</h3>
      <p><strong>Date:</strong> ${selectedDate}</p>
      <p><strong>Time:</strong> ${selectedTime}</p>
      <p><strong>Timezone:</strong> ${timezone}</p>
      <p><strong>Budget:</strong> ${budget}</p>
      <p><strong>Destination(s):</strong> ${studyDestinations.join(", ")}</p>
    </div>

    <p>We’ll contact you soon to confirm your session and provide further details.</p>

    <p style="margin-top: 20px;">Best regards,<br><strong>WWAH Team</strong></p>

    <footer style="margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 8px;">
      This is an automated email. Please do not reply directly.
    </footer>
  </div>
`;


    // 📤 Send emails
    await Promise.all([
      sendEmail("info@wwah.ai", `New Session Booking - ${fullName}`, adminEmailContent),
      sendEmail(email, `Booking Confirmation - ${fullName}`, userEmailContent)
    ])

// ✅ Success response
res.status(200).json({
  success: true,
  message:
    "Session booked successfully. Confirmation sent to user and admin.",
});
  } catch (error) {
  console.error("Error booking session:", error);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    details: error.message,
  });
}
});

module.exports = router;
