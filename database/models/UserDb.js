const mongoose = require("mongoose");

// Define a schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
      minlength: 11,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    referralCode: {
      type: String,
      sparse: true, // This allows multiple null values (for users without referral codes)
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    contactNo: {
      type: Number,
    },
    dob: { type: Date },
    countryCode: { type: String },
    nationality: { type: String },
    country: { type: String },
    city: { type: String },
    token: { type: String },
    otp: {
      type: String,
    },
    otpExpiration: {
      type: Date,
    },
    otpVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);
// Create a model
const UserDb = mongoose.models.UserDb || mongoose.model("UserDb", userSchema);
// Export the model
module.exports = UserDb;