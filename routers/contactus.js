const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

router.post('/', async (req, res) => {
    const { firstName, lastName, countryCode, phoneNumber, message } = req.body;
    console.log(req.body)
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
      // from: `${firstName} ${lastName}`, // sender address
      // to: "chillpills313@gmail.com", // list of receivers
      from: "umberfatimi@gmail.com", // Use your configured email as sender
      to: "info@worldwideadmissionshub.com", // Recipient
      subject: "Contact Us Form Submission", // Subject line
      text: `Name: ${firstName} ${lastName} \nphone: ${countryCode}-${phoneNumber}\nMessage: ${message}`, // plain text body
    };

    // Send mail with defined transport object
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully', succes: true });


    } catch (error) {
        res.status(500).json({ message: 'Error sending email: ' + error.message, succes: true });
    }
});

module.exports = router;