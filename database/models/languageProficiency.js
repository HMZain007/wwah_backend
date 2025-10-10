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
      enum: [
        "Native Speaker",
        "Willing to take a test",
        "Completed a test or have proof of English proficiency",
        "I want WWAH to help me with this",
      ], // Restrict to specific levels
      //required: true,
    },
    proficiencyTest: {
      type: String,
      enum: [
        "IELTS",
        "PTE",
        "TOEFL ibt",
        "TOEFL pbt",
        "Duolingo English Test",
        "LanguageCert Academic",
        "Cambridge English Advanced (CAE)",
        "Oxford ELLT",
        "Any Other (Specify)",
      ],
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
