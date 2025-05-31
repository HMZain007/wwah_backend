// const express = require("express");
// const nodemailer = require("nodemailer");
// const router = express.Router();
// router.post("/", async (req, res) => {
//   const {
//     firstName,
//     lastName,
//     email,
//     country,
//     countryCode,
//     phoneNumber,
//     test,
//     format,
//     timing,
//   } = req.body;

//   const user = `Name: ${firstName}  ${lastName} 
//   Email: ${email}
//   Country: ${country}
//   Phone: ${countryCode}${phoneNumber}
//   Test: ${test}
//   Fromat: ${format}
//     Timing: ${timing}
//   `;
//   // Create a transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   // Setup email data
//   let mailOptions = {
//     from: email, // sender address
//     // to: "chillpills313@gmail.com", // list of receivers
//     // from: "umberfatimi@gmail.com", // Use your configured email as sender
//     to: "info@worldwideadmissionshub.com", // Recipient
//     subject: "Book Demo", // Subject line
//     text: user, // plain text body
//   };

//   // Send mail with defined transport object
//   try {
//     let info = await transporter.sendMail(mailOptions);
//     res.status(200).send({ message: "Email sent successfully", info });
//   } catch (error) {
//     res.status(500).send({ message: "Error sending email", error });
//   }
// });

// module.exports = router;
const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    country,
    countryCode,
    phoneNumber,
    test,
    format,
    timing,
    formType, // Add this to destructure the formType
  } = req.body;

  const user = `Name: ${firstName} ${lastName} 
Email: ${email}
Country: ${country}
Phone: ${countryCode}${phoneNumber}
Test: ${test}
Format: ${format}
Timing: ${timing}
`;

  // Determine subject based on formType
  const emailSubject = formType === "Register Now" ? "Register" : "Book Demo";

  // Create a transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Setup email data with dynamic subject
  let mailOptions = {
    from: email, // sender address
    to: "info@worldwideadmissionshub.com", // Recipient
    subject: emailSubject, // Dynamic subject based on form type
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