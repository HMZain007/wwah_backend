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

      minlength: 11,
    },
    password: {
      type: String,
      // required: true,
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
    token: { type: String },
    otp: {
      type: String,
    },
    otpExpiration: {
      type: Date,
    },
    otpVerified: { type: Boolean, default: false },
    profilePic: { type: String },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, unique: true, sparse: true },
    isVerified: { type: Boolean, default: false },
  },

  { timestamps: true }
);
// Create a model
const UserDb = mongoose.models.UserDb || mongoose.model("UserDb", userSchema);
// Export the model
module.exports = UserDb;