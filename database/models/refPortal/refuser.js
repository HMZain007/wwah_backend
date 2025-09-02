// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     firstName: {
//       type: String,
//       required: true,
//     },
//     lastName: {
//       type: String,
//       required: true,
//     },
//     fullName: {
//       type: String,
//     },
//     country: {
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
//       type: String, // Changed from Number to String to handle formatting
//       minlength: 10,
//     },
//     password: {
//       type: String,
//       minlength: 6,
//     },
//     // Add these missing fields for Google auth
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
//     provider: {
//       type: String,
//       enum: ["email", "google", "facebook"],
//       default: "email",
//     },
//     googleId: {
//       type: String,
//       sparse: true, // Allow multiple null values but unique non-null values
//     },

//     // Existing fields
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
//     otpVerified: {
//       type: Boolean,
//       default: false,
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     resetPasswordOTP: {
//       type: String,
//       default: null,
//     },
//     resetPasswordOTPExpires: {
//       type: Date,
//       default: null,
//     },
//     // Token for password reset
//     resetPasswordToken: {
//       type: String,
//       default: null,
//     },
//     resetPasswordTokenExpires: {
//       type: Date,
//       default: null,
//     },
//     refId: {
//       type: Number,
//     },
//     referralCode: {
//       type: String,
//       unique: true,
//       sparse: true,
//     },
//     totalReferrals: {
//       type: Number,
//       default: 0,
//     },
//     referrals: [
//       {
//         firstName: {
//           type: String,
//           required: true,
//         },
//         lastName: {
//           type: String,
//           required: true,
//         },
//         id: {
//           type: String,
//           required: true,
//         },
//         profilePicture: {
//           type: String,
//           default: null,
//           validate: {
//             validator: function (v) {
//               if (!v) return true;
//               return /^https?:\/\/.+/.test(v);
//             },
//             message: "Profile picture must be a valid URL",
//           },
//         },
//         status: {
//           type: String,
//           enum: ["accepted", "pending", "rejected"],
//           default: "pending",
//         },
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// // Create a model
// const UserRefDb =
//   mongoose.models.UserRefDb || mongoose.model("UserRefDb", userSchema);

// module.exports = UserRefDb;
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String },
    country: { type: String },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, minlength: 10 },
    password: { type: String, minlength: 6 },
    profilePicture: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
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
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: "Cover photo must be a valid URL",
      },
    },
    // Existing fields
    token: { type: String },
    otp: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
    countryCode: { type: String },
    contactNo: { type: Number },
    dob: { type: Date },
    city: { type: String },
    otpExpiration: { type: Date },
    otpVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    resetPasswordOTP: { type: String, default: null },
    resetPasswordOTPExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordTokenExpires: { type: Date, default: null },
    refId: { type: Number },
    referralCode: { type: String, unique: true, sparse: true },
    totalReferrals: { type: Number, default: 0 },

    // NEW: Commission-related fields
    commissionPerReferral: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: "Commission per referral must be a positive number",
      },
    },

    referrals: [
      {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        id: { type: String, required: true },
        profilePicture: {
          type: String,
          default: null,
          validate: {
            validator: function (v) {
              if (!v) return true;
              return /^https?:\/\/.+/.test(v);
            },
            message: "Profile picture must be a valid URL",
          },
        },
        status: {
          type: String,
          enum: ["accepted", "pending", "rejected"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    // Add virtual field for total commission calculation
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to calculate total commission earned
userSchema.virtual("totalCommissionEarned").get(function () {
  if (!this.referrals || !this.commissionPerReferral) {
    return 0;
  }

  const acceptedReferrals = this.referrals.filter(
    (ref) => ref.status === "accepted"
  ).length;
  return acceptedReferrals * this.commissionPerReferral;
});

// Method to update commission per referral (admin only)
userSchema.methods.updateCommissionRate = function (newRate) {
  this.commissionPerReferral = newRate;
  return this.save();
};

// Static method to get users with commission data
userSchema.statics.getUsersWithCommission = function () {
  return this.find().select("+commissionPerReferral");
};

const UserRefDb =
  mongoose.models.UserRefDb || mongoose.model("UserRefDb", userSchema);
module.exports = UserRefDb;