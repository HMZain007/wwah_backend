const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
router.post("/", async (req, res) => {
  const { name, email, phone, date, from, to, subject } = req.body;

  const user = `Name: ${name} 
  Email: ${email}
  Phone: ${phone}
  Date: ${date}
  From: ${from}
    To: ${to}
  Subject: ${subject}`;
  // Create a transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Setup email data
  let mailOptions = {
    from: email, // sender address
    // to: "chillpills313@gmail.com", // list of receivers
    // from: "umberfatimi@gmail.com", // Use your configured email as sender
    to: "info@worldwideadmissionshub.com", // Recipient
    subject: "Book Demo", // Subject line
    text: user, // plain text body
  };

  // Send mail with defined transport object
  try {
    let info = await transporter.sendMail(mailOptions);
    res.status(200).send({ message: "Email sent successfully", info });
  } catch (error) {
    res.status(500).send({ message: "Error sending email", error });
  }
});

module.exports = router;
