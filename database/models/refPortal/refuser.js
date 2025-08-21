const mongoose = require("mongoose");

// Define a schema
const userSchema = new mongoose.Schema(
  {
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
      minlength: 8,
    },

    token: { type: String },
    otp: {
      type: String,
    },
    facebook: {
      type: String,
    },
    instagram: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    contactNo: {
      type: Number,
    },
    dob: {
      type: Date,
    },
    city: {
      type: String,
    },
    otpExpiration: {
      type: Date,
    },
    otpVerified: { type: Boolean, default: false },

    isVerified: { type: Boolean, default: false },
  },

  { timestamps: true }
);
// Create a model
const UserRefDb =
  mongoose.models.UserRefDb || mongoose.model("UserRefDb", userSchema);
// Export the model
module.exports = UserRefDb;
