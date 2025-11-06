const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  resendAvailableAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Otp", OtpSchema);
