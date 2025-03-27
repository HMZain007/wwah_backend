const mongoose = require("mongoose");
// Define a schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
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
// const UserDb = mongoose.model("UserDb", userSchema);
const UserDb = mongoose.models.UserDb || mongoose.model("UserDb", userSchema);
// Export the model
module.exports = UserDb;
