const mongoose = require("mongoose");

const refAcdemicInfoSchema = mongoose.Schema(
  {
    currentDegree: {
      type: String,
    },
    program: {
      type: String,
    },
    uniName: {
      type: String,
    },
    currentSemester: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRefDb", // Reference to UserRefDb model to link refAcademicInfo with user.
    },
  },
  { timestamps: true }
);

// Create a model
const refAcademicInfo =
  mongoose.models.refAcademicInfo ||
  mongoose.model("refAcademicInfo", refAcdemicInfoSchema);

// Export the model
module.exports = refAcademicInfo ;
