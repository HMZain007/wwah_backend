const mongoose = require("mongoose");

const languageProficiencySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming a User model exists
      required: true, // Tie proficiency to a specific user
    },
    proficiencyLevel: {
      type: String,
      enum: ["native speaker", "test", "willingToTest"], // Restrict to specific levels
      //required: true,
    },
    proficiencyTest: {
      type: String,
      enum: ["IELTS", "PTE", "TOEFL", "DUOLINGO", "Language Cert", "others"],
    },
    proficiencyTestScore: {
      type: String,
      default: "N/A", // Optional field with a default value
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

const LanguageProficiency =
  mongoose.models.LanguageProficiency ||
  mongoose.model("LanguageProficiency", languageProficiencySchema);

module.exports = LanguageProficiency;
