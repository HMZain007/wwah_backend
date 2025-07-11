const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
env = require("dotenv").config();

// Helper function to format date
const formatDate = (dateString) => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Helper function to format time
const formatTime = (timeString) => {
  const [hour, minute] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hour), parseInt(minute));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

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

  // Format date and time for better readability
  const formattedDate = formatDate(date);
  const formattedFromTime = formatTime(fromTime);
  const formattedToTime = formatTime(toTime);

  // Email to company (existing functionality)
  let companyMailOptions = {
    from: process.env.EMAIL_USER,
    replyTo: email,
    to: "info@wwah.ai",
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
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedFromTime} - ${formattedToTime}</p>
        <p><strong>Meeting Type:</strong> ${meetingType}</p>
        
        <h3>Study Preferences:</h3>
        <p><strong>Preferred Study Destination:</strong> ${studyDestination}</p>
        <p><strong>Preferred Degree:</strong> ${degree}</p>
        <p><strong>Preferred Major:</strong> ${major}</p>
        <p><strong>Budget:</strong> $${budget}</p>
      </div>
    `,
  };

  // Confirmation email to student
  let studentMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🎉 Your Counseling Session is Confirmed - WWAH Advisors",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #28a745; margin-bottom: 10px;">✅ Session Confirmed!</h1>
            <p style="color: #6c757d; font-size: 16px;">Your counseling session has been successfully scheduled</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #343a40; margin-bottom: 15px;">📅 Session Details</h2>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedFromTime} - ${formattedToTime}</p>
            <p><strong>Meeting Type:</strong> ${meetingType}</p>
            <p><strong>Duration:</strong> 30 minutes</p>
          </div>
          
          <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #343a40; margin-bottom: 15px;">🎓 Your Study Preferences</h2>
            <p><strong>Destination:</strong> ${studyDestination}</p>
            <p><strong>Degree:</strong> ${degree}</p>
            <p><strong>Major:</strong> ${major}</p>
            <p><strong>Budget:</strong> $${budget}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #343a40; margin-bottom: 15px;">📝 What to Expect</h2>
            <ul style="padding-left: 20px; line-height: 1.6;">
              <li>Our expert counselor will contact you 15 minutes before the session</li>
              <li>Have your academic documents ready for discussion</li>
              <li>Prepare any specific questions about your study abroad journey</li>
              <li>We'll discuss scholarship opportunities and application processes</li>
            </ul>
          </div>
          
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #343a40; margin-bottom: 15px;">📞 Contact Information</h2>
            <p><strong>Email:</strong> info@wwah.ai</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Website:</strong> www.wwah.ai</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6c757d; font-size: 14px;">
              Need to reschedule? Reply to this email or contact us directly.
            </p>
            <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
              Thank you for choosing WWAH Advisors for your study abroad journey!
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
🎉 Your Counseling Session is Confirmed!

Dear ${name},

Your counseling session has been successfully scheduled with WWAH Advisors.

📅 Session Details:
- Date: ${formattedDate}
- Time: ${formattedFromTime} - ${formattedToTime}
- Meeting Type: ${meetingType}
- Duration: 30 minutes

🎓 Your Study Preferences:
- Destination: ${studyDestination}
- Degree: ${degree}
- Major: ${major}
- Budget: $${budget}

📝 What to Expect:
- Our expert counselor will contact you 15 minutes before the session
- Have your academic documents ready for discussion
- Prepare any specific questions about your study abroad journey
- We'll discuss scholarship opportunities and application processes

📞 Contact Information:
- Email: info@wwah.ai
- Phone: +1 (555) 123-4567
- Website: www.wwah.ai

Need to reschedule? Reply to this email or contact us directly.

Thank you for choosing WWAH Advisors for your study abroad journey!

Best regards,
WWAH Advisors Team
    `,
  };

  try {
    // Send email to company
    await transporter.sendMail(companyMailOptions);
    // console.log("Company notification email sent successfully");

    // Send confirmation email to student
    await transporter.sendMail(studentMailOptions);
    // console.log("Student confirmation email sent successfully");


    res.status(200).json({
      message: "Session scheduled successfully! Check your email  for confirmation details.",
      success: true,
    });

  } catch (error) {
    console.error("Error in session scheduling:", error);
    res.status(500).json({
      error: "Error scheduling session. Please try again later.",
      success: false,
    });
  }
});

module.exports = router;