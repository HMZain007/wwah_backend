const mongoose = require("mongoose");

const appliedCourseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
      trim: true,
    },
    applicationStatus: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7],
      default: 1,
    },
    statusId: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      default: 1,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const appliedScholarshipCourseSchema = new mongoose.Schema(
  {
    scholarshipName: {
      type: String,
      required: true,
      trim: true,
    },
    banner: {
      type: String,
    },
    hostCountry: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    universityName: {
      type: String,
      required: true,
      trim: true,
    },

    scholarshipType: {
      type: String,
      required: true,
      trim: true,
    },
    deadline: {
      type: String,
      required: true,
      trim: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    ScholarshipId: {
    ScholarshipId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "submitted",
        "approved",
        "rejected",
        "incomplete-application",
        "complete-application",
        "awaiting-course-confirmation",
        "pay-application-fee",
        "in-process",
        "application-withdrawn",
        "application-successful",
        "application-unsuccessful",
        "visa-in-process",
        "visa-rejected",
        "ready-to-fly",
      ],
      enum: [
        "pending",
        "submitted",
        "approved",
        "rejected",
        "incomplete-application",
        "complete-application",
        "awaiting-course-confirmation",
        "pay-application-fee",
        "in-process",
        "application-withdrawn",
        "application-successful",
        "application-unsuccessful",
        "visa-in-process",
        "visa-rejected",
        "ready-to-fly",
      ],
      default: "pending",
    },
    applicationStatus: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7], // Progress tracking steps
      default: 1,
    },
    statusId: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Detailed status from APPLICATION_STATUS
      enum: [1, 2, 3, 4, 5, 6, 7], // Progress tracking steps
      default: 1,
    },
    statusId: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Detailed status from APPLICATION_STATUS
      default: 1,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Define the main user schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // ✅ Password only required for local accounts
    password: { type: String, required: function () { return this.provider === "local"; } },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, unique: true, sparse: true },
    isVerified: { type: Boolean, default: false },
    phone: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    countryCode: {
      type: String,
    },
    contactNo: {
      type: String,
    },
    dob: {
      type: Date,
    },
    nationality: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    // Image URLs
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
    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    // Password reset
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },

    name: {
      type: String,
    },
    referralCode: {
      type: String,
      sparse: true,
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
    favouriteCourse: { type: [String], default: [] },
    favouriteScholarship: { type: [String], default: [] },
    favouriteUniversity: { type: [String], default: [] },

    appliedCourses: {
      type: [appliedCourseSchema],
      default: [],
    },

    appliedScholarshipCourses: {
      type: [appliedScholarshipCourseSchema],
      default: [],
    },

    migrationVersion: {
      type: Number,
      default: 0,
    },
    lastMigrated: {
      type: Date,
    },
  },
  {
    timestamps: true,
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // Remove sensitive fields when converting to JSON
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.emailVerificationToken;
        return ret;
      },
    },
  }
);

// Create a model
const UserDb = mongoose.models.UserDb || mongoose.model("UserDb", userSchema);

// Export the model
module.exports = UserDb;
