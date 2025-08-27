// const mongoose = require("mongoose");

// // Define a schema
// const userSchema = new mongoose.Schema(
//   {
//     firstName: {
//       type: String,
//     },
//     lastName: {
//       type: String,
//     },
//     fullName: {
//       type: String,
//     },
//     provider: {
//       type: String,
//       enum: ["local", "google"],
//       default: "local",
//     },
//     googleId: {
//       type: String,
//       unique: true,
//       sparse: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     phone: {
//       type: Number,

//       minlength: 11,
//     },
//     password: {
//       type: String,
//       minlength: 8,
//     },

//     token: { type: String },
//     otp: {
//       type: String,
//     },
//     facebook: {
//       type: String,
//     },
//     instagram: {
//       type: String,
//     },
//     linkedin: {
//       type: String,
//     },
//     countryCode: {
//       type: String,
//     },
//     country: {
//       type: String,
//     },
//     contactNo: {
//       type: Number,
//     },
//     dob: {
//       type: Date,
//     },
//     city: {
//       type: String,
//     },
//     otpExpiration: {
//       type: Date,
//     },
//     profilePicture: {
//       type: String,
//       default: null,
//       validate: {
//         validator: function (v) {
//           // Only validate if value exists
//           if (!v) return true;
//           // Simple URL validation
//           return /^https?:\/\/.+/.test(v);
//         },
//         message: "Profile picture must be a valid URL",
//       },
//     },
//     coverPhoto: {
//       type: String,
//       default: null,
//       validate: {
//         validator: function (v) {
//           // Only validate if value exists
//           if (!v) return true;
//           // Simple URL validation
//           return /^https?:\/\/.+/.test(v);
//         },
//         message: "Cover photo must be a valid URL",
//       },
//     },
//     otpVerified: { type: Boolean, default: false },

//     isVerified: { type: Boolean, default: false },
//   },

//   { timestamps: true }
// );
// // Create a model
// const UserRefDb =
//   mongoose.models.UserRefDb || mongoose.model("UserRefDb", userSchema);
// // Export the model
// module.exports = UserRefDb;
const mongoose = require("mongoose");
// const commissionSchema = new mongoose.Schema(
//   {
//     month: {
//       type: String, // Example: "May 2025"
//       required: true,
//     },
//     referrals: {
//       type: Number,
//       default: 0,
//     },
//     amount: {
//       type: Number,
//       default: 0,
//     },
//     status: {
//       type: String,
//       enum: ["Paid", "Pending", "Requested"],
//       default: "Pending",
//     },
//     transactionId: {
//       type: String,
//       default: null, // Will be filled when admin processes payment
//     },
//     dateOfPayment: {
//       type: Date,
//       default: null, // Will be set when Paid
//     },
//     purpose: {
//       type: String,
//       default: null, // Example: "Commission Payment – May 2025"
//     },
//     receiptUrl: {
//       type: String,
//       default: null, // Link to stored PDF receipt
//     },
//   },
//   { timestamps: true }
// );
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
    fullName: {
      type: String,
    },
    country: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String, // Changed from Number to String to handle formatting
      minlength: 10,
    },
    password: {
      type: String,
      minlength: 6,
    },
    // Add these missing fields for Google auth
    profilePicture: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          // Only validate if value exists
          if (!v) return true;
          // Simple URL validation
          return /^https?:\/\/.+/.test(v);
        },
        message: "Profile picture must be a valid URL",
      },
    },
    coverPhoto: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          // Only validate if value exists
          if (!v) return true;
          // Simple URL validation
          return /^https?:\/\/.+/.test(v);
        },
        message: "Cover photo must be a valid URL",
      },
    },
    provider: {
      type: String,
      enum: ["email", "google", "facebook"],
      default: "email",
    },
    googleId: {
      type: String,
      sparse: true, // Allow multiple null values but unique non-null values
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },
    // Existing fields
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
    otpVerified: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // ADD THESE NEW FIELDS FOR PASSWORD RESET FUNCTIONALITY
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordOTPExpires: {
      type: Date,
      default: null,
    },
    // Token for password reset (after OTP verification)
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordTokenExpires: {
      type: Date,
      default: null,
    },
    // commissiontracker: [commissionSchema],
  },
  { timestamps: true }
);

// Create a model
const UserRefDb =
  mongoose.models.UserRefDb || mongoose.model("UserRefDb", userSchema);

module.exports = UserRefDb;