const mongoose = require("mongoose");

const acdemicInfoSchema = mongoose.Schema(
  {
    highestQualification: {
      type: String,
    },
    majorSubject: {
      type: String,
    },
    previousGradingScale: {
      type: String,
    },
    previousGradingScore: {
      type: String,
    },
    standardizedTest: {
      type: String,
    },
    standardizedTestScore: {
      type: String,
    },
    institutionName: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDb", // Reference to UserDb model to link academicInfo with user.
    },
  },
  { timestamps: true }
);

// Create a model
const academicInfo =
  mongoose.models.AcademicInfo ||
  mongoose.model("AcademicInfo", acdemicInfoSchema);

// Export the model
module.exports = academicInfo ;
