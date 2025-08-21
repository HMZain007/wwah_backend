const mongoose = require("mongoose");

const WorkExperienceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRefDb", // Reference to UserRefDb model to link refAcademicInfo with user.
    },
    hasWorkExperience: { type: Boolean, required: true, default: false },
    hasBrandAmbassador: { type: Boolean, required: true, default: false },
    jobDescription: { type: String },
  },
  { timestamps: true }
);

const refWorkExperience =
  mongoose.models.refWorkExperience ||
  mongoose.model("refWorkExperience", WorkExperienceSchema);

// Export the model
module.exports = refWorkExperience;
