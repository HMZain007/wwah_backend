const mongoose = require("mongoose");
const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // University name is required
  },
  country: {
    type: String,
    required: true, // Country is required
  },
  city: {
    type: String,
    required: true, // City is required
  },
  programs: [
    {
      name: {
        type: String,
        required: true, // Program name is required
      },
      scholarship: {
        type: Number, // Scholarship in percentage or amount
        default: 0, // Default is no scholarship
      },
    },
  ],
  websiteLink: {
    type: String,
    required: true, // Website link is required
  },
});
const University =
  mongoose.models.University || mongoose.model("University", universitySchema);
// const University = mongoose.model("University", universitySchema);
module.exports = University;