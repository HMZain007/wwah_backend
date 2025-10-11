const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    // 1. Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Define email options
    const mailOptions = {
      from: `"WWAH" <info@wwah.ai>`,
      to,
      subject,
      html,
      attachments: attachments.length > 0 ? attachments.map(file => ({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
        contentDisposition: "attachment",
      })) : [],
    };

    // 3. Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
