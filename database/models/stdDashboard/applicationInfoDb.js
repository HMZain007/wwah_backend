const mongoose = require("mongoose");
const educationalBackgroundSchema = new mongoose.Schema({
  highestDegree: {
    type: String,
    required: true,
    trim: true,
  },
  subjectName: {
    type: String,
    required: true,
    trim: true,
  },
  marks: {
    type: String,
    required: true,
  },
  institutionAttended: {
    type: String,
    trim: true,
  },
  degreeStartDate: {
    type: Date,
  },
  degreeEndDate: {
    type: Date,
  },
});
const workExperienceSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
  },
  organizationName: {
    type: String,
  },
  employmentType: {
    type: String,
    enum: ["fullTime", "partTime"],
  },

  from: {
    type: Date,
  },
  to: {
    type: Date,
  },
});
const applicationInfoSchema = mongoose.Schema(
  {
    countryOfStudy: {
      type: String,
    },
    proficiencyLevel: {
      type: String,
    },
    proficiencyTest: {
      type: String,
    },
    overAllScore: {
      type: String,
    },
    listeningScore: {
      type: String,
    },
    writingScore: {
      type: String,
    },
    readingScore: {
      type: String,
    },
    speakingScore: {
      type: String,
    },

    standardizedTest: {
      type: String,
    },
    standardizedOverallScore: {
      type: String,
    },
    standardizedSubScore: [String],

    educationalBackground: [educationalBackgroundSchema],
    workExperience: [workExperienceSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDb", // Reference to UserDb model to link academicInfo with user.
      required: true,
    },
  },
  { timestamps: true }
);

const applicationInfo =
  mongoose.models.ApplicationInfo ||
  mongoose.model("ApplicationInfo", applicationInfoSchema);

// Export the model
module.exports = applicationInfo;
