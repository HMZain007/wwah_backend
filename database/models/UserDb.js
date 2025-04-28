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
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserDb',
      default: null,
    },
    referrals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserDb'
    }],
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

// Generate a unique referral code when a new user is created
userSchema.pre('save', async function (next) {
  // Only generate a referral code if this is a new user (first save)
  if (this.isNew && !this.referralCode) {
    // Create a referral code based on user's ID and random characters
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.referralCode = `${randomChars}${this._id.toString().substring(0, 5)}`;
  }
  next();
});

// Update referrals when a user is referred
userSchema.post('save', async function () {
  // If this user was referred by someone, update the referrer's referrals array
  if (this.referredBy) {
    try {
      await this.constructor.findByIdAndUpdate(
        this.referredBy,
        { $addToSet: { referrals: this._id } }
      );
    } catch (error) {
      console.error('Error updating referrer:', error);
      // Don't throw error - just log it to prevent blocking the user creation
    }
  }
});

// Create a model
const UserDb = mongoose.models.UserDb || mongoose.model("UserDb", userSchema);

// Export the model
module.exports = UserDb;