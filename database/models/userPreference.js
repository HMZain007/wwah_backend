const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming a User model exists
      required: true, // Ensure the preference is tied to a user
    },
    perferredCountry: {
      type: String,
      //  required: true, // Country is mandatory
    },
    perferredCity: {
      type: String,
      default: "", // Optional field, default to an empty string
    },
    degreeLevel: {
      type: String,
      enum: ["Bachelor", "Master", "PhD"], // Restrict to specific values
      //required: true,
    },
    fieldOfStudy: {
      type: String,
      //required: true,
    },
    livingcost: {
      type: String,
    },
    tutionfees: {
      type: String,
    },
    studyMode: {
      type: String,
      enum: ["Online", "On-Campus", "Hybrid"], // Restrict to specific values
      default: "On-Campus",
    },
    currency: {
      type: String,
      // enum: ["USD", "EUR", "GBP", "JPY"], // Restrict to specific currencies
    },
  },
  { timestamps: true }
);

// Create the model
// const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);
const UserPreference =
  mongoose.models.UserPreference ||
  mongoose.model("UserPreference", userPreferenceSchema);

// Export the model
module.exports = UserPreference;
