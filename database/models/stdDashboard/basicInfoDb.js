const mongoose = require("mongoose");
const familyMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  relationship: {
    type: String,
    required: true,
    trim: true,
  },
  nationality: {
    type: String,
    trim: true,
  },
  occupation: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email address",
    ],
  },
  countryCode: {
    type: String,
    trim: true,
  },

  phoneNo: {
    type: String,
    trim: true,
  },
});
const basicInfoSchema = mongoose.Schema(
  {
    familyName: {
      type: String,
    },
    givenName: {
      type: String,
    },
    gender: {
      type: String,
    },
    DOB: {
      type: Date,
    },
    nationality: {
      type: String,
    },
    countryOfResidence: {
      type: String,
    },
    maritalStatus: {
      type: String,
    },
    nativeLanguage: {
      type: String,
    },
    religion: {
      type: String,
    },
    homeAddress: {
      type: String,
    },
    detailedAddress: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    email: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    currentHomeAddress: {
      type: String,
    },
    currentDetailedAddress: {
      type: String,
    },
    currentCountry: {
      type: String,
    },
    currentCity: {
      type: String,
    },
    currentZipCode: {
      type: String,
    },
    currentEmail: {
      type: String,
    },
    currentCountryCode: {
      type: String,
    },
    currentPhoneNo: {
      type: String,
    },
    hasPassport: {
      type: Boolean,
    },
    passportNumber: {
      type: String,
    },
    passportExpiryDate: {
      type: Date,
    },
    oldPassportNumber: {
      type: String,
    },
    oldPassportExpiryDate: {
      type: Date,
    },
    hasStudiedAbroad: {
      type: Boolean,
    },
    visitedCountry: {
      type: String,
    },
    studyDuration: {
      type: String,
    },
    institution: {
      type: String,
    },
    visaType: {
      type: String,
    },
    visaExpiryDate: {
      type: Date,
    },
    durationOfStudyAbroad: {
      type: String,
    },
    sponsorName: {
      type: String,
    },
    sponsorRelationship: {
      type: String,
    },
    sponsorsNationality: {
      type: String,
    },
    sponsorsOccupation: {
      type: String,
    },
    sponsorsEmail: {
      type: String,
    },
    sponsorsCountryCode: {
      type: String,
    },
    sponsorsPhoneNo: {
      type: String,
    },
    familyMembers: [familyMemberSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDb", // Reference to UserDb model to link academicInfo with user.
      required: true,
    },
  },
  { timestamps: true }
);

const basicInfo =
  mongoose.models.BasicInfo || mongoose.model("BasicInfo", basicInfoSchema);

// Export the model
module.exports = basicInfo;
